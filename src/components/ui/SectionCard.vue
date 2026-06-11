<script setup lang="ts">
import { NCard } from 'naive-ui'

withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    bordered?: boolean
    embedded?: boolean
  }>(),
  {
    bordered: false,
    embedded: false,
  },
)
</script>

<template>
  <n-card
    class="ui-section-card"
    :title="title"
    :bordered="bordered"
    :embedded="embedded"
  >
    <template v-if="subtitle" #header>
      <div class="ui-section-card__header">
        <div class="ui-section-card__title">{{ title }}</div>
        <div class="ui-section-card__subtitle">{{ subtitle }}</div>
      </div>
    </template>
    <template v-if="$slots.extra" #header-extra>
      <slot name="extra" />
    </template>
    <slot />
  </n-card>
</template>

<style scoped>
.ui-section-card {
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}

.ui-section-card__title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.ui-section-card__subtitle {
  margin-top: var(--space-1);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
</style>
