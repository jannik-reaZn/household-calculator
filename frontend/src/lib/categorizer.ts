import mappingJson from "../../../data/mapping.json";
import type { CategorizedTransaction, Transaction } from "./types";

export const FALLBACK_CATEGORY = "Others";

/** Category name -> keywords. Category order in the object is the precedence. */
export type CategoryMapping = Record<string, string[]>;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Case-insensitive whole-word match: no letter or digit directly before or after the keyword. */
function keywordRegExp(keyword: string): RegExp {
  return new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(keyword.trim())}(?![\\p{L}\\p{N}])`, "iu");
}

/**
 * Builds a categorizer for the given mapping. The first category (in object order) with a
 * matching keyword wins; transactions without a match get `FALLBACK_CATEGORY`.
 */
export function createCategorizer(mapping: CategoryMapping) {
  const rules = Object.entries(mapping).map(([category, keywords]) => ({
    category,
    patterns: keywords.filter((keyword) => keyword.trim() !== "").map(keywordRegExp),
  }));

  return function categorize(transaction: Pick<Transaction, "payee" | "purpose">): string {
    // Newline separator so a keyword can't match across the payee/purpose boundary.
    const text = `${transaction.payee}\n${transaction.purpose}`;
    for (const { category, patterns } of rules) {
      if (patterns.some((pattern) => pattern.test(text))) return category;
    }
    return FALLBACK_CATEGORY;
  };
}

const categorizeWithRepoMapping = createCategorizer(mappingJson);

/** Categorizes transactions with the rules from `data/mapping.json`. */
export function categorizeTransactions(transactions: Transaction[]): CategorizedTransaction[] {
  return transactions.map((transaction) => ({
    ...transaction,
    category: categorizeWithRepoMapping(transaction),
  }));
}
