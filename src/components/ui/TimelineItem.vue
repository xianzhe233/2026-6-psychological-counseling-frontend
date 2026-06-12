<script setup lang="ts">
defineProps<{
  title: string
  meta?: string
  active?: boolean
  last?: boolean
}>()
</script>

<template>
  <div class="ui-timeline-item" :class="{ 'ui-timeline-item--last': last }">
    <div
      class="ui-timeline-item__dot"
      :class="{ 'ui-timeline-item__dot--active': active }"
    />
    <div class="ui-timeline-item__body">
      <div class="ui-timeline-item__title">{{ title }}</div>
      <div v-if="meta" class="ui-timeline-item__meta">{{ meta }}</div>
      <div v-if="$slots.default" class="ui-timeline-item__content">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.ui-timeline-item--last {
  padding-bottom: 0;
}
</style>
