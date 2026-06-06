<script setup lang="ts">
import { h, computed } from 'vue'
import { NIcon, NMenu } from 'naive-ui'
import { useRouter } from 'vue-router'

import { dashboardMenu, roleMenus } from '@/constants/menus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const menuOptions = computed(() => {
  const items = [dashboardMenu]
  for (const role of auth.roles) {
    items.push(...roleMenus[role])
  }

  return items.map(item => ({
    key: item.path,
    label: item.label,
    icon: () => h(NIcon, null, { default: () => h(item.icon) }),
  }))
})
</script>

<template>
  <div class="app-sidebar">
    <div class="app-sidebar__brand">
      <div class="app-sidebar__badge">TYUT</div>
      <div>
        <div class="app-sidebar__title">心理咨询系统</div>
        <div class="app-sidebar__subtitle">前端基础骨架</div>
      </div>
    </div>
    <n-menu :options="menuOptions" :value="$route.path" @update:value="router.push(String($event))" />
  </div>
</template>
