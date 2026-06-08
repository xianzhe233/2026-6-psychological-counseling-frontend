<script setup lang="ts">
import * as echarts from 'echarts'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import {
  NButton,
  NCard,
  NEmpty,
  NGi,
  NGrid,
  NStatistic,
  useMessage,
} from 'naive-ui'

import PageHeader from '@/components/common/PageHeader.vue'
import { getStaffOptions } from '@/api/admin'
import type { OptionItem } from '@/api/admin'
import { getConsultationProblemTypeOptions } from '@/api/assistant'
import {
  getCounselorWorkload,
  getCrisisLevelDistribution,
  getMonthlyTrend,
  getOverview,
  getProblemTypeDistribution,
} from '@/api/statistics'
import type { BarChartVO, LineChartVO, OverviewStatsVO, PieItem, StatisticsQuery } from '@/api/statistics'

const message = useMessage()

const loading = ref(false)
const overview = ref<OverviewStatsVO | null>(null)
const monthlyTrend = ref<LineChartVO | null>(null)
const problemTypes = ref<PieItem[]>([])
const crisisLevels = ref<BarChartVO | null>(null)
const counselorWorkload = ref<BarChartVO | null>(null)

const counselorOptions = ref<OptionItem[]>([])
const problemTypeOptions = ref<OptionItem[]>([])

const searchForm = reactive({
  startDate: '',
  endDate: '',
  counselorId: null as number | null,
  problemTypeId: null as number | null,
})

const trendChartRef = ref<HTMLDivElement>()
const pieChartRef = ref<HTMLDivElement>()
const crisisChartRef = ref<HTMLDivElement>()
const workloadChartRef = ref<HTMLDivElement>()

let trendChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null
let crisisChart: echarts.ECharts | null = null
let workloadChart: echarts.ECharts | null = null

const overviewCards = computed(() => {
  const data = overview.value
  return [
    { label: '初访预约总数', value: data?.firstVisitAppointmentCount ?? 0 },
    { label: '待审核预约', value: data?.pendingAppointmentCount ?? 0 },
    { label: '高风险学生', value: data?.highRiskStudentCount ?? 0 },
    { label: '排队人数', value: data?.waitingQueueCount ?? 0 },
    { label: '已安排咨询', value: data?.consultationScheduleCount ?? 0 },
    { label: '结案数', value: data?.closedCaseCount ?? 0 },
  ]
})

function buildQuery(): StatisticsQuery {
  return {
    startDate: searchForm.startDate || undefined,
    endDate: searchForm.endDate || undefined,
    counselorId: searchForm.counselorId ?? undefined,
    problemTypeId: searchForm.problemTypeId ?? undefined,
  }
}

function disposeChart(instance: echarts.ECharts | null) {
  instance?.dispose()
}

function disposeAllCharts() {
  disposeChart(trendChart)
  disposeChart(pieChart)
  disposeChart(crisisChart)
  disposeChart(workloadChart)
  trendChart = null
  pieChart = null
  crisisChart = null
  workloadChart = null
}

function renderTrendChart() {
  if (!trendChartRef.value) return
  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }

  const data = monthlyTrend.value
  const hasData = !!data && data.series.some(item => item.data.some(value => value > 0))

  if (!hasData) {
    trendChart.clear()
    return
  }

  trendChart.setOption({
    color: ['#18A058', '#2080F0'],
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    grid: { left: 40, right: 24, top: 24, bottom: 48 },
    xAxis: { type: 'category', data: data!.xAxis },
    yAxis: { type: 'value', minInterval: 1 },
    series: data!.series.map(item => ({
      name: item.name,
      type: 'line',
      smooth: true,
      data: item.data,
    })),
  }, true)
}

function renderPieChart() {
  if (!pieChartRef.value) return
  if (!pieChart) {
    pieChart = echarts.init(pieChartRef.value)
  }

  const hasData = problemTypes.value.some(item => item.value > 0)
  if (!hasData) {
    pieChart.clear()
    return
  }

  pieChart.setOption({
    color: ['#18A058', '#2080F0', '#F0A020', '#D03050', '#8A2BE2', '#36CFC9'],
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, type: 'scroll' },
    series: [{
      name: '问题类型',
      type: 'pie',
      radius: ['38%', '68%'],
      center: ['50%', '45%'],
      data: problemTypes.value,
      label: { formatter: '{b}: {c}' },
    }],
  }, true)
}

function renderBarChart(
  instance: echarts.ECharts | null,
  container: HTMLDivElement | undefined,
  data: BarChartVO | null,
  title: string,
  setter: (chart: echarts.ECharts | null) => void,
) {
  if (!container) return
  let chart = instance
  if (!chart) {
    chart = echarts.init(container)
    setter(chart)
  }

  const hasData = !!data && data.series.some(item => item.data.some(value => value > 0))
  if (!hasData) {
    chart.clear()
    return
  }

  chart.setOption({
    color: ['#18A058', '#2080F0'],
    title: { text: title, left: 'center', textStyle: { fontSize: 14, fontWeight: 500 } },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    grid: { left: 40, right: 24, top: 40, bottom: 48 },
    xAxis: { type: 'category', data: data!.xAxis },
    yAxis: { type: 'value', minInterval: 1 },
    series: data!.series.map(item => ({
      name: item.name,
      type: 'bar',
      barMaxWidth: 36,
      data: item.data,
    })),
  }, true)
}

function renderAllCharts() {
  renderTrendChart()
  renderPieChart()
  renderBarChart(crisisChart, crisisChartRef.value, crisisLevels.value, '危机等级分布', chart => { crisisChart = chart })
  renderBarChart(workloadChart, workloadChartRef.value, counselorWorkload.value, '咨询师工作量', chart => { workloadChart = chart })
}

function handleResize() {
  trendChart?.resize()
  pieChart?.resize()
  crisisChart?.resize()
  workloadChart?.resize()
}

async function fetchData() {
  loading.value = true
  try {
    const query = buildQuery()
    const [overviewData, trendData, problemData, crisisData, workloadData] = await Promise.all([
      getOverview(query),
      getMonthlyTrend(query),
      getProblemTypeDistribution(query),
      getCrisisLevelDistribution(query),
      getCounselorWorkload(query),
    ])
    overview.value = overviewData
    monthlyTrend.value = trendData
    problemTypes.value = problemData
    crisisLevels.value = crisisData
    counselorWorkload.value = workloadData
    await nextTick()
    renderAllCharts()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载统计数据失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  void fetchData()
}

function handleReset() {
  searchForm.startDate = ''
  searchForm.endDate = ''
  searchForm.counselorId = null
  searchForm.problemTypeId = null
  handleSearch()
}

function handleCounselorChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  searchForm.counselorId = value ? Number(value) : null
  handleSearch()
}

function handleProblemTypeChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  searchForm.problemTypeId = value ? Number(value) : null
  handleSearch()
}

onMounted(async () => {
  try {
    const [counselors, problemTypes] = await Promise.all([
      getStaffOptions('COUNSELOR'),
      getConsultationProblemTypeOptions(),
    ])
    counselorOptions.value = counselors
    problemTypeOptions.value = problemTypes
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载筛选选项失败')
  }

  window.addEventListener('resize', handleResize)
  await fetchData()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  disposeAllCharts()
})

watch([monthlyTrend, problemTypes, crisisLevels, counselorWorkload], async () => {
  await nextTick()
  renderAllCharts()
})
</script>

<template>
  <div class="statistics-view">
    <PageHeader
      title="统计看板"
      description="查看初访预约、咨询安排、风险分布和咨询师工作量等核心指标，支持按日期范围筛选。"
    />

    <n-card title="筛选条件">
      <div class="search-panel">
        <label class="search-field">
          <span>日期范围</span>
          <div class="date-range">
            <input v-model="searchForm.startDate" type="date" @change="handleSearch">
            <span>至</span>
            <input v-model="searchForm.endDate" type="date" @change="handleSearch">
          </div>
        </label>

        <label class="search-field">
          <span>咨询师</span>
          <select :value="searchForm.counselorId ?? ''" @change="handleCounselorChange">
            <option value="">全部</option>
            <option v-for="option in counselorOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>

        <label class="search-field">
          <span>问题类型</span>
          <select :value="searchForm.problemTypeId ?? ''" @change="handleProblemTypeChange">
            <option value="">全部</option>
            <option v-for="option in problemTypeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>
      </div>

      <div class="search-actions">
        <n-button @click="handleReset">重置</n-button>
        <n-button type="primary" :loading="loading" @click="handleSearch">刷新统计</n-button>
      </div>
    </n-card>

    <n-grid :cols="3" :x-gap="16" :y-gap="16" responsive="screen" style="margin-top: 16px">
      <n-gi v-for="card in overviewCards" :key="card.label">
        <n-card>
          <n-statistic :label="card.label" :value="card.value" />
        </n-card>
      </n-gi>
    </n-grid>

    <n-grid :cols="2" :x-gap="16" :y-gap="16" responsive="screen" style="margin-top: 16px">
      <n-gi>
        <n-card title="月度趋势">
          <div v-if="monthlyTrend && monthlyTrend.series.some(item => item.data.some(value => value > 0))" ref="trendChartRef" class="chart-box" />
          <n-empty v-else description="暂无趋势数据" />
        </n-card>
      </n-gi>

      <n-gi>
        <n-card title="问题类型分布">
          <div v-if="problemTypes.some(item => item.value > 0)" ref="pieChartRef" class="chart-box" />
          <n-empty v-else description="暂无分布数据" />
        </n-card>
      </n-gi>

      <n-gi>
        <n-card title="危机等级分布">
          <div
            v-if="crisisLevels && crisisLevels.series.some(item => item.data.some(value => value > 0))"
            ref="crisisChartRef"
            class="chart-box"
          />
          <n-empty v-else description="暂无危机等级数据" />
        </n-card>
      </n-gi>

      <n-gi>
        <n-card title="咨询师工作量">
          <div
            v-if="counselorWorkload && counselorWorkload.series.some(item => item.data.some(value => value > 0))"
            ref="workloadChartRef"
            class="chart-box"
          />
          <n-empty v-else description="暂无工作量数据" />
        </n-card>
      </n-gi>
    </n-grid>
  </div>
</template>

<style scoped>
.statistics-view {
  padding: 16px;
}

.search-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.search-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #4b5563;
  font-size: 14px;
}

.search-field input,
.search-field select {
  height: 34px;
  padding: 0 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-range input {
  min-width: 0;
  flex: 1;
}

.search-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.chart-box {
  width: 100%;
  height: 340px;
}
</style>
