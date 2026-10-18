<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { computed, h } from "vue";
import { useI18n } from "vue-i18n";
import { UNKNOWN_PAYEE, type UnmatchedPayee } from "../lib/aggregate";
import { FALLBACK_CATEGORY } from "../lib/categorizer";
import { formatEuro } from "../lib/format";
import DashboardPanel from "./DashboardPanel.vue";

const { t } = useI18n();
const props = defineProps<{
  payees: UnmatchedPayee[];
  /** Selectable categories, without the fallback. */
  categories: string[];
  /** Current session assignment per payee. */
  overrides: Record<string, string>;
}>();

const emit = defineEmits<{ assign: [payee: string, category: string] }>();

const categoryItems = computed(() => [FALLBACK_CATEGORY, ...props.categories]);

const columns = computed<TableColumn<UnmatchedPayee>[]>(() => [
  {
    accessorKey: "payee",
    header: t("common.payee"),
    cell: ({ row }) => row.original.payee || UNKNOWN_PAYEE,
  },
  {
    accessorKey: "count",
    header: () => h("div", { class: "text-right" }, t("unmatched.bookings")),
    cell: ({ row }) => h("div", { class: "text-right" }, row.original.count),
  },
  {
    accessorKey: "cents",
    header: () => h("div", { class: "text-right" }, t("unmatched.sum")),
    cell: ({ row }) =>
      h("div", { class: "text-right whitespace-nowrap" }, formatEuro(row.original.cents)),
  },
  { id: "category", header: t("common.category") },
]);
</script>

<template>
  <DashboardPanel v-if="payees.length > 0" :title="t('unmatched.title', { count: payees.length })">
    <div class="grid gap-4">
      <UAlert
        color="neutral"
        variant="subtle"
        icon="i-lucide-info"
        :description="t('unmatched.info', { fallback: FALLBACK_CATEGORY })"
      />
      <UTable :data="payees" :columns="columns" class="max-h-96">
        <template #category-cell="{ row }">
          <USelect
            :model-value="overrides[row.original.payee] ?? FALLBACK_CATEGORY"
            :items="categoryItems"
            :aria-label="t('unmatched.categoryFor', { payee: row.original.payee || UNKNOWN_PAYEE })"
            class="w-56"
            @update:model-value="emit('assign', row.original.payee, $event as string)"
          />
        </template>
      </UTable>
    </div>
  </DashboardPanel>
</template>
