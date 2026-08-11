import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { flavors, calculatePromoDiscountCents } from "@/lib/flavors";
import { getDeliveryFeeCents, isDeliveryZip } from "@/lib/delivery";

type IncomingItem = { id: string; quantity: number };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: IncomingItem[] = body.items ?? [];
    const fulfillment: "pickup" | "delivery" = body.fulfillment;
    const zip: string | null = body.zip ?? null;
    const customer = body.customer ?? {};

    if (!items.length) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    const totalCookies = items.reduce((sum, item) => sum + Math.max(1, Math.floor(item.quantity)), 0);
    if (totalCookies < 4) {
      return NextResponse.json({ error: "Minimum order is 4 cookies" }, { status: 400 });
    }

    // Never trust prices/fees sent from the browser — recompute from source of truth.
    const line_items = items.map((item) => {
      const flavor = flavors.find((f) => f.id === item.id);
      if (!flavor) throw new Error(`Unknown flavor: ${item.id}`);
      const quantity = Math.max(1, Math.floor(item.quantity));
      return {
        quantity,
        price_data: {
          currency: "usd",
          unit_amount: flavor.pricePerCookieCents,
          product_data: { name: flavor.name },
        },
      };
    });

    if (fulfillment === "delivery") {
      if (!zip || !isDeliveryZip(zip)) {
        return NextResponse.json(
          { error: "Zip code is outside the delivery area" },
          { status: 400 }
        );
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

    // Buy 4, get the 5th free — recomputed from source-of-truth prices,
    // never trust a discount amount sent from the browser.
    const cookieItems = items.map((item) => {
      const flavor = flavors.find((f) => f.id === item.id)!;
      return { unitPriceCents: flavor.pricePerCookieCents, quantity: Math.max(1, Math.floor(item.quantity)) };
    });
    const promoDiscountCents = calculatePromoDiscountCents(cookieItems);

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
        customerName: customer.name ?? "",
        notes: (customer.notes ?? "").slice(0, 400),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
