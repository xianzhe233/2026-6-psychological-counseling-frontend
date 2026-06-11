<script setup lang="ts">
import { NButton } from 'naive-ui'
import { useRouter } from 'vue-router'

defineProps<{
  title: string
  description: string
  defaultRoute?: string
}>()

const router = useRouter()

function handleGoDefault(route?: string) {
  if (route) {
    router.push(route)
  }
}
</script>

<template>
  <section class="shell-dashboard-welcome">
    <div class="shell-dashboard-welcome__content">
      <span class="shell-dashboard-welcome__eyebrow">工作台</span>
      <h2 class="shell-dashboard-welcome__title">{{ title }}</h2>
      <p class="shell-dashboard-welcome__description">{{ description }}</p>
    </div>
    <n-button
      v-if="defaultRoute"
      type="primary"
      class="shell-dashboard-welcome__action"
      @click="handleGoDefault(defaultRoute)"
    >
      进入常用功能
    </n-button>
  </section>
</template>
