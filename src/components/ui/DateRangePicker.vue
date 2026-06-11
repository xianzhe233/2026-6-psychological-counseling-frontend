<script setup lang="ts">
import { NDatePicker } from 'naive-ui'

const value = defineModel<[number, number] | null>('value', { default: null })

withDefaults(
  defineProps<{
    label?: string
    clearable?: boolean
    type?: 'daterange' | 'datetimerange'
    size?: 'small' | 'medium' | 'large'
    disabled?: boolean
  }>(),
  {
    clearable: true,
    type: 'daterange',
    size: 'medium',
    disabled: false,
  },
)

const emit = defineEmits<{
  change: [value: [number, number] | null]
}>()

function handleUpdate(next: [number, number] | null) {
  value.value = next
  emit('change', next)
}
</script>

<template>
  <div class="ui-date-range-picker">
    <span v-if="label" class="ui-date-range-picker__label">{{ label }}</span>
    <n-date-picker
      :value="value"
      :type="type"
      :clearable="clearable"
      :size="size"
      :disabled="disabled"
      style="width: 100%"
      @update:value="handleUpdate"
    />
  </div>
</template>

<style scoped>
.ui-date-range-picker {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.ui-date-range-picker__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}
</style>
