// Sends transactional email via Resend (resend.com). Free tier covers far
// more volume than a small bakery needs. Requires RESEND_API_KEY to be set
// — without it, this logs a warning and skips sending rather than crashing
// the webhook (a missing notification email shouldn't ever block Stripe
// from confirming the payment succeeded).

const RESEND_API_URL = "https://api.resend.com/emails";

// Resend's shared sending domain works out of the box with zero setup,
// good for getting started. For better deliverability (fewer emails
// landing in spam) once you're ready, verify your own domain in Resend
// and change this to something like "orders@bakedbycait.com".
const FROM_ADDRESS = "Baked by Cait <orders@resend.dev>";

export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY is not set — skipping email send:", subject);
    return;
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [to],
      subject,
      text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("Resend email failed:", res.status, body);
  }
}
