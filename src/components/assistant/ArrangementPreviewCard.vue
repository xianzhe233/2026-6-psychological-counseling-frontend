<script setup lang="ts">
defineProps<{
  preview: string
  emptyText?: string
}>()
</script>

<template>
  <div class="bp-preview-card arrangement-preview-card">
    <span class="bp-preview-card__label">安排预览</span>
    <p class="bp-preview-card__content">
      {{ preview || emptyText || '请选择咨询师、日期、时间段和咨询室后生成预览' }}
    </p>
  </div>
</template>

<style scoped>
.arrangement-preview-card {
  border-style: solid;
  border-color: var(--color-primary-subtle);
  background: linear-gradient(135deg, var(--color-bg-subtle), var(--color-primary-subtle));
}
</style>
