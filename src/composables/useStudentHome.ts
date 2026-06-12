import type { Component } from 'vue'
import {
  CalendarOutline,
  ClipboardOutline,
  DocumentTextOutline,
  HomeOutline,
  NotificationsOutline,
} from '@vicons/ionicons5'

export interface StudentQuickLink {
  key: string
  label: string
  path: string
  icon: Component
}

export interface StudentFeaturePage {
  title: string
  desc: string
  tag: string
  tagType: 'warning' | 'info' | 'success' | 'default'
  path: string
}

export function useStudentHome() {
  const quickLinks: StudentQuickLink[] = [
    { key: 'first-visit', label: '首访登记', path: '/student/first-visit-form', icon: ClipboardOutline },
    { key: 'consent', label: '知情同意', path: '/student/consent', icon: DocumentTextOutline },
    { key: 'appointment', label: '初访预约', path: '/student/appointment-create', icon: CalendarOutline },
    { key: 'appointments', label: '我的预约', path: '/student/appointments', icon: HomeOutline },
    { key: 'notifications', label: '我的通知', path: '/student/notifications', icon: NotificationsOutline },
  ]

  const featurePages: StudentFeaturePage[] = [
    {
      title: '首访登记表',
      desc: '填写个人基本信息、来访原因和紧急联系人等，建立初始档案。',
      tag: '必填',
      tagType: 'warning',
      path: '/student/first-visit-form',
    },
    {
      title: '知情同意书',
      desc: '阅读并签署知情同意书，了解咨询保密原则和相关权利义务。',
      tag: '必填',
      tagType: 'warning',
      path: '/student/consent',
    },
    {
      title: '初访预约',
      desc: '选择合适的日期和时间段，提交初访预约申请，等待中心审核。',
      tag: '预约',
      tagType: 'info',
      path: '/student/appointment-create',
    },
    {
      title: '我的预约',
      desc: '查看预约审核状态、历史预约记录和咨询安排详情。',
      tag: '查询',
      tagType: 'success',
      path: '/student/appointments',
    },
    {
      title: '我的通知',
      desc: '接收预约审核结果、咨询提醒和其他系统通知消息。',
      tag: '通知',
      tagType: 'default',
      path: '/student/notifications',
    },
  ]

  const contactItems = [
    { label: '咨询电话', value: '010-12345678' },
    { label: '服务时间', value: '周一至周五 8:30-17:30' },
    { label: '咨询地点', value: '学生活动中心 3 层' },
    { label: '紧急情况', value: '24 小时心理热线 400-161-9995' },
  ]

  return {
    quickLinks,
    featurePages,
    contactItems,
  }
}
