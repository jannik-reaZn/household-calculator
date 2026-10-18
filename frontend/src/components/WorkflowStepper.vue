<script setup lang="ts">
import type { StepperItem } from "@nuxt/ui";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { useTransactions } from "../composables/useTransactions";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { transactions } = useTransactions();

const items = computed<StepperItem[]>(() => [
  {
    value: "upload",
    title: t("stepper.upload.title"),
    description: t("stepper.upload.description"),
    icon: "i-lucide-upload",
  },
  {
    value: "analysis",
    title: t("stepper.analysis.title"),
    description: t("stepper.analysis.description"),
    icon: "i-lucide-chart-pie",
    // Nothing to analyse until a file was loaded.
    disabled: transactions.value.length === 0,
  },
]);

const current = computed(() => (route.name === "analysis" ? "analysis" : "upload"));

function go(step: string | number | undefined) {
  if (typeof step === "string" && step !== current.value) router.push({ name: step });
}
</script>

<template>
  <UStepper :model-value="current" :items="items" class="w-full" @update:model-value="go" />
</template>
