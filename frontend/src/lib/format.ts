const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

/** `12345` -> `123,45 €` */
export function formatEuro(cents: number): string {
  return euro.format(cents / 100);
}

/** `2026-07-05` -> `05.07.2026` */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}`;
}

/** `1234` -> `+12,34 €`, `-500` -> `-5,00 €` (explicit plus sign for positive values). */
export function formatSignedEuro(cents: number): string {
  return `${cents > 0 ? "+" : ""}${formatEuro(cents)}`;
}

/** `12.34` -> `+12,3 %` */
export function formatSignedPercent(percent: number): string {
  const text = percent.toLocaleString("de-DE", { maximumFractionDigits: 1 });
  return `${percent > 0 ? "+" : ""}${text} %`;
}
