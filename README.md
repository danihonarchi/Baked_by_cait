# Baked by Cait — starter site

A small, cheap-to-run ordering site: animated cookie hero, a flip-card flavor
case, and a checkout flow that takes payment via Stripe with a pickup or
local-delivery choice. No shipping, no inventory system, nothing you don't need yet.

Stack: Next.js 14 + Tailwind + Framer Motion + Stripe Checkout, meant to run
free on Vercel.

## 1. Run it locally

You'll need [Node.js](https://nodejs.org) 18+ installed.

```bash
npm install
cp .env.example .env.local
# fill in .env.local, see below
npm run dev
```

Open http://localhost:3000.

## 2. Get a Stripe key

1. Create a free account at https://dashboard.stripe.com/register
2. In the dashboard, go to **Developers → API keys**
3. Copy the **Secret key** (starts with `sk_test_...` while testing) into
   `.env.local` as `STRIPE_SECRET_KEY`
4. Test payments with card number `4242 4242 4242 4242`, any future expiry, any CVC
5. When you're ready to take real money, flip Stripe out of test mode and
   swap in the live secret key (`sk_live_...`)

Stripe's cut is the standard ~2.9% + 30 cents per transaction, no monthly fee.

## 3. Customize it

Everything you'll want to change day-to-day lives in a few files:

- **`lib/flavors.ts`** — flavor names, taglines, prices, tags, and which
  photo each one uses. Add or remove flavors here; the flavor case, order
  page, and catering page all update automatically. This is also where the
  "buy 4 get the 5th free" math lives (`calculatePromoDiscountCents`) — it
  applies to every 5 cookies across the whole order, not per flavor.
- **`lib/delivery.ts`** — which zip codes get delivery and what the fee is
  for each. It's a simple lookup table to start (not a true mileage
  calculation) — good enough for a single shop with a ~15 mile radius. If
  you want a real "how far is this address" check later, this is the file
  to swap out for a Google Maps Distance Matrix API call.
- **`public/images/`** — the actual cookie and logo photos. To swap a photo,
  replace the file with the same name (e.g. drop a new `oreo.jpg` in) or add
  a new file and point to it from `lib/flavors.ts`. Square-ish photos crop
  cleanest into the circular cookie shapes.
- **`app/catering/page.tsx`** — line 8, `CATERING_EMAIL`, is currently a
  placeholder (`hello@bakedbycait.com`). Change it to the real inbox that
  should receive catering requests. Right now, submitting the form opens the
  customer's own email app with the request pre-filled (name, date, flavors,
  notes) so it just works with zero extra setup or monthly cost. If you'd
  rather requests land automatically without the customer needing to hit
  "send" in their own email client, swap that `mailto:` for a free form
  backend like Formspree — happy to wire that up if you want it.

Colors and fonts are in `tailwind.config.ts` and `app/layout.tsx` if you want
to adjust the palette (currently a butterscotch / cherry / cocoa bakery
theme) or swap the display font.

## 4. What this doesn't do yet (on purpose)

- **No order dashboard.** Every paid order shows up in your Stripe dashboard
  under Payments, with the customer's name/notes/zip in the metadata. For a
  handful of orders a week that's genuinely enough — no need for a database yet.
- **No automatic "you've got a new order" text/email to Cait.** Stripe will
  email the customer a receipt automatically. If you want a ping to Cait's
  phone too, the cheapest add-on is a Stripe webhook that posts to a Zapier
  or Make.com flow that texts/emails her — happy to wire that up once the
  base site is live and you know you want it.
- **No shipping.** Deliberately left out per your ask — pickup and local
  delivery only.

## 5. Deploy it (free)

1. Push this folder to a GitHub repo
2. Go to https://vercel.com, sign in with GitHub, "Import Project," pick the repo
3. In Vercel's project settings, add the same environment variables from
   `.env.local` (`STRIPE_SECRET_KEY`, `SITE_URL` set to your real domain)
4. Deploy — Vercel gives you a free `*.vercel.app` URL immediately; you can
   point a custom domain at it later for ~$12/year through any registrar

Total recurring cost: $0/month platform fee (Vercel free tier + Stripe's
per-transaction cut only). A custom domain is the only optional cost.
