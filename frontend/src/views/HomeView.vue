<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const features = [
  { key: "upload", icon: "i-lucide-upload" },
  { key: "analysis", icon: "i-lucide-chart-pie" },
  { key: "privacy", icon: "i-lucide-shield-check" },
] as const;
</script>

<template>
  <UContainer class="grid max-w-4xl gap-10 py-12">
    <section class="grid gap-4 text-center">
      <h1 class="text-4xl font-bold text-highlighted">{{ t("home.title") }}</h1>
      <p class="mx-auto max-w-2xl text-lg text-muted">{{ t("home.description") }}</p>
      <div class="flex flex-wrap justify-center gap-3">
        <UButton to="/upload" size="lg" icon="i-lucide-upload">{{ t("home.start") }}</UButton>
        <UButton
          to="/analysis"
          size="lg"
          color="neutral"
          variant="outline"
          icon="i-lucide-chart-pie"
        >
          {{ t("nav.analysis") }}
        </UButton>
      </div>
    </section>

    <section class="grid gap-4 sm:grid-cols-3">
      <UCard v-for="feature in features" :key="feature.key">
        <div class="grid gap-2">
          <UIcon :name="feature.icon" class="size-6 text-primary" />
          <h2 class="font-semibold text-highlighted">
            {{ t(`home.features.${feature.key}.title`) }}
          </h2>
          <p class="text-sm text-muted">{{ t(`home.features.${feature.key}.text`) }}</p>
        </div>
      </UCard>
    </section>
  </UContainer>
</template>
