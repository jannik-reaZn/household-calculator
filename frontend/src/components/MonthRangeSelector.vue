<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { formatMonth } from "../lib/months";

const { t } = useI18n();
const props = defineProps<{ months: string[]; from: string | null; to: string | null }>();
const emit = defineEmits<{ "update:from": [month: string]; "update:to": [month: string] }>();

const items = computed(() =>
  props.months.map((month) => ({ label: formatMonth(month), value: month })),
);
</script>

<template>
  <div class="flex flex-wrap gap-4">
    <UFormField :label="t('range.from')">
      <USelect
        :model-value="from ?? undefined"
        :items="items"
        class="w-48"
        @update:model-value="emit('update:from', $event as string)"
      />
    </UFormField>
    <UFormField :label="t('range.to')">
      <USelect
        :model-value="to ?? undefined"
        :items="items"
        class="w-48"
        @update:model-value="emit('update:to', $event as string)"
      />
    </UFormField>
  </div>
</template>
