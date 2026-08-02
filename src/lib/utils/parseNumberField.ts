/** Parses a form input's raw string into a number, or null for an empty/invalid field. */
export function parseNumberField(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
