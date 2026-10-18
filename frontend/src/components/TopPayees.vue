<script setup lang="ts">
import { BarChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import VChart from "vue-echarts";
import DashboardPanel from "./DashboardPanel.vue";
import { useChartTheme } from "../composables/useChartTheme";
import { topPayees } from "../lib/aggregate";
import { formatEuro } from "../lib/format";
import type { CategorizedTransaction } from "../lib/types";

use([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

const LIMIT = 10;

const { t } = useI18n();
const props = defineProps<{ transactions: CategorizedTransaction[] }>();
const { theme } = useChartTheme();

const payees = computed(() => topPayees(props.transactions, LIMIT));

const option = computed(() => ({
  tooltip: {
    trigger: "axis",
    axisPointer: { type: "shadow" },
    ...theme.value.tooltip,
    formatter: (params: { name: string; value: number }[]) =>
      `${params[0].name}<br/><b>${formatEuro(Math.round(params[0].value * 100))}</b>`,
  },
  grid: { left: 8, right: 16, top: 4, bottom: 4, containLabel: true },
  xAxis: {
    type: "value",
    axisLabel: {
      ...theme.value.axisLabel,
      formatter: (v: number) => `${v.toLocaleString("de-DE")} €`,
    },
    splitLine: theme.value.splitLine,
  },
  yAxis: {
    type: "category",
    inverse: true, // largest payee on top
    data: payees.value.map((p) => p.payee),
    axisLabel: { ...theme.value.axisLabel, width: 140, overflow: "truncate" },
    axisLine: theme.value.axisLine,
  },
  series: [{ type: "bar", data: payees.value.map((p) => p.cents / 100) }],
}));
</script>

<template>
  <DashboardPanel :title="t('topPayees.title')">
    <div v-if="payees.length > 0" class="h-72 lg:h-auto lg:min-h-0 lg:flex-1">
      <VChart :option="option" autoresize />
    </div>
    <UEmpty v-else icon="i-lucide-users" :title="t('common.noExpenses')" />
  </DashboardPanel>
</template>
