import dayjs from 'dayjs'

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

export async function pageUsers(query: UserQuery) {
  const keyword = normalizeKeyword(query.keyword)
  const records = mockUsers
    .filter((item) => {
      const matchKeyword = !keyword || [item.username, item.realName, item.phone, item.email]
        .filter(Boolean)
        .some(value => value.toLowerCase().includes(keyword))
      const matchRole = !query.roleCode || item.roles.includes(query.roleCode)
      const matchStatus = query.status == null || item.status === query.status
      return matchKeyword && matchRole && matchStatus
    })
    .sort((a, b) => b.id - a.id)

  return respond(paginate(records, query.pageNum, query.pageSize))
}

export async function createUser(data: UserSaveRequest) {
  const now = dayjs().format('YYYY-MM-DD HH:mm')
  const user: UserVO = {
    id: ++userIdSeed,
    username: data.username.trim(),
    realName: data.realName.trim(),
    phone: data.phone?.trim() ?? '',
    email: data.email?.trim() ?? '',
    roles: [...data.roleCodes],
    status: data.status,
    lastLoginTime: '-',
    createTime: now,
  }
  mockUsers.unshift(user)
  return respond(user)
}

export async function updateUser(id: number, data: UserSaveRequest) {
  const target = mockUsers.find(item => item.id === id)
  if (!target) {
    throw new Error('未找到用户')
  }

  Object.assign(target, {
    username: data.username.trim(),
    realName: data.realName.trim(),
    phone: data.phone?.trim() ?? '',
    email: data.email?.trim() ?? '',
    roles: [...data.roleCodes],
    status: data.status,
  })

  return respond(target)
}

export async function disableUser(id: number) {
  const target = mockUsers.find(item => item.id === id)
  if (!target) {
    throw new Error('未找到用户')
  }
  target.status = 0
  return respond(target)
}

export async function enableUser(id: number) {
  const target = mockUsers.find(item => item.id === id)
  if (!target) {
    throw new Error('未找到用户')
  }
  target.status = 1
  return respond(target)
}

export async function resetPassword(id: number) {
  const target = mockUsers.find(item => item.id === id)
  if (!target) {
    throw new Error('未找到用户')
  }
  return respond({ id, defaultPassword: '123456' })
}

export async function pageStaff(query: StaffQuery) {
  const keyword = normalizeKeyword(query.keyword)
  const records = mockStaff
    .filter((item) => {
      const matchKeyword = !keyword || [item.staffNo, item.realName, item.phone]
        .filter(Boolean)
        .some(value => value.toLowerCase().includes(keyword))
      const matchType = !query.staffType || item.staffType === query.staffType
      const matchStatus = query.status == null || item.status === query.status
      return matchKeyword && matchType && matchStatus
    })
    .sort((a, b) => b.id - a.id)

  return respond(paginate(records, query.pageNum, query.pageSize))
}

export async function createStaff(data: StaffSaveRequest) {
  const staff: StaffVO = {
    id: ++staffIdSeed,
    userId: data.userId ?? 0,
    username: data.username?.trim() ?? '',
    staffNo: data.staffNo?.trim() || `${data.staffType.slice(0, 1)}${String(staffIdSeed).slice(-3)}`,
    realName: data.realName.trim(),
    phone: data.phone?.trim() ?? '',
    staffType: data.staffType,
    title: data.title?.trim() ?? '',
    specialty: data.specialty?.trim() ?? '',
    introduction: data.introduction?.trim() ?? '',
    maxDailyAppointments: data.maxDailyAppointments ?? 6,
    status: data.status,
  }
  mockStaff.unshift(staff)
  return respond(staff)
}

export async function updateStaff(id: number, data: StaffSaveRequest) {
  const target = mockStaff.find(item => item.id === id)
  if (!target) {
    throw new Error('未找到工作人员')
  }

  Object.assign(target, {
    userId: data.userId ?? target.userId,
    username: data.username?.trim() ?? target.username ?? '',
    staffNo: data.staffNo?.trim() || target.staffNo,
    realName: data.realName.trim(),
    phone: data.phone?.trim() ?? '',
    staffType: data.staffType,
    title: data.title?.trim() ?? '',
    specialty: data.specialty?.trim() ?? '',
    introduction: data.introduction?.trim() ?? '',
    maxDailyAppointments: data.maxDailyAppointments ?? 6,
    status: data.status,
  })

  mockDutySchedules.forEach((item) => {
    if (item.staffId === id) {
      item.staffName = target.realName
      item.staffType = target.staffType
    }
  })

  return respond(target)
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
  const keyword = normalizeKeyword(query.keyword)
  const records = mockRooms
    .filter((item) => {
      const matchKeyword = !keyword || [item.roomName, item.location, item.remark]
        .filter(Boolean)
        .some(value => value.toLowerCase().includes(keyword))
      const matchStatus = query.status == null || item.status === query.status
      return matchKeyword && matchStatus
    })
    .sort((a, b) => b.id - a.id)

  return respond(paginate(records, query.pageNum, query.pageSize))
}

export async function createRoom(data: RoomSaveRequest) {
  const room: RoomVO = {
    id: ++roomIdSeed,
    roomName: data.roomName.trim(),
    location: data.location?.trim() ?? '',
    capacity: data.capacity,
    status: data.status,
    remark: data.remark?.trim() ?? '',
  }
  mockRooms.unshift(room)
  return respond(room)
}

export async function updateRoom(id: number, data: RoomSaveRequest) {
  const target = mockRooms.find(item => item.id === id)
  if (!target) {
    throw new Error('未找到咨询室')
  }

  Object.assign(target, {
    roomName: data.roomName.trim(),
    location: data.location?.trim() ?? '',
    capacity: data.capacity,
    status: data.status,
    remark: data.remark?.trim() ?? '',
  })

  mockDutySchedules.forEach((item) => {
    if (item.roomId === id) {
      item.roomName = target.roomName
    }
  })

  return respond(target)
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
  const keyword = normalizeKeyword(query.keyword)
  const records = mockTimeSlots
    .filter((item) => {
      const matchKeyword = !keyword || [item.slotName, item.startTime, item.endTime]
        .some(value => value.toLowerCase().includes(keyword))
      const matchStatus = query.status == null || item.status === query.status
      return matchKeyword && matchStatus
    })
    .sort((a, b) => b.id - a.id)

  return respond(paginate(records, query.pageNum, query.pageSize))
}

export async function createTimeSlot(data: TimeSlotSaveRequest) {
  const slot: TimeSlotVO = {
    id: ++slotIdSeed,
    slotName: data.slotName.trim(),
    startTime: data.startTime,
    endTime: data.endTime,
    intervalMinutes: data.intervalMinutes ?? 10,
    status: data.status,
  }
  mockTimeSlots.unshift(slot)
  return respond(slot)
}

export async function updateTimeSlot(id: number, data: TimeSlotSaveRequest) {
  const target = mockTimeSlots.find(item => item.id === id)
  if (!target) {
    throw new Error('未找到时间段')
  }

  Object.assign(target, {
    slotName: data.slotName.trim(),
    startTime: data.startTime,
    endTime: data.endTime,
    intervalMinutes: data.intervalMinutes ?? 10,
    status: data.status,
  })

  mockDutySchedules.forEach((item) => {
    if (item.slotId === id) {
      item.slotName = target.slotName
      item.startTime = target.startTime
      item.endTime = target.endTime
    }
  })

  return respond(target)
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
