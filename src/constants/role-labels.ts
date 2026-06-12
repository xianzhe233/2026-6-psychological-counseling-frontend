import type { RoleCode } from '@/types/auth'

export const roleLabelMap: Record<RoleCode, string> = {
  STUDENT: '学生',
  ADMIN: '管理员',
  INTERVIEWER: '初访员',
  ASSISTANT: '心理助理',
  COUNSELOR: '咨询师',
}

export function getRoleLabel(role: RoleCode | string): string {
  return roleLabelMap[role as RoleCode] ?? role
}
