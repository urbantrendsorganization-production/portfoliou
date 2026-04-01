import { stripe } from "@/lib/stripe/server";
import { NextResponse } from "next/server";

const API_URL = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const meRes = await fetch(`${API_URL}/profiles/me/`, {
      headers: { Authorization: authHeader },
    });

    if (!meRes.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await meRes.json();

    // Fetch subscription to get stripe_customer_id
    const subRes = await fetch(`${API_URL}/subscriptions/`, {
      headers: { Authorization: authHeader },
    });

    if (!subRes.ok) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      );
    }

    const subscriptions = await subRes.json();
    const sub = Array.isArray(subscriptions)
      ? subscriptions[0]
      : subscriptions?.results?.[0];

    if (!sub?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No Stripe customer found" },
        { status: 404 }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe Portal Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
