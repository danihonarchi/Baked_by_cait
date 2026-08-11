"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

// Each stage is a set of circles (all curves, no straight edges) that get
// cut out of the cookie photo via a CSS mask. Circles are allowed to hang
// off the left edge of the 256x256 box on purpose — only the part inside
// the box actually cuts into the cookie, which is what gives the bite its
// rounded, uneven "real bite" silhouette instead of a single clean circle.
const BITE_STAGES: { cx: number; cy: number; r: number }[][] = [
  [], // stage 0: whole cookie
  [{ cx: 2, cy: 128, r: 54 }], // stage 1: one clean bite from the left edge
  [
    { cx: 2, cy: 128, r: 54 },
    { cx: 38, cy: 34, r: 40 }, // stage 2: same bite + a second, separate one near the top
  ],
];

const CAPTIONS = ["go ahead, take a bite", "one more bite?", "good, isn't it? tap to start over"];

function circlePath(cx: number, cy: number, r: number): string {
  return `M${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} Z`;
}

function buildMask(stage: number): string {
  const circles = BITE_STAGES[stage];
  const rect = "M0,0 H256 V256 H0 Z";
  const holes = circles.map((c) => circlePath(c.cx, c.cy, c.r)).join(" ");
  // A single path, rect + circles, using evenodd fill: the circle areas
  // become true holes (alpha 0) rather than just a different color — mask
  // images in browsers cut based on transparency, not color.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="${rect} ${holes}" fill="black" fill-rule="evenodd"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export default function HeroCookie() {
  const [stage, setStage] = useState(0);
  const mask = useMemo(() => buildMask(stage), [stage]);

  return (
    <div className="relative flex flex-col items-center gap-4">
      <motion.button
        type="button"
        aria-label={stage === 0 ? "Take a bite" : "Take another bite"}
        onClick={() => setStage((s) => (s + 1) % BITE_STAGES.length)}
        initial={{ rotate: -6, y: -10, opacity: 0 }}
        animate={{ rotate: [-6, -2, -6], y: 0, opacity: 1 }}
        transition={{
          rotate: { repeat: Infinity, duration: 6, ease: "easeInOut" },
          y: { duration: 0.8, ease: "easeOut" },
          opacity: { duration: 0.8 },
        }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="relative h-56 w-56 sm:h-64 sm:w-64 shrink-0 rounded-cookie grain-shadow focus:outline-none focus-visible:ring-4 focus-visible:ring-cherry/50"
        style={{
          WebkitMaskImage: mask,
          maskImage: mask,
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          maskMode: "alpha",
        }}
      >
        <Image
          src="/images/deluxe-chocolate-chip.png"
          alt="Deluxe chocolate chip cookie"
          fill
          sizes="(min-width: 640px) 256px, 224px"
          className="object-cover rounded-cookie"
          priority
        />
      </motion.button>

      <p className="font-ticket text-xs uppercase tracking-widest text-cocoa/60 max-w-[16rem] text-center">
        {CAPTIONS[stage]}
      </p>
    </div>
  );
}
