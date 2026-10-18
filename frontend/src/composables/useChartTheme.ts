import { computed, ref } from "vue";

// Nuxt UI toggles the `dark` class on <html>; mirror it so canvas charts (which can't use CSS variables) follow.
const isDark = ref(false);

if (typeof document !== "undefined") {
  const root = document.documentElement;
  const sync = () => (isDark.value = root.classList.contains("dark"));
  sync();
  new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ["class"] });
}

/** Colors for ECharts options that match the current light/dark mode. */
export function useChartTheme() {
  const theme = computed(() => {
    const text = isDark.value ? "#d4d4d8" : "#3f3f46";
    const line = isDark.value ? "#3f3f46" : "#e4e4e7";
    return {
      text,
      line,
      tooltip: {
        backgroundColor: isDark.value ? "#18181b" : "#ffffff",
        borderColor: line,
        textStyle: { color: text },
      },
      legend: { textStyle: { color: text } },
      axisLabel: { color: text },
      axisLine: { lineStyle: { color: line } },
      splitLine: { lineStyle: { color: line } },
    };
  });
  return { theme };
}
