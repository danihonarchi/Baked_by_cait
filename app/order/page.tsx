"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Nav from "@/components/Nav";
import { flavors, calculatePromoDiscountCents } from "@/lib/flavors";
import { getDeliveryFeeCents, isDeliveryZip, PICKUP_ADDRESS } from "@/lib/delivery";

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

type Fulfillment = "pickup" | "delivery";

export default function OrderPage() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [fulfillment, setFulfillment] = useState<Fulfillment>("pickup");
  const [zip, setZip] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalCookies = Object.values(quantities).reduce((a, b) => a + b, 0);

  const subtotalCents = flavors.reduce((sum, f) => {
    const qty = quantities[f.id] ?? 0;
    return sum + qty * f.pricePerCookieCents;
  }, 0);

  const deliveryFeeCents = useMemo(() => {
    if (fulfillment !== "delivery") return 0;
    return getDeliveryFeeCents(zip) ?? 0;
  }, [fulfillment, zip]);

  const promoDiscountCents = useMemo(() => {
    const cookieItems = flavors
      .filter((f) => (quantities[f.id] ?? 0) > 0)
      .map((f) => ({ unitPriceCents: f.pricePerCookieCents, quantity: quantities[f.id] }));
    return calculatePromoDiscountCents(cookieItems);
  }, [quantities]);
  const freeCookieCount = Math.floor(totalCookies / 5);

  const zipRecognized = fulfillment === "pickup" || isDeliveryZip(zip);
  const totalCents = subtotalCents - promoDiscountCents + deliveryFeeCents;

  function updateQty(id: string, delta: number) {
    setQuantities((q) => {
      const next = Math.max(0, (q[id] ?? 0) + delta);
      return { ...q, [id]: next };
    });
  }

  async function handleCheckout() {
    setError(null);

    if (totalCookies < 4) {
      setError("Minimum order is 4 cookies.");
      return;
    }
    if (!name.trim() || !email.trim()) {
      setError("Please add your name and email so we can confirm the order.");
      return;
    }
    if (fulfillment === "delivery" && !zipRecognized) {
      setError("That zip is outside our delivery area right now — try pickup instead.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: flavors
            .filter((f) => (quantities[f.id] ?? 0) > 0)
            .map((f) => ({ id: f.id, name: f.name, quantity: quantities[f.id], unitPriceCents: f.pricePerCookieCents })),
          fulfillment,
          zip: fulfillment === "delivery" ? zip : null,
          deliveryFeeCents,
          customer: { name, email, notes },
        }),
      });

      if (!res.ok) throw new Error("Checkout failed");
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setError("Something went wrong starting checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <Nav />
      <section className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="font-display text-4xl italic text-cocoa">Build your box</h1>
        <p className="mt-2 text-cocoa/60">4 cookie minimum. Mix and match flavors.</p>

        <div className="mt-8 space-y-4">
          {flavors.map((f) => {
            const qty = quantities[f.id] ?? 0;
            return (
              <motion.div
                key={f.id}
                layout
                className="flex flex-col gap-3 rounded-2xl border border-cocoa/10 bg-buttercream/50 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-cookie">
                    <Image src={f.image} alt={f.name} fill sizes="48px" className="object-cover" />
                  </div>
                  <div>
                    <p className="font-display text-lg">{f.name}</p>
                    <p className="text-sm text-cocoa/60">{f.tagline}</p>
                    <p className="font-ticket text-xs text-cocoa/50">{formatCents(f.pricePerCookieCents)} each</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <button
                    type="button"
                    aria-label={`Remove one ${f.name}`}
                    onClick={() => updateQty(f.id, -1)}
                    className="h-10 w-10 rounded-full border border-cocoa/30 text-cocoa transition hover:bg-cocoa hover:text-parchment"
                  >
                    &minus;
                  </button>
                  <span className="w-6 text-center font-ticket">{qty}</span>
                  <button
                    type="button"
                    aria-label={`Add one ${f.name}`}
                    onClick={() => updateQty(f.id, 1)}
                    className="h-10 w-10 rounded-full border border-cocoa/30 text-cocoa transition hover:bg-cocoa hover:text-parchment"
                  >
                    +
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Fulfillment */}
        <div className="mt-10">
          <p className="font-semibold text-cocoa">How should we get these to you?</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setFulfillment("pickup")}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                fulfillment === "pickup" ? "bg-cocoa text-parchment" : "border border-cocoa/30 text-cocoa"
              }`}
            >
              Pickup (free)
            </button>
            <button
              type="button"
              onClick={() => setFulfillment("delivery")}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                fulfillment === "delivery" ? "bg-cocoa text-parchment" : "border border-cocoa/30 text-cocoa"
              }`}
            >
              Local delivery
            </button>
          </div>

          {fulfillment === "pickup" ? (
            <p className="mt-3 text-sm text-cocoa/60">Pickup at {PICKUP_ADDRESS}. We'll text you when it's ready.</p>
          ) : (
            <div className="mt-3">
              <label className="block text-sm text-cocoa/70" htmlFor="zip">
                Delivery zip code
              </label>
              <input
                id="zip"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="73019"
                className="mt-1 w-40 rounded-lg border border-cocoa/20 bg-parchment px-3 py-2"
              />
              {zip && (
                <p className={`mt-2 text-sm ${zipRecognized ? "text-sprig" : "text-cherry"}`}>
                  {zipRecognized
                    ? `Delivery fee: ${formatCents(getDeliveryFeeCents(zip) ?? 0)}`
                    : "That zip is outside our ~15 mile delivery area right now."}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Contact */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm text-cocoa/70" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-cocoa/20 bg-parchment px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-cocoa/70" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-cocoa/20 bg-parchment px-3 py-2"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-cocoa/70" htmlFor="notes">
              Notes (allergies, message on box, pickup time preference)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-cocoa/20 bg-parchment px-3 py-2"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="mt-10 rounded-2xl border border-cocoa/10 bg-buttercream/50 p-5">
          <div className="flex justify-between text-sm text-cocoa/70">
            <span>{totalCookies} cookies</span>
            <span>{formatCents(subtotalCents)}</span>
          </div>
          {promoDiscountCents > 0 && (
            <div className="mt-1 flex justify-between text-sm text-sprig">
              <span>
                Buy 4 get 1 free ({freeCookieCount} free cookie{freeCookieCount > 1 ? "s" : ""})
              </span>
              <span>&minus;{formatCents(promoDiscountCents)}</span>
            </div>
          )}
          {fulfillment === "delivery" && (
            <div className="mt-1 flex justify-between text-sm text-cocoa/70">
              <span>Delivery fee</span>
              <span>{formatCents(deliveryFeeCents)}</span>
            </div>
          )}
          <div className="mt-3 flex justify-between border-t border-cocoa/10 pt-3 font-display text-xl">
            <span>Total</span>
            <span>{formatCents(totalCents)}</span>
          </div>

          {error && <p className="mt-3 text-sm text-cherry">{error}</p>}

          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading}
            className="mt-5 w-full rounded-full bg-cherry py-3 font-semibold text-parchment transition hover:bg-cocoa disabled:opacity-60"
          >
            {loading ? "Starting checkout…" : "Checkout"}
          </button>
        </div>
      </section>
    </main>
  );
}
