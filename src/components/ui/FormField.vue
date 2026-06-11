<script setup lang="ts">
defineProps<{
  label?: string
  required?: boolean
  hint?: string
  error?: string
  htmlFor?: string
}>()
</script>

<template>
  <label class="ui-form-field" :for="htmlFor">
    <span
      v-if="label"
      class="ui-form-field__label"
      :class="{ 'ui-form-field__label--required': required }"
    >
      {{ label }}
    </span>
    <div class="ui-form-field__control">
      <slot />
    </div>
    <span v-if="error" class="ui-form-field__error">{{ error }}</span>
    <span v-else-if="hint" class="ui-form-field__hint">{{ hint }}</span>
  </label>
</template>
