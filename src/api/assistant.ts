import dayjs from 'dayjs'

import type { OptionItem, PageResult } from './admin'
import {
  getRoomOptions,
  getStaffOptions,
  getTimeSlotOptions,
} from './admin'
import {
  getMockAppointmentById,
  getMockAppointments,
  respondMock,
} from './mock-first-visit'

export type QueueStatus = 'WAITING' | 'ARRANGED' | 'DEFERRED'
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
  queueId: number
  appointmentId: number
  studentId: number
  studentName: string
  studentNo: string
  college?: string
  phone?: string
  problemTypeId: number
  problemTypeLabel: string
  crisisLevel: RiskLevel
  priorityScore: number
  enqueueTime: string
  status: QueueStatus
  initialSummary?: string
  nextAction?: string
}

export interface ConsultationArrangeDetailVO extends ConsultationQueueVO {
  appointmentNo: string
  mainProblem: string
  problemDescription?: string
  expectedHelp?: string
  interviewTime: string
  interviewerName?: string
  initialRiskScore: number
  moodScore: number
  sleepScore: number
  stressScore: number
  selfHarmFlag: number
  emergencyFlag: number
  arrangedInfo?: FormalConsultationArrangeVO
}

export interface FormalConsultationArrangeVO {
  id: number
  queueId: number
  appointmentId: number
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

export interface FormalConsultationArrangeRequest {
  counselorId: number
  consultationDate: string
  slotId: number
  roomId: number
  remark?: string
}

interface QueueState {
  appointmentId: number
  status: QueueStatus
  deferReason?: string
}

let arrangementIdSeed = 8000

const queueStates: QueueState[] = []
const arrangements: FormalConsultationArrangeVO[] = []

function normalizeKeyword(value?: string) {
  return value?.trim().toLowerCase() ?? ''
}

function paginate<T>(list: T[], pageNum: number, pageSize: number): PageResult<T> {
  const total = list.length
  const safePageSize = Math.max(pageSize, 1)
  const safePageNum = Math.max(pageNum, 1)
  const start = (safePageNum - 1) * safePageSize
  return {
    records: list.slice(start, start + safePageSize),
    total,
    pageNum: safePageNum,
    pageSize: safePageSize,
    pages: Math.max(Math.ceil(total / safePageSize), 1),
  }
}

function getQueueState(appointmentId: number): QueueState {
  let state = queueStates.find(item => item.appointmentId === appointmentId)
  if (!state) {
    state = { appointmentId, status: 'WAITING' }
    queueStates.push(state)
  }
  return state
}

function getArrangementByAppointmentId(appointmentId: number) {
  return arrangements.find(item => item.appointmentId === appointmentId)
}

function buildQueueRecord(appointmentId: number): ConsultationQueueVO | null {
  const appointment = getMockAppointmentById(appointmentId)
  if (!appointment?.latestResult || appointment.latestResult.conclusion !== 'ARRANGE_CONSULTATION') {
    return null
  }

  const state = getQueueState(appointment.id)
  const arranged = getArrangementByAppointmentId(appointment.id)
  const priorityScore = appointment.latestResult.crisisLevel === 'URGENT'
    ? appointment.riskScore + 30
    : appointment.latestResult.crisisLevel === 'HIGH'
      ? appointment.riskScore + 15
      : appointment.riskScore + (appointment.priorityFlag === 1 ? 8 : 0)

  return {
    queueId: appointment.id,
    appointmentId: appointment.id,
    studentId: appointment.studentId,
    studentName: appointment.studentName,
    studentNo: appointment.studentNo,
    college: appointment.college,
    phone: appointment.phone,
    problemTypeId: appointment.latestResult.problemTypeId,
    problemTypeLabel: appointment.latestResult.problemTypeLabel,
    crisisLevel: appointment.latestResult.crisisLevel,
    priorityScore,
    enqueueTime: appointment.latestResult.submitTime,
    status: arranged ? 'ARRANGED' : state.status,
    initialSummary: appointment.latestResult.summary,
    nextAction: appointment.latestResult.nextAction,
  }
}

function getQueueRecordOrThrow(queueId: number) {
  const record = buildQueueRecord(queueId)
  if (!record) {
    throw new Error('未找到咨询队列记录')
  }
  return record
}

function getOptionLabel(options: OptionItem[], value: number) {
  return options.find(item => item.value === value)?.label
}

function listQueueRecords() {
  return getMockAppointments()
    .map(item => buildQueueRecord(item.id))
    .filter((item): item is ConsultationQueueVO => Boolean(item))
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'WAITING' ? -1 : 1
      if (a.priorityScore !== b.priorityScore) return b.priorityScore - a.priorityScore
      return a.enqueueTime.localeCompare(b.enqueueTime)
    })
}

function parseSlotLabel(label: string) {
  const match = label.match(/^(.*?)（(.+?)-(.+?)）$/)
  return {
    slotName: match?.[1] ?? label,
    startTime: match?.[2] ?? '',
    endTime: match?.[3] ?? '',
  }
}

export async function pageConsultationQueue(query: ConsultationQueueQuery) {
  const keyword = normalizeKeyword(query.keyword)
  const records = listQueueRecords()
    .filter((item) => {
      const matchKeyword = !keyword || [
        item.studentName,
        item.studentNo,
        item.college,
        item.problemTypeLabel,
        item.initialSummary,
      ].some(value => value?.toLowerCase().includes(keyword))
      const matchCrisis = !query.crisisLevel || item.crisisLevel === query.crisisLevel
      const matchProblem = query.problemTypeId == null || item.problemTypeId === query.problemTypeId
      const matchStatus = !query.status || item.status === query.status
      return matchKeyword && matchCrisis && matchProblem && matchStatus
    })

  return respondMock(paginate(records, query.pageNum, query.pageSize))
}

export async function getConsultationArrangeDetail(queueId: number) {
  const record = getQueueRecordOrThrow(queueId)
  const appointment = getMockAppointmentById(record.appointmentId)
  if (!appointment?.latestResult) {
    throw new Error('未找到初访摘要')
  }

  const detail: ConsultationArrangeDetailVO = {
    ...record,
    appointmentNo: appointment.appointmentNo,
    mainProblem: appointment.mainProblem,
    problemDescription: appointment.problemDescription,
    expectedHelp: appointment.expectedHelp,
    interviewTime: appointment.latestResult.interviewTime,
    interviewerName: appointment.interviewerName,
    initialRiskScore: appointment.riskScore,
    moodScore: appointment.moodScore,
    sleepScore: appointment.sleepScore,
    stressScore: appointment.stressScore,
    selfHarmFlag: appointment.selfHarmFlag,
    emergencyFlag: appointment.emergencyFlag,
    arrangedInfo: getArrangementByAppointmentId(appointment.id),
  }

  return respondMock(detail)
}

export async function deferConsultationQueue(queueId: number) {
  getQueueRecordOrThrow(queueId)
  const state = getQueueState(queueId)
  state.status = 'DEFERRED'
  state.deferReason = '心理助理暂缓安排'
  return respondMock({ success: true })
}

export async function getConsultationProblemTypeOptions() {
  const options = getMockAppointments()
    .flatMap(item => item.latestResult && item.latestResult.conclusion === 'ARRANGE_CONSULTATION' ? [item.latestResult] : [])
    .reduce<OptionItem[]>((acc, item) => {
      if (!acc.some(option => option.value === item.problemTypeId)) {
        acc.push({ label: item.problemTypeLabel, value: item.problemTypeId })
      }
      return acc
    }, [])

  return respondMock(options)
}

export async function getConsultationQueueOptions() {
  const options = listQueueRecords().map<OptionItem>(item => ({
    label: `${item.studentName}（${item.studentNo}）- ${item.problemTypeLabel}`,
    value: item.queueId,
  }))

  return respondMock(options)
}

export async function getConsultationCounselorOptions() {
  return getStaffOptions('COUNSELOR')
}

export async function getConsultationRoomOptions() {
  return getRoomOptions()
}

export async function getConsultationTimeSlotOptions() {
  return getTimeSlotOptions()
}

export async function arrangeFormalConsultation(queueId: number, data: FormalConsultationArrangeRequest) {
  const record = getQueueRecordOrThrow(queueId)
  const [counselors, rooms, slots] = await Promise.all([
    getStaffOptions('COUNSELOR'),
    getRoomOptions(),
    getTimeSlotOptions(),
  ])
  const counselorName = getOptionLabel(counselors, data.counselorId)
  const roomName = getOptionLabel(rooms, data.roomId)
  const slotLabel = getOptionLabel(slots, data.slotId)

  if (!counselorName) {
    throw new Error('请选择有效的咨询师')
  }
  if (!roomName) {
    throw new Error('请选择有效的咨询室')
  }
  if (!slotLabel) {
    throw new Error('请选择有效的时间段')
  }
  if (!data.consultationDate) {
    throw new Error('请选择咨询日期')
  }

  const conflict = arrangements.find(item => (
    item.appointmentId !== record.appointmentId
    && item.consultationDate === data.consultationDate
    && item.slotId === data.slotId
    && (item.counselorId === data.counselorId || item.roomId === data.roomId)
  ))

  if (conflict) {
    if (conflict.counselorId === data.counselorId) {
      throw new Error(`冲突原因：${counselorName} 在 ${data.consultationDate} ${conflict.slotName} 已有正式咨询`)
    }
    throw new Error(`冲突原因：${roomName} 在 ${data.consultationDate} ${conflict.slotName} 已被占用`)
  }

  const existingIndex = arrangements.findIndex(item => item.appointmentId === record.appointmentId)
  const slot = parseSlotLabel(slotLabel)
  const arrangement: FormalConsultationArrangeVO = {
    id: existingIndex >= 0 ? arrangements[existingIndex].id : ++arrangementIdSeed,
    queueId,
    appointmentId: record.appointmentId,
    studentName: record.studentName,
    studentNo: record.studentNo,
    counselorId: data.counselorId,
    counselorName,
    consultationDate: data.consultationDate,
    slotId: data.slotId,
    slotName: slot.slotName,
    startTime: slot.startTime,
    endTime: slot.endTime,
    roomId: data.roomId,
    roomName,
    remark: data.remark?.trim() || '',
    createTime: existingIndex >= 0 ? arrangements[existingIndex].createTime : dayjs().format('YYYY-MM-DD HH:mm'),
  }

  if (existingIndex >= 0) {
    arrangements.splice(existingIndex, 1, arrangement)
  } else {
    arrangements.push(arrangement)
  }

  getQueueState(queueId).status = 'ARRANGED'
  return respondMock(arrangement)
}
