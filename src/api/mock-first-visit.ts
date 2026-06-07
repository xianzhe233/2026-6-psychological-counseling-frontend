import dayjs from 'dayjs'

import type { DutyScheduleVO, OptionItem } from './admin'

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type AppointmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED' | 'COMPLETED'
export type InterviewConclusion = 'NO_NEED' | 'ARRANGE_CONSULTATION' | 'TRANSFER'

export interface MockAppointmentRecord {
  id: number
  appointmentNo: string
  studentId: number
  studentNo: string
  studentName: string
  college: string
  phone: string
  mainProblem: string
  problemDescription?: string
  expectedHelp?: string
  moodScore: number
  sleepScore: number
  stressScore: number
  selfHarmFlag: number
  emergencyFlag: number
  riskScore: number
  riskLevel: RiskLevel
  requestedDate: string
  requestedSlotId: number
  requestedSlotName: string
  appointmentDate: string
  slotId: number
  slotName: string
  startTime: string
  endTime: string
  interviewerId?: number
  interviewerName?: string
  roomId?: number
  roomName?: string
  dutyScheduleId?: number
  appointmentStatus: AppointmentStatus
  priorityFlag: number
  auditRemark?: string
  rejectReason?: string
  auditTime?: string
  auditorName?: string
  createTime: string
  latestResult?: {
    crisisLevel: RiskLevel
    problemTypeId: number
    problemTypeLabel: string
    interviewTime: string
    conclusion: InterviewConclusion
    summary?: string
    nextAction?: string
    submitTime: string
  }
}

const problemTypeOptions: OptionItem[] = [
  { label: '学业压力', value: 1 },
  { label: '人际关系', value: 2 },
  { label: '情绪困扰', value: 3 },
  { label: '恋爱与情感', value: 4 },
  { label: '家庭问题', value: 5 },
  { label: '生涯规划', value: 6 },
  { label: '其他', value: 7 },
]

const mockAppointments: MockAppointmentRecord[] = [
  {
    id: 9001,
    appointmentNo: 'FV20260607001',
    studentId: 7001,
    studentNo: '2023001001',
    studentName: '李晓彤',
    college: '信息与计算机学院',
    phone: '13900000011',
    mainProblem: '近期学业压力大，情绪波动明显',
    problemDescription: '连续两周失眠，临近期末感到明显焦虑，担心挂科。',
    expectedHelp: '希望有人帮助梳理压力来源，并给出缓解建议。',
    moodScore: 8,
    sleepScore: 7,
    stressScore: 9,
    selfHarmFlag: 0,
    emergencyFlag: 0,
    riskScore: 72,
    riskLevel: 'HIGH',
    requestedDate: '2026-06-09',
    requestedSlotId: 4001,
    requestedSlotName: '上午第一时段',
    appointmentDate: '2026-06-09',
    slotId: 4001,
    slotName: '上午第一时段',
    startTime: '08:30',
    endTime: '10:00',
    appointmentStatus: 'PENDING',
    priorityFlag: 0,
    createTime: '2026-06-07 09:15',
  },
  {
    id: 9002,
    appointmentNo: 'FV20260607002',
    studentId: 7002,
    studentNo: '2023001002',
    studentName: '王子昂',
    college: '机械工程学院',
    phone: '13900000012',
    mainProblem: '宿舍关系紧张，影响学习状态',
    problemDescription: '与室友频繁冲突，想搬宿舍但不知如何沟通。',
    expectedHelp: '希望得到人际沟通方面的建议。',
    moodScore: 6,
    sleepScore: 5,
    stressScore: 6,
    selfHarmFlag: 0,
    emergencyFlag: 0,
    riskScore: 48,
    riskLevel: 'MEDIUM',
    requestedDate: '2026-06-10',
    requestedSlotId: 4002,
    requestedSlotName: '上午第二时段',
    appointmentDate: '2026-06-10',
    slotId: 4002,
    slotName: '上午第二时段',
    startTime: '10:10',
    endTime: '11:40',
    appointmentStatus: 'PENDING',
    priorityFlag: 1,
    createTime: '2026-06-07 10:02',
  },
  {
    id: 9003,
    appointmentNo: 'FV20260607003',
    studentId: 7003,
    studentNo: '2023001003',
    studentName: '赵欣怡',
    college: '经济管理学院',
    phone: '13900000013',
    mainProblem: '情绪低落，对未来感到迷茫',
    problemDescription: '近期对专业选择产生怀疑，做事提不起精神。',
    expectedHelp: '希望有人帮助分析当前状态并给出方向建议。',
    moodScore: 7,
    sleepScore: 6,
    stressScore: 7,
    selfHarmFlag: 0,
    emergencyFlag: 0,
    riskScore: 61,
    riskLevel: 'HIGH',
    requestedDate: '2026-06-11',
    requestedSlotId: 4003,
    requestedSlotName: '下午第一时段',
    appointmentDate: '2026-06-11',
    slotId: 4003,
    slotName: '下午第一时段',
    startTime: '14:30',
    endTime: '16:00',
    interviewerId: 2005,
    interviewerName: '赵老师',
    roomId: 3001,
    roomName: '咨询室101',
    dutyScheduleId: 5003,
    appointmentStatus: 'COMPLETED',
    priorityFlag: 0,
    auditRemark: '已安排常规初访，请按时参加。',
    auditTime: '2026-06-07 11:10',
    auditorName: '中心管理员',
    createTime: '2026-06-07 10:30',
    latestResult: {
      crisisLevel: 'HIGH',
      problemTypeId: 3,
      problemTypeLabel: '情绪困扰',
      interviewTime: '2026-06-11 14:30',
      conclusion: 'ARRANGE_CONSULTATION',
      summary: '学生持续情绪低落，对专业和未来方向存在明显困惑，需要进入正式咨询持续支持。',
      nextAction: '建议安排情绪支持方向咨询师，优先在一周内完成首次正式咨询。',
      submitTime: '2026-06-11 16:10',
    },
  },
  {
    id: 9004,
    appointmentNo: 'FV20260607004',
    studentId: 7004,
    studentNo: '2023001004',
    studentName: '孙浩然',
    college: '材料科学与工程学院',
    phone: '13900000014',
    mainProblem: '想法消极，需要尽快沟通',
    problemDescription: '连续多日情绪失控，伴随明显无助感，希望尽快获得支持。',
    expectedHelp: '希望尽快见到老师。',
    moodScore: 9,
    sleepScore: 8,
    stressScore: 9,
    selfHarmFlag: 1,
    emergencyFlag: 1,
    riskScore: 92,
    riskLevel: 'URGENT',
    requestedDate: '2026-06-09',
    requestedSlotId: 4001,
    requestedSlotName: '上午第一时段',
    appointmentDate: '2026-06-09',
    slotId: 4001,
    slotName: '上午第一时段',
    startTime: '08:30',
    endTime: '10:00',
    appointmentStatus: 'PENDING',
    priorityFlag: 1,
    createTime: '2026-06-07 11:28',
  },
  {
    id: 9005,
    appointmentNo: 'FV20260607005',
    studentId: 7005,
    studentNo: '2023001005',
    studentName: '周雨桐',
    college: '外国语学院',
    phone: '13900000015',
    mainProblem: '与家人沟通受挫，情绪波动',
    problemDescription: '近期与父母关系紧张，感到烦躁和委屈。',
    expectedHelp: '想学习更好的表达和沟通方式。',
    moodScore: 5,
    sleepScore: 4,
    stressScore: 5,
    selfHarmFlag: 0,
    emergencyFlag: 0,
    riskScore: 36,
    riskLevel: 'LOW',
    requestedDate: '2026-06-13',
    requestedSlotId: 4001,
    requestedSlotName: '上午第一时段',
    appointmentDate: '2026-06-13',
    slotId: 4001,
    slotName: '上午第一时段',
    startTime: '08:30',
    endTime: '10:00',
    interviewerId: 2002,
    interviewerName: '初访员张老师',
    roomId: 3002,
    roomName: '咨询室102',
    dutyScheduleId: 5006,
    appointmentStatus: 'COMPLETED',
    priorityFlag: 0,
    auditRemark: '请提前 10 分钟到场。',
    auditTime: '2026-06-07 12:05',
    auditorName: '中心管理员',
    createTime: '2026-06-07 11:40',
    latestResult: {
      crisisLevel: 'MEDIUM',
      problemTypeId: 5,
      problemTypeLabel: '家庭问题',
      interviewTime: '2026-06-13 08:30',
      conclusion: 'ARRANGE_CONSULTATION',
      summary: '家庭沟通压力对近期情绪影响较明显，学生有继续咨询意愿。',
      nextAction: '建议安排家庭沟通与情绪调节方向正式咨询。',
      submitTime: '2026-06-13 10:05',
    },
  },
  {
    id: 9006,
    appointmentNo: 'FV20260607006',
    studentId: 7006,
    studentNo: '2023001006',
    studentName: '高嘉禾',
    college: '土木工程学院',
    phone: '13900000016',
    mainProblem: '考试失利后持续自责',
    problemDescription: '近期状态恢复中，但想先暂停预约。',
    expectedHelp: '如有需要再联系老师。',
    moodScore: 4,
    sleepScore: 4,
    stressScore: 5,
    selfHarmFlag: 0,
    emergencyFlag: 0,
    riskScore: 28,
    riskLevel: 'LOW',
    requestedDate: '2026-06-10',
    requestedSlotId: 4002,
    requestedSlotName: '上午第二时段',
    appointmentDate: '2026-06-10',
    slotId: 4002,
    slotName: '上午第二时段',
    startTime: '10:10',
    endTime: '11:40',
    appointmentStatus: 'REJECTED',
    priorityFlag: 0,
    rejectReason: '学生主动撤回并表示暂不需要安排。',
    auditRemark: '可后续自行重新预约。',
    auditTime: '2026-06-07 13:20',
    auditorName: '中心管理员',
    createTime: '2026-06-07 12:30',
  },
]

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function sleep(ms = 180) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export async function respondMock<T>(value: T) {
  await sleep()
  return clone(value)
}

export function getProblemTypeOptions() {
  return clone(problemTypeOptions)
}

export function getMockAppointments() {
  return mockAppointments
}

export function getMockAppointmentById(id: number) {
  return mockAppointments.find(item => item.id === id)
}

export function updateMockAppointment(id: number, patch: Partial<MockAppointmentRecord>) {
  const target = getMockAppointmentById(id)
  if (!target) {
    throw new Error('未找到预约记录')
  }
  Object.assign(target, patch)
  return target
}

export function pickDutyScheduleOptions(schedules: DutyScheduleVO[], staffId?: number) {
  return schedules
    .filter(item => item.status === 1)
    .filter(item => item.staffType === 'INTERVIEWER')
    .filter(item => !staffId || item.staffId === staffId)
    .sort((a, b) => `${a.dutyDate}${a.startTime}`.localeCompare(`${b.dutyDate}${b.startTime}`))
}

export function applyDutyScheduleToAppointment(
  appointmentId: number,
  schedule: DutyScheduleVO,
  auditRemark?: string,
  nextStatus: AppointmentStatus = 'APPROVED',
) {
  const target = getMockAppointmentById(appointmentId)
  if (!target) {
    throw new Error('未找到预约记录')
  }

  updateMockAppointment(appointmentId, {
    dutyScheduleId: schedule.id,
    interviewerId: schedule.staffId,
    interviewerName: schedule.staffName,
    appointmentDate: schedule.dutyDate,
    slotId: schedule.slotId,
    slotName: schedule.slotName,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    roomId: schedule.roomId ?? undefined,
    roomName: schedule.roomName,
    appointmentStatus: nextStatus,
    auditRemark: auditRemark?.trim() || '',
    auditTime: dayjs().format('YYYY-MM-DD HH:mm'),
    auditorName: '中心管理员',
  })
}
