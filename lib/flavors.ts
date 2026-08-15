// Edit this file to change what's for sale. Prices are in cents (USD).
export type ProductCategory = "cookie" | "roll";

export type Product = {
  id: string;
  name: string;
  tagline: string;
  priceCents: number;
  image: string; // path in /public/images
  tags: string[];
  category: ProductCategory;
  promoEligible: boolean; // whether this item counts toward "buy 4 get the 5th free"
};

// Minimum quantity required per category, only enforced if the customer
// ordered anything at all from that category.
export const COOKIE_MINIMUM = 4;
export const ROLL_MINIMUM = 4;

export const flavors: Product[] = [
  {
    id: "deluxe-chocolate-chip",
    name: "Deluxe Chocolate Chip",
    tagline: "Loaded with chocolate chips, soft and gooey center",
    priceCents: 400,
    image: "/images/deluxe-chocolate-chip.png",
    tags: ["classic", "best seller"],
    category: "cookie",
    promoEligible: true,
  },
  {
    id: "smores",
    name: "S'mores",
    tagline: "Chocolate chip base, gooey marshmallow, graham crumble",
    priceCents: 400,
    image: "/images/smores.png",
    tags: ["fan favorite"],
    category: "cookie",
    promoEligible: true,
  },
  {
    id: "oreo",
    name: "Oreo",
    tagline: "Chunks of Oreo and white chocolate throughout",
    priceCents: 400,
    image: "/images/oreo.png",
    tags: ["crowd pleaser"],
    category: "cookie",
    promoEligible: true,
  },
  {
    id: "nutella",
    name: "Nutella",
    tagline: "Hazelnut chocolate swirled through every bite",
    priceCents: 400,
    image: "/images/nutella.png",
    tags: ["rich"],
    category: "cookie",
    promoEligible: true,
  },
  {
    id: "salted-caramel",
    name: "Salted Caramel",
    tagline: "Buttery caramel pockets, finished with flaky salt",
    priceCents: 400,
    image: "/images/salted-caramel.png",
    tags: ["sweet & salty"],
    category: "cookie",
    promoEligible: true,
  },
  {
    id: "white-chocolate-macadamia",
    name: "White Chocolate Macadamia Nut",
    tagline: "White chocolate chunks and toasted macadamia nuts",
    priceCents: 400,
    image: "/images/white-choc-macadamia.png",
    tags: ["classic"],
    category: "cookie",
    promoEligible: true,
  },
];

export const rolls: Product[] = [
  {
    id: "cinnamon-roll-vanilla-cream-cheese",
    name: "Cinnamon Roll with Vanilla Cream Cheese",
    tagline: "Soft, swirled, and finished with vanilla cream cheese icing",
    priceCents: 600,
    image: "/images/cinnamon-roll.jpg",
    tags: ["not eligible for cookie promo"],
    category: "roll",
    promoEligible: false,
  },
];

export const allProducts: Product[] = [...flavors, ...rolls];

export function findProduct(id: string): Product | undefined {
  return allProducts.find((p) => p.id === id);
}

// Promo: buy 4 cookies, get the 5th free. Applies only to promo-eligible
// items (cookies), never rolls. Every group of 5, one is free.
export function calculatePromoDiscountCents(items: { unitPriceCents: number; quantity: number }[]): number {
  const unitPrices: number[] = [];
  for (const item of items) {
    for (let i = 0; i < item.quantity; i++) unitPrices.push(item.unitPriceCents);
  }
  unitPrices.sort((a, b) => a - b);

  const freeCount = Math.floor(unitPrices.length / 5);
  let discount = 0;
  for (let i = 0; i < freeCount; i++) discount += unitPrices[i];
  return discount;
}
