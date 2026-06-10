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

const mockStaff: StaffVO[] = [
  {
    id: 2001,
    userId: 1001,
    username: 'admin01',
    staffNo: 'A001',
    realName: '中心管理员',
    phone: '13800000001',
    staffType: 'ADMIN',
    title: '主管老师',
    specialty: '系统管理',
    introduction: '负责中心日常配置与运营。',
    maxDailyAppointments: 6,
    status: 1,
  },
  {
    id: 2002,
    userId: 1002,
    username: 'interviewer01',
    staffNo: 'I001',
    realName: '初访员张老师',
    phone: '13800000002',
    staffType: 'INTERVIEWER',
    title: '讲师',
    specialty: '压力管理',
    introduction: '擅长学生压力与情绪问题初筛。',
    maxDailyAppointments: 8,
    status: 1,
  },
  {
    id: 2003,
    userId: 1003,
    username: 'assistant01',
    staffNo: 'S001',
    realName: '心理助理王老师',
    phone: '13800000003',
    staffType: 'ASSISTANT',
    title: '助理研究员',
    specialty: '流程协调',
    introduction: '负责正式咨询安排与跟进。',
    maxDailyAppointments: 10,
    status: 0,
  },
  {
    id: 2004,
    userId: 1004,
    username: 'counselor01',
    staffNo: 'C001',
    realName: '咨询师李老师',
    phone: '13800000004',
    staffType: 'COUNSELOR',
    title: '副教授',
    specialty: '人际关系',
    introduction: '负责正式咨询与结案报告。',
    maxDailyAppointments: 5,
    status: 1,
  },
  {
    id: 2005,
    userId: 1006,
    username: 'multi-role01',
    staffNo: 'I002',
    realName: '赵老师',
    phone: '13800000006',
    staffType: 'INTERVIEWER',
    title: '讲师',
    specialty: '危机识别',
    introduction: '参与值班与初访任务。',
    maxDailyAppointments: 6,
    status: 1,
  },
]

export function findMockStaffByIdentity(params: {
  userId?: number
  username?: string
  realName?: string
  staffType?: string
}) {
  const { userId, username, realName, staffType } = params
  return mockStaff.find((item) => {
    if (staffType && item.staffType !== staffType) return false
    if (typeof userId === 'number' && item.userId === userId) return true
    if (username && item.username === username) return true
    if (realName && item.realName === realName) return true
    return false
  })
}

const mockRooms: RoomVO[] = [
  { id: 3001, roomName: '咨询室101', location: '心理中心一层', capacity: 2, status: 1, remark: '适合一对一面谈' },
  { id: 3002, roomName: '咨询室102', location: '心理中心一层', capacity: 2, status: 1, remark: '靠近等候区' },
  { id: 3003, roomName: '团体辅导室', location: '心理中心二层', capacity: 8, status: 1, remark: '可用于小组活动' },
  { id: 3004, roomName: '备用咨询室', location: '心理中心二层', capacity: 1, status: 0, remark: '设备待维护' },
]

const mockTimeSlots: TimeSlotVO[] = [
  { id: 4001, slotName: '上午第一时段', startTime: '08:30', endTime: '10:00', intervalMinutes: 10, status: 1 },
  { id: 4002, slotName: '上午第二时段', startTime: '10:10', endTime: '11:40', intervalMinutes: 10, status: 1 },
  { id: 4003, slotName: '下午第一时段', startTime: '14:30', endTime: '16:00', intervalMinutes: 10, status: 1 },
  { id: 4004, slotName: '晚间时段', startTime: '19:00', endTime: '20:30', intervalMinutes: 10, status: 0 },
]

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function sleep(ms = 180) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function respond<T>(value: T) {
  await sleep()
  return clone(value)
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
  const options = mockStaff
    .filter(item => item.status === 1)
    .filter(item => !staffType || item.staffType === staffType)
    .map<OptionItem>(item => ({
      label: `${item.realName}（${getStaffTypeLabel(item.staffType)}）`,
      value: item.id,
    }))

  return respond(options)
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
  const options = mockRooms
    .filter(item => item.status === 1)
    .map<OptionItem>(item => ({
      label: item.roomName,
      value: item.id,
    }))

  return respond(options)
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
  const options = mockTimeSlots
    .filter(item => item.status === 1)
    .map<OptionItem>(item => ({
      label: `${item.slotName}（${item.startTime}-${item.endTime}）`,
      value: item.id,
    }))

  return respond(options)
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
