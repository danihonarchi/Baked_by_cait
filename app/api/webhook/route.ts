import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";
import { BUSINESS_EMAIL } from "@/lib/config";
import Stripe from "stripe";

function formatCents(cents: number | null) {
  if (cents == null) return "$0.00";
  return `$${(cents / 100).toFixed(2)}`;
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    console.error("Webhook missing signature or STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });

      const itemLines = lineItems.data
        .map((li) => `  ${li.quantity} x ${li.description}: ${formatCents(li.amount_total)}`)
        .join("\n");

      const meta = session.metadata ?? {};
      const fulfillment = meta.fulfillment ?? "unknown";

      const fulfillmentLines =
        fulfillment === "pickup"
          ? [`Pickup date: ${meta.pickupDate || "not set"}`, `Pickup window: ${meta.pickupWindow || "not set"}`]
          : [`Delivery address: ${meta.deliveryAddress || "not set"}`, `Delivery zip: ${meta.zip || "not set"}`];

      const emailText = [
        `New order! ${formatCents(session.amount_total)} total.`,
        "",
        `Fulfillment: ${fulfillment}`,
        ...fulfillmentLines,
        "",
        "Items:",
        itemLines,
        "",
        `Customer: ${meta.customerName || "not provided"}`,
        `Phone: ${meta.customerPhone || "not provided"}`,
        `Email: ${session.customer_details?.email || "not provided"}`,
        "",
        `Notes: ${meta.notes || "none"}`,
        "",
        `Stripe payment: https://dashboard.stripe.com/payments/${session.payment_intent}`,
      ].join("\n");

      await sendEmail({
        to: BUSINESS_EMAIL,
        subject: `New order: ${formatCents(session.amount_total)} (${fulfillment})`,
        text: emailText,
      });
    } catch (err) {
      // Log but still return 200 below — Stripe already has the payment,
      // a notification-email hiccup shouldn't trigger Stripe's retry storm.
      console.error("Failed to send order notification email:", err instanceof Error ? err.message : err);
    }
  }

  return NextResponse.json({ received: true });
}
