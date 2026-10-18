import { monthKey } from "./months";
import type { CategorizedTransaction } from "./types";

export interface CategoryComparison {
  category: string;
  firstCents: number;
  secondCents: number;
}

export interface MonthComparison {
  rows: CategoryComparison[];
  firstTotalCents: number;
  secondTotalCents: number;
  /** `second - first` in cents; positive means more spending in the second month. */
  diffCents: number;
  /** Change relative to the first month; null if the first month has no expenses. */
  diffPercent: number | null;
}

/** Compares expenses of two months (`YYYY-MM` keys) per category. Categories with no spending in either month are omitted. */
export function compareMonths(
  transactions: Pick<CategorizedTransaction, "category" | "expenseCents" | "date">[],
  first: string,
  second: string,
): MonthComparison {
  const byCategory = new Map<string, { first: number; second: number }>();
  let firstTotalCents = 0;
  let secondTotalCents = 0;

  for (const t of transactions) {
    const key = monthKey(t.date);
    const isFirst = key === first;
    const isSecond = key === second;
    if (!isFirst && !isSecond) continue;
    const entry = byCategory.get(t.category) ?? { first: 0, second: 0 };
    if (isFirst) {
      entry.first += t.expenseCents;
      firstTotalCents += t.expenseCents;
    }
    if (isSecond) {
      entry.second += t.expenseCents;
      secondTotalCents += t.expenseCents;
    }
    byCategory.set(t.category, entry);
  }

  const rows = [...byCategory]
    .map(([category, v]) => ({ category, firstCents: v.first, secondCents: v.second }))
    .sort(
      (a, b) =>
        Math.max(b.firstCents, b.secondCents) - Math.max(a.firstCents, a.secondCents) ||
        a.category.localeCompare(b.category),
    );

  const diffCents = secondTotalCents - firstTotalCents;
  return {
    rows,
    firstTotalCents,
    secondTotalCents,
    diffCents,
    diffPercent: firstTotalCents === 0 ? null : (diffCents / firstTotalCents) * 100,
  };
}
