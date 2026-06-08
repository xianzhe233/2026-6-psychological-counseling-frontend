import type { PageResult } from './admin'
import { respondMock } from './mock-first-visit'

export interface NotificationLogQuery {
  pageNum: number
  pageSize: number
  keyword?: string
  notifyType?: string
  sendStatus?: 'SUCCESS' | 'FAILED'
  startTime?: string
  endTime?: string
}

export interface NotificationLogVO {
  id: number
  receiverName: string
  receiverPhone: string
  notifyType: string
  title: string
  content: string
  sendStatus: 'SUCCESS' | 'FAILED'
  sendTime: string
}

export interface OperationLogQuery {
  pageNum: number
  pageSize: number
  operatorName?: string
  moduleName?: string
  operationType?: string
  resultStatus?: 'SUCCESS' | 'FAILED'
  startTime?: string
  endTime?: string
}

export interface OperationLogVO {
  id: number
  operatorName: string
  roleName: string
  moduleName: string
  operationType: string
  description: string
  resultStatus: 'SUCCESS' | 'FAILED'
  durationMs: number
  ipAddress: string
  operateTime: string
}

const mockNotificationLogs: NotificationLogVO[] = [
  {
    id: 1,
    receiverName: '张同学',
    receiverPhone: '13800000005',
    notifyType: 'APPOINTMENT_APPROVED',
    title: '初访预约已通过',
    content: '您的初访预约已通过审核，请按时参加初访。',
    sendStatus: 'SUCCESS',
    sendTime: '2026-06-07 09:12',
  },
  {
    id: 2,
    receiverName: '李晓彤',
    receiverPhone: '13900000011',
    notifyType: 'CONSULTATION_ARRANGED',
    title: '正式咨询已安排',
    content: '心理中心已为您安排正式咨询，请查看咨询时间与地点。',
    sendStatus: 'SUCCESS',
    sendTime: '2026-06-07 10:05',
  },
  {
    id: 3,
    receiverName: '王浩',
    receiverPhone: '13900000012',
    notifyType: 'APPOINTMENT_REJECTED',
    title: '初访预约被驳回',
    content: '您的初访预约未通过审核，请根据驳回原因调整后重新提交。',
    sendStatus: 'SUCCESS',
    sendTime: '2026-06-06 16:40',
  },
  {
    id: 4,
    receiverName: '咨询师李老师',
    receiverPhone: '13800000004',
    notifyType: 'SCHEDULE_REMINDER',
    title: '咨询日程提醒',
    content: '您明天上午有 2 场正式咨询，请提前准备咨询记录。',
    sendStatus: 'SUCCESS',
    sendTime: '2026-06-06 18:20',
  },
  {
    id: 5,
    receiverName: '赵同学',
    receiverPhone: '13900000013',
    notifyType: 'CASE_REPORT_SUBMITTED',
    title: '结案报告提交通知',
    content: '咨询师已提交结案报告，管理员可查看并下载。',
    sendStatus: 'FAILED',
    sendTime: '2026-06-05 11:30',
  },
  {
    id: 6,
    receiverName: '心理助理王老师',
    receiverPhone: '13800000003',
    notifyType: 'QUEUE_UPDATE',
    title: '咨询队列更新',
    content: '有新的学生进入咨询队列，请及时安排正式咨询。',
    sendStatus: 'SUCCESS',
    sendTime: '2026-06-05 09:15',
  },
]

const mockOperationLogs: OperationLogVO[] = [
  {
    id: 1,
    operatorName: '中心管理员',
    roleName: '管理员',
    moduleName: '预约审核',
    operationType: 'APPROVE',
    description: '通过学生李晓彤的初访预约申请',
    resultStatus: 'SUCCESS',
    durationMs: 126,
    ipAddress: '10.0.0.12',
    operateTime: '2026-06-07 09:10',
  },
  {
    id: 2,
    operatorName: '心理助理王老师',
    roleName: '心理助理',
    moduleName: '咨询安排',
    operationType: 'CREATE',
    description: '为学生王浩安排正式咨询（咨询师李老师）',
    resultStatus: 'SUCCESS',
    durationMs: 203,
    ipAddress: '10.0.0.18',
    operateTime: '2026-06-07 10:02',
  },
  {
    id: 3,
    operatorName: '心理助理王老师',
    roleName: '心理助理',
    moduleName: '咨询安排',
    operationType: 'CREATE',
    description: '为学生赵同学安排正式咨询时发生时间冲突',
    resultStatus: 'FAILED',
    durationMs: 88,
    ipAddress: '10.0.0.18',
    operateTime: '2026-06-06 15:36',
  },
  {
    id: 4,
    operatorName: '咨询师李老师',
    roleName: '咨询师',
    moduleName: '咨询记录',
    operationType: 'SAVE',
    description: '保存学生张同学的第 2 次咨询记录',
    resultStatus: 'SUCCESS',
    durationMs: 156,
    ipAddress: '10.0.0.25',
    operateTime: '2026-06-06 17:18',
  },
  {
    id: 5,
    operatorName: '咨询师李老师',
    roleName: '咨询师',
    moduleName: '结案报告',
    operationType: 'SUBMIT',
    description: '提交学生李晓彤的结案报告',
    resultStatus: 'SUCCESS',
    durationMs: 241,
    ipAddress: '10.0.0.25',
    operateTime: '2026-06-05 16:42',
  },
  {
    id: 6,
    operatorName: '中心管理员',
    roleName: '管理员',
    moduleName: '用户管理',
    operationType: 'DISABLE',
    description: '禁用用户 multi-role01',
    resultStatus: 'SUCCESS',
    durationMs: 74,
    ipAddress: '10.0.0.12',
    operateTime: '2026-06-04 12:38',
  },
]

function normalizeKeyword(value?: string) {
  return value?.trim().toLowerCase() ?? ''
}

function paginate<T>(list: T[], pageNum: number, pageSize: number): PageResult<T> {
  const total = list.length
  const safePageSize = Math.max(pageSize, 1)
  const safePageNum = Math.max(pageNum, 1)
  const start = (safePageNum - 1) * safePageSize
  const records = list.slice(start, start + safePageSize)
  return {
    records,
    total,
    pageNum: safePageNum,
    pageSize: safePageSize,
    pages: Math.max(Math.ceil(total / safePageSize), 1),
  }
}

const notifyTypeLabelMap: Record<string, string> = {
  APPOINTMENT_APPROVED: '预约通过',
  APPOINTMENT_REJECTED: '预约驳回',
  CONSULTATION_ARRANGED: '咨询安排',
  SCHEDULE_REMINDER: '日程提醒',
  CASE_REPORT_SUBMITTED: '结案报告',
  QUEUE_UPDATE: '队列更新',
}

export function getNotifyTypeLabel(notifyType: string) {
  return notifyTypeLabelMap[notifyType] ?? notifyType
}

export async function pageNotificationLogs(query: NotificationLogQuery) {
  const keyword = normalizeKeyword(query.keyword)
  const records = mockNotificationLogs
    .filter((item) => {
      const matchKeyword = !keyword || [
        item.receiverName,
        item.receiverPhone,
        item.title,
        item.content,
        getNotifyTypeLabel(item.notifyType),
      ].some(value => value.toLowerCase().includes(keyword))
      const matchType = !query.notifyType || item.notifyType === query.notifyType
      const matchStatus = !query.sendStatus || item.sendStatus === query.sendStatus
      const matchStart = !query.startTime || item.sendTime >= query.startTime
      const matchEnd = !query.endTime || item.sendTime <= `${query.endTime} 23:59`
      return matchKeyword && matchType && matchStatus && matchStart && matchEnd
    })
    .sort((a, b) => b.sendTime.localeCompare(a.sendTime))

  return respondMock(paginate(records, query.pageNum, query.pageSize))
}

export async function pageOperationLogs(query: OperationLogQuery) {
  const operatorName = normalizeKeyword(query.operatorName)
  const records = mockOperationLogs
    .filter((item) => {
      const matchOperator = !operatorName || item.operatorName.toLowerCase().includes(operatorName)
      const matchModule = !query.moduleName || item.moduleName === query.moduleName
      const matchType = !query.operationType || item.operationType === query.operationType
      const matchStatus = !query.resultStatus || item.resultStatus === query.resultStatus
      const matchStart = !query.startTime || item.operateTime >= query.startTime
      const matchEnd = !query.endTime || item.operateTime <= `${query.endTime} 23:59`
      return matchOperator && matchModule && matchType && matchStatus && matchStart && matchEnd
    })
    .sort((a, b) => b.operateTime.localeCompare(a.operateTime))

  return respondMock(paginate(records, query.pageNum, query.pageSize))
}
