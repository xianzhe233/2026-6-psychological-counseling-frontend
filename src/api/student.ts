import { http } from './http'
import type { ApiResult } from '@/types/auth'
import type {
  FirstVisitForm,
  FirstVisitFormRequest,
  ConsentStatus,
  ConsentSignRequest,
  AvailableSlot,
  AppointmentCreateRequest,
  Appointment,
  AppointmentCancelRequest,
  Notification,
} from '@/types/student'

export function getLatestFirstVisitForm() {
  return http.get<ApiResult<FirstVisitForm | null>>('/student/first-visit/forms/latest')
}

export function saveFirstVisitForm(data: FirstVisitFormRequest) {
  return http.post<ApiResult<FirstVisitForm>>('/student/first-visit/forms', data)
}

export function getConsentStatus(formId: number) {
  return http.get<ApiResult<ConsentStatus>>('/student/consents/status', { params: { formId } })
}

export function signConsent(data: ConsentSignRequest) {
  return http.post<ApiResult<null>>('/student/consents/sign', data)
}

export function getAvailableSlots(date: string, interviewerId?: number) {
  return http.get<ApiResult<AvailableSlot[]>>('/student/appointments/available-slots', {
    params: { date, interviewerId },
  })
}

export function createAppointment(data: AppointmentCreateRequest) {
  return http.post<ApiResult<{ id: number; appointmentNo: string; appointmentStatus: string }>>('/student/appointments', data)
}

export function getMyAppointments(params: {
  pageNum: number
  pageSize: number
  status?: string
  startDate?: string
  endDate?: string
}) {
  return http.get<ApiResult<{ records: Appointment[]; total: number }>>('/student/appointments', { params })
}

export function cancelAppointment(id: number, data: AppointmentCancelRequest) {
  return http.post<ApiResult<null>>(`/student/appointments/${id}/cancel`, data)
}

export function getMyNotifications(params: {
  pageNum: number
  pageSize: number
  notifyType?: string
}) {
  return http.get<ApiResult<{ records: Notification[]; total: number }>>('/student/notifications', { params })
}
