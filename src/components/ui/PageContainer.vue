<script setup lang="ts">
withDefaults(
  defineProps<{
    flush?: boolean
    maxWidth?: boolean
  }>(),
  {
    flush: false,
    maxWidth: true,
  },
)
</script>

<template>
  <div
    class="ui-page-container"
    :class="{
      'ui-page-container--flush': flush,
      'ui-page-container--full': !maxWidth,
    }"
  >
    <slot />
  </div>
</template>

<style scoped>
.ui-page-container--full {
  max-width: none;
}
</style>
