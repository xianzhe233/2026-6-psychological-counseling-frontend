<script setup lang="ts">
import { NDivider } from 'naive-ui'

defineProps<{
  title: string
  description?: string
  divider?: boolean
}>()
</script>

<template>
  <section class="ui-form-section">
    <div class="ui-form-section__header">
      <h3 class="ui-form-section__title">{{ title }}</h3>
      <p v-if="description" class="ui-form-section__description">{{ description }}</p>
    </div>
    <div class="ui-form-section__body">
      <slot />
    </div>
    <n-divider v-if="divider" />
  </section>
</template>

<style scoped>
.ui-form-section {
  margin-bottom: var(--space-6);
}

.ui-form-section:last-child {
  margin-bottom: 0;
}

.ui-form-section__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-form-gap);
}
</style>
