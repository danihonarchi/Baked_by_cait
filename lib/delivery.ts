// Simple zip-code based delivery zone for launch. Good enough for a 15 mile
// radius around one shop, no Google Maps API key required.
//
// To upgrade to a real "as the crow flies" radius check later, swap
// getDeliveryFeeCents() to call the Google Maps Distance Matrix API with the
// customer's address and compare against your shop's lat/lng.

export const PICKUP_ADDRESS = "1712 W Lindsey St, Norman, OK";

// Zips within roughly 15 miles of Norman, OK. Edit this list to match your
// actual delivery area — this is a starting point, not verified mileage.
const DELIVERY_ZIPS: Record<string, number> = {
  "73019": 500, // Norman - campus
  "73026": 500, // Norman
  "73069": 500, // Norman
  "73071": 500, // Norman
  "73072": 600, // Norman west
  "73160": 800, // Moore
  "73170": 800, // Moore
  "73159": 900, // South OKC
  "73139": 900, // South OKC
  "73135": 1000, // Del City / SE OKC
};

export function isDeliveryZip(zip: string): boolean {
  return zip.trim() in DELIVERY_ZIPS;
}

export function getDeliveryFeeCents(zip: string): number | null {
  const fee = DELIVERY_ZIPS[zip.trim()];
  return fee ?? null;
}

export const DELIVERY_ZONE_LIST = Object.keys(DELIVERY_ZIPS);
