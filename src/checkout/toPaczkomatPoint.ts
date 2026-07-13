import type { PaczkomatPoint } from "./types";

/**
 * Maps the easyPack widget's selection to our PaczkomatPoint. The widget's
 * `name` is the point code; the display name is assembled as "street, city"
 * here at capture time so every downstream surface (cart line, confirmation
 * and admin emails) shows the full point address without any change to the
 * shipping-address contract — `name` stays an opaque string (#75, ADR-0003).
 */
export function toPaczkomatPoint(point: EasyPackPoint): PaczkomatPoint {
  const street = point.address?.line1;
  const city = point.address?.city;
  return {
    code: point.name,
    name: street ? (city ? `${street}, ${city}` : street) : point.name,
    city,
  };
}
