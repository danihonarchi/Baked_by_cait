import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { findProduct, calculatePromoDiscountCents, COOKIE_MINIMUM, ROLL_MINIMUM } from "@/lib/flavors";
import { getDeliveryFeeCents, isDeliveryZip } from "@/lib/delivery";

type IncomingItem = { id: string; quantity: number };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: IncomingItem[] = body.items ?? [];
    const fulfillment: "pickup" | "delivery" = body.fulfillment;
    const zip: string | null = body.zip ?? null;
    const deliveryAddress: string | null = body.deliveryAddress ?? null;
    const pickupDate: string | null = body.pickupDate ?? null;
    const pickupWindow: string | null = body.pickupWindow ?? null;
    const customer = body.customer ?? {};

    if (!items.length) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    // Never trust prices sent from the browser — recompute every line from
    // source-of-truth product data, and reject anything with an unknown id.
    let cookieCount = 0;
    let rollCount = 0;
    const line_items: {
      quantity: number;
      price_data: { currency: string; unit_amount: number; product_data: { name: string } };
    }[] = [];
    const promoEligibleItems: { unitPriceCents: number; quantity: number }[] = [];

    for (const item of items) {
      const product = findProduct(item.id);
      if (!product) {
        return NextResponse.json({ error: `Unknown item: ${item.id}` }, { status: 400 });
      }
      const quantity = Math.max(1, Math.floor(item.quantity));
      if (product.category === "cookie") cookieCount += quantity;
      if (product.category === "roll") rollCount += quantity;
      if (product.promoEligible) {
        promoEligibleItems.push({ unitPriceCents: product.priceCents, quantity });
      }
      line_items.push({
        quantity,
        price_data: {
          currency: "usd",
          unit_amount: product.priceCents,
          product_data: { name: product.name },
        },
      });
    }

    if (cookieCount > 0 && cookieCount < COOKIE_MINIMUM) {
      return NextResponse.json({ error: `Cookie orders need a minimum of ${COOKIE_MINIMUM} cookies` }, { status: 400 });
    }
    if (rollCount > 0 && rollCount < ROLL_MINIMUM) {
      return NextResponse.json({ error: `Cinnamon roll orders need a minimum of ${ROLL_MINIMUM}` }, { status: 400 });
    }

    if (fulfillment === "delivery") {
      if (!zip || !isDeliveryZip(zip)) {
        return NextResponse.json({ error: "Zip code is outside the delivery area" }, { status: 400 });
      }
      if (!deliveryAddress) {
        return NextResponse.json({ error: "A full delivery address is required" }, { status: 400 });
      }
      const feeCents = getDeliveryFeeCents(zip);
      if (feeCents) {
        line_items.push({
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: feeCents,
            product_data: { name: `Local delivery (${zip})` },
          },
        });
      }
    }

    if (fulfillment === "pickup" && (!pickupDate || !pickupWindow)) {
      return NextResponse.json({ error: "A pickup date and time window are required" }, { status: 400 });
    }
    if (fulfillment === "pickup" && pickupDate) {
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 1);
      minDate.setHours(0, 0, 0, 0);
      const requested = new Date(`${pickupDate}T00:00:00`);
      if (requested < minDate) {
        return NextResponse.json({ error: "Pickup needs at least a day's notice" }, { status: 400 });
      }
    }

    if (!customer.phone) {
      return NextResponse.json({ error: "A phone number is required" }, { status: 400 });
    }

    // Buy 4, get the 5th free — cookies only, recomputed server-side.
    const promoDiscountCents = calculatePromoDiscountCents(promoEligibleItems);

    let discounts: { coupon: string }[] | undefined;
    if (promoDiscountCents > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: promoDiscountCents,
        currency: "usd",
        duration: "once",
        name: "Buy 4, get the 5th free",
      });
      discounts = [{ coupon: coupon.id }];
    }

    const origin = req.headers.get("origin") ?? process.env.SITE_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      discounts,
      customer_email: customer.email || undefined,
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/order`,
      metadata: {
        fulfillment,
        zip: zip ?? "",
        deliveryAddress: deliveryAddress ?? "",
        pickupDate: pickupDate ?? "",
        pickupWindow: pickupWindow ?? "",
        customerName: customer.name ?? "",
        customerPhone: customer.phone ?? "",
        notes: (customer.notes ?? "").slice(0, 400),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    // Log the real error server-side (visible in Vercel's function logs)
    // while keeping the client-facing message generic and safe.
    console.error("Checkout error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Checkout failed. Please try again in a moment." }, { status: 500 });
  }
}
