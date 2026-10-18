<script setup lang="ts">
import { LineChart } from "echarts/charts";
import { GridComponent, LegendComponent, TooltipComponent } from "echarts/components";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import VChart from "vue-echarts";
import DashboardPanel from "./DashboardPanel.vue";
import { useChartTheme } from "../composables/useChartTheme";
import { categoryTotals, categoryTrend } from "../lib/aggregate";
import { formatEuro } from "../lib/format";
import { formatMonth, monthsBetween } from "../lib/months";
import type { CategorizedTransaction } from "../lib/types";

use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

const DEFAULT_CATEGORY_COUNT = 5;

const { t } = useI18n();
const props = defineProps<{
  transactions: CategorizedTransaction[];
  from: string;
  to: string;
}>();
const { theme } = useChartTheme();

/** Categories with spending in the range, largest first. */
const categories = computed(() => categoryTotals(props.transactions).map((t) => t.category));

// null = default selection (the largest categories)
const selection = ref<string[] | null>(null);
const selected = computed(() =>
  selection.value
    ? categories.value.filter((c) => selection.value!.includes(c))
    : categories.value.slice(0, DEFAULT_CATEGORY_COUNT),
);

const months = computed(() => monthsBetween(props.from, props.to));
const series = computed(() => categoryTrend(props.transactions, selected.value, months.value));

const option = computed(() => ({
  tooltip: {
    trigger: "axis",
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
  legend: { bottom: 0, type: "scroll", ...theme.value.legend },
  grid: { left: 8, right: 16, top: 12, bottom: 36, containLabel: true },
  xAxis: {
    type: "category",
    data: months.value.map(formatMonth),
    boundaryGap: false,
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
  series: series.value.map((s) => ({
    name: s.category,
    type: "line",
    symbol: "circle",
    symbolSize: 6,
    data: s.cents.map((cents) => cents / 100),
  })),
}));
</script>

<template>
  <DashboardPanel :title="t('trend.title')">
    <template v-if="categories.length > 0" #actions>
      <USelectMenu
        :model-value="selected"
        :items="categories"
        multiple
        size="sm"
        :placeholder="t('trend.categories')"
        :aria-label="t('trend.categories')"
        class="w-52"
        @update:model-value="selection = $event as string[]"
      >
        <template #default>{{ t("trend.categoriesCount", { count: selected.length }) }}</template>
      </USelectMenu>
    </template>
    <template v-if="categories.length > 0">
      <div v-if="selected.length > 0" class="h-72 lg:h-auto lg:min-h-0 lg:flex-1">
        <VChart :option="option" autoresize />
      </div>
      <UEmpty v-else icon="i-lucide-chart-line" :title="t('trend.selectOne')" />
    </template>
    <UEmpty v-else icon="i-lucide-chart-line" :title="t('common.noExpenses')" />
  </DashboardPanel>
</template>
