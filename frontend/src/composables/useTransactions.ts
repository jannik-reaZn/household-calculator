import { computed, ref } from "vue";
import mappingJson from "../../../data/mapping.json";
import { unmatchedPayees } from "../lib/aggregate";
import { categorizeTransactions, FALLBACK_CATEGORY } from "../lib/categorizer";
import { CsvParseError, parseBankCsv } from "../lib/parseBankCsv";
import type { CategorizedTransaction, Transaction } from "../lib/types";

/** All categories a transaction can have: those from `mapping.json` plus the fallback. */
export const ALL_CATEGORIES: string[] = [...Object.keys(mappingJson), FALLBACK_CATEGORY];

// Module-level state: the app has exactly one dataset. Held in memory only; never persisted or sent anywhere.
const rawTransactions = ref<Transaction[]>([]);
const fileName = ref<string | null>(null);
const error = ref<string | null>(null);
const loading = ref(false);
/** Session-only category per payee (exact payee text); takes precedence over `mapping.json`. */
const overrides = ref<Record<string, string>>({});
/** Incremented on every upload so dependent state (e.g. the month range) can reset. */
const uploadId = ref(0);
let loadCounter = 0;

/** Categorized by `mapping.json` only, ignoring session overrides. */
const baseTransactions = computed(() => categorizeTransactions(rawTransactions.value));

const transactions = computed<CategorizedTransaction[]>(() =>
  baseTransactions.value.map((transaction) => ({
    ...transaction,
    category: overrides.value[transaction.payee] ?? transaction.category,
  })),
);

/** Payees that no `mapping.json` keyword matched (whole file), whether or not they have an override. */
const unmatchedPayeeList = computed(() => unmatchedPayees(baseTransactions.value));

function reset() {
  rawTransactions.value = [];
  overrides.value = {};
  fileName.value = null;
  error.value = null;
}

/** Replaces all previous data (including overrides) with the contents of `file`. */
async function loadFile(file: File): Promise<void> {
  const current = ++loadCounter;
  uploadId.value++;
  reset();
  loading.value = true;
  try {
    const parsed = parseBankCsv(new Uint8Array(await file.arrayBuffer()));
    if (current !== loadCounter) return;
    rawTransactions.value = parsed;
    fileName.value = file.name;
    if (parsed.length === 0) error.value = "Die Datei enthält keine Ausgaben.";
  } catch (e) {
    if (current !== loadCounter) return;
    error.value = e instanceof CsvParseError ? e.message : "Die Datei konnte nicht gelesen werden.";
  } finally {
    if (current === loadCounter) loading.value = false;
  }
}

function setPayeeCategory(payee: string, category: string) {
  overrides.value = { ...overrides.value, [payee]: category };
}

function clearPayeeCategory(payee: string) {
  const { [payee]: _removed, ...rest } = overrides.value;
  overrides.value = rest;
}

export function useTransactions() {
  return {
    transactions,
    unmatchedPayees: unmatchedPayeeList,
    fileName,
    error,
    loading,
    uploadId,
    overrides,
    loadFile,
    setPayeeCategory,
    clearPayeeCategory,
  };
}

/** Test helper: forgets everything. */
export function resetTransactions() {
  loadCounter++;
  loading.value = false;
  reset();
}
