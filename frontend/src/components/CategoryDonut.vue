<script setup lang="ts">
import { PieChart } from "echarts/charts";
import { LegendComponent, TooltipComponent } from "echarts/components";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import VChart from "vue-echarts";
import DashboardPanel from "./DashboardPanel.vue";
import { useChartTheme } from "../composables/useChartTheme";
import { categoryTotals } from "../lib/aggregate";
import { formatEuro } from "../lib/format";
import type { CategorizedTransaction } from "../lib/types";

use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer]);

const { t } = useI18n();
const props = defineProps<{ transactions: CategorizedTransaction[] }>();
const { theme } = useChartTheme();

const totals = computed(() => categoryTotals(props.transactions));

const option = computed(() => ({
  tooltip: {
    trigger: "item",
    ...theme.value.tooltip,
    formatter: (p: { name: string; value: number; percent: number }) =>
      `${p.name}<br/><b>${formatEuro(p.value)}</b> (${p.percent.toLocaleString("de-DE", { maximumFractionDigits: 1 })} %)`,
  },
  legend: { bottom: 0, type: "scroll", ...theme.value.legend },
  series: [
    {
      type: "pie",
      radius: ["48%", "72%"],
      center: ["50%", "42%"],
      label: { show: false },
      itemStyle: { borderColor: "transparent", borderWidth: 2, borderRadius: 4 },
      data: totals.value.map((t) => ({ name: t.category, value: t.cents })),
    },
  ],
}));
</script>

<template>
  <DashboardPanel :title="t('donut.title')">
    <div v-if="totals.length > 0" class="h-72 lg:h-auto lg:min-h-0 lg:flex-1">
      <VChart :option="option" autoresize />
    </div>
    <UEmpty v-else icon="i-lucide-chart-pie" :title="t('common.noExpenses')" />
  </DashboardPanel>
</template>
