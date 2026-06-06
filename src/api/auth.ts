import { http } from './http'
import type { ApiResult, CurrentUser, LoginRequest } from '@/types/auth'

export function login(data: LoginRequest) {
  return http.post<ApiResult<CurrentUser>>('/auth/login', data)
}

export function logout() {
  return http.post<ApiResult<null>>('/auth/logout')
}

export function getCurrentUser() {
  return http.get<ApiResult<CurrentUser>>('/auth/current')
}
