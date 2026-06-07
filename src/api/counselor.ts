import dayjs from 'dayjs'

import type { OptionItem, PageResult } from './admin'
import { respondMock } from './mock-first-visit'
import { getProblemTypeOptions } from './mock-first-visit'

export type ScheduleStatus = 'RESERVED' | 'COMPLETED' | 'ABSENT' | 'LEAVE' | 'DROPPED' | 'CLOSED' | 'CANCELED'
export type RecordStatus = 'COMPLETED' | 'ABSENT' | 'LEAVE' | 'DROPPED' | 'CLOSED'
export type ExtensionRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type ReportStatus = 'DRAFT' | 'SUBMITTED'
export type CloseType = 'NORMAL' | 'DROPPED' | 'TRANSFER'

export interface CounselorScheduleQuery {
  pageNum: number
  pageSize: number
  startDate?: string
  endDate?: string
  status?: ScheduleStatus | null
  studentKeyword?: string
}

export interface CounselorScheduleVO {
  id: number
  scheduleNo: string
  studentId: number
  studentName: string
  studentNo: string
  college: string
  phone: string
  problemTypeId: number
  problemTypeLabel: string
  crisisLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  consultationDate: string
  slotName: string
  startTime: string
  endTime: string
  roomName: string
  sessionIndex: number
  status: ScheduleStatus
  counselorId: number
  counselorName: string
  firstVisitSummary: string
  nextAction?: string
}

export interface ConsultationRecordRequest {
  recordStatus: RecordStatus
  consultationTime: string
  contentSummary?: string
  nextPlan?: string
  needClose: 0 | 1
}

export interface ConsultationRecordVO extends ConsultationRecordRequest {
  id: number
  scheduleId: number
  saveTime: string
}

export interface ExtensionRequestQuery {
  pageNum: number
  pageSize: number
  status?: ExtensionRequestStatus | null
}

export interface ExtensionRequestVO {
  id: number
  studentId: number
  studentName: string
  studentNo: string
  requestSessions: number
  reason: string
  status: ExtensionRequestStatus
  auditRemark?: string
  createTime: string
}

export interface CreateExtensionRequest {
  studentId: number
  requestSessions: number
  reason: string
}

export interface CaseReportQuery {
  pageNum: number
  pageSize: number
  status?: ReportStatus | null
  studentKeyword?: string
}

export interface CaseReportRequest {
  studentId: number
  problemTypeId: number
  totalSessions: number
  effectSelfRating: string
  caseSummary?: string
  counselingEffect?: string
  suggestion?: string
  closeType: CloseType
  reportStatus: ReportStatus
}

export interface CaseReportVO extends CaseReportRequest {
  id: number
  reportNo: string
  studentName: string
  studentNo: string
  college: string
  phone: string
  problemTypeLabel: string
  submitTime?: string
  updateTime: string
}

let recordIdSeed = 12000
let extensionIdSeed = 13000
let reportIdSeed = 14000

const schedules: CounselorScheduleVO[] = [
  {
    id: 8101,
    scheduleNo: 'CS20260615001',
    studentId: 7003,
    studentName: '赵欣怡',
    studentNo: '2023001003',
    college: '经济管理学院',
    phone: '13900000013',
    problemTypeId: 3,
    problemTypeLabel: '情绪困扰',
    crisisLevel: 'HIGH',
    consultationDate: '2026-06-15',
    slotName: '下午第一时段',
    startTime: '14:30',
    endTime: '16:00',
    roomName: '咨询室101',
    sessionIndex: 1,
    status: 'RESERVED',
    counselorId: 2004,
    counselorName: '李老师',
    firstVisitSummary: '学生持续情绪低落，对专业和未来方向存在明显困惑，需要进入正式咨询持续支持。',
    nextAction: '建议安排情绪支持方向咨询师，优先在一周内完成首次正式咨询。',
  },
  {
    id: 8102,
    scheduleNo: 'CS20260618001',
    studentId: 7005,
    studentName: '周雨桐',
    studentNo: '2023001005',
    college: '外国语学院',
    phone: '13900000015',
    problemTypeId: 5,
    problemTypeLabel: '家庭问题',
    crisisLevel: 'MEDIUM',
    consultationDate: '2026-06-18',
    slotName: '上午第一时段',
    startTime: '08:30',
    endTime: '10:00',
    roomName: '咨询室102',
    sessionIndex: 1,
    status: 'RESERVED',
    counselorId: 2004,
    counselorName: '李老师',
    firstVisitSummary: '家庭沟通压力对近期情绪影响较明显，学生有继续咨询意愿。',
    nextAction: '建议安排家庭沟通与情绪调节方向正式咨询。',
  },
  {
    id: 8103,
    scheduleNo: 'CS20260605001',
    studentId: 7007,
    studentName: '陈亦航',
    studentNo: '2023001007',
    college: '软件学院',
    phone: '13900000017',
    problemTypeId: 1,
    problemTypeLabel: '学业压力',
    crisisLevel: 'MEDIUM',
    consultationDate: '2026-06-05',
    slotName: '下午第二时段',
    startTime: '16:10',
    endTime: '17:40',
    roomName: '咨询室103',
    sessionIndex: 2,
    status: 'COMPLETED',
    counselorId: 2004,
    counselorName: '李老师',
    firstVisitSummary: '考试压力明显，已进入第二次正式咨询。',
    nextAction: '继续跟进睡眠与复习计划。',
  },
]

const records: ConsultationRecordVO[] = [
  {
    id: 12001,
    scheduleId: 8103,
    recordStatus: 'COMPLETED',
    consultationTime: '2026-06-05 16:10',
    contentSummary: '围绕考试压力和时间安排进行讨论，学生能够识别主要压力来源。',
    nextPlan: '下次继续讨论睡眠改善和复习节奏。',
    needClose: 0,
    saveTime: '2026-06-05 17:50',
  },
]

const extensionRequests: ExtensionRequestVO[] = [
  {
    id: 13001,
    studentId: 7007,
    studentName: '陈亦航',
    studentNo: '2023001007',
    requestSessions: 2,
    reason: '既有咨询安排完成后仍需继续支持考试压力调节。',
    status: 'PENDING',
    createTime: '2026-06-06 11:20',
  },
]

const caseReports: CaseReportVO[] = [
  {
    id: 14001,
    reportNo: 'CR20260605001',
    studentId: 7007,
    studentName: '陈亦航',
    studentNo: '2023001007',
    college: '软件学院',
    phone: '13900000017',
    problemTypeId: 1,
    problemTypeLabel: '学业压力',
    totalSessions: 2,
    effectSelfRating: '较好',
    caseSummary: '学生主要困扰为考试压力和作息紊乱，经过咨询后能够列出复习计划并尝试放松训练。',
    counselingEffect: '焦虑感有所下降，睡眠节律较初访时更稳定。',
    suggestion: '建议继续保持规律作息，必要时申请追加咨询。',
    closeType: 'NORMAL',
    reportStatus: 'DRAFT',
    updateTime: '2026-06-06 15:30',
  },
]

function normalizeKeyword(value?: string) {
  return value?.trim().toLowerCase() ?? ''
}

function paginate<T>(list: T[], pageNum: number, pageSize: number): PageResult<T> {
  const safePageNum = Math.max(pageNum, 1)
  const safePageSize = Math.max(pageSize, 1)
  const start = (safePageNum - 1) * safePageSize
  const total = list.length

  return {
    records: list.slice(start, start + safePageSize),
    total,
    pageNum: safePageNum,
    pageSize: safePageSize,
    pages: Math.max(Math.ceil(total / safePageSize), 1),
  }
}

function getScheduleOrThrow(scheduleId: number) {
  const schedule = schedules.find(item => item.id === scheduleId)
  if (!schedule) {
    throw new Error('未找到咨询日程')
  }
  return schedule
}

function getProblemTypeLabel(problemTypeId: number) {
  return getProblemTypeOptions().find(item => item.value === problemTypeId)?.label ?? '其他'
}

function getStudentOptionSource() {
  const map = new Map<number, OptionItem>()
  schedules.forEach((item) => {
    map.set(item.studentId, { label: `${item.studentName}（${item.studentNo}）`, value: item.studentId })
  })
  return Array.from(map.values())
}

function getStudentProfile(studentId: number) {
  const schedule = schedules.find(item => item.studentId === studentId)
  if (!schedule) {
    throw new Error('请选择有效的学生')
  }
  return schedule
}

export async function pageMySchedules(query: CounselorScheduleQuery) {
  const keyword = normalizeKeyword(query.studentKeyword)
  const filtered = schedules
    .filter(item => !query.startDate || item.consultationDate >= query.startDate)
    .filter(item => !query.endDate || item.consultationDate <= query.endDate)
    .filter(item => !query.status || item.status === query.status)
    .filter(item => !keyword || [item.studentName, item.studentNo, item.college, item.problemTypeLabel].some(value => value.toLowerCase().includes(keyword)))
    .sort((a, b) => `${a.consultationDate} ${a.startTime}`.localeCompare(`${b.consultationDate} ${b.startTime}`))

  return respondMock(paginate(filtered, query.pageNum, query.pageSize))
}

export async function getScheduleDetail(scheduleId: number) {
  return respondMock(getScheduleOrThrow(scheduleId))
}

export async function getRecordBySchedule(scheduleId: number) {
  getScheduleOrThrow(scheduleId)
  return respondMock(records.find(item => item.scheduleId === scheduleId) ?? null)
}

export async function saveConsultationRecord(scheduleId: number, data: ConsultationRecordRequest) {
  const schedule = getScheduleOrThrow(scheduleId)
  const existingIndex = records.findIndex(item => item.scheduleId === scheduleId)
  const record: ConsultationRecordVO = {
    id: existingIndex >= 0 ? records[existingIndex].id : ++recordIdSeed,
    scheduleId,
    recordStatus: data.recordStatus,
    consultationTime: data.consultationTime,
    contentSummary: data.contentSummary?.trim() || '',
    nextPlan: data.nextPlan?.trim() || '',
    needClose: data.needClose,
    saveTime: dayjs().format('YYYY-MM-DD HH:mm'),
  }

  if (existingIndex >= 0) {
    records.splice(existingIndex, 1, record)
  } else {
    records.push(record)
  }

  schedule.status = data.recordStatus
  return respondMock(record)
}

export async function pageMyExtensionRequests(query: ExtensionRequestQuery) {
  const filtered = extensionRequests
    .filter(item => !query.status || item.status === query.status)
    .sort((a, b) => b.createTime.localeCompare(a.createTime))

  return respondMock(paginate(filtered, query.pageNum, query.pageSize))
}

export async function createExtensionRequest(data: CreateExtensionRequest) {
  const student = getStudentProfile(data.studentId)
  const request: ExtensionRequestVO = {
    id: ++extensionIdSeed,
    studentId: data.studentId,
    studentName: student.studentName,
    studentNo: student.studentNo,
    requestSessions: data.requestSessions,
    reason: data.reason.trim(),
    status: 'PENDING',
    createTime: dayjs().format('YYYY-MM-DD HH:mm'),
  }
  extensionRequests.unshift(request)
  return respondMock(request)
}

export async function pageMyCaseReports(query: CaseReportQuery) {
  const keyword = normalizeKeyword(query.studentKeyword)
  const filtered = caseReports
    .filter(item => !query.status || item.reportStatus === query.status)
    .filter(item => !keyword || [item.studentName, item.studentNo, item.problemTypeLabel].some(value => value.toLowerCase().includes(keyword)))
    .sort((a, b) => b.updateTime.localeCompare(a.updateTime))

  return respondMock(paginate(filtered, query.pageNum, query.pageSize))
}

export async function getCaseReport(id: number) {
  const report = caseReports.find(item => item.id === id)
  if (!report) {
    throw new Error('未找到结案报告')
  }
  return respondMock(report)
}

export async function saveCaseReport(data: CaseReportRequest) {
  const student = getStudentProfile(data.studentId)
  const report: CaseReportVO = {
    id: ++reportIdSeed,
    reportNo: `CR${dayjs().format('YYYYMMDD')}${String(reportIdSeed).slice(-3)}`,
    studentId: data.studentId,
    studentName: student.studentName,
    studentNo: student.studentNo,
    college: student.college,
    phone: student.phone,
    problemTypeId: data.problemTypeId,
    problemTypeLabel: getProblemTypeLabel(data.problemTypeId),
    totalSessions: data.totalSessions,
    effectSelfRating: data.effectSelfRating,
    caseSummary: data.caseSummary?.trim() || '',
    counselingEffect: data.counselingEffect?.trim() || '',
    suggestion: data.suggestion?.trim() || '',
    closeType: data.closeType,
    reportStatus: data.reportStatus,
    submitTime: data.reportStatus === 'SUBMITTED' ? dayjs().format('YYYY-MM-DD HH:mm') : undefined,
    updateTime: dayjs().format('YYYY-MM-DD HH:mm'),
  }
  caseReports.unshift(report)
  return respondMock(report)
}

export async function updateCaseReport(id: number, data: CaseReportRequest) {
  const existingIndex = caseReports.findIndex(item => item.id === id)
  if (existingIndex < 0) {
    throw new Error('未找到结案报告')
  }
  const student = getStudentProfile(data.studentId)
  const oldReport = caseReports[existingIndex]
  const report: CaseReportVO = {
    ...oldReport,
    studentId: data.studentId,
    studentName: student.studentName,
    studentNo: student.studentNo,
    college: student.college,
    phone: student.phone,
    problemTypeId: data.problemTypeId,
    problemTypeLabel: getProblemTypeLabel(data.problemTypeId),
    totalSessions: data.totalSessions,
    effectSelfRating: data.effectSelfRating,
    caseSummary: data.caseSummary?.trim() || '',
    counselingEffect: data.counselingEffect?.trim() || '',
    suggestion: data.suggestion?.trim() || '',
    closeType: data.closeType,
    reportStatus: data.reportStatus,
    submitTime: data.reportStatus === 'SUBMITTED' ? oldReport.submitTime ?? dayjs().format('YYYY-MM-DD HH:mm') : oldReport.submitTime,
    updateTime: dayjs().format('YYYY-MM-DD HH:mm'),
  }
  caseReports.splice(existingIndex, 1, report)
  return respondMock(report)
}

export async function submitCaseReport(id: number) {
  const report = caseReports.find(item => item.id === id)
  if (!report) {
    throw new Error('未找到结案报告')
  }
  report.reportStatus = 'SUBMITTED'
  report.submitTime = dayjs().format('YYYY-MM-DD HH:mm')
  report.updateTime = report.submitTime
  return respondMock(report)
}

export async function downloadMyCaseReportWord(id: number) {
  const report = caseReports.find(item => item.id === id)
  if (!report) {
    throw new Error('未找到结案报告')
  }
  return respondMock({ fileName: `${report.studentName}-结案报告.docx` })
}

export async function getCounselorStudentOptions() {
  return respondMock(getStudentOptionSource())
}

export async function getCounselorProblemTypeOptions() {
  return respondMock(getProblemTypeOptions())
}
