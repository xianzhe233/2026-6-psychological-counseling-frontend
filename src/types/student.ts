export interface FirstVisitForm {
  id: number
  studentId: number
  mainProblem: string
  problemDescription: string
  expectedHelp: string
  moodScore: number
  sleepScore: number
  stressScore: number
  selfHarmFlag: number
  emergencyFlag: number
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  formStatus: 'DRAFT' | 'SUBMITTED'
  submitTime: string | null
  createTime: string
  updateTime: string
}

export interface FirstVisitFormRequest {
  mainProblem: string
  problemDescription: string
  expectedHelp: string
  moodScore: number
  sleepScore: number
  stressScore: number
  selfHarmFlag: number
  emergencyFlag: number
}

export interface ConsentStatus {
  formId: number
  signed: boolean
  signTime: string | null
  consentVersion: string | null
}

export interface ConsentSignRequest {
  formId: number
  consentVersion: string
}

export interface AvailableSlot {
  dutyScheduleId: number
  interviewerId: number
  interviewerName: string
  appointmentDate: string
  slotId: number
  slotName: string
  startTime: string
  endTime: string
  roomId: number
  roomName: string
  capacity: number
  reservedCount: number
  remaining: number
  available: boolean
  disabledReason: string | null
}

export interface AppointmentCreateRequest {
  formId: number
  dutyScheduleId: number
  appointmentDate: string
  slotId: number
  interviewerId: number
  roomId: number
}

export interface Appointment {
  id: number
  appointmentNo: string
  appointmentDate: string
  slotName: string
  startTime: string
  endTime: string
  interviewerName: string
  roomName: string
  appointmentStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED' | 'COMPLETED'
  auditRemark: string | null
  rejectReason: string | null
  createTime: string
}

export interface AppointmentCancelRequest {
  reason: string
}

export interface Notification {
  id: number
  title: string
  content: string
  notifyType: string
  sendTime: string
  readStatus: number
}