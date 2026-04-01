import { stripe } from "@/lib/stripe/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const DJANGO_API_KEY = process.env.DJANGO_INTERNAL_API_KEY || "";

async function djangoRequest(endpoint: string, method: string, body?: Record<string, unknown>) {
  const res = await fetch(`${API_URL}/${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Key": DJANGO_API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res;
}

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const profileId = session.metadata?.profileId;
      const plan = session.metadata?.plan;

      if (!profileId || !plan) break;

      // Create/update subscription via Django API
      await djangoRequest("subscriptions/", "POST", {
        profile: Number(profileId),
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        plan,
        status: "active",
        current_period_end: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
      });

      // Update profile premium status
      await djangoRequest(`profiles/${profileId}/`, "PATCH", {
        is_premium: true,
      });

      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as unknown as Record<string, unknown>;
      const customerId = subscription.customer as string;

      // Find subscription by stripe_customer_id and deactivate
      const subRes = await fetch(
        `${API_URL}/subscriptions/?stripe_customer_id=${customerId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Internal-Key": DJANGO_API_KEY,
          },
        }
      );

      if (subRes.ok) {
        const subs = await subRes.json();
        const sub = Array.isArray(subs) ? subs[0] : subs?.results?.[0];
        if (sub) {
          // Update subscription status
          await djangoRequest(`subscriptions/${sub.id}/`, "PATCH", {
            status: "canceled",
          });
          // Remove premium status
          await djangoRequest(`profiles/${sub.profile}/`, "PATCH", {
            is_premium: false,
          });
        }
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as unknown as Record<string, unknown>;
      const subStatus = subscription.status as string;
      const customerId = subscription.customer as string;

      // Update subscription status in our database
      const subSearchRes = await fetch(
        `${API_URL}/subscriptions/?stripe_customer_id=${customerId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Internal-Key": DJANGO_API_KEY,
          },
        }
      );

      if (subSearchRes.ok) {
        const subs = await subSearchRes.json();
        const sub = Array.isArray(subs) ? subs[0] : subs?.results?.[0];
        if (sub) {
          await djangoRequest(`subscriptions/${sub.id}/`, "PATCH", {
            status: subStatus,
          });

          // If subscription goes past_due or incomplete, remove premium
          if (["past_due", "incomplete", "canceled"].includes(subStatus)) {
            await djangoRequest(`profiles/${sub.profile}/`, "PATCH", {
              is_premium: false,
            });
          }
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
