<script setup lang="ts">
import type { Component } from 'vue'
import { NIcon } from 'naive-ui'
import { ChevronForwardOutline } from '@vicons/ionicons5'
import { useRouter } from 'vue-router'

const props = defineProps<{
  label: string
  path: string
  icon: Component
}>()

const router = useRouter()

function handleClick() {
  router.push(props.path)
}
</script>

<template>
  <button type="button" class="shell-quick-link-card" @click="handleClick">
    <span class="shell-quick-link-card__icon">
      <n-icon :component="icon" :size="20" />
    </span>
    <span class="shell-quick-link-card__label">{{ label }}</span>
    <n-icon class="shell-quick-link-card__arrow" :component="ChevronForwardOutline" :size="16" />
  </button>
</template>
