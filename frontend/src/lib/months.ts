import type { Transaction } from "./types";

/** `YYYY-MM` key of an ISO date. */
export function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7);
}

/** Sorted unique `YYYY-MM` keys that occur in the transactions. */
export function availableMonths(transactions: Pick<Transaction, "date">[]): string[] {
  return [...new Set(transactions.map((t) => monthKey(t.date)))].sort();
}

/** `2026-07` -> `Juli 2026`. */
export function formatMonth(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Keeps transactions whose month lies within `from`..`to` (inclusive, `YYYY-MM` keys). */
export function filterByMonthRange<T extends Pick<Transaction, "date">>(
  transactions: T[],
  from: string,
  to: string,
): T[] {
  return transactions.filter((t) => {
    const key = monthKey(t.date);
    return key >= from && key <= to;
  });
}

/** Every month from `from` to `to` inclusive, without gaps (`YYYY-MM` keys). */
export function monthsBetween(from: string, to: string): string[] {
  const result: string[] = [];
  let [year, month] = from.split("-").map(Number);
  const [endYear, endMonth] = to.split("-").map(Number);
  while (year < endYear || (year === endYear && month <= endMonth)) {
    result.push(`${year}-${String(month).padStart(2, "0")}`);
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }
  return result;
}
