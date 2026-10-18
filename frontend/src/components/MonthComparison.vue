<script setup lang="ts">
import { BarChart } from "echarts/charts";
import { GridComponent, LegendComponent, TooltipComponent } from "echarts/components";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import VChart from "vue-echarts";
import DashboardPanel from "./DashboardPanel.vue";
import { useChartTheme } from "../composables/useChartTheme";
import { compareMonths } from "../lib/comparison";
import { formatEuro, formatSignedEuro, formatSignedPercent } from "../lib/format";
import { formatMonth } from "../lib/months";
import type { CategorizedTransaction } from "../lib/types";

use([BarChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

const { t } = useI18n();
const props = defineProps<{
  /** All transactions of the file, independent of the global month range. */
  transactions: CategorizedTransaction[];
  /** All months present in the file, ascending. */
  months: string[];
}>();
const { theme } = useChartTheme();

// null = default: the last two months in the file
const selectedFirst = ref<string | null>(null);
const selectedSecond = ref<string | null>(null);

const first = computed(() =>
  selectedFirst.value && props.months.includes(selectedFirst.value)
    ? selectedFirst.value
    : (props.months.at(-2) ?? null),
);
const second = computed(() =>
  selectedSecond.value && props.months.includes(selectedSecond.value)
    ? selectedSecond.value
    : (props.months.at(-1) ?? null),
);

const items = computed(() =>
  props.months.map((month) => ({ label: formatMonth(month), value: month })),
);

const comparison = computed(() =>
  first.value && second.value ? compareMonths(props.transactions, first.value, second.value) : null,
);

// ECharts needs distinct series names, also when the same month is picked twice.
const names = computed(() => {
  const a = first.value ? formatMonth(first.value) : "";
  const b = second.value ? formatMonth(second.value) : "";
  return a === b ? [`${a} (1)`, `${b} (2)`] : [a, b];
});

const option = computed(() => {
  const rows = comparison.value?.rows ?? [];
  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      ...theme.value.tooltip,
      formatter: (
        params: { axisValueLabel: string; marker: string; seriesName: string; value: number }[],
      ) =>
        [
          params[0]?.axisValueLabel ?? "",
          ...params.map(
            (p) => `${p.marker} ${p.seriesName}: <b>${formatEuro(Math.round(p.value * 100))}</b>`,
          ),
        ].join("<br/>"),
    },
    legend: { bottom: 0, ...theme.value.legend },
    grid: { left: 8, right: 16, top: 12, bottom: 36, containLabel: true },
    xAxis: {
      type: "category",
      data: rows.map((r) => r.category),
      axisLabel: theme.value.axisLabel,
      axisLine: theme.value.axisLine,
    },
    yAxis: {
      type: "value",
      axisLabel: {
        ...theme.value.axisLabel,
        formatter: (v: number) => `${v.toLocaleString("de-DE")} €`,
      },
      splitLine: theme.value.splitLine,
    },
    series: [
      { name: names.value[0], type: "bar", data: rows.map((r) => r.firstCents / 100) },
      { name: names.value[1], type: "bar", data: rows.map((r) => r.secondCents / 100) },
    ],
  };
});
</script>

<template>
  <DashboardPanel :title="t('comparison.title')">
    <template v-if="months.length >= 2" #actions>
      <USelect
        :model-value="first ?? undefined"
        :items="items"
        size="sm"
        :aria-label="t('comparison.month1')"
        class="w-36"
        @update:model-value="selectedFirst = $event as string"
      />
      <span class="text-sm text-muted" aria-hidden="true">→</span>
      <USelect
        :model-value="second ?? undefined"
        :items="items"
        size="sm"
        :aria-label="t('comparison.month2')"
        class="w-36"
        @update:model-value="selectedSecond = $event as string"
      />
    </template>
    <UEmpty
      v-if="months.length < 2"
      icon="i-lucide-calendar-range"
      :title="t('comparison.needTwoMonths')"
    />
    <template v-else-if="comparison">
      <p class="mb-2 text-sm text-muted tabular-nums">
        {{ names[0] }}:
        <strong class="text-highlighted">{{ formatEuro(comparison.firstTotalCents) }}</strong> →
        {{ names[1] }}:
        <strong class="text-highlighted">{{ formatEuro(comparison.secondTotalCents) }}</strong> ·
        {{ t("comparison.difference") }}
        <strong class="text-highlighted">{{ formatSignedEuro(comparison.diffCents) }}</strong>
        <template v-if="comparison.diffPercent !== null">
          ({{ formatSignedPercent(comparison.diffPercent) }})
        </template>
      </p>
      <div v-if="comparison.rows.length > 0" class="h-72 lg:h-auto lg:min-h-0 lg:flex-1">
        <VChart :option="option" autoresize />
      </div>
      <UEmpty v-else icon="i-lucide-chart-column" :title="t('comparison.noExpenses')" />
    </template>
  </DashboardPanel>
</template>
