import { computed, ref, watch } from "vue";
import { availableMonths, filterByMonthRange } from "../lib/months";
import { useTransactions } from "./useTransactions";

const { transactions, uploadId } = useTransactions();

// User selections; null means "default" (first / last month in the data).
const selectedFrom = ref<string | null>(null);
const selectedTo = ref<string | null>(null);

// A new upload resets the selection.
watch(uploadId, () => {
  selectedFrom.value = null;
  selectedTo.value = null;
});

/** Months present in the data, ascending. */
const months = computed(() => availableMonths(transactions.value));

const from = computed(() =>
  selectedFrom.value && months.value.includes(selectedFrom.value)
    ? selectedFrom.value
    : (months.value[0] ?? null),
);
const to = computed(() =>
  selectedTo.value && months.value.includes(selectedTo.value)
    ? selectedTo.value
    : (months.value.at(-1) ?? null),
);

/** Transactions within the selected range; drives donut, trend and top-payees views. */
const rangeTransactions = computed(() =>
  from.value && to.value ? filterByMonthRange(transactions.value, from.value, to.value) : [],
);

function setFrom(month: string) {
  selectedFrom.value = month;
  if (to.value && month > to.value) selectedTo.value = month;
}

function setTo(month: string) {
  selectedTo.value = month;
  if (from.value && month < from.value) selectedFrom.value = month;
}

export function useMonthRange() {
  return { months, from, to, rangeTransactions, setFrom, setTo };
}
