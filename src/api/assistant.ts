import { http } from './http'
import type { OptionItem, PageResult } from './admin'
import { getRoomOptionsReal, getStaffOptionsReal, getTimeSlotOptionsReal } from './admin'

export type QueueStatus = 'WAITING' | 'ARRANGED' | 'SUSPENDED'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface ConsultationQueueQuery {
  pageNum: number
  pageSize: number
  keyword?: string
  crisisLevel?: RiskLevel | null
  problemTypeId?: number | null
  status?: QueueStatus | null
}

export interface ConsultationQueueVO {
  id: number
  studentId: number
  studentName: string
  studentNo: string
  college?: string
  phone?: string
  problemTypeId: number
  problemTypeName: string
  crisisLevel: RiskLevel
  priorityScore: number
  enqueueTime: string
  queueStatus: QueueStatus
  summary?: string
  nextAction?: string
}

export interface ConsultationQueueDetailVO {
  id: number
  studentId: number
  studentName: string
  studentNo: string
  college: string
  phone: string
  gender?: string
  problemTypeId: number
  problemTypeName: string
  crisisLevel: string
  priorityScore: number
  queueStatus: QueueStatus
  enqueueTime: string
  firstVisitResultId?: number
  appointmentId: number
  appointmentNo: string
  mainProblem: string
  problemDescription?: string
  expectedHelp?: string
  interviewTime: string
  interviewerName?: string
  summary?: string
  nextAction?: string
  riskScore: number
  riskLevel: string
  schedules: ConsultationScheduleVO[]
}

export interface ConsultationScheduleVO {
  id: number
  scheduleNo: string
  queueId: number
  studentId: number
  studentName: string
  studentNo: string
  counselorId: number
  counselorName: string
  assistantId?: number
  assistantName?: string
  consultationDate: string
  slotId: number
  slotName: string
  startTime: string
  endTime: string
  roomId: number
  roomName: string
  sessionNo: number
  scheduleStatus: string
  createTime: string
}

export interface FormalConsultationArrangeVO {
  id: number
  scheduleNo: string
  studentName: string
  studentNo: string
  counselorId: number
  counselorName: string
  consultationDate: string
  slotId: number
  slotName: string
  startTime: string
  endTime: string
  roomId: number
  roomName: string
  remark?: string
  createTime: string
}

export interface ArrangeConsultationRequest {
  queueId: number
  studentId: number
  counselorId: number
  consultationDate: string
  slotId: number
  roomId: number
  remark?: string
}

export interface AvailableSlotVO {
  dutyScheduleId: number
  counselorId: number
  counselorName: string
  dutyDate: string
  slotId: number
  slotName: string
  startTime: string
  endTime: string
  roomId: number
  roomName: string
  available: boolean
  disabledReason?: string
}

export async function pageConsultationQueue(query: ConsultationQueueQuery): Promise<PageResult<ConsultationQueueVO>> {
  const { data: result } = await http.get('/assistant/consultation/queue', { params: query })
  return result.data
}

export async function getConsultationArrangeDetail(queueId: number): Promise<ConsultationQueueDetailVO> {
  const { data: result } = await http.get(`/assistant/consultation/queue/${queueId}`)
  return result.data
}

export async function deferConsultationQueue(queueId: number): Promise<{ success: boolean }> {
  const { data: result } = await http.post(`/assistant/consultation/queue/${queueId}/suspend`)
  return result.data
}

export async function getConsultationProblemTypeOptions(): Promise<OptionItem[]> {
  const { data: result } = await http.get('/common/problem-types/options')
  return result.data
}

export async function getConsultationQueueOptions(): Promise<OptionItem[]> {
  const { data: result } = await http.get('/assistant/consultation/queue', { params: { pageNum: 1, pageSize: 999 } })
  const records: ConsultationQueueVO[] = result.data?.records ?? []
  return records.map(item => ({
    label: `${item.studentName}（${item.studentNo}）- ${item.problemTypeName}`,
    value: item.id,
  }))
}

export async function getConsultationCounselorOptions(): Promise<OptionItem[]> {
  return getStaffOptionsReal('COUNSELOR')
}

export async function getConsultationRoomOptions(): Promise<OptionItem[]> {
  return getRoomOptionsReal()
}

export async function getConsultationTimeSlotOptions(): Promise<OptionItem[]> {
  return getTimeSlotOptionsReal()
}

export async function getAvailableSlots(counselorId: number, startDate: string): Promise<AvailableSlotVO[]> {
  const { data: result } = await http.get('/assistant/counselors/available-slots', {
    params: { counselorId, startDate },
  })
  return result.data
}

export async function arrangeFormalConsultation(data: ArrangeConsultationRequest): Promise<FormalConsultationArrangeVO> {
  const { data: result } = await http.post('/assistant/consultation/schedules', data)
  return result.data
}
