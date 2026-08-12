// Simple zip-code based delivery zone. Good enough for a ~10 mile radius
// around one shop, no Google Maps API key required.
//
// IMPORTANT: this is a zip-code approximation, not a real driving-distance
// or straight-line-distance check. Zip codes cover an area, not a point —
// some addresses inside a "safe" zip could be right at the edge of 10
// miles, and some addresses in a zip you haven't added could actually be
// closer than 10 miles. Double check any zip you add here against your
// actual shop address using a maps app before trusting it. Only zips
// squarely within Norman are included by default; the previous Moore/OKC
// zips were removed since they were more likely to exceed 10 miles from
// the new pickup address.
//
// To upgrade to a real "as the crow flies" or driving-distance radius
// check later, swap getDeliveryFeeCents() to call the Google Maps
// Distance Matrix API with the customer's full address and compare
// against your shop's lat/lng.

export const PICKUP_ADDRESS = "810 Nebraska St, Norman, OK";

const DELIVERY_ZIPS: Record<string, number> = {
  "73019": 500, // Norman - campus
  "73026": 500, // Norman
  "73069": 500, // Norman
  "73071": 500, // Norman
  "73072": 600, // Norman west
};

export function isDeliveryZip(zip: string): boolean {
  return zip.trim() in DELIVERY_ZIPS;
}

export function getDeliveryFeeCents(zip: string): number | null {
  const fee = DELIVERY_ZIPS[zip.trim()];
  return fee ?? null;
}

export const DELIVERY_ZONE_LIST = Object.keys(DELIVERY_ZIPS);

// Fixed pickup time windows offered at checkout for online orders. Edit
// this list to match how far ahead you need for baking + how you want to
// split up the day.
export const PICKUP_WINDOWS = [
  "9:00 AM – 11:00 AM",
  "11:00 AM – 1:00 PM",
  "1:00 PM – 3:00 PM",
  "3:00 PM – 5:00 PM",
];
