<script setup lang="ts">
import { NButton } from 'naive-ui'
import { useRouter } from 'vue-router'

import RoleBadge from '@/components/layout/RoleBadge.vue'
import { logout, useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await logout().catch(() => undefined)
  router.push('/login')
}
</script>

<template>
  <header class="app-header">
    <div>
      <div class="app-header__title">{{ $route.meta.title || '工作台' }}</div>
    </div>
    <div class="app-header__meta">
      <RoleBadge v-if="auth.user?.primaryRole" :role="auth.user.primaryRole" />
      <span class="app-header__user">{{ auth.user?.realName || '未登录' }}</span>
      <n-button tertiary type="primary" @click="handleLogout">退出</n-button>
    </div>
  </header>
</template>
