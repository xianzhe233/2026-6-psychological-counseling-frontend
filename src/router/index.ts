import { createRouter, createWebHistory } from 'vue-router'

import { getDefaultRouteByRoles, loadCurrentUser, useAuthStore } from '@/stores/auth'
import { routes } from './routes'

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  document.title = `${String(to.meta.title ?? '心理咨询系统')} | 高校心理咨询系统`

  if (to.path === '/dashboard') {
    const auth = useAuthStore()
    if (!auth.loaded) {
      await loadCurrentUser().catch(() => undefined)
    }
    if (auth.user) {
      return getDefaultRouteByRoles(auth.roles)
    }
  }

  if (!to.meta.requiresAuth) {
    return true
  }

  const auth = useAuthStore()
  if (!auth.loaded) {
    await loadCurrentUser().catch(() => undefined)
  }

  if (!auth.user) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  const roles = to.meta.roles as string[] | undefined
  if (roles && !roles.some(role => auth.roles.includes(role as never))) {
    return { path: '/403' }
  }

  return true
})

export default router
