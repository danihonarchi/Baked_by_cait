import Nav from "@/components/Nav";

export default function OrderSuccessPage() {
  return (
    <main>
      <Nav />
      <section className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="font-ticket text-xs uppercase tracking-widest text-cherry">Order received</p>
        <h1 className="mt-3 font-display text-4xl italic text-cocoa">You're on the list.</h1>
        <p className="mt-4 text-cocoa/70">
          Thanks for ordering! You'll get a confirmation email shortly with
          pickup or delivery details. Questions in the meantime? Just reply to
          that email.
        </p>
      </section>
    </main>
  );
}
