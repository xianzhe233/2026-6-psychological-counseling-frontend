import { http } from './http'
import type { ApiResult } from '@/types/auth'

export interface PageResult<T> {
  records: T[]
  total: number
  pageNum: number
  pageSize: number
  pages: number
}

export interface OptionItem {
  label: string
  value: number
}

// 用户管理
export interface UserQuery {
  pageNum: number
  pageSize: number
  keyword?: string
  roleCode?: string
  status?: number | null
}

export interface UserSaveRequest {
  id?: number
  username: string
  realName: string
  phone?: string
  email?: string
  password?: string
  roleCodes: string[]
  status: number
}

export interface UserVO {
  id: number
  username: string
  realName: string
  phone: string
  email: string
  roles: string[]
  status: number
  lastLoginTime: string
  createTime: string
}

// 工作人员管理
export interface StaffQuery {
  pageNum: number
  pageSize: number
  keyword?: string
  staffType?: string
  status?: number | null
}

export interface StaffSaveRequest {
  userId?: number
  username?: string
  realName: string
  phone?: string
  staffNo?: string
  staffType: string
  title?: string
  specialty?: string
  introduction?: string
  maxDailyAppointments?: number
  status: number
}

export interface StaffVO {
  id: number
  userId: number
  username?: string
  staffNo: string
  realName: string
  phone: string
  staffType: string
  title: string
  specialty: string
  introduction: string
  maxDailyAppointments: number
  status: number
}

// 咨询室管理
export interface RoomQuery {
  pageNum: number
  pageSize: number
  keyword?: string
  status?: number | null
}

export interface RoomSaveRequest {
  roomName: string
  location?: string
  capacity: number
  status: number
  remark?: string
}

export interface RoomVO {
  id: number
  roomName: string
  location: string
  capacity: number
  status: number
  remark: string
}

// 时间段管理
export interface TimeSlotQuery {
  pageNum: number
  pageSize: number
  keyword?: string
  status?: number | null
}

export interface TimeSlotSaveRequest {
  slotName: string
  startTime: string
  endTime: string
  intervalMinutes?: number
  status: number
}

export interface TimeSlotVO {
  id: number
  slotName: string
  startTime: string
  endTime: string
  intervalMinutes: number
  status: number
}

// 值班管理
export interface DutyScheduleQuery {
  pageNum: number
  pageSize: number
  staffType?: string
  staffId?: number | null
  startDate?: string
  endDate?: string
  status?: number | null
}

export interface DutyScheduleSaveRequest {
  staffId: number
  staffType: string
  dutyDate: string
  slotId: number
  roomId?: number | null
  capacity: number
  status: number
}

export interface DutyScheduleVO {
  id: number
  staffId: number
  staffName: string
  staffType: string
  dutyDate: string
  slotId: number
  slotName: string
  startTime: string
  endTime: string
  roomId: number | null
  roomName: string
  capacity: number
  reservedCount: number
  remaining: number
  status: number
}

export interface BatchCreateDutySchedulesRequest {
  staffId: number
  staffType: string
  startDate: string
  endDate: string
  weekdays: number[]
  slotIds: number[]
  roomId?: number | null
  capacity: number
}

export interface BatchCreateDutySchedulesResult {
  createdCount: number
}

const roleLabelMap: Record<string, string> = {
  STUDENT: '学生',
  ADMIN: '管理员',
  INTERVIEWER: '初访员',
  ASSISTANT: '心理助理',
  COUNSELOR: '咨询师',
}

const staffTypeLabelMap: Record<string, string> = {
  ADMIN: '管理员',
  INTERVIEWER: '初访员',
  ASSISTANT: '心理助理',
  COUNSELOR: '咨询师',
}

export function getRoleLabel(roleCode: string) {
  return roleLabelMap[roleCode] ?? roleCode
}

export function getStaffTypeLabel(staffType: string) {
  return staffTypeLabelMap[staffType] ?? staffType
}

function compactParams<T extends Record<string, unknown>>(params: T) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  )
}

export async function pageUsers(query: UserQuery) {
  const { data } = await http.get<ApiResult<PageResult<UserVO>>>('/admin/users', {
    params: compactParams(query),
  })
  return data.data
}

export async function createUser(data: UserSaveRequest) {
  const response = await http.post<ApiResult<number>>('/admin/users', data)
  return response.data.data
}

export async function updateUser(id: number, data: UserSaveRequest) {
  await http.put<ApiResult<null>>(`/admin/users/${id}`, data)
}

export async function disableUser(id: number) {
  await http.post<ApiResult<null>>(`/admin/users/${id}/disable`)
}

export async function enableUser(id: number) {
  await http.post<ApiResult<null>>(`/admin/users/${id}/enable`)
}

export async function resetPassword(id: number) {
  const response = await http.post<ApiResult<string>>(`/admin/users/${id}/reset-password`)
  return response.data.data
}

export async function pageStaff(query: StaffQuery) {
  const { data } = await http.get<ApiResult<PageResult<StaffVO>>>('/admin/staff', {
    params: compactParams(query),
  })
  return data.data
}

export async function createStaff(data: StaffSaveRequest) {
  const response = await http.post<ApiResult<number>>('/admin/staff', data)
  return response.data.data
}

export async function updateStaff(id: number, data: StaffSaveRequest) {
  await http.put<ApiResult<null>>(`/admin/staff/${id}`, data)
}

export async function getStaffOptions(staffType?: string) {
  const { data } = await getStaffOptionsReal(staffType)
  return data.data
}

export async function pageRooms(query: RoomQuery) {
  const { data } = await http.get<ApiResult<PageResult<RoomVO>>>('/admin/rooms', {
    params: compactParams(query),
  })
  return data.data
}

export async function createRoom(data: RoomSaveRequest) {
  const response = await http.post<ApiResult<number>>('/admin/rooms', data)
  return response.data.data
}

export async function updateRoom(id: number, data: RoomSaveRequest) {
  await http.put<ApiResult<null>>(`/admin/rooms/${id}`, data)
}

export async function getRoomOptions() {
  const { data } = await getRoomOptionsReal()
  return data.data
}

export async function pageTimeSlots(query: TimeSlotQuery) {
  const { data } = await http.get<ApiResult<PageResult<TimeSlotVO>>>('/admin/time-slots', {
    params: compactParams(query),
  })
  return data.data
}

export async function createTimeSlot(data: TimeSlotSaveRequest) {
  const response = await http.post<ApiResult<number>>('/admin/time-slots', data)
  return response.data.data
}

export async function updateTimeSlot(id: number, data: TimeSlotSaveRequest) {
  await http.put<ApiResult<null>>(`/admin/time-slots/${id}`, data)
}

export async function getTimeSlotOptions() {
  const { data } = await getTimeSlotOptionsReal()
  return data.data
}

export interface AppointmentAuditQuery {
  pageNum: number
  pageSize: number
  keyword?: string
  status?: string
  riskLevel?: string
  startDate?: string
  endDate?: string
  priorityFlag?: number | null
}

export interface AppointmentAuditVO {
  id: number
  appointmentNo: string
  studentNo: string
  studentName: string
  college?: string
  phone?: string
  mainProblem: string
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  appointmentDate: string
  slotName: string
  interviewerName?: string
  roomName?: string
  appointmentStatus: string
  priorityFlag: number
  createTime: string
}

export interface AppointmentDetailVO extends AppointmentAuditVO {
  studentId: number
  problemDescription?: string
  expectedHelp?: string
  moodScore: number
  sleepScore: number
  stressScore: number
  selfHarmFlag: number
  emergencyFlag: number
  slotId: number
  startTime: string
  endTime: string
  interviewerId?: number
  roomId?: number
  dutyScheduleId?: number
  auditRemark?: string
  rejectReason?: string
  auditTime?: string
  auditorName?: string
  latestResult?: {
    crisisLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    problemTypeId: number
    problemTypeLabel: string
    interviewTime: string
    conclusion: 'NO_NEED' | 'ARRANGE_CONSULTATION' | 'TRANSFER'
    summary?: string
    nextAction?: string
    submitTime: string
  }
}

export interface ApproveAppointmentRequest {
  dutyScheduleId: number
  interviewerId: number
  appointmentDate: string
  slotId: number
  roomId?: number
  auditRemark?: string
}

export interface RejectAppointmentRequest {
  reason: string
}

export interface RescheduleAppointmentRequest {
  dutyScheduleId: number
  interviewerId: number
  appointmentDate: string
  slotId: number
  roomId?: number
  auditRemark?: string
}

export interface InterviewDutyOption {
  dutyScheduleId: number
  interviewerId: number
  interviewerName: string
  appointmentDate: string
  slotId: number
  slotName: string
  startTime: string
  endTime: string
  roomId?: number
  roomName?: string
  capacity: number
  reservedCount: number
  remaining: number
}

// ========== 真实后端API调用（阶段二） ==========

export interface RealPageResult<T> {
  records: T[]
  total: number
  pageNum: number
  pageSize: number
  pages: number
}

export interface RealAppointmentAuditVO {
  id: number
  appointmentNo: string
  studentId: number
  studentName: string
  studentNo: string
  college: string
  phone?: string
  formId: number
  mainProblem: string
  problemDescription?: string
  expectedHelp?: string
  moodScore?: number
  sleepScore?: number
  stressScore?: number
  selfHarmFlag?: number
  emergencyFlag?: number
  riskScore: number
  riskLevel: string
  appointmentDate: string
  slotId: number
  slotName: string
  startTime: string
  endTime: string
  roomId?: number
  roomName?: string
  interviewerId?: number
  interviewerName?: string
  dutyScheduleId?: number
  appointmentStatus: string
  priorityFlag: number
  auditAdminId?: number
  auditAdminName?: string
  auditTime?: string
  auditRemark?: string
  cancelReason?: string
  rejectReason?: string
  createTime: string
  updateTime: string
}

export interface RealApproveRequest {
  dutyScheduleId: number
  interviewerId: number
  appointmentDate: string
  slotId: number
  roomId?: number
  auditRemark?: string
}

export interface RealRejectRequest {
  reason: string
}

export function pageAuditAppointmentsReal(params: {
  pageNum: number
  pageSize: number
  keyword?: string
  status?: string
  riskLevel?: string
  startDate?: string
  endDate?: string
  priorityFlag?: number
}) {
  return http.get<ApiResult<RealPageResult<RealAppointmentAuditVO>>>('/admin/first-visit/appointments', { params })
}

export function getAuditAppointmentDetailReal(id: number) {
  return http.get<ApiResult<RealAppointmentAuditVO>>(`/admin/first-visit/appointments/${id}`)
}

export function approveAppointmentReal(id: number, data: RealApproveRequest) {
  return http.post<ApiResult<void>>(`/admin/first-visit/appointments/${id}/approve`, data)
}

export function rejectAppointmentReal(id: number, data: RealRejectRequest) {
  return http.post<ApiResult<void>>(`/admin/first-visit/appointments/${id}/reject`, data)
}

export function rescheduleAppointmentReal(id: number, data: RealApproveRequest) {
  return http.post<ApiResult<void>>(`/admin/first-visit/appointments/${id}/reschedule`, data)
}

export function markPriorityReal(id: number) {
  return http.post<ApiResult<void>>(`/admin/first-visit/appointments/${id}/priority`)
}

// ========== 真实后端API调用（阶段五：值班管理） ==========

export interface RealDutyScheduleVO {
  id: number
  staffId: number
  staffName: string
  staffType: string
  dutyDate: string
  slotId: number
  slotName: string
  startTime: string
  endTime: string
  roomId?: number
  roomName?: string
  capacity: number
  reservedCount: number
  remaining: number
  status: number
}

export interface RealBatchScheduleResponse {
  createdCount: number
  skippedCount: number
  conflicts?: Array<{
    date: string
    slotId: number
    reason: string
  }>
}

export function pageDutySchedulesReal(params: {
  pageNum: number
  pageSize: number
  staffType?: string
  staffId?: number
  startDate?: string
  endDate?: string
  status?: number
}) {
  return http.get<ApiResult<RealPageResult<RealDutyScheduleVO>>>('/admin/duty-schedules', { params })
}

export function createDutyScheduleReal(data: {
  staffId: number
  staffType: string
  dutyDate: string
  slotId: number
  roomId?: number
  capacity: number
  status: number
}) {
  return http.post<ApiResult<number>>('/admin/duty-schedules', data)
}

export function updateDutyScheduleReal(id: number, data: {
  staffId: number
  staffType: string
  dutyDate: string
  slotId: number
  roomId?: number
  capacity: number
  status: number
}) {
  return http.put<ApiResult<void>>(`/admin/duty-schedules/${id}`, data)
}

export function batchCreateDutySchedulesReal(data: {
  staffId: number
  staffType: string
  startDate: string
  endDate: string
  weekdays: number[]
  slotIds: number[]
  roomId?: number
  capacity: number
}) {
  return http.post<ApiResult<RealBatchScheduleResponse>>('/admin/duty-schedules/batch', data)
}

export function getStaffOptionsReal(staffType?: string) {
  return http.get<ApiResult<Array<{ label: string; value: number; staffType?: string }>>>('/admin/staff/options', {
    params: staffType ? { staffType } : {},
  })
}

export function getRoomOptionsReal() {
  return http.get<ApiResult<Array<{ label: string; value: number }>>>('/admin/rooms/options')
}

export function getTimeSlotOptionsReal() {
  return http.get<ApiResult<Array<{ label: string; value: number }>>>('/admin/time-slots/options')
}

export function getInterviewDutyOptionsReal(params?: {
  staffType?: string
  staffId?: number
  startDate?: string
  endDate?: string
  status?: number
}) {
  return http.get<ApiResult<RealPageResult<RealDutyScheduleVO>>>('/admin/duty-schedules', {
    params: {
      staffType: 'INTERVIEWER',
      status: 1,
      pageNum: 1,
      pageSize: 100,
      ...params,
    },
  })
}

export type CloseType = 'NORMAL' | 'DROPPED' | 'TRANSFER'
export type ReportStatus = 'DRAFT' | 'SUBMITTED'

export interface AdminCaseReportQuery {
  pageNum: number
  pageSize: number
  studentKeyword?: string
  counselorId?: number | null
  problemTypeId?: number | null
  closeType?: CloseType | null
  startDate?: string
  endDate?: string
}

export interface AdminCaseReportVO {
  id: number
  reportNo: string
  studentId: number
  studentName: string
  studentNo: string
  college?: string
  phone?: string
  counselorId?: number
  counselorName?: string
  problemTypeId: number
  problemTypeLabel: string
  totalSessions: number
  effectSelfRating?: string
  caseSummary?: string
  counselingEffect?: string
  suggestion?: string
  closeType: CloseType
  reportStatus: ReportStatus
  submitTime?: string
  updateTime: string
}

export async function getCounselorStaffOptionsReal(): Promise<OptionItem[]> {
  const { data } = await getStaffOptionsReal('COUNSELOR')
  return data.data
}

export async function getProblemTypeOptionsReal(): Promise<OptionItem[]> {
  const { data } = await http.get<ApiResult<OptionItem[]>>('/common/problem-types/options')
  return data.data
}

export async function pageCaseReports(query: AdminCaseReportQuery) {
  const { data } = await http.get<ApiResult<PageResult<AdminCaseReportVO>>>('/admin/case-reports', {
    params: compactParams(query),
  })
  return data.data
}

export async function getCaseReportDetail(id: number) {
  const { data } = await http.get<ApiResult<AdminCaseReportVO>>(`/admin/case-reports/${id}`)
  return data.data
}

export async function downloadCaseReportWord(id: number): Promise<void> {
  const response = await http.get(`/admin/case-reports/${id}/export-word`, {
    responseType: 'blob',
  })
  const contentDisposition = response.headers['content-disposition'] ?? ''
  const match = contentDisposition.match(/filename\*?=(?:UTF-8''|"?)?"?([^";]+)"?/) 
  const fileName = match?.[1] ?? '结案报告.docx'
  const url = URL.createObjectURL(response.data as Blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = decodeURIComponent(fileName)
  anchor.click()
  URL.revokeObjectURL(url)
}
