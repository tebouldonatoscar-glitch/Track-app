/**
 * Thin wrapper over the Vibration API. There's no real Taptic Engine access
 * on the web (iOS Safari doesn't expose `navigator.vibrate` at all), so this
 * is a best-effort Android-only enhancement that silently no-ops elsewhere.
 */

function vibrate(pattern: number | number[]): void {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  navigator.vibrate(pattern);
}

/** Light tap feedback for a button press. */
export function hapticTap(): void {
  vibrate(10);
}

/** Success feedback, e.g. after adding a food to history. */
export function hapticSuccess(): void {
  vibrate([15, 40, 15]);
}
