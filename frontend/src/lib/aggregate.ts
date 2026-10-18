import { FALLBACK_CATEGORY } from "./categorizer";
import type { CategorizedTransaction } from "./types";

export interface CategoryTotal {
  category: string;
  cents: number;
}

/** Expense totals per category, largest first. */
export function categoryTotals(
  transactions: Pick<CategorizedTransaction, "category" | "expenseCents">[],
): CategoryTotal[] {
  const totals = new Map<string, number>();
  for (const t of transactions) {
    totals.set(t.category, (totals.get(t.category) ?? 0) + t.expenseCents);
  }
  return [...totals]
    .map(([category, cents]) => ({ category, cents }))
    .sort((a, b) => b.cents - a.cents || a.category.localeCompare(b.category));
}

export interface CategorySeries {
  category: string;
  /** Expense in cents for each month, aligned with the `months` argument; 0 where nothing was spent. */
  cents: number[];
}

/** Monthly expense per category for the given categories and months (`YYYY-MM` keys). */
export function categoryTrend(
  transactions: Pick<CategorizedTransaction, "category" | "expenseCents" | "date">[],
  categories: string[],
  months: string[],
): CategorySeries[] {
  const monthIndex = new Map(months.map((month, i) => [month, i]));
  const series = new Map(categories.map((category) => [category, months.map(() => 0)]));
  for (const t of transactions) {
    const values = series.get(t.category);
    const i = monthIndex.get(t.date.slice(0, 7));
    if (values && i !== undefined) values[i] += t.expenseCents;
  }
  return categories.map((category) => ({ category, cents: series.get(category)! }));
}

export const UNKNOWN_PAYEE = "Unbekannt";

export interface PayeeTotal {
  payee: string;
  cents: number;
}

/** The `limit` payees with the highest total expenses, largest first. Empty payees become "Unbekannt". */
export function topPayees(
  transactions: Pick<CategorizedTransaction, "payee" | "expenseCents">[],
  limit: number,
): PayeeTotal[] {
  const totals = new Map<string, number>();
  for (const t of transactions) {
    const payee = t.payee.trim() || UNKNOWN_PAYEE;
    totals.set(payee, (totals.get(payee) ?? 0) + t.expenseCents);
  }
  return [...totals]
    .map(([payee, cents]) => ({ payee, cents }))
    .sort((a, b) => b.cents - a.cents || a.payee.localeCompare(b.payee))
    .slice(0, limit);
}

/** The `limit` single transactions with the highest expense, largest first (ties: newest first). */
export function largestTransactions<
  T extends Pick<CategorizedTransaction, "expenseCents" | "date">,
>(transactions: T[], limit: number): T[] {
  return [...transactions]
    .sort((a, b) => b.expenseCents - a.expenseCents || b.date.localeCompare(a.date))
    .slice(0, limit);
}

export interface UnmatchedPayee {
  payee: string;
  count: number;
  cents: number;
}

/** Payees whose transactions are in the fallback category, largest total first. Expects mapping-only categories. */
export function unmatchedPayees(
  transactions: Pick<CategorizedTransaction, "payee" | "category" | "expenseCents">[],
): UnmatchedPayee[] {
  const byPayee = new Map<string, UnmatchedPayee>();
  for (const t of transactions) {
    if (t.category !== FALLBACK_CATEGORY) continue;
    const entry = byPayee.get(t.payee) ?? { payee: t.payee, count: 0, cents: 0 };
    entry.count++;
    entry.cents += t.expenseCents;
    byPayee.set(t.payee, entry);
  }
  return [...byPayee.values()].sort((a, b) => b.cents - a.cents || a.payee.localeCompare(b.payee));
}
