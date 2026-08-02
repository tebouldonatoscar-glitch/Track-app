/**
 * Synthetic id for a manually added product that has no real barcode
 * (e.g. a generic staple like eggs or flour). Kept distinct from real
 * EAN/UPC barcodes (digits only) so the two never collide.
 */
export function generateManualProductId(name: string): string {
  const combiningDiacritics = new RegExp("[\\u0300-\\u036f]", "g");
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(combiningDiacritics, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return `generic-${slug || "produit"}-${suffix}`;
}
