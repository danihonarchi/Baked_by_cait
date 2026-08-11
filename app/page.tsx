import Link from "next/link";
import Nav from "@/components/Nav";
import HeroCookie from "@/components/HeroCookie";
import FlavorCase from "@/components/FlavorCase";

export default function Home() {
  return (
    <main>
      <Nav />

      {/* Hero */}
      <section className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-12 px-6 py-16 md:flex-row md:py-24">
        <div className="max-w-xl text-center md:text-left">
          <p className="font-ticket text-xs uppercase tracking-[0.2em] text-cherry">
            Norman, OK &middot; Baked to order
          </p>
          <h1 className="mt-3 font-display text-5xl italic leading-[1.05] text-cocoa md:text-6xl">
            Cookies worth the crumbs on your counter.
          </h1>
          <p className="mt-5 text-lg text-cocoa/70">
            Small batches, real butter, whatever flavor sounds good this week.
            Pick your dozen, choose pickup or local delivery, done.
          </p>
          <p className="mt-3 font-ticket text-sm text-cherry">
            Buy 4, get the 5th free &mdash; automatic at checkout.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
            <Link
              href="/order"
              className="rounded-full bg-cherry px-6 py-3 font-semibold text-parchment transition hover:bg-cocoa"
            >
              Build your box
            </Link>
            <a
              href="#flavors"
              className="rounded-full border border-cocoa/20 px-6 py-3 font-semibold text-cocoa transition hover:border-cocoa"
            >
              See flavors
            </a>
          </div>
        </div>
        <HeroCookie />
      </section>

      {/* Flavor case */}
      <section id="flavors" className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl italic text-cocoa">This week's case</h2>
          <p className="mt-2 text-cocoa/60">
            The lineup rotates. Whatever's below is what's fresh right now.
          </p>
        </div>
        <FlavorCase />
      </section>

      {/* Delivery / pickup blurb */}
      <section className="border-y border-cocoa/10 bg-buttercream/60">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 sm:grid-cols-2">
          <div>
            <h3 className="font-display text-2xl italic text-cocoa">Pickup</h3>
            <p className="mt-2 text-cocoa/70">
              Free, always. Grab your order from 1712 W Lindsey St, Norman, OK
              at the time you pick during checkout.
            </p>
          </div>
          <div>
            <h3 className="font-display text-2xl italic text-cocoa">Local delivery</h3>
            <p className="mt-2 text-cocoa/70">
              Delivered within about 15 miles of Norman. Enter your zip at
              checkout and the fee shows up automatically &mdash; no surprises.
            </p>
          </div>
        </div>
      </section>

      {/* Catering callout */}
      <section className="mx-auto max-w-6xl px-6 py-14 text-center">
        <h3 className="font-display text-2xl italic text-cocoa">Feeding a crowd?</h3>
        <p className="mx-auto mt-2 max-w-md text-cocoa/70">
          Weddings, offices, parties &mdash; tell us what you need and we&apos;ll send over a quote.
        </p>
        <Link
          href="/catering"
          className="mt-5 inline-block rounded-full border border-cocoa/20 px-6 py-3 font-semibold text-cocoa transition hover:border-cocoa"
        >
          Request a catering quote
        </Link>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-center text-sm text-cocoa/50">
        Baked by Cait &middot; Norman, Oklahoma &middot; Order 48 hours ahead when you can
      </footer>
    </main>
  );
}
