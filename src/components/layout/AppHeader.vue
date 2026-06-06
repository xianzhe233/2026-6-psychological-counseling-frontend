<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NSpace, NTag } from 'naive-ui'
import { useRouter } from 'vue-router'

import { logout, useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const roleLabel = computed(() => auth.user?.primaryRole ?? 'GUEST')

async function handleLogout() {
  await logout().catch(() => undefined)
  router.push('/login')
}
</script>

<template>
  <header class="app-header">
    <div>
      <div class="app-header__title">{{ $route.meta.title || '工作台' }}</div>
      <div class="app-header__hint">开发骨架已就绪，可在对应路由下继续实现业务页面。</div>
    </div>
    <n-space align="center">
      <n-tag type="success" size="small">{{ roleLabel }}</n-tag>
      <span class="app-header__user">{{ auth.user?.realName || '未登录' }}</span>
      <n-button tertiary type="primary" @click="handleLogout">退出</n-button>
    </n-space>
  </header>
</template>
