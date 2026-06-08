import dayjs from 'dayjs'

import { http } from './http'
import type { ApiResult } from '@/types/auth'
import {
  applyDutyScheduleToAppointment,
  getMockAppointmentById,
  getMockAppointments,
  respondMock,
  updateMockAppointment,
} from './mock-first-visit'

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

type DutyScheduleEntity = Omit<DutyScheduleVO, 'remaining'>

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

let userIdSeed = 1006
let staffIdSeed = 2005
let roomIdSeed = 3004
let slotIdSeed = 4004
let dutyScheduleIdSeed = 5007

const mockUsers: UserVO[] = [
  {
    id: 1001,
    username: 'admin01',
    realName: '中心管理员',
    phone: '13800000001',
    email: 'admin01@tyut.edu.cn',
    roles: ['ADMIN'],
    status: 1,
    lastLoginTime: '2026-06-07 08:30',
    createTime: '2026-06-01 09:00',
  },
  {
    id: 1002,
    username: 'interviewer01',
    realName: '初访员张老师',
    phone: '13800000002',
    email: 'interviewer01@tyut.edu.cn',
    roles: ['INTERVIEWER'],
    status: 1,
    lastLoginTime: '2026-06-07 09:20',
    createTime: '2026-06-01 09:20',
  },
  {
    id: 1003,
    username: 'assistant01',
    realName: '心理助理王老师',
    phone: '13800000003',
    email: 'assistant01@tyut.edu.cn',
    roles: ['ASSISTANT'],
    status: 1,
    lastLoginTime: '2026-06-06 17:10',
    createTime: '2026-06-01 09:40',
  },
  {
    id: 1004,
    username: 'counselor01',
    realName: '咨询师李老师',
    phone: '13800000004',
    email: 'counselor01@tyut.edu.cn',
    roles: ['COUNSELOR'],
    status: 1,
    lastLoginTime: '2026-06-06 16:20',
    createTime: '2026-06-01 10:00',
  },
  {
    id: 1005,
    username: 'student01',
    realName: '张同学',
    phone: '13800000005',
    email: 'student01@tyut.edu.cn',
    roles: ['STUDENT'],
    status: 1,
    lastLoginTime: '2026-06-06 19:30',
    createTime: '2026-06-01 10:20',
  },
  {
    id: 1006,
    username: 'multi-role01',
    realName: '赵老师',
    phone: '13800000006',
    email: 'multirole01@tyut.edu.cn',
    roles: ['ADMIN', 'INTERVIEWER'],
    status: 0,
    lastLoginTime: '2026-06-04 12:40',
    createTime: '2026-06-02 11:10',
  },
]

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

const mockDutySchedules: DutyScheduleEntity[] = [
  {
    id: 5001,
    staffId: 2002,
    staffName: '初访员张老师',
    staffType: 'INTERVIEWER',
    dutyDate: '2026-06-09',
    slotId: 4001,
    slotName: '上午第一时段',
    startTime: '08:30',
    endTime: '10:00',
    roomId: 3001,
    roomName: '咨询室101',
    capacity: 2,
    reservedCount: 1,
    status: 1,
  },
  {
    id: 5002,
    staffId: 2002,
    staffName: '初访员张老师',
    staffType: 'INTERVIEWER',
    dutyDate: '2026-06-10',
    slotId: 4002,
    slotName: '上午第二时段',
    startTime: '10:10',
    endTime: '11:40',
    roomId: 3002,
    roomName: '咨询室102',
    capacity: 2,
    reservedCount: 0,
    status: 1,
  },
  {
    id: 5003,
    staffId: 2005,
    staffName: '赵老师',
    staffType: 'INTERVIEWER',
    dutyDate: '2026-06-11',
    slotId: 4003,
    slotName: '下午第一时段',
    startTime: '14:30',
    endTime: '16:00',
    roomId: 3001,
    roomName: '咨询室101',
    capacity: 3,
    reservedCount: 1,
    status: 0,
  },
  {
    id: 5004,
    staffId: 2004,
    staffName: '咨询师李老师',
    staffType: 'COUNSELOR',
    dutyDate: '2026-06-09',
    slotId: 4001,
    slotName: '上午第一时段',
    startTime: '08:30',
    endTime: '10:00',
    roomId: 3003,
    roomName: '团体辅导室',
    capacity: 2,
    reservedCount: 1,
    status: 1,
  },
  {
    id: 5005,
    staffId: 2004,
    staffName: '咨询师李老师',
    staffType: 'COUNSELOR',
    dutyDate: '2026-06-12',
    slotId: 4003,
    slotName: '下午第一时段',
    startTime: '14:30',
    endTime: '16:00',
    roomId: 3003,
    roomName: '团体辅导室',
    capacity: 2,
    reservedCount: 0,
    status: 1,
  },
  {
    id: 5006,
    staffId: 2002,
    staffName: '初访员张老师',
    staffType: 'INTERVIEWER',
    dutyDate: '2026-06-13',
    slotId: 4001,
    slotName: '上午第一时段',
    startTime: '08:30',
    endTime: '10:00',
    roomId: 3002,
    roomName: '咨询室102',
    capacity: 2,
    reservedCount: 0,
    status: 1,
  },
  {
    id: 5007,
    staffId: 2004,
    staffName: '咨询师李老师',
    staffType: 'COUNSELOR',
    dutyDate: '2026-06-13',
    slotId: 4002,
    slotName: '上午第二时段',
    startTime: '10:10',
    endTime: '11:40',
    roomId: 3003,
    roomName: '团体辅导室',
    capacity: 1,
    reservedCount: 0,
    status: 1,
  },
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

function getStaffById(id: number) {
  const staff = mockStaff.find(item => item.id === id)
  if (!staff) {
    throw new Error('未找到工作人员')
  }
  return staff
}

function getRoomById(id: number | null | undefined) {
  if (id == null) return null
  const room = mockRooms.find(item => item.id === id)
  if (!room) {
    throw new Error('未找到咨询室')
  }
  return room
}

function getTimeSlotById(id: number) {
  const slot = mockTimeSlots.find(item => item.id === id)
  if (!slot) {
    throw new Error('未找到时间段')
  }
  return slot
}

function toDutyScheduleVO(entity: DutyScheduleEntity): DutyScheduleVO {
  return {
    ...entity,
    remaining: Math.max(entity.capacity - entity.reservedCount, 0),
  }
}

function buildDutyScheduleEntity(payload: DutyScheduleSaveRequest, reservedCount = 0, id?: number): DutyScheduleEntity {
  const staff = getStaffById(payload.staffId)
  const slot = getTimeSlotById(payload.slotId)
  const room = getRoomById(payload.roomId)

  return {
    id: id ?? ++dutyScheduleIdSeed,
    staffId: payload.staffId,
    staffName: staff.realName,
    staffType: payload.staffType,
    dutyDate: payload.dutyDate,
    slotId: payload.slotId,
    slotName: slot.slotName,
    startTime: slot.startTime,
    endTime: slot.endTime,
    roomId: room?.id ?? null,
    roomName: room?.roomName ?? '未分配',
    capacity: payload.capacity,
    reservedCount,
    status: payload.status,
  }
}

function validateDuplicateDutySchedule(payload: DutyScheduleSaveRequest, excludeId?: number) {
  const duplicated = mockDutySchedules.some(item => (
    item.id !== excludeId
    && item.staffId === payload.staffId
    && item.dutyDate === payload.dutyDate
    && item.slotId === payload.slotId
  ))

  if (duplicated) {
    throw new Error('该工作人员在该日期和时间段已存在值班安排')
  }
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

export async function pageDutySchedules(query: DutyScheduleQuery) {
  const records = mockDutySchedules
    .filter((item) => {
      const matchType = !query.staffType || item.staffType === query.staffType
      const matchStaff = query.staffId == null || item.staffId === query.staffId
      const matchStart = !query.startDate || item.dutyDate >= query.startDate
      const matchEnd = !query.endDate || item.dutyDate <= query.endDate
      const matchStatus = query.status == null || item.status === query.status
      return matchType && matchStaff && matchStart && matchEnd && matchStatus
    })
    .sort((a, b) => `${a.dutyDate}${a.startTime}`.localeCompare(`${b.dutyDate}${b.startTime}`))
    .map(toDutyScheduleVO)

  return respond(paginate(records, query.pageNum, query.pageSize))
}

export async function createDutySchedule(data: DutyScheduleSaveRequest) {
  validateDuplicateDutySchedule(data)
  const entity = buildDutyScheduleEntity(data)
  mockDutySchedules.unshift(entity)
  return respond(toDutyScheduleVO(entity))
}

export async function updateDutySchedule(id: number, data: DutyScheduleSaveRequest) {
  const index = mockDutySchedules.findIndex(item => item.id === id)
  if (index < 0) {
    throw new Error('未找到值班安排')
  }

  const current = mockDutySchedules[index]
  if (data.capacity < current.reservedCount) {
    throw new Error('容量不能小于已预约数')
  }

  validateDuplicateDutySchedule(data, id)
  mockDutySchedules[index] = buildDutyScheduleEntity(data, current.reservedCount, id)
  return respond(toDutyScheduleVO(mockDutySchedules[index]))
}

export async function deleteDutySchedule(id: number) {
  const target = mockDutySchedules.find(item => item.id === id)
  if (!target) {
    throw new Error('未找到值班安排')
  }
  target.status = 0
  return respond(toDutyScheduleVO(target))
}

export async function batchCreateDutySchedules(data: BatchCreateDutySchedulesRequest) {
  let createdCount = 0

  for (
    let cursor = dayjs(data.startDate);
    cursor.isBefore(dayjs(data.endDate).add(1, 'day'), 'day');
    cursor = cursor.add(1, 'day')
  ) {
    if (!data.weekdays.includes(cursor.day())) {
      continue
    }

    for (const slotId of data.slotIds) {
      const payload: DutyScheduleSaveRequest = {
        staffId: data.staffId,
        staffType: data.staffType,
        dutyDate: cursor.format('YYYY-MM-DD'),
        slotId,
        roomId: data.roomId ?? null,
        capacity: data.capacity,
        status: 1,
      }

      const duplicated = mockDutySchedules.some(item => (
        item.staffId === payload.staffId
        && item.dutyDate === payload.dutyDate
        && item.slotId === payload.slotId
      ))

      if (duplicated) {
        continue
      }

      mockDutySchedules.unshift(buildDutyScheduleEntity(payload))
      createdCount += 1
    }
  }

  if (createdCount === 0) {
    throw new Error('所选日期范围内没有新增值班，请检查是否全部与现有安排重复')
  }

  return respond<BatchCreateDutySchedulesResult>({ createdCount })
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

function getScheduleReservedCount(scheduleId: number, excludeAppointmentId?: number) {
  const schedule = mockDutySchedules.find(item => item.id === scheduleId)
  if (!schedule) {
    throw new Error('未找到值班安排')
  }

  const dynamicReserved = getMockAppointments().filter(item => (
    item.dutyScheduleId === scheduleId
    && item.id !== excludeAppointmentId
    && ['APPROVED', 'COMPLETED'].includes(item.appointmentStatus)
  )).length

  return Math.max(schedule.reservedCount, dynamicReserved)
}

function getInterviewDutyScheduleOrThrow(scheduleId: number, excludeAppointmentId?: number) {
  const schedule = mockDutySchedules.find(item => item.id === scheduleId && item.staffType === 'INTERVIEWER')
  if (!schedule) {
    throw new Error('未找到初访员值班安排')
  }

  const reservedCount = getScheduleReservedCount(scheduleId, excludeAppointmentId)
  return {
    ...schedule,
    reservedCount,
    remaining: Math.max(schedule.capacity - reservedCount, 0),
  }
}

function toAppointmentAuditVO(item: AppointmentDetailVO): AppointmentAuditVO {
  return {
    id: item.id,
    appointmentNo: item.appointmentNo,
    studentNo: item.studentNo,
    studentName: item.studentName,
    college: item.college,
    phone: item.phone,
    mainProblem: item.mainProblem,
    riskScore: item.riskScore,
    riskLevel: item.riskLevel,
    appointmentDate: item.appointmentDate,
    slotName: item.slotName,
    interviewerName: item.interviewerName,
    roomName: item.roomName,
    appointmentStatus: item.appointmentStatus,
    priorityFlag: item.priorityFlag,
    createTime: item.createTime,
  }
}

function toAppointmentDetailVO(id: number): AppointmentDetailVO {
  const item = getMockAppointmentById(id)
  if (!item) {
    throw new Error('未找到预约记录')
  }

  return {
    id: item.id,
    appointmentNo: item.appointmentNo,
    studentId: item.studentId,
    studentNo: item.studentNo,
    studentName: item.studentName,
    college: item.college,
    phone: item.phone,
    mainProblem: item.mainProblem,
    problemDescription: item.problemDescription,
    expectedHelp: item.expectedHelp,
    moodScore: item.moodScore,
    sleepScore: item.sleepScore,
    stressScore: item.stressScore,
    selfHarmFlag: item.selfHarmFlag,
    emergencyFlag: item.emergencyFlag,
    riskScore: item.riskScore,
    riskLevel: item.riskLevel,
    appointmentDate: item.appointmentDate,
    slotId: item.slotId,
    slotName: item.slotName,
    startTime: item.startTime,
    endTime: item.endTime,
    interviewerId: item.interviewerId,
    interviewerName: item.interviewerName,
    roomId: item.roomId,
    roomName: item.roomName,
    dutyScheduleId: item.dutyScheduleId,
    appointmentStatus: item.appointmentStatus,
    priorityFlag: item.priorityFlag,
    auditRemark: item.auditRemark,
    rejectReason: item.rejectReason,
    auditTime: item.auditTime,
    auditorName: item.auditorName,
    createTime: item.createTime,
    latestResult: item.latestResult,
  }
}

export async function pageAuditAppointments(query: AppointmentAuditQuery) {
  const keyword = normalizeKeyword(query.keyword)
  const records = getMockAppointments()
    .filter((item) => {
      const matchKeyword = !keyword || [item.appointmentNo, item.studentNo, item.studentName, item.college, item.mainProblem]
        .filter(Boolean)
        .some(value => value.toLowerCase().includes(keyword))
      const matchStatus = !query.status || item.appointmentStatus === query.status
      const matchRisk = !query.riskLevel || item.riskLevel === query.riskLevel
      const matchStart = !query.startDate || item.appointmentDate >= query.startDate
      const matchEnd = !query.endDate || item.appointmentDate <= query.endDate
      const matchPriority = query.priorityFlag == null || item.priorityFlag === query.priorityFlag
      return matchKeyword && matchStatus && matchRisk && matchStart && matchEnd && matchPriority
    })
    .map(item => toAppointmentDetailVO(item.id))
    .sort((a, b) => {
      if (a.priorityFlag !== b.priorityFlag) return b.priorityFlag - a.priorityFlag
      if (a.riskScore !== b.riskScore) return b.riskScore - a.riskScore
      return b.createTime.localeCompare(a.createTime)
    })
    .map(toAppointmentAuditVO)

  return respondMock(paginate(records, query.pageNum, query.pageSize))
}

export async function getAuditAppointmentDetail(id: number) {
  return respondMock(toAppointmentDetailVO(id))
}

export async function getInterviewDutyOptions(staffId?: number) {
  const records = mockDutySchedules
    .filter(item => item.staffType === 'INTERVIEWER' && item.status === 1)
    .filter(item => !staffId || item.staffId === staffId)
    .map<InterviewDutyOption>((item) => {
      const reservedCount = getScheduleReservedCount(item.id)
      return {
        dutyScheduleId: item.id,
        interviewerId: item.staffId,
        interviewerName: item.staffName,
        appointmentDate: item.dutyDate,
        slotId: item.slotId,
        slotName: item.slotName,
        startTime: item.startTime,
        endTime: item.endTime,
        roomId: item.roomId ?? undefined,
        roomName: item.roomName,
        capacity: item.capacity,
        reservedCount,
        remaining: Math.max(item.capacity - reservedCount, 0),
      }
    })
    .sort((a, b) => `${a.appointmentDate}${a.startTime}`.localeCompare(`${b.appointmentDate}${b.startTime}`))

  return respondMock(records)
}

export async function approveAppointment(id: number, data: ApproveAppointmentRequest) {
  const appointment = getMockAppointmentById(id)
  if (!appointment) {
    throw new Error('未找到预约记录')
  }
  if (appointment.appointmentStatus !== 'PENDING') {
    throw new Error('只有待处理预约才能执行通过操作')
  }

  const schedule = getInterviewDutyScheduleOrThrow(data.dutyScheduleId)
  if (schedule.remaining < 1) {
    throw new Error('所选值班容量已满，请选择其他时间段')
  }

  applyDutyScheduleToAppointment(id, schedule, data.auditRemark, 'APPROVED')
  return respondMock(toAppointmentDetailVO(id))
}

export async function rejectAppointment(id: number, data: RejectAppointmentRequest) {
  const appointment = getMockAppointmentById(id)
  if (!appointment) {
    throw new Error('未找到预约记录')
  }
  if (appointment.appointmentStatus !== 'PENDING') {
    throw new Error('只有待处理预约才能执行驳回操作')
  }
  if (!data.reason.trim()) {
    throw new Error('驳回原因不能为空')
  }

  updateMockAppointment(id, {
    appointmentStatus: 'REJECTED',
    rejectReason: data.reason.trim(),
    auditRemark: data.reason.trim(),
    auditTime: dayjs().format('YYYY-MM-DD HH:mm'),
    auditorName: '中心管理员',
  })

  return respondMock(toAppointmentDetailVO(id))
}

export async function rescheduleAppointment(id: number, data: RescheduleAppointmentRequest) {
  const appointment = getMockAppointmentById(id)
  if (!appointment) {
    throw new Error('未找到预约记录')
  }
  if (!['PENDING', 'APPROVED'].includes(appointment.appointmentStatus)) {
    throw new Error('当前预约状态不支持改约')
  }

  const schedule = getInterviewDutyScheduleOrThrow(data.dutyScheduleId, appointment.id)
  const changingToAnotherSchedule = appointment.dutyScheduleId !== schedule.dutyScheduleId
  if (changingToAnotherSchedule && schedule.remaining < 1) {
    throw new Error('所选值班容量已满，请选择其他时间段')
  }

  applyDutyScheduleToAppointment(id, schedule, data.auditRemark, appointment.appointmentStatus as 'PENDING' | 'APPROVED')
  return respondMock(toAppointmentDetailVO(id))
}

export async function markPriority(id: number) {
  const appointment = getMockAppointmentById(id)
  if (!appointment) {
    throw new Error('未找到预约记录')
  }

  updateMockAppointment(id, { priorityFlag: 1 })
  return respondMock(toAppointmentDetailVO(id))
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
