import { http } from './http'
import type { PageResult } from './admin'

export interface NotificationLogQuery {
  pageNum: number
  pageSize: number
  keyword?: string
  notifyType?: string
  sendStatus?: string
  startTime?: string
  endTime?: string
}

export interface NotificationLogVO {
  id: number
  receiverName: string
  phone: string
  notifyType: string
  title: string
  content: string
  sendStatus: string
  sendTime: string
}

export interface OperationLogQuery {
  pageNum: number
  pageSize: number
  keyword?: string
  moduleName?: string
  operationType?: string
  resultStatus?: string
  startTime?: string
  endTime?: string
}

export interface OperationLogVO {
  id: number
  operatorName: string
  roleCode: string
  moduleName: string
  operationType: string
  operationDesc: string
  requestUrl: string
  resultStatus: string
  errorMessage: string
  ipAddress: string
  executionTime: number
  createTime: string
}

const notifyTypeLabelMap: Record<string, string> = {
  APPOINTMENT_APPROVED: '预约通过',
  APPOINTMENT_REJECTED: '预约驳回',
  APPOINTMENT_RESCHEDULED: '预约改约',
  CONSULTATION_ARRANGED: '咨询安排',
  CONSULTATION_CANCELED: '咨询取消',
  EXTENSION_APPROVED: '追加通过',
  EXTENSION_REJECTED: '追加驳回',
  SCHEDULE_REMINDER: '日程提醒',
  CASE_REPORT_SUBMITTED: '结案报告',
  QUEUE_UPDATE: '队列更新',
}

export function getNotifyTypeLabel(notifyType: string): string {
  return notifyTypeLabelMap[notifyType] ?? notifyType
}

export async function pageNotificationLogs(query: NotificationLogQuery): Promise<PageResult<NotificationLogVO>> {
  const { data: result } = await http.get('/admin/logs/notifications', { params: query })
  return result.data
}

export async function pageOperationLogs(query: OperationLogQuery): Promise<PageResult<OperationLogVO>> {
  const { data: result } = await http.get('/admin/logs/operations', { params: query })
  return result.data
}
