"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Nav from "@/components/Nav";
import { flavors, rolls, calculatePromoDiscountCents, COOKIE_MINIMUM, ROLL_MINIMUM, type Product } from "@/lib/flavors";
import { getDeliveryFeeCents, isDeliveryZip, PICKUP_ADDRESS, TIME_WINDOWS, getMinLeadDate } from "@/lib/delivery";

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

type Fulfillment = "pickup" | "delivery";

function ProductRow({
  product,
  qty,
  onChange,
}: {
  product: Product;
  qty: number;
  onChange: (delta: number) => void;
}) {
  return (
    <motion.div
      layout
      className="flex flex-col gap-3 rounded-2xl border border-cocoa/10 bg-buttercream/50 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
    >
      <div className="flex items-center gap-4">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-cookie">
          <Image src={product.image} alt={product.name} fill sizes="48px" className="object-cover" />
        </div>
        <div>
          <p className="font-display text-lg">{product.name}</p>
          <p className="text-sm text-cocoa/60">{product.tagline}</p>
          <p className="font-ticket text-xs text-cocoa/50">{formatCents(product.priceCents)} each</p>
        </div>
      </div>
      <div className="flex items-center gap-3 self-end sm:self-auto">
        <button
          type="button"
          aria-label={`Remove one ${product.name}`}
          onClick={() => onChange(-1)}
          className="h-10 w-10 rounded-full border border-cocoa/30 text-cocoa transition hover:bg-cocoa hover:text-parchment"
        >
          &minus;
        </button>
        <span className="w-6 text-center font-ticket">{qty}</span>
        <button
          type="button"
          aria-label={`Add one ${product.name}`}
          onClick={() => onChange(1)}
          className="h-10 w-10 rounded-full border border-cocoa/30 text-cocoa transition hover:bg-cocoa hover:text-parchment"
        >
          +
        </button>
      </div>
    </motion.div>
  );
}

export default function OrderPage() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [fulfillment, setFulfillment] = useState<Fulfillment>("pickup");

  const [fulfillmentDate, setFulfillmentDate] = useState("");
  const [fulfillmentWindow, setFulfillmentWindow] = useState(TIME_WINDOWS[0]);

  const [deliveryStreet, setDeliveryStreet] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("Norman");
  const [zip, setZip] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const minFulfillmentDate = useMemo(() => getMinLeadDate(), []);

  function updateQty(id: string, delta: number) {
    setQuantities((q) => ({ ...q, [id]: Math.max(0, (q[id] ?? 0) + delta) }));
  }

  const totalCookies = flavors.reduce((sum, f) => sum + (quantities[f.id] ?? 0), 0);
  const totalRolls = rolls.reduce((sum, r) => sum + (quantities[r.id] ?? 0), 0);

  const subtotalCents = [...flavors, ...rolls].reduce(
    (sum, p) => sum + (quantities[p.id] ?? 0) * p.priceCents,
    0
  );

  const promoDiscountCents = useMemo(() => {
    const cookieItems = flavors
      .filter((f) => (quantities[f.id] ?? 0) > 0)
      .map((f) => ({ unitPriceCents: f.priceCents, quantity: quantities[f.id] }));
    return calculatePromoDiscountCents(cookieItems);
  }, [quantities]);
  const freeCookieCount = Math.floor(totalCookies / 5);

  const deliveryFeeCents = useMemo(() => {
    if (fulfillment !== "delivery") return 0;
    return getDeliveryFeeCents(zip) ?? 0;
  }, [fulfillment, zip]);

  const zipRecognized = fulfillment === "pickup" || isDeliveryZip(zip);
  const totalCents = subtotalCents - promoDiscountCents + deliveryFeeCents;

  async function handleCheckout() {
    setError(null);

    if (totalCookies === 0 && totalRolls === 0) {
      setError("Add at least one item to your order.");
      return;
    }
    if (totalCookies > 0 && totalCookies < COOKIE_MINIMUM) {
      setError(`Cookie orders need a minimum of ${COOKIE_MINIMUM} cookies.`);
      return;
    }
    if (totalRolls > 0 && totalRolls < ROLL_MINIMUM) {
      setError(`Cinnamon roll orders need a minimum of ${ROLL_MINIMUM}.`);
      return;
    }
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Name, email, and phone number are all required so we can reach you about your order.");
      return;
    }
    if (!fulfillmentDate || !fulfillmentWindow) {
      setError(`Pick a ${fulfillment === "pickup" ? "pickup" : "delivery"} date and time window.`);
      return;
    }
    if (fulfillmentDate < minFulfillmentDate) {
      setError("At least a day's notice is needed, so pick a date a little further out.");
      return;
    }
    if (fulfillment === "delivery") {
      if (!deliveryStreet.trim() || !deliveryCity.trim() || !zip.trim()) {
        setError("Full delivery address (street, city, and zip) is required.");
        return;
      }
      if (!zipRecognized) {
        setError("That zip's outside our ~10 mile delivery area right now. Pickup might work better!");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [...flavors, ...rolls]
            .filter((p) => (quantities[p.id] ?? 0) > 0)
            .map((p) => ({ id: p.id, name: p.name, quantity: quantities[p.id] })),
          fulfillment,
          zip: fulfillment === "delivery" ? zip : null,
          deliveryAddress: fulfillment === "delivery" ? `${deliveryStreet}, ${deliveryCity}, OK ${zip}` : null,
          deliveryFeeCents,
          fulfillmentDate,
          fulfillmentWindow,
          customer: { name, email, phone, notes },
        }),
      });

      const data = await res.json().catch(() => ({}) as { error?: string; url?: string });

      if (!res.ok) {
        setError(data.error || "Something went wrong starting checkout. Please try again.");
        setLoading(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Checkout started but no payment page came back. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Couldn't reach checkout. Check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <main>
      <Nav />
      <section className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="font-display text-4xl italic text-cocoa">Build your box</h1>
        <p className="mt-2 text-cocoa/60">
          {COOKIE_MINIMUM} cookie minimum. Mix and match flavors.
        </p>

        <h2 className="mt-8 font-display text-2xl italic text-cocoa">Cookies</h2>
        <div className="mt-4 space-y-4">
          {flavors.map((f) => (
            <ProductRow key={f.id} product={f} qty={quantities[f.id] ?? 0} onChange={(d) => updateQty(f.id, d)} />
          ))}
        </div>

        <h2 className="mt-10 font-display text-2xl italic text-cocoa">Cinnamon Rolls</h2>
        <p className="mt-1 text-sm text-cocoa/60">
          {ROLL_MINIMUM} minimum. Not eligible for the cookie promo.
        </p>
        <div className="mt-4 space-y-4">
          {rolls.map((r) => (
            <ProductRow key={r.id} product={r} qty={quantities[r.id] ?? 0} onChange={(d) => updateQty(r.id, d)} />
          ))}
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

          {/* Date + time window — same for both pickup and delivery */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-cocoa/70" htmlFor="fulfillmentDate">
                {fulfillment === "pickup" ? "Pickup date" : "Delivery date"}
              </label>
              <p className="mt-0.5 text-xs text-cocoa/50">Available next day.</p>
              <input
                id="fulfillmentDate"
                type="date"
                min={minFulfillmentDate}
                value={fulfillmentDate}
                onChange={(e) => setFulfillmentDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-cocoa/20 bg-parchment px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-cocoa/70" htmlFor="fulfillmentWindow">
                {fulfillment === "pickup" ? "Pickup window" : "Delivery window"}
              </label>
              <select
                id="fulfillmentWindow"
                value={fulfillmentWindow}
                onChange={(e) => setFulfillmentWindow(e.target.value)}
                className="mt-1 w-full rounded-lg border border-cocoa/20 bg-parchment px-3 py-2"
              >
                {TIME_WINDOWS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {fulfillment === "pickup" ? (
            <p className="mt-4 text-sm text-cocoa/60">Pickup at {PICKUP_ADDRESS}.</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm text-cocoa/70" htmlFor="deliveryStreet">
                  Street address
                </label>
                <input
                  id="deliveryStreet"
                  value={deliveryStreet}
                  onChange={(e) => setDeliveryStreet(e.target.value)}
                  placeholder="123 Main St, Apt 2"
                  className="mt-1 w-full rounded-lg border border-cocoa/20 bg-parchment px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-cocoa/70" htmlFor="deliveryCity">
                  City
                </label>
                <input
                  id="deliveryCity"
                  value={deliveryCity}
                  onChange={(e) => setDeliveryCity(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-cocoa/20 bg-parchment px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-cocoa/70" htmlFor="zip">
                  Zip code
                </label>
                <input
                  id="zip"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="73019"
                  className="mt-1 w-full rounded-lg border border-cocoa/20 bg-parchment px-3 py-2"
                />
                {zip && (
                  <p className={`mt-2 text-sm ${zipRecognized ? "text-sprig" : "text-cherry"}`}>
                    {zipRecognized
                      ? `Delivery fee: ${formatCents(getDeliveryFeeCents(zip) ?? 0)}`
                      : "That zip is outside our ~10 mile delivery area right now."}
                  </p>
                )}
              </div>
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
          <div>
            <label className="block text-sm text-cocoa/70" htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(405) 555-0123"
              className="mt-1 w-full rounded-lg border border-cocoa/20 bg-parchment px-3 py-2"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-cocoa/70" htmlFor="notes">
              Notes (allergies, message on box)
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
          {totalCookies > 0 && (
            <div className="flex justify-between text-sm text-cocoa/70">
              <span>{totalCookies} cookies</span>
              <span>{formatCents(flavors.reduce((s, f) => s + (quantities[f.id] ?? 0) * f.priceCents, 0))}</span>
            </div>
          )}
          {totalRolls > 0 && (
            <div className="mt-1 flex justify-between text-sm text-cocoa/70">
              <span>{totalRolls} cinnamon roll{totalRolls > 1 ? "s" : ""}</span>
              <span>{formatCents(rolls.reduce((s, r) => s + (quantities[r.id] ?? 0) * r.priceCents, 0))}</span>
            </div>
          )}
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
