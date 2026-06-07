import { http } from './http'

// 初访任务
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
}

export interface InterviewResultRequest {
  crisisLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  problemTypeId: number
  interviewTime: string
  conclusion: 'NO_NEED' | 'ARRANGE_CONSULTATION' | 'TRANSFER'
  summary?: string
  nextAction?: string
}

export function pageInterviewTasks(query: InterviewTaskQuery) {
  return http.get('/interviewer/tasks', { params: query })
}

export function getInterviewTaskDetail(id: number) {
  return http.get(`/interviewer/tasks/${id}`)
}

export function submitInterviewResult(id: number, data: InterviewResultRequest) {
  return http.post(`/interviewer/tasks/${id}/result`, data)
}
