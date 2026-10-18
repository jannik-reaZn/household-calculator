<script setup lang="ts">
import { useRouter } from "vue-router";
import FileUpload from "../components/FileUpload.vue";
import WorkflowStepper from "../components/WorkflowStepper.vue";
import { useTransactions } from "../composables/useTransactions";

const router = useRouter();
const { transactions, fileName, error, loading, loadFile } = useTransactions();

async function onSelect(file: File) {
  await loadFile(file);
  if (!error.value && transactions.value.length > 0) await router.push({ name: "analysis" });
}
</script>

<template>
  <UContainer class="grid max-w-5xl gap-6 py-6">
    <WorkflowStepper />
    <FileUpload :loading="loading" :error="error" :file-name="fileName" @select="onSelect" />
  </UContainer>
</template>
