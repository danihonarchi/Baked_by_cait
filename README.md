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

## 3. Set up order notification emails

New orders email Cait automatically (full order details, not just "you got
paid") using Stripe webhooks + Resend for the actual sending. Two things to
set up:

**Resend (sends the email):**
1. Create a free account at https://resend.com (3,000 emails/month free)
2. Go to **API Keys**, create one, and copy it into `.env.local` as
   `RESEND_API_KEY`
3. Out of the box this sends from Resend's own shared address
   (`orders@resend.dev`), which works immediately with zero setup. For
   better deliverability later, verify your own domain in Resend and update
   `FROM_ADDRESS` in `lib/email.ts`.

**Stripe webhook (tells your site when a payment completes):**
1. In the Stripe dashboard, go to **Developers → Webhooks → Add endpoint**
2. Endpoint URL: `https://your-deployed-url.vercel.app/api/webhook` (your
   real Vercel URL, not localhost — this step only matters for the deployed
   site, not local dev)
3. Select the event `checkout.session.completed`
4. After creating it, copy the **Signing secret** (starts with `whsec_...`)
   into your environment as `STRIPE_WEBHOOK_SECRET`

Where Cait's notification email goes is set in `lib/config.ts`
(`BUSINESS_EMAIL`) — change it there if it ever needs to be a different inbox.

## 4. Customize it

Everything you'll want to change day-to-day lives in a few files:

- **`lib/flavors.ts`** — flavor and cinnamon roll names, taglines, prices,
  tags, photos, and category (`cookie` vs `roll`). Add or remove items here;
  the flavor case, order page, and catering page all update automatically.
  Each category has its own minimum order quantity (`COOKIE_MINIMUM`,
  `ROLL_MINIMUM`, both 4 by default) and a `promoEligible` flag — only
  cookies are eligible for "buy 4 get the 5th free" right now.
- **`lib/delivery.ts`** — which zip codes get delivery and what the fee is
  for each. It's a simple lookup table (not a true mileage calculation) —
  good enough for a single shop with a ~10 mile radius. If
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

## 5. What this doesn't do yet (on purpose)

- **No order dashboard.** Every paid order shows up in your Stripe dashboard
  under Payments, with the customer's name/notes/zip in the metadata. For a
  handful of orders a week that's genuinely enough — no need for a database yet.
- **No shipping.** Deliberately left out per your ask — pickup and local
  delivery only.

## 6. Deploy it (free)

1. Push this folder to a GitHub repo
2. Go to https://vercel.com, sign in with GitHub, "Import Project," pick the repo
3. In Vercel's project settings, add the same environment variables from
   `.env.local` (`STRIPE_SECRET_KEY`, `SITE_URL` set to your real domain)
4. Deploy — Vercel gives you a free `*.vercel.app` URL immediately; you can
   point a custom domain at it later for ~$12/year through any registrar

Total recurring cost: $0/month platform fee (Vercel free tier + Stripe's
per-transaction cut only). A custom domain is the only optional cost.
