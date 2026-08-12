"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { Product } from "@/lib/flavors";

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function ProductFlipCard({ product, delay = 0 }: { product: Product; delay?: number }) {
  return (
    <motion.div
      className="group [perspective:1200px]"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="relative aspect-square w-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus-within:[transform:rotateY(180deg)]">
        {/* Front */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-cocoa/10 bg-buttercream p-5 [backface-visibility:hidden]">
          <div className="relative h-36 w-36 overflow-hidden rounded-cookie grain-shadow">
            <Image src={product.image} alt={product.name} fill sizes="144px" className="object-cover" />
          </div>
          <p className="text-center font-display text-lg leading-tight">{product.name}</p>
          <span className="font-ticket text-xs text-cocoa/50">hover to see details</span>
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-cocoa p-5 text-center text-parchment [backface-visibility:hidden]"
          style={{ transform: "rotateY(180deg)" }}
        >
          <p className="font-display text-lg">{product.name}</p>
          <p className="text-sm text-parchment/80">{product.tagline}</p>
          <p className="font-ticket text-base text-buttercream">{formatPrice(product.priceCents)} each</p>
          <div className="flex flex-wrap justify-center gap-1 pt-1">
            {product.tags.map((t) => (
              <span key={t} className="rounded-full border border-parchment/30 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
