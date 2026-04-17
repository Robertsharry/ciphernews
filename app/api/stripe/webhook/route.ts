import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/server";
import type { SubscriptionStatus } from "@/lib/supabase/types";

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return new NextResponse("Webhook secret not configured", { status: 500 });
  }

  const sig = request.headers.get("stripe-signature");
  const raw = await request.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(raw, sig ?? "", secret);
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed", err);
    return new NextResponse("Bad signature", { status: 400 });
  }

  const service = createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      if (userId && session.customer && session.subscription) {
        await service
          .from("profiles")
          .update({
            stripe_customer_id: String(session.customer),
            stripe_subscription_id: String(session.subscription),
            subscription_status: "active",
          })
          .eq("id", userId);
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const status = mapStatus(sub.status);
      const customerId = String(sub.customer);
      const periodEndEpoch = sub.items.data[0]?.current_period_end;
      const currentPeriodEnd = periodEndEpoch
        ? new Date(periodEndEpoch * 1000).toISOString()
        : null;

      // Find profile by customer id
      const { data: profile } = await service
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();

      if (profile) {
        await service
          .from("profiles")
          .update({
            subscription_status: status,
            stripe_subscription_id: sub.id,
            current_period_end: currentPeriodEnd,
          })
          .eq("id", profile.id);
      }
      break;
    }

    default:
      // Ignore others — Stripe sends many event types by default.
      break;
  }

  return NextResponse.json({ received: true });
}

function mapStatus(s: Stripe.Subscription.Status): SubscriptionStatus {
  switch (s) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
      return "canceled";
    case "incomplete":
    case "incomplete_expired":
      return "incomplete";
    default:
      return "free";
  }
}
