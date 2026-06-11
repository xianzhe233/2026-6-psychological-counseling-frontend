<script setup lang="ts">
withDefaults(
  defineProps<{
    sticky?: boolean
    align?: 'start' | 'center' | 'end' | 'between'
  }>(),
  {
    sticky: true,
    align: 'end',
  },
)
</script>

<template>
  <div
    class="ui-action-bar"
    :class="{
      'ui-action-bar--static': !sticky,
      [`ui-action-bar--${align}`]: true,
    }"
  >
    <div v-if="$slots.left" class="ui-action-bar__left">
      <slot name="left" />
    </div>
    <div class="ui-action-bar__right">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.ui-action-bar--static {
  position: static;
  box-shadow: none;
  border-top: none;
  padding-left: 0;
  padding-right: 0;
}

.ui-action-bar--start {
  justify-content: flex-start;
}

.ui-action-bar--center {
  justify-content: center;
}

.ui-action-bar--between {
  justify-content: space-between;
}

.ui-action-bar__left {
  margin-right: auto;
}

.ui-action-bar__right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
</style>
