<script setup lang="ts">
import type { Component } from 'vue'
import { NCard, NIcon } from 'naive-ui'

defineProps<{
  label: string
  value: string | number
  footer?: string
  icon?: Component
  trend?: 'up' | 'down' | 'flat'
}>()
</script>

<template>
  <n-card class="ui-stat-card" :bordered="false">
    <div class="ui-stat-card__inner">
      <div v-if="icon" class="ui-stat-card__icon">
        <n-icon :component="icon" :size="22" />
      </div>
      <div class="ui-stat-card__content">
        <div class="ui-stat-card__label">{{ label }}</div>
        <div class="ui-stat-card__value">{{ value }}</div>
        <div
          v-if="footer"
          class="ui-stat-card__footer"
          :class="{
            'ui-stat-card__footer--up': trend === 'up',
            'ui-stat-card__footer--down': trend === 'down',
          }"
        >
          {{ footer }}
        </div>
      </div>
    </div>
    <slot />
  </n-card>
</template>

<style scoped>
.ui-stat-card {
  box-shadow: var(--shadow-card);
  border-radius: var(--radius-card);
}

.ui-stat-card__footer--up {
  color: var(--color-success);
}

.ui-stat-card__footer--down {
  color: var(--color-error);
}
</style>
