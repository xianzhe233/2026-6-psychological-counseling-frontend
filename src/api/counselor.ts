import { http } from './http'
import { saveBlobResponse } from './download'
import type { OptionItem, PageResult } from './admin'

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
  crisisLevel: string
  consultationDate: string
  slotName: string
  startTime: string
  endTime: string
  roomName: string
  sessionIndex: number
  status: ScheduleStatus
  counselorId: number
  counselorName: string
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
}

export interface CaseReportVO {
  id: number
  reportNo: string
  studentId: number
  studentName: string
  studentNo: string
  college: string
  phone: string
  problemTypeId: number
  problemTypeLabel: string
  totalSessions: number
  effectSelfRating: string
  caseSummary: string
  counselingEffect: string
  suggestion: string
  closeType: CloseType
  reportStatus: ReportStatus
  submitTime?: string
  updateTime: string
}

export async function pageMySchedules(query: CounselorScheduleQuery): Promise<PageResult<CounselorScheduleVO>> {
  const { data: result } = await http.get('/counselor/schedules', { params: query })
  return result.data
}

export async function getScheduleDetail(scheduleId: number): Promise<CounselorScheduleVO> {
  const { data: result } = await http.get(`/counselor/schedules/${scheduleId}`)
  return result.data
}

export async function getRecordBySchedule(scheduleId: number): Promise<ConsultationRecordVO | null> {
  const { data: result } = await http.get(`/counselor/schedules/${scheduleId}/record`)
  return result.data ?? null
}

export async function saveConsultationRecord(scheduleId: number, data: ConsultationRecordRequest): Promise<ConsultationRecordVO> {
  const { data: result } = await http.post(`/counselor/schedules/${scheduleId}/record`, data)
  return result.data
}

export async function pageMyExtensionRequests(query: ExtensionRequestQuery): Promise<PageResult<ExtensionRequestVO>> {
  const { data: result } = await http.get('/counselor/extension-requests', { params: query })
  return result.data
}

export async function createExtensionRequest(data: CreateExtensionRequest): Promise<ExtensionRequestVO> {
  const { data: result } = await http.post('/counselor/extension-requests', data)
  return result.data
}

export async function pageMyCaseReports(query: CaseReportQuery): Promise<PageResult<CaseReportVO>> {
  const { data: result } = await http.get('/counselor/case-reports', { params: query })
  return result.data
}

export async function getCaseReport(id: number): Promise<CaseReportVO> {
  const { data: result } = await http.get(`/counselor/case-reports/${id}`)
  return result.data
}

export async function saveCaseReport(data: CaseReportRequest): Promise<CaseReportVO> {
  const { data: result } = await http.post('/counselor/case-reports', data)
  return result.data
}

export async function updateCaseReport(id: number, data: CaseReportRequest): Promise<CaseReportVO> {
  const { data: result } = await http.put(`/counselor/case-reports/${id}`, data)
  return result.data
}

export async function submitCaseReport(id: number): Promise<CaseReportVO> {
  const { data: result } = await http.post(`/counselor/case-reports/${id}/submit`)
  return result.data
}

export async function downloadMyCaseReportWord(id: number): Promise<void> {
  const response = await http.get<Blob>(`/counselor/case-reports/${id}/export-word`, {
    responseType: 'blob',
  })
  await saveBlobResponse(response, '结案报告.docx')
}

export async function getCounselorStudentOptions(): Promise<OptionItem[]> {
  const { data: result } = await http.get('/counselor/schedules', {
    params: { pageNum: 1, pageSize: 999 },
  })
  const records: CounselorScheduleVO[] = result.data?.records ?? []
  const seen = new Set<number>()
  return records
    .filter(item => {
      if (seen.has(item.studentId)) return false
      seen.add(item.studentId)
      return true
    })
    .map(item => ({
      label: `${item.studentName}（${item.studentNo}）`,
      value: item.studentId,
    }))
}

export async function getCounselorProblemTypeOptions(): Promise<OptionItem[]> {
  const { data: result } = await http.get('/common/problem-types/options')
  return result.data ?? []
}
