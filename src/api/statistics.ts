import { getProblemTypeOptions, respondMock } from './mock-first-visit'

export interface StatisticsQuery {
  startDate?: string
  endDate?: string
  counselorId?: number
  problemTypeId?: number
}

export interface OverviewStatsVO {
  firstVisitAppointmentCount: number
  pendingAppointmentCount: number
  highRiskStudentCount: number
  waitingQueueCount: number
  consultationScheduleCount: number
  closedCaseCount: number
}

export interface PieItem {
  name: string
  value: number
}

export interface LineChartVO {
  xAxis: string[]
  series: { name: string; data: number[] }[]
}

export interface BarChartVO {
  xAxis: string[]
  series: { name: string; data: number[] }[]
}

const overviewBase: OverviewStatsVO = {
  firstVisitAppointmentCount: 128,
  pendingAppointmentCount: 12,
  highRiskStudentCount: 18,
  waitingQueueCount: 9,
  consultationScheduleCount: 46,
  closedCaseCount: 21,
}

const monthlyTrendBase: LineChartVO = {
  xAxis: ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'],
  series: [
    { name: '初访预约', data: [18, 22, 25, 20, 28, 15] },
    { name: '正式咨询', data: [10, 14, 16, 18, 20, 12] },
  ],
}

const problemTypeBase: PieItem[] = [
  { name: '学业压力', value: 32 },
  { name: '情绪困扰', value: 28 },
  { name: '人际关系', value: 18 },
  { name: '家庭问题', value: 12 },
  { name: '恋爱与情感', value: 8 },
  { name: '其他', value: 6 },
]

const crisisLevelBase: BarChartVO = {
  xAxis: ['低风险', '中风险', '高风险', '紧急风险'],
  series: [{ name: '学生人数', data: [56, 38, 22, 8] }],
}

const counselorWorkloadBase: BarChartVO = {
  xAxis: ['咨询师李老师', '咨询师王老师', '咨询师赵老师', '咨询师陈老师'],
  series: [
    { name: '咨询次数', data: [18, 14, 11, 9] },
    { name: '结案数', data: [8, 6, 5, 2] },
  ],
}

function applyFilterFactor(query: StatisticsQuery) {
  let factor = 1
  if (query.counselorId) factor *= 0.72
  if (query.problemTypeId) factor *= 0.65
  if (query.startDate || query.endDate) factor *= 0.88
  return factor
}

function scaleNumber(value: number, factor: number) {
  return Math.max(Math.round(value * factor), 0)
}

export async function getOverview(query: StatisticsQuery = {}) {
  const factor = applyFilterFactor(query)
  const data: OverviewStatsVO = {
    firstVisitAppointmentCount: scaleNumber(overviewBase.firstVisitAppointmentCount, factor),
    pendingAppointmentCount: scaleNumber(overviewBase.pendingAppointmentCount, factor),
    highRiskStudentCount: scaleNumber(overviewBase.highRiskStudentCount, factor),
    waitingQueueCount: scaleNumber(overviewBase.waitingQueueCount, factor),
    consultationScheduleCount: scaleNumber(overviewBase.consultationScheduleCount, factor),
    closedCaseCount: scaleNumber(overviewBase.closedCaseCount, factor),
  }
  return respondMock(data)
}

export async function getMonthlyTrend(query: StatisticsQuery = {}) {
  const factor = applyFilterFactor(query)
  const data: LineChartVO = {
    xAxis: monthlyTrendBase.xAxis,
    series: monthlyTrendBase.series.map(item => ({
      name: item.name,
      data: item.data.map(value => scaleNumber(value, factor)),
    })),
  }
  return respondMock(data)
}

export async function getProblemTypeDistribution(query: StatisticsQuery = {}) {
  const factor = applyFilterFactor(query)
  let items = problemTypeBase.map(item => ({
    name: item.name,
    value: scaleNumber(item.value, factor),
  }))

  if (query.problemTypeId) {
    const target = getProblemTypeOptions().find(item => item.value === query.problemTypeId)
    if (target) {
      items = items.filter(item => item.name === target.label)
    }
  }

  return respondMock(items)
}

export async function getCrisisLevelDistribution(query: StatisticsQuery = {}) {
  const factor = applyFilterFactor(query)
  const data: BarChartVO = {
    xAxis: crisisLevelBase.xAxis,
    series: crisisLevelBase.series.map(item => ({
      name: item.name,
      data: item.data.map(value => scaleNumber(value, factor)),
    })),
  }
  return respondMock(data)
}

export async function getCounselorWorkload(query: StatisticsQuery = {}) {
  const factor = applyFilterFactor(query)
  let xAxis = counselorWorkloadBase.xAxis
  let series = counselorWorkloadBase.series.map(item => ({
    name: item.name,
    data: item.data.map(value => scaleNumber(value, factor)),
  }))

  if (query.counselorId) {
    const index = (query.counselorId % counselorWorkloadBase.xAxis.length)
    xAxis = [counselorWorkloadBase.xAxis[index]]
    series = series.map(item => ({
      name: item.name,
      data: [item.data[index]],
    }))
  }

  return respondMock({ xAxis, series })
}

export async function exportStatisticsExcel(_query: StatisticsQuery = {}) {
  const blob = new Blob(['统计报表导出功能将在后端联调后启用'], { type: 'text/plain;charset=utf-8' })
  return respondMock(blob)
}
