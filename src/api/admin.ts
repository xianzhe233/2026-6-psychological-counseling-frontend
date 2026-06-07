import { http } from './http'

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

export function pageUsers(query: UserQuery) {
  return http.get('/admin/users', { params: query })
}

export function createUser(data: UserSaveRequest) {
  return http.post('/admin/users', data)
}

export function updateUser(id: number, data: UserSaveRequest) {
  return http.put(`/admin/users/${id}`, data)
}

export function disableUser(id: number) {
  return http.post(`/admin/users/${id}/disable`)
}

export function enableUser(id: number) {
  return http.post(`/admin/users/${id}/enable`)
}

export function resetPassword(id: number) {
  return http.post(`/admin/users/${id}/reset-password`)
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
  staffNo: string
  realName: string
  phone: string
  staffType: string
  title: string
  specialty: string
  maxDailyAppointments: number
  status: number
}

export function pageStaff(query: StaffQuery) {
  return http.get('/admin/staff', { params: query })
}

export function createStaff(data: StaffSaveRequest) {
  return http.post('/admin/staff', data)
}

export function updateStaff(id: number, data: StaffSaveRequest) {
  return http.put(`/admin/staff/${id}`, data)
}

export function getStaffOptions(staffType: string) {
  return http.get('/admin/staff/options', { params: { staffType } })
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

export function pageRooms(query: RoomQuery) {
  return http.get('/admin/rooms', { params: query })
}

export function createRoom(data: RoomSaveRequest) {
  return http.post('/admin/rooms', data)
}

export function updateRoom(id: number, data: RoomSaveRequest) {
  return http.put(`/admin/rooms/${id}`, data)
}

export function getRoomOptions() {
  return http.get('/admin/rooms/options')
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

export function pageTimeSlots(query: TimeSlotQuery) {
  return http.get('/admin/time-slots', { params: query })
}

export function createTimeSlot(data: TimeSlotSaveRequest) {
  return http.post('/admin/time-slots', data)
}

export function updateTimeSlot(id: number, data: TimeSlotSaveRequest) {
  return http.put(`/admin/time-slots/${id}`, data)
}

export function getTimeSlotOptions() {
  return http.get('/admin/time-slots/options')
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
  roomId: number
  roomName: string
  capacity: number
  reservedCount: number
  remaining: number
  status: number
}

export function pageDutySchedules(query: DutyScheduleQuery) {
  return http.get('/admin/duty-schedules', { params: query })
}

export function createDutySchedule(data: DutyScheduleSaveRequest) {
  return http.post('/admin/duty-schedules', data)
}

export function updateDutySchedule(id: number, data: DutyScheduleSaveRequest) {
  return http.put(`/admin/duty-schedules/${id}`, data)
}

export function deleteDutySchedule(id: number) {
  return http.delete(`/admin/duty-schedules/${id}`)
}

export function batchCreateDutySchedules(data: {
  staffId: number
  staffType: string
  startDate: string
  endDate: string
  weekdays: number[]
  slotIds: number[]
  roomId?: number | null
  capacity: number
}) {
  return http.post('/admin/duty-schedules/batch', data)
}