import type { Component } from 'vue'
import { CalendarOutline, ClipboardOutline, GridOutline, HomeOutline, PeopleOutline, PulseOutline } from '@vicons/ionicons5'
import type { RoleCode } from '@/types/auth'

export interface MenuItem {
  key: string
  label: string
  path: string
  icon: Component
}

export const roleMenus: Record<RoleCode, MenuItem[]> = {
  STUDENT: [
    { key: 'student-appointments', label: '我的预约', path: '/student/appointments', icon: CalendarOutline },
  ],
  ADMIN: [
    { key: 'admin-users', label: '用户管理', path: '/admin/users', icon: PeopleOutline },
    { key: 'admin-staff', label: '工作人员管理', path: '/admin/staff', icon: PeopleOutline },
    { key: 'admin-rooms', label: '咨询室管理', path: '/admin/rooms', icon: GridOutline },
    { key: 'admin-time-slots', label: '时间段配置', path: '/admin/time-slots', icon: CalendarOutline },
    { key: 'admin-duty-schedules', label: '值班管理', path: '/admin/duty-schedules', icon: GridOutline },
    { key: 'admin-audit', label: '预约审核', path: '/admin/appointments/audit', icon: ClipboardOutline },
  ],
  INTERVIEWER: [
    { key: 'interviewer-tasks', label: '初访任务', path: '/interviewer/tasks', icon: PeopleOutline },
  ],
  ASSISTANT: [
    { key: 'assistant-queue', label: '咨询队列', path: '/assistant/queue', icon: PulseOutline },
  ],
  COUNSELOR: [
    { key: 'counselor-schedules', label: '咨询日程', path: '/counselor/schedules', icon: GridOutline },
  ],
}

export const dashboardMenu: MenuItem = {
  key: 'dashboard',
  label: '工作台',
  path: '/dashboard',
  icon: HomeOutline,
}
