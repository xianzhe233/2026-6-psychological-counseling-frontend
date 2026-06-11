<script setup lang="ts">
import type { DescriptionItem } from '@/components/ui/types'

withDefaults(
  defineProps<{
    items: DescriptionItem[]
    columns?: 1 | 2
    bordered?: boolean
  }>(),
  {
    columns: 2,
    bordered: true,
  },
)
</script>

<template>
  <div
    class="ui-info-descriptions"
    :class="{
      'ui-info-descriptions--cols-2': columns === 2,
      'ui-info-descriptions--plain': !bordered,
    }"
  >
    <div
      v-for="(item, index) in items"
      :key="`${item.label}-${index}`"
      class="ui-info-descriptions__item"
      :style="item.span === 2 ? { gridColumn: '1 / -1' } : undefined"
    >
      <span class="ui-info-descriptions__label">{{ item.label }}</span>
      <span class="ui-info-descriptions__value">
        <slot :name="`value-${index}`" :item="item">
          {{ item.value ?? '—' }}
        </slot>
      </span>
    </div>
  </div>
</template>

<style scoped>
.ui-info-descriptions--plain .ui-info-descriptions__item {
  background: transparent;
  border-color: transparent;
  padding-left: 0;
  padding-right: 0;
}
</style>
