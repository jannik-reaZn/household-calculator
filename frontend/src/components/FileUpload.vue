<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
defineProps<{ loading: boolean; error: string | null; fileName: string | null }>();
const { t } = useI18n();
const emit = defineEmits<{ select: [file: File] }>();

// UFileUpload keeps the chosen file; we hand it over and reset so the same file can be picked again.
const model = ref<File | null>(null);

watch(model, (file) => {
  if (!file) return;
  emit("select", file);
  model.value = null;
});
</script>

<template>
  <section class="grid gap-3">
    <UFileUpload
      v-model="model"
      accept=".csv,text/csv"
      :label="t('upload.label')"
      :description="t('upload.description')"
      icon="i-lucide-file-spreadsheet"
      :disabled="loading"
      class="w-full min-h-40"
    />
    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :title="t('upload.errorTitle')"
      :description="error"
    />
    <UAlert
      v-else-if="fileName"
      color="neutral"
      variant="subtle"
      icon="i-lucide-shield-check"
      :title="t('upload.loaded', { fileName })"
      :description="t('upload.privacy')"
    />
  </section>
</template>
