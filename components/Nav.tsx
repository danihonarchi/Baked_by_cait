import Link from "next/link";
import Image from "next/image";

export default function Nav() {
  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between gap-2 px-4 py-3 backdrop-blur bg-parchment/80 border-b border-cocoa/10 sm:px-6">
      <Link href="/" className="flex shrink-0 items-center">
        <Image
          src="/images/logo.png"
          alt="Baked by Cait"
          width={160}
          height={82}
          className="h-9 w-auto sm:h-12"
          priority
        />
      </Link>
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/catering"
          className="whitespace-nowrap rounded-full border border-cocoa/20 px-3 py-1.5 text-xs font-semibold text-cocoa transition hover:border-cocoa sm:px-5 sm:py-2 sm:text-sm"
        >
          Catering
        </Link>
        <Link
          href="/order"
          className="whitespace-nowrap rounded-full bg-cherry px-3 py-1.5 text-xs font-semibold text-parchment transition hover:bg-cocoa focus:outline-none focus-visible:ring-2 focus-visible:ring-cocoa focus-visible:ring-offset-2 focus-visible:ring-offset-parchment sm:px-5 sm:py-2 sm:text-sm"
        >
          Order Now
        </Link>
      </div>
    </nav>
  );
}
