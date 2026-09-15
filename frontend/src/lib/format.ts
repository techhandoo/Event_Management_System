/**
 * Shared formatters — one owner for money and date display.
 * Before this module, `₹${(c/100).toFixed(2)}` and half a dozen divergent
 * `toLocaleDateString` option sets were hand-rolled per page, so the same
 * timestamp rendered differently across Dashboard, MyBookings, Organizer and
 * Admin. Add new variants here, not inline in pages.
 */

/** Price in paise → "Free" for 0, else "₹123.45". */
export function formatMoney(cents: number): string {
 return cents === 0 ? 'Free' : `₹${(cents / 100).toFixed(2)}`;
}

/** Revenue/money stat that must always show a number ("₹0.00", never "Free"). */
export function formatINR(cents: number): string {
 return `₹${(cents / 100).toFixed(2)}`;
}

/** Event listing / table cells: "Mar 14, 6:30 PM". */
export function formatDateShort(iso: string): string {
 return new Date(iso).toLocaleDateString('en-US', {
  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
 });
}

/** Event detail hero: "Saturday, March 14, 2026 at 6:30 PM". */
export function formatDateLong(iso: string): string {
 return new Date(iso).toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
 });
}

/** Timestamps in tables/feeds (booked at, joined at): browser-default date only. */
export function formatDateOnly(iso: string): string {
 return new Date(iso).toLocaleDateString();
}
