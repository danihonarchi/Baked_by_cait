import Link from "next/link";
import Image from "next/image";

export default function Nav() {
  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-3 backdrop-blur bg-parchment/80 border-b border-cocoa/10">
      <Link href="/" className="flex items-center">
        <Image
          src="/images/logo.png"
          alt="Baked by Cait"
          width={160}
          height={82}
          className="h-12 w-auto"
          priority
        />
      </Link>
      <div className="flex items-center gap-3">
        <Link
          href="/catering"
          className="hidden sm:inline-block rounded-full border border-cocoa/20 px-5 py-2 text-sm font-semibold text-cocoa transition hover:border-cocoa"
        >
          Catering
        </Link>
        <Link
          href="/order"
          className="rounded-full bg-cherry px-5 py-2 text-sm font-semibold text-parchment transition hover:bg-cocoa focus:outline-none focus-visible:ring-2 focus-visible:ring-cocoa focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
        >
          Order Now
        </Link>
      </div>
    </nav>
  );
}
