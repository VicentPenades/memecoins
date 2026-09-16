<template>
  <div
    :style="{ height: height + 'px', position: 'relative' }"
  >
    <SankeyChart
      type="sankey"
      :data="(data as never)"
      :options="(mergedOptions as never)"
    />
  </div>
</template>

<script setup lang="ts">
import { Chart as SankeyChart } from "vue-chartjs";
import { Chart as ChartJS } from "chart.js";
import { SankeyController, Flow } from "chartjs-chart-sankey";

ChartJS.register(SankeyController, Flow);

const props = defineProps<{
  data: {
    datasets: Record<string, unknown>[];
  };
  height?: number;
  options?: Record<string, unknown>;
}>();

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
};

const mergedOptions = computed(() =>
  deepMerge(defaultOptions, props.options ?? {}),
);

function deepMerge<T extends Record<string, unknown>>(base: T, override: Record<string, unknown>): T {
  const result = { ...base } as Record<string, unknown>;
  for (const key of Object.keys(override)) {
    const baseVal = result[key];
    const overVal = override[key];
    if (
      baseVal &&
      overVal &&
      typeof baseVal === "object" &&
      typeof overVal === "object" &&
      !Array.isArray(baseVal) &&
      !Array.isArray(overVal)
    ) {
      result[key] = deepMerge(
        baseVal as Record<string, unknown>,
        overVal as Record<string, unknown>,
      );
    } else {
      result[key] = overVal;
    }
  }
  return result as T;
}
</script>
