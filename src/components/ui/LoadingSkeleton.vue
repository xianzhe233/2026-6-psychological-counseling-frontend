<script setup lang="ts">
withDefaults(
  defineProps<{
    rows?: number
    type?: 'table' | 'card' | 'form'
  }>(),
  {
    rows: 4,
    type: 'table',
  },
)
</script>

<template>
  <div class="ui-skeleton" :class="`ui-skeleton--${type}`">
    <template v-if="type === 'table'">
      <div class="ui-skeleton__toolbar ui-skeleton-block" />
      <div
        v-for="index in rows"
        :key="index"
        class="ui-skeleton__row ui-skeleton-block"
        :style="{ width: `${100 - (index % 3) * 8}%` }"
      />
    </template>

    <template v-else-if="type === 'card'">
      <div class="ui-skeleton__card ui-skeleton-block" />
      <div
        v-for="index in rows"
        :key="index"
        class="ui-skeleton__line ui-skeleton-block"
      />
    </template>

    <template v-else>
      <div
        v-for="index in rows"
        :key="index"
        class="ui-skeleton__field ui-skeleton-block"
      />
    </template>
  </div>
</template>

<style scoped>
.ui-skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
}

.ui-skeleton__toolbar {
  height: 40px;
  margin-bottom: var(--space-2);
}

.ui-skeleton__row {
  height: 44px;
}

.ui-skeleton__card {
  height: 120px;
  margin-bottom: var(--space-2);
}

.ui-skeleton__line {
  height: 16px;
}

.ui-skeleton__field {
  height: 56px;
}
</style>
