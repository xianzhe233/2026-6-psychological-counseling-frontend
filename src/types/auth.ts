export type RoleCode = 'STUDENT' | 'ADMIN' | 'INTERVIEWER' | 'ASSISTANT' | 'COUNSELOR'

export interface ApiResult<T> {
  code: number
  message: string
  data: T
}

export interface LoginRequest {
  username: string
  password: string
}

export interface CurrentUser {
  id: number
  username: string
  realName: string
  phone?: string
  roles: RoleCode[]
  primaryRole: RoleCode
}
