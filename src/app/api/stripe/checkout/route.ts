import { stripe } from "@/lib/stripe/server";
import { NextResponse } from "next/server";
import { PLANS } from "@/utils/constants";

// Server-side calls use internal Docker URL; falls back to public URL or localhost
const API_URL = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function POST(req: Request) {
  try {
    // Verify user via Django JWT
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
    const body = await req.json();
    const plan = body.plan as string;

    if (plan !== "student_premium" && plan !== "client_premium") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const planInfo = PLANS[plan as "student_premium" | "client_premium"];

    if (!("priceId" in planInfo) || !planInfo.priceId) {
      return NextResponse.json(
        { error: "Price ID not configured" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: planInfo.priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
      customer_email: profile.email,
      metadata: {
        profileId: String(profile.id),
        plan: plan,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe Checkout Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
