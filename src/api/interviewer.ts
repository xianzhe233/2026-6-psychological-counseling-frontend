import { http } from './http'
import type { ApiResult } from '@/types/auth'
import type { OptionItem, PageResult } from './admin'

export interface InterviewResultRequest {
  crisisLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  problemTypeId: number
  interviewTime: string
  conclusion: 'NO_NEED' | 'ARRANGE_CONSULTATION' | 'TRANSFER'
  summary?: string
  nextAction?: string
}

export interface RealInterviewTaskVO {
  appointmentId: number
  appointmentNo: string
  studentName: string
  studentNo: string
  appointmentDate: string
  slotName: string
  startTime: string
  endTime: string
  roomName?: string
  riskLevel: string
  appointmentStatus: string
}

export interface RealInterviewTaskDetailVO {
  appointmentId: number
  appointmentNo: string
  studentId: number
  studentName: string
  studentNo: string
  college?: string
  phone?: string
  formId?: number
  mainProblem?: string
  problemDescription?: string
  expectedHelp?: string
  moodScore?: number
  sleepScore?: number
  stressScore?: number
  selfHarmFlag?: number
  emergencyFlag?: number
  riskLevel?: string
  riskScore?: number
  appointmentDate: string
  slotId?: number
  slotName: string
  startTime: string
  endTime: string
  roomId?: number
  roomName?: string
  interviewerId?: number
  interviewerName?: string
  priorityFlag?: number
  appointmentStatus: string
  createTime: string
  latestResult?: {
    crisisLevel: string
    problemTypeId: number
    problemTypeLabel: string
    interviewTime: string
    conclusion: string
    summary?: string
    nextAction?: string
    submitTime: string
  }
}

export function pageInterviewTasksReal(params: {
  pageNum: number
  pageSize: number
  startDate?: string
  endDate?: string
  status?: string
  riskLevel?: string
}) {
  return http.get<ApiResult<PageResult<RealInterviewTaskVO>>>('/interviewer/tasks', { params })
}

export function getInterviewTaskDetailReal(appointmentId: number) {
  return http.get<ApiResult<RealInterviewTaskDetailVO>>(`/interviewer/tasks/${appointmentId}`)
}

export function submitInterviewResultReal(appointmentId: number, data: InterviewResultRequest) {
  return http.post<ApiResult<void>>(`/interviewer/tasks/${appointmentId}/result`, data)
}

export function getProblemTypeOptionsReal() {
  return http.get<ApiResult<OptionItem[]>>('/common/problem-types/options')
}
