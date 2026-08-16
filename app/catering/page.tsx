"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Nav from "@/components/Nav";
import { allProducts } from "@/lib/flavors";
import { getMinLeadDate } from "@/lib/delivery";

import { BUSINESS_EMAIL } from "@/lib/config";

const CATERING_EMAIL = BUSINESS_EMAIL;

export default function CateringPage() {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const minEventDate = useMemo(() => getMinLeadDate(), []);

  function toggle(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const chosenFlavors = allProducts.filter((f) => selected[f.id]);
    if (!name.trim() || !email.trim() || !phone.trim() || !eventDate) {
      setError("Name, email, phone, and event date are all required so we can quote this.");
      return;
    }
    if (eventDate < minEventDate) {
      setError("We need at least a day's notice, so pick a date a little further out.");
      return;
    }
    if (chosenFlavors.length === 0) {
      setError("Pick at least one flavor you're interested in.");
      return;
    }

    const subject = encodeURIComponent(`Catering quote request from ${name}, ${eventDate}`);
    const body = encodeURIComponent(
      [
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || "Not provided"}`,
        `Event date needed: ${eventDate}`,
        `Approx. guest count: ${guestCount || "Not provided"}`,
        `Flavors interested in: ${chosenFlavors.map((f) => f.name).join(", ")}`,
        "",
        `Notes: ${notes || "None"}`,
      ].join("\n")
    );

    window.location.href = `mailto:${CATERING_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <main>
      <Nav />
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-display text-4xl italic text-cocoa">Catering &amp; large orders</h1>
        <p className="mt-2 text-cocoa/60">
          Tell us what you're picturing and we'll follow up with pricing.
          This just opens an email to us with your details already filled
          in. Nothing gets charged here, we'll get back to you first.
        </p>

        {sent && (
          <div className="mt-6 rounded-2xl border border-sprig/30 bg-sprig/10 p-4 text-sprig">
            Your email app should be open with the request ready to send. If nothing opened, email us directly at {CATERING_EMAIL}.
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          <div>
            <p className="font-semibold text-cocoa">Which flavors are you interested in?</p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {allProducts.map((f) => (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => toggle(f.id)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition ${
                    selected[f.id] ? "border-cherry bg-buttercream" : "border-cocoa/15"
                  }`}
                >
                  <div className="relative h-16 w-16 overflow-hidden rounded-cookie">
                    <Image src={f.image} alt={f.name} fill sizes="64px" className="object-cover" />
                  </div>
                  <span className="text-xs font-medium leading-tight text-cocoa">{f.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-cocoa/70" htmlFor="name">Name</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-cocoa/20 bg-parchment px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-cocoa/70" htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-cocoa/20 bg-parchment px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-cocoa/70" htmlFor="phone">Phone</label>
              <input id="phone" required value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-lg border border-cocoa/20 bg-parchment px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-cocoa/70" htmlFor="eventDate">Date needed</label>
              <p className="mt-0.5 text-xs text-cocoa/50">Please allow at least 3 days' notice for catering orders.</p>
              <input
                id="eventDate"
                type="date"
                min={minEventDate}
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-cocoa/20 bg-parchment px-3 py-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-cocoa/70" htmlFor="guestCount">Approx. guest count / cookie count</label>
              <input id="guestCount" value={guestCount} onChange={(e) => setGuestCount(e.target.value)} placeholder="e.g. 50 guests, or 100 cookies" className="mt-1 w-full rounded-lg border border-cocoa/20 bg-parchment px-3 py-2" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-cocoa/70" htmlFor="notes">Anything else we should know?</label>
              <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-cocoa/20 bg-parchment px-3 py-2" />
            </div>
          </div>

          {error && <p className="text-sm text-cherry">{error}</p>}

          <button type="submit" className="w-full rounded-full bg-cherry py-3 font-semibold text-parchment transition hover:bg-cocoa sm:w-auto sm:px-8">
            Send quote request
          </button>
        </form>
      </section>
    </main>
  );
}
