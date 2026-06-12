/**
 * 业务状态与 Naive UI Tag 类型、设计令牌颜色的统一映射
 */

export type NaiveTagType = 'default' | 'info' | 'success' | 'warning' | 'error'

export interface StatusConfig {
  label: string
  type: NaiveTagType
  color?: string
  background?: string
}

/** 通用预约/队列/日程/报告状态 */
export const appointmentStatusMap: Record<string, StatusConfig> = {
  PENDING: { label: '待处理', type: 'info', color: 'var(--color-info)', background: 'var(--color-info-subtle)' },
  APPROVED: { label: '已通过', type: 'success', color: 'var(--color-success)', background: 'var(--color-success-subtle)' },
  REJECTED: { label: '已驳回', type: 'error', color: 'var(--color-error)', background: 'var(--color-error-subtle)' },
  CANCELED: { label: '已取消', type: 'default' },
  COMPLETED: { label: '已完成', type: 'success', color: 'var(--color-success)', background: 'var(--color-success-subtle)' },
  WAITING: { label: '排队中', type: 'warning', color: 'var(--color-warning)', background: 'var(--color-warning-subtle)' },
  ARRANGED: { label: '已安排', type: 'success', color: 'var(--color-success)', background: 'var(--color-success-subtle)' },
  SUSPENDED: { label: '已暂缓', type: 'default' },
  RESERVED: { label: '已预约', type: 'info', color: 'var(--color-info)', background: 'var(--color-info-subtle)' },
  ABSENT: { label: '旷约', type: 'warning', color: 'var(--color-warning)', background: 'var(--color-warning-subtle)' },
  LEAVE: { label: '请假', type: 'warning', color: 'var(--color-warning)', background: 'var(--color-warning-subtle)' },
  DROPPED: { label: '脱落', type: 'error', color: 'var(--color-error)', background: 'var(--color-error-subtle)' },
  CLOSED: { label: '已结案', type: 'default' },
  DRAFT: { label: '草稿', type: 'default' },
  SUBMITTED: { label: '已提交', type: 'success', color: 'var(--color-success)', background: 'var(--color-success-subtle)' },
}

/** 学生初访预约状态（展示文案略有差异） */
export const studentAppointmentStatusMap: Record<string, StatusConfig> = {
  PENDING: { label: '待审核', type: 'warning', color: 'var(--color-warning)', background: 'var(--color-warning-subtle)' },
  APPROVED: { label: '已通过', type: 'success', color: 'var(--color-success)', background: 'var(--color-success-subtle)' },
  REJECTED: { label: '已驳回', type: 'error', color: 'var(--color-error)', background: 'var(--color-error-subtle)' },
  CANCELED: { label: '已撤销', type: 'default' },
  COMPLETED: { label: '已完成', type: 'success', color: 'var(--color-success)', background: 'var(--color-success-subtle)' },
}

/** 危机等级 */
export const riskLevelMap: Record<string, StatusConfig> = {
  LOW: { label: '低风险', type: 'success', color: 'var(--color-risk-low)', background: 'var(--color-risk-low-subtle)' },
  MEDIUM: { label: '中风险', type: 'warning', color: 'var(--color-risk-medium)', background: 'var(--color-risk-medium-subtle)' },
  HIGH: { label: '高风险', type: 'error', color: 'var(--color-risk-high)', background: 'var(--color-risk-high-subtle)' },
  URGENT: { label: '紧急风险', type: 'error', color: 'var(--color-risk-urgent)', background: 'var(--color-risk-urgent-subtle)' },
}

/** 优先级分数 → 视觉等级 */
export function getPriorityLevel(score: number): 'low' | 'medium' | 'high' | 'urgent' {
  if (score >= 90) return 'urgent'
  if (score >= 70) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

export const priorityLevelConfig: Record<
  ReturnType<typeof getPriorityLevel>,
  { label: string; color: string; background: string }
> = {
  low: { label: '普通', color: 'var(--color-text-muted)', background: 'var(--color-bg-muted)' },
  medium: { label: '关注', color: 'var(--color-warning)', background: 'var(--color-warning-subtle)' },
  high: { label: '优先', color: 'var(--color-risk-high)', background: 'var(--color-risk-high-subtle)' },
  urgent: { label: '紧急', color: 'var(--color-risk-urgent)', background: 'var(--color-risk-urgent-subtle)' },
}

export function resolveStatus(value: string, map: Record<string, StatusConfig> = appointmentStatusMap): StatusConfig {
  return map[value] ?? { label: value, type: 'default' }
}
