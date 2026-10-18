<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import CategoryDonut from "../components/CategoryDonut.vue";
import CategoryTrend from "../components/CategoryTrend.vue";
import LargestTransactions from "../components/LargestTransactions.vue";
import MonthComparison from "../components/MonthComparison.vue";
import MonthRangeSelector from "../components/MonthRangeSelector.vue";
import TopPayees from "../components/TopPayees.vue";
import UnmatchedPayees from "../components/UnmatchedPayees.vue";
import { useMonthRange } from "../composables/useMonthRange";
import { ALL_CATEGORIES, useTransactions } from "../composables/useTransactions";
import { categoryTotals } from "../lib/aggregate";
import { FALLBACK_CATEGORY } from "../lib/categorizer";
import { formatEuro } from "../lib/format";
import { monthsBetween } from "../lib/months";

const { t } = useI18n();
const { transactions, unmatchedPayees, overrides, setPayeeCategory, clearPayeeCategory } =
  useTransactions();
const { months, from, to, rangeTransactions, setFrom, setTo } = useMonthRange();

const assignableCategories = ALL_CATEGORIES.filter((c) => c !== FALLBACK_CATEGORY);

function assign(payee: string, category: string) {
  if (category === FALLBACK_CATEGORY) clearPayeeCategory(payee);
  else setPayeeCategory(payee, category);
}

const totalCents = computed(() =>
  rangeTransactions.value.reduce((sum, t) => sum + t.expenseCents, 0),
);

const tab = ref("overview");
const tabs = computed(() => [
  { label: t("analysis.tabOverview"), value: "overview", icon: "i-lucide-layout-dashboard" },
  { label: t("analysis.tabDetails"), value: "details", icon: "i-lucide-table" },
]);

const monthCount = computed(() =>
  from.value && to.value ? monthsBetween(from.value, to.value).length : 0,
);
const averageCents = computed(() =>
  monthCount.value > 0 ? Math.round(totalCents.value / monthCount.value) : 0,
);
const topCategory = computed(() => categoryTotals(rangeTransactions.value)[0] ?? null);
const topShare = computed(() =>
  topCategory.value && totalCents.value > 0
    ? ((topCategory.value.cents / totalCents.value) * 100).toLocaleString("de-DE", {
        maximumFractionDigits: 1,
      })
    : "0",
);

const kpis = computed(() => [
  { label: t("analysis.kpiTotal"), value: formatEuro(totalCents.value) },
  { label: t("analysis.kpiAverage"), value: formatEuro(averageCents.value) },
  {
    label: t("analysis.kpiBookings"),
    value: rangeTransactions.value.length.toLocaleString("de-DE"),
  },
  {
    label: t("analysis.kpiTopCategory"),
    value: topCategory.value?.category ?? "–",
    hint: topCategory.value ? t("analysis.kpiShare", { percent: topShare.value }) : "",
  },
]);
</script>

<template>
  <div
    class="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 lg:h-[calc(100svh-var(--ui-header-height)-3.5rem)] lg:min-h-[640px]"
  >
    <UEmpty
      v-if="transactions.length === 0"
      icon="i-lucide-file-x"
      :title="t('analysis.emptyTitle')"
      :description="t('analysis.emptyDescription')"
      :actions="[{ label: t('analysis.toUpload'), icon: 'i-lucide-upload', to: '/upload' }]"
    />
    <template v-else>
      <div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div class="flex items-center gap-6">
          <h1 class="text-xl font-semibold text-highlighted">{{ t("analysis.heading") }}</h1>
          <UTabs v-model="tab" :items="tabs" :content="false" size="sm" variant="pill" />
        </div>
        <MonthRangeSelector
          :months="months"
          :from="from"
          :to="to"
          @update:from="setFrom"
          @update:to="setTo"
        />
      </div>

      <dl
        class="grid shrink-0 grid-cols-2 divide-default rounded-lg border border-default bg-default lg:grid-cols-4 lg:divide-x"
      >
        <div
          v-for="(kpi, i) in kpis"
          :key="kpi.label"
          class="min-w-0 px-4 py-3"
          :class="{ 'border-t border-default lg:border-t-0': i >= 2 }"
        >
          <dt class="text-xs text-muted">{{ kpi.label }}</dt>
          <dd class="truncate text-xl font-semibold text-highlighted tabular-nums">
            {{ kpi.value }}
          </dd>
          <p v-if="kpi.hint" class="text-xs text-muted tabular-nums">{{ kpi.hint }}</p>
        </div>
      </dl>

      <div
        v-if="tab === 'overview'"
        class="grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-12 lg:grid-rows-2"
      >
        <CategoryDonut class="lg:col-span-4" :transactions="rangeTransactions" />
        <CategoryTrend
          v-if="from && to"
          class="lg:col-span-8"
          :transactions="rangeTransactions"
          :from="from"
          :to="to"
        />
        <TopPayees class="lg:col-span-5" :transactions="rangeTransactions" />
        <MonthComparison class="lg:col-span-7" :transactions="transactions" :months="months" />
      </div>
      <div v-else class="grid auto-rows-max gap-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
        <LargestTransactions :transactions="rangeTransactions" />
        <UnmatchedPayees
          :payees="unmatchedPayees"
          :categories="assignableCategories"
          :overrides="overrides"
          @assign="assign"
        />
      </div>
    </template>
  </div>
</template>
