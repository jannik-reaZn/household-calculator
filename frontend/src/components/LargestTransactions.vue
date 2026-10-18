<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { computed, h } from "vue";
import { useI18n } from "vue-i18n";
import { largestTransactions, UNKNOWN_PAYEE } from "../lib/aggregate";
import { formatDate, formatEuro } from "../lib/format";
import type { CategorizedTransaction } from "../lib/types";
import DashboardPanel from "./DashboardPanel.vue";

const LIMIT = 10;

const { t } = useI18n();
const props = defineProps<{ transactions: CategorizedTransaction[] }>();

const largest = computed(() => largestTransactions(props.transactions, LIMIT));

const columns = computed<TableColumn<CategorizedTransaction>[]>(() => [
  {
    accessorKey: "date",
    header: t("topPayees.date"),
    cell: ({ row }) => formatDate(row.original.date),
  },
  {
    accessorKey: "payee",
    header: t("common.payee"),
    cell: ({ row }) => row.original.payee || UNKNOWN_PAYEE,
  },
  { accessorKey: "purpose", header: t("topPayees.purpose") },
  { accessorKey: "category", header: t("common.category") },
  {
    accessorKey: "expenseCents",
    header: () => h("div", { class: "text-right" }, t("common.amount")),
    cell: ({ row }) =>
      h(
        "div",
        { class: "text-right whitespace-nowrap tabular-nums" },
        formatEuro(row.original.expenseCents),
      ),
  },
]);
</script>

<template>
  <DashboardPanel :title="t('topPayees.largestTitle')">
    <UTable v-if="largest.length > 0" :data="largest" :columns="columns" />
    <UEmpty v-else icon="i-lucide-receipt" :title="t('common.noExpenses')" />
  </DashboardPanel>
</template>
