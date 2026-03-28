import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/service";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

async function resolveUserId(supabase: ReturnType<typeof createServiceClient>, email: string): Promise<string | null> {
  // Try profiles table first (email synced from auth.users)
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (profile) return profile.id;

  // Fallback: look up via auth admin API
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const user = users.find((u) => u.email === email);
  return user?.id ?? null;
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const PRICE_PLUS_WEEKLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_PLUS_WEEKLY;
  const PRICE_MATTER_PACK = process.env.NEXT_PUBLIC_STRIPE_PRICE_MATTER_PACK;

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerEmail = session.customer_details?.email;
        const priceId = session.metadata?.price_id;

        if (!customerEmail || !priceId) break;

        const userId = await resolveUserId(supabase, customerEmail);

        if (priceId === PRICE_MATTER_PACK) {
          if (userId) {
            await supabase.from("profiles").update({
              matter_pack_purchased: true,
              matter_pack_session_id: session.id,
              matter_pack_purchased_at: new Date().toISOString(),
              stripe_customer_id: session.customer as string | null,
            }).eq("id", userId);
          }

          // Record the paid matter request
          await supabase.from("matter_requests").insert({
            user_id: userId,
            name: session.customer_details?.name ?? "",
            email: customerEmail,
            stripe_session_id: session.id,
            amount_paid: session.amount_total,
            status: "paid",
          });

        } else if (priceId === PRICE_PLUS_WEEKLY && userId) {
          await supabase.from("profiles").update({
            subscription_tier: "plus",
            stripe_customer_id: session.customer as string | null,
            stripe_subscription_id: session.subscription as string | null,
          }).eq("id", userId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const tier = (sub.status === "active" || sub.status === "trialing") ? "plus" : "free";

        await supabase.from("profiles")
          .update({ subscription_tier: tier })
          .eq("stripe_customer_id", sub.customer as string);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await supabase.from("profiles")
          .update({ subscription_tier: "free", stripe_subscription_id: null })
          .eq("stripe_customer_id", sub.customer as string);
        break;
      }

      default:
        console.log("Unhandled Stripe event:", event.type);
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
