import { reactive } from 'vue'

import { getCurrentUser, login as loginApi, logout as logoutApi } from '@/api/auth'
import type { CurrentUser, LoginRequest, RoleCode } from '@/types/auth'

const authState = reactive({
  loaded: false,
  user: null as CurrentUser | null,
  roles: [] as RoleCode[],
})

export function useAuthStore() {
  return authState
}

export function clearAuthState() {
  authState.loaded = true
  authState.user = null
  authState.roles = []
}

export async function loadCurrentUser() {
  const { data } = await getCurrentUser()
  authState.user = data.data
  authState.roles = data.data?.roles ?? []
  authState.loaded = true
  return data.data
}

export async function login(payload: LoginRequest) {
  const { data } = await loginApi(payload)
  if (!data.data) {
    throw new Error(data.message || '登录失败')
  }
  authState.user = data.data
  authState.roles = data.data.roles ?? []
  authState.loaded = true
  return data.data
}

export async function logout() {
  await logoutApi()
  clearAuthState()
}

export function hasRole(role: RoleCode) {
  return authState.roles.includes(role)
}

export function getDefaultRouteByRoles(roles: RoleCode[]) {
  if (roles.includes('ADMIN')) return '/admin/appointments/audit'
  if (roles.includes('INTERVIEWER')) return '/interviewer/tasks'
  if (roles.includes('ASSISTANT')) return '/assistant/queue'
  if (roles.includes('COUNSELOR')) return '/counselor/schedules'
  return '/student/appointments'
}
