/** Lowercases and strips accents/diacritics so text search is accent- and case-insensitive. */
export function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "");
}
