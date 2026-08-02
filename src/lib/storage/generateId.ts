function slugify(name: string): string {
  const combiningDiacritics = new RegExp("[\\u0300-\\u036f]", "g");
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(combiningDiacritics, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueSuffix(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Synthetic id for a manually added product that has no real barcode
 * (e.g. a generic staple like eggs or flour). Kept distinct from real
 * EAN/UPC barcodes (digits only) so the two never collide.
 */
export function generateManualProductId(name: string): string {
  const slug = slugify(name);
  return `generic-${slug || "produit"}-${uniqueSuffix()}`;
}

/** Synthetic id for a user-composed recipe, kept distinct from product barcodes. */
export function generateRecipeId(name: string): string {
  const slug = slugify(name);
  return `recipe-${slug || "recette"}-${uniqueSuffix()}`;
}
