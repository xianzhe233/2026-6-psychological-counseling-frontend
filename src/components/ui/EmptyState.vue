<script setup lang="ts">
import type { Component } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { FolderOpenOutline } from '@vicons/ionicons5'

withDefaults(
  defineProps<{
    title?: string
    description?: string
    icon?: Component
    actionText?: string
  }>(),
  {
    title: '暂无数据',
    description: '当前条件下没有可展示的内容，请调整筛选条件后重试。',
    icon: FolderOpenOutline,
  },
)

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="ui-empty-state">
    <div class="ui-empty-state__icon">
      <n-icon :component="icon" :size="32" />
    </div>
    <h3 class="ui-empty-state__title">{{ title }}</h3>
    <p v-if="description" class="ui-empty-state__description">{{ description }}</p>
    <slot />
    <n-button v-if="actionText" type="primary" @click="emit('action')">
      {{ actionText }}
    </n-button>
  </div>
</template>
