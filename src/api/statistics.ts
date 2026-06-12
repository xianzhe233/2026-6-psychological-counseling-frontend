import { http } from './http'

export interface StatisticsQuery {
  startDate?: string
  endDate?: string
}

export interface OverviewStatsVO {
  totalConsultations: number
  totalStudents: number
  completedReports: number
  activeCounselors: number
}

export interface PieItemVO {
  name: string
  value: number
}

export interface ChartSeriesVO {
  name: string
  data: number[]
}

export interface ChartVO {
  xAxis: string[]
  series: ChartSeriesVO[]
}

export interface CounselorWorkloadVO {
  counselorId: number
  counselorName: string
  consultationCount: number
  studentCount: number
  reportCount: number
}

export async function getOverview(query: StatisticsQuery): Promise<OverviewStatsVO> {
  const { data: result } = await http.get('/admin/statistics/overview', { params: query })
  return result.data
}

export async function getConsultationTrend(query: StatisticsQuery): Promise<ChartVO> {
  const { data: result } = await http.get('/admin/statistics/consultation-trend', { params: query })
  return result.data
}

export async function getCompletionTrend(query: StatisticsQuery): Promise<ChartVO> {
  const { data: result } = await http.get('/admin/statistics/completion-trend', { params: query })
  return result.data
}

export async function getNewStudentTrend(query: StatisticsQuery): Promise<ChartVO> {
  const { data: result } = await http.get('/admin/statistics/new-student-trend', { params: query })
  return result.data
}

export async function getConsultationDistribution(query: StatisticsQuery): Promise<PieItemVO[]> {
  const { data: result } = await http.get('/admin/statistics/consultation-distribution', { params: query })
  return result.data
}

export async function getProblemTypeDistribution(query: StatisticsQuery): Promise<PieItemVO[]> {
  const { data: result } = await http.get('/admin/statistics/problem-type-distribution', { params: query })
  return result.data
}

export async function getWorkloadChart(query: StatisticsQuery): Promise<ChartVO> {
  const { data: result } = await http.get('/admin/statistics/workload-chart', { params: query })
  return result.data
}

export async function getWorkloadTable(query: StatisticsQuery): Promise<CounselorWorkloadVO[]> {
  const { data: result } = await http.get('/admin/statistics/workload-table', { params: query })
  return result.data
}
