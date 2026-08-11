// Edit this file to change what's for sale. Prices are in cents (USD).
export type Flavor = {
  id: string;
  name: string;
  tagline: string;
  pricePerCookieCents: number;
  image: string; // path in /public/images
  tags: string[];
};

export const flavors: Flavor[] = [
  {
    id: "deluxe-chocolate-chip",
    name: "Deluxe Chocolate Chip",
    tagline: "Loaded with chocolate chips, soft and gooey center",
    pricePerCookieCents: 400,
    image: "/images/deluxe-chocolate-chip.png",
    tags: ["classic", "best seller"],
  },
  {
    id: "smores",
    name: "S'mores",
    tagline: "Chocolate chip base, gooey marshmallow, graham crumble",
    pricePerCookieCents: 400,
    image: "/images/smores.png",
    tags: ["fan favorite"],
  },
  {
    id: "oreo",
    name: "Oreo",
    tagline: "Chunks of Oreo and white chocolate throughout",
    pricePerCookieCents: 400,
    image: "/images/oreo.png",
    tags: ["crowd pleaser"],
  },
  {
    id: "nutella",
    name: "Nutella",
    tagline: "Hazelnut chocolate swirled through every bite",
    pricePerCookieCents: 400,
    image: "/images/nutella.png",
    tags: ["rich"],
  },
  {
    id: "salted-caramel",
    name: "Salted Caramel",
    tagline: "Buttery caramel pockets, finished with flaky salt",
    pricePerCookieCents: 400,
    image: "/images/salted-caramel.png",
    tags: ["sweet & salty"],
  },
  {
    id: "white-chocolate-macadamia",
    name: "White Chocolate Macadamia Nut",
    tagline: "White chocolate chunks and toasted macadamia nuts",
    pricePerCookieCents: 400,
    image: "/images/white-choc-macadamia.png",
    tags: ["classic"],
  },
];

// Promo: buy 4 cookies, get the 5th free. Applies to total cookie count
// across all flavors — every group of 5 cookies, one is free (the cheapest
// one in that group, though all cookies are the same price right now).
export function calculatePromoDiscountCents(items: { unitPriceCents: number; quantity: number }[]): number {
  // Expand into a flat list of unit prices, cheapest-first so the "free"
  // one is never the most expensive item if prices ever differ.
  const unitPrices: number[] = [];
  for (const item of items) {
    for (let i = 0; i < item.quantity; i++) unitPrices.push(item.unitPriceCents);
  }
  unitPrices.sort((a, b) => a - b);

  const freeCookieCount = Math.floor(unitPrices.length / 5);
  let discount = 0;
  for (let i = 0; i < freeCookieCount; i++) {
    discount += unitPrices[i];
  }
  return discount;
}
