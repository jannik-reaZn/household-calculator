<script setup lang="ts">
defineProps<{ title: string }>();
</script>

<template>
  <section class="flex min-h-0 flex-col rounded-lg border border-default bg-default">
    <header
      class="flex min-h-12 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-default px-4 py-2"
    >
      <h2 class="text-sm font-semibold text-highlighted">{{ title }}</h2>
      <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2">
        <slot name="actions" />
      </div>
    </header>
    <div class="flex min-h-0 flex-1 flex-col p-4">
      <slot />
    </div>
  </section>
</template>
