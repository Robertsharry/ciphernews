import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, priceIds } from "@/lib/stripe/client";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, stripe_customer_id, subscription_status")
    .eq("id", user.id)
    .single();

  const form = await request.formData();
  const plan = form.get("plan") === "yearly" ? "yearly" : "monthly";

  const stripe = getStripe();
  const prices = priceIds();
  const price = plan === "yearly" ? prices.yearly : prices.monthly;

  let customerId = profile?.stripe_customer_id ?? undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email ?? undefined,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price, quantity: 1 }],
    success_url: `${origin}/billing?success=1`,
    cancel_url: `${origin}/billing?canceled=1`,
    allow_promotion_codes: true,
    subscription_data: { metadata: { user_id: user.id } },
    client_reference_id: user.id,
  });

  if (!session.url) {
    return NextResponse.json({ error: "Stripe did not return a URL" }, { status: 500 });
  }
  return NextResponse.redirect(session.url, { status: 303 });
}
