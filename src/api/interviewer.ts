import dayjs from 'dayjs'

import { useAuthStore } from '@/stores/auth'
import { findMockStaffByIdentity, type OptionItem, type PageResult } from './admin'
import {
  getMockAppointments,
  getMockAppointmentById,
  getProblemTypeOptions,
  respondMock,
  updateMockAppointment,
} from './mock-first-visit'

export interface InterviewTaskQuery {
  pageNum: number
  pageSize: number
  startDate?: string
  endDate?: string
  status?: string
  riskLevel?: string
}

export interface InterviewTaskVO {
  appointmentId: number
  appointmentNo: string
  studentName: string
  studentNo: string
  appointmentDate: string
  slotName: string
  roomName?: string
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  appointmentStatus: string
}

export interface InterviewTaskDetailVO {
  appointmentId: number
  appointmentNo: string
  studentId: number
  studentNo: string
  studentName: string
  college?: string
  phone?: string
  mainProblem: string
  problemDescription?: string
  expectedHelp?: string
  moodScore: number
  sleepScore: number
  stressScore: number
  selfHarmFlag: number
  emergencyFlag: number
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  appointmentDate: string
  slotId: number
  slotName: string
  startTime: string
  endTime: string
  roomId?: number
  roomName?: string
  appointmentStatus: string
  priorityFlag: number
  createTime: string
  interviewerId?: number
  interviewerName?: string
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

export interface InterviewResultRequest {
  crisisLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  problemTypeId: number
  interviewTime: string
  conclusion: 'NO_NEED' | 'ARRANGE_CONSULTATION' | 'TRANSFER'
  summary?: string
  nextAction?: string
}

function getCurrentInterviewerStaffId() {
  const auth = useAuthStore()
  const currentUser = auth.user
  if (!currentUser) {
    throw new Error('当前未登录，无法加载初访任务')
  }

  const staff = findMockStaffByIdentity({
    userId: currentUser.id,
    username: currentUser.username,
    realName: currentUser.realName,
    staffType: 'INTERVIEWER',
  })
  if (!staff) {
    throw new Error('当前账号未绑定初访员身份')
  }

  return staff.id
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

export async function pageInterviewTasks(query: InterviewTaskQuery) {
  const interviewerStaffId = getCurrentInterviewerStaffId()

  const records = getMockAppointments()
    .filter((item) => item.interviewerId === interviewerStaffId)
    .filter((item) => !query.status || item.appointmentStatus === query.status)
    .filter((item) => !query.riskLevel || item.riskLevel === query.riskLevel)
    .filter((item) => !query.startDate || item.appointmentDate >= query.startDate)
    .filter((item) => !query.endDate || item.appointmentDate <= query.endDate)
    .sort((a, b) => `${a.appointmentDate}${a.startTime}`.localeCompare(`${b.appointmentDate}${b.startTime}`))
    .map<InterviewTaskVO>((item) => ({
      appointmentId: item.id,
      appointmentNo: item.appointmentNo,
      studentName: item.studentName,
      studentNo: item.studentNo,
      appointmentDate: item.appointmentDate,
      slotName: item.slotName,
      roomName: item.roomName,
      riskLevel: item.riskLevel,
      appointmentStatus: item.appointmentStatus,
    }))

  return respondMock(paginate(records, query.pageNum, query.pageSize))
}

export async function getInterviewTaskDetail(id: number) {
  const interviewerStaffId = getCurrentInterviewerStaffId()
  const item = getMockAppointmentById(id)
  if (!item) {
    throw new Error('未找到初访任务')
  }
  if (item.interviewerId !== interviewerStaffId) {
    throw new Error('无权查看其他初访员的任务')
  }

  const detail: InterviewTaskDetailVO = {
    appointmentId: item.id,
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
    roomId: item.roomId,
    roomName: item.roomName,
    appointmentStatus: item.appointmentStatus,
    priorityFlag: item.priorityFlag,
    createTime: item.createTime,
    interviewerId: item.interviewerId,
    interviewerName: item.interviewerName,
    latestResult: item.latestResult,
  }

  return respondMock(detail)
}

export async function submitInterviewResult(id: number, data: InterviewResultRequest) {
  const interviewerStaffId = getCurrentInterviewerStaffId()
  const item = getMockAppointmentById(id)
  if (!item) {
    throw new Error('未找到初访任务')
  }
  if (item.interviewerId !== interviewerStaffId) {
    throw new Error('无权提交其他初访员的任务结果')
  }
  if (item.appointmentStatus !== 'APPROVED') {
    throw new Error('只有已通过的预约才能录入初访结果')
  }
  if (!data.nextAction?.trim() && data.conclusion === 'TRANSFER') {
    throw new Error('转介送诊时必须填写后续建议')
  }

  const problemType = getProblemTypeOptions().find(option => option.value === data.problemTypeId)
  if (!problemType) {
    throw new Error('问题类型无效')
  }

  updateMockAppointment(id, {
    appointmentStatus: 'COMPLETED',
    latestResult: {
      crisisLevel: data.crisisLevel,
      problemTypeId: data.problemTypeId,
      problemTypeLabel: problemType.label,
      interviewTime: data.interviewTime,
      conclusion: data.conclusion,
      summary: data.summary?.trim() || '',
      nextAction: data.nextAction?.trim() || '',
      submitTime: dayjs().format('YYYY-MM-DD HH:mm'),
    },
  })

  return respondMock({ success: true })
}

export async function getProblemTypeOptionList() {
  return respondMock<OptionItem[]>(getProblemTypeOptions())
}
