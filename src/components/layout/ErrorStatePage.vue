<script setup lang="ts">
import { NButton } from 'naive-ui'
import { useRouter } from 'vue-router'

withDefaults(
  defineProps<{
    code: string
    title: string
    description: string
    actionText?: string
    actionRoute?: string
  }>(),
  {
    actionText: '返回工作台',
    actionRoute: '/dashboard',
  },
)

const router = useRouter()

function handleAction(route: string) {
  router.push(route)
}
</script>

<template>
  <div class="shell-error-page">
    <div class="shell-error-page__card">
      <div class="shell-error-page__code">{{ code }}</div>
      <h1 class="shell-error-page__title">{{ title }}</h1>
      <p class="shell-error-page__description">{{ description }}</p>
      <n-button type="primary" @click="handleAction(actionRoute)">
        {{ actionText }}
      </n-button>
    </div>
  </div>
</template>
