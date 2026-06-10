<script setup lang="ts">
import dayjs from 'dayjs'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components'
import { init, use, type ECharts } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import {
  NButton,
  NCard,
  NDatePicker,
  NEmpty,
  NForm,
  NFormItem,
  NGi,
  NGrid,
  NSelect,
  NSpace,
  NStatistic,
  useMessage,
} from 'naive-ui'

import PageHeader from '@/components/common/PageHeader.vue'
import { getStaffOptionsReal } from '@/api/admin'
import type { OptionItem } from '@/api/admin'
import {
  getConsultationDistribution,
  getConsultationTrend,
  getOverview,
  getProblemTypeDistribution,
  getWorkloadChart,
} from '@/api/statistics'
import type { ChartVO, CounselorWorkloadVO, OverviewStatsVO, PieItemVO, StatisticsQuery } from '@/api/statistics'

use([BarChart, LineChart, PieChart, GridComponent, LegendComponent, TitleComponent, TooltipComponent, CanvasRenderer])

const message = useMessage()

const loading = ref(false)
const overview = ref<OverviewStatsVO | null>(null)
const consultationTrend = ref<ChartVO | null>(null)
const problemTypes = ref<PieItemVO[]>([])
const consultationDist = ref<PieItemVO[]>([])
const workloadChart = ref<ChartVO | null>(null)
const workloadTable = ref<CounselorWorkloadVO[]>([])

const counselorOptions = ref<OptionItem[]>([])
const problemTypeOptions = ref<OptionItem[]>([])

const searchForm = reactive({
  dateRange: null as [number, number] | null,
})

const trendChartRef = ref<HTMLDivElement | null>(null)
const pieChartRef = ref<HTMLDivElement | null>(null)
const distChartRef = ref<HTMLDivElement | null>(null)
const workloadChartRef = ref<HTMLDivElement | null>(null)

let trendChart: ECharts | null = null
let pieChart: ECharts | null = null
let distChart: ECharts | null = null
let workloadChartIns: ECharts | null = null

const hasTrendData = computed(() => !!consultationTrend.value && consultationTrend.value.series.some(item => item.data.some(value => value > 0)))
const hasProblemTypeData = computed(() => problemTypes.value.some(item => item.value > 0))
const hasDistData = computed(() => consultationDist.value.some(item => item.value > 0))
const hasWorkloadData = computed(() => !!workloadChart.value && workloadChart.value.series.some(item => item.data.some(value => value > 0)))

const overviewCards = computed(() => {
  const data = overview.value
  return [
    { label: '咨询总次数', value: data?.totalConsultations ?? 0 },
    { label: '咨询学生总数', value: data?.totalStudents ?? 0 },
    { label: '结案报告数', value: data?.completedReports ?? 0 },
    { label: '活跃咨询师数', value: data?.activeCounselors ?? 0 },
  ]
})

function buildQuery(): StatisticsQuery {
  return {
    startDate: searchForm.dateRange ? dayjs(searchForm.dateRange[0]).format('YYYY-MM-DD') : undefined,
    endDate: searchForm.dateRange ? dayjs(searchForm.dateRange[1]).format('YYYY-MM-DD') : undefined,
  }
}

function ensureChart(
  container: HTMLDivElement | null,
  current: ECharts | null,
  setter: (chart: ECharts | null) => void,
) {
  if (!container) return null
  if (!current || current.getDom() !== container) {
    current?.dispose()
    const nextChart = init(container)
    setter(nextChart)
    return nextChart
  }
  return current
}

function disposeAllCharts() {
  trendChart?.dispose()
  pieChart?.dispose()
  distChart?.dispose()
  workloadChartIns?.dispose()
  trendChart = null
  pieChart = null
  distChart = null
  workloadChartIns = null
}

function renderTrendChart() {
  const chart = ensureChart(trendChartRef.value, trendChart, nextChart => { trendChart = nextChart })
  if (!chart) return
  if (!hasTrendData.value || !consultationTrend.value) {
    chart.clear()
    return
  }

  chart.setOption({
    color: ['#18A058', '#2080F0'],
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    grid: { left: 40, right: 24, top: 24, bottom: 48 },
    xAxis: { type: 'category', data: consultationTrend.value.xAxis },
    yAxis: { type: 'value', minInterval: 1 },
    series: consultationTrend.value.series.map(item => ({
      name: item.name,
      type: 'line',
      smooth: true,
      data: item.data,
    })),
  }, true)
}

function renderPieChart() {
  const chart = ensureChart(pieChartRef.value, pieChart, nextChart => { pieChart = nextChart })
  if (!chart) return
  if (!hasProblemTypeData.value) {
    chart.clear()
    return
  }

  chart.setOption({
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

function renderDistChart() {
  const chart = ensureChart(distChartRef.value, distChart, nextChart => { distChart = nextChart })
  if (!chart) return
  if (!hasDistData.value) {
    chart.clear()
    return
  }

  chart.setOption({
    color: ['#18A058', '#2080F0', '#F0A020', '#D03050', '#8A2BE2', '#36CFC9'],
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, type: 'scroll' },
    series: [{
      name: '学院分布',
      type: 'pie',
      radius: ['38%', '68%'],
      center: ['50%', '45%'],
      data: consultationDist.value,
      label: { formatter: '{b}: {c}' },
    }],
  }, true)
}

function renderWorkloadChart() {
  const chart = ensureChart(workloadChartRef.value, workloadChartIns, nextChart => { workloadChartIns = nextChart })
  if (!chart) return
  if (!hasWorkloadData.value || !workloadChart.value) {
    chart.clear()
    return
  }

  chart.setOption({
    color: ['#18A058', '#2080F0', '#F0A020'],
    title: { text: '咨询师工作量', left: 'center', textStyle: { fontSize: 14, fontWeight: 500 } },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    grid: { left: 40, right: 24, top: 40, bottom: 48 },
    xAxis: { type: 'category', data: workloadChart.value.xAxis },
    yAxis: { type: 'value', minInterval: 1 },
    series: workloadChart.value.series.map(item => ({
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
  renderDistChart()
  renderWorkloadChart()
}

function handleResize() {
  trendChart?.resize()
  pieChart?.resize()
  distChart?.resize()
  workloadChartIns?.resize()
}

async function loadFilterOptions() {
  try {
    const counselors = await getStaffOptionsReal('COUNSELOR')
    counselorOptions.value = counselors
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载筛选选项失败')
  }
}

async function fetchData() {
  loading.value = true
  try {
    const query = buildQuery()
    const [overviewData, trendData, problemData, distData, workloadData] = await Promise.all([
      getOverview(query),
      getConsultationTrend(query),
      getProblemTypeDistribution(query),
      getConsultationDistribution(query),
      getWorkloadChart(query),
    ])
    overview.value = overviewData
    consultationTrend.value = trendData
    problemTypes.value = problemData
    consultationDist.value = distData
    workloadChart.value = workloadData
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
  searchForm.dateRange = null
  handleSearch()
}

onMounted(async () => {
  window.addEventListener('resize', handleResize)
  await loadFilterOptions()
  await fetchData()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  disposeAllCharts()
})

watch([consultationTrend, problemTypes, consultationDist, workloadChart, hasTrendData, hasProblemTypeData, hasDistData, hasWorkloadData], async () => {
  await nextTick()
  renderAllCharts()
})
</script>

<template>
  <div class="statistics-view">
    <PageHeader
      title="统计看板"
      description="查看咨询安排、问题类型分布、咨询师工作量等核心指标，支持按日期范围筛选。"
    />

    <n-card title="筛选条件">
      <n-form label-placement="top">
        <n-grid :cols="1" :x-gap="16" responsive="screen" item-responsive>
          <n-gi span="1 m:2">
            <n-form-item label="日期范围">
              <n-date-picker
                v-model:value="searchForm.dateRange"
                type="daterange"
                clearable
                style="width: 100%"
              />
            </n-form-item>
          </n-gi>
        </n-grid>
      </n-form>

      <div class="search-actions">
        <n-space>
          <n-button @click="handleReset">重置</n-button>
          <n-button type="primary" :loading="loading" @click="handleSearch">刷新统计</n-button>
        </n-space>
      </div>
    </n-card>

    <n-grid :cols="1" :x-gap="16" :y-gap="16" responsive="screen" item-responsive style="margin-top: 16px">
      <n-gi v-for="card in overviewCards" :key="card.label" span="1 s:1 m:2 l:2 xl:1">
        <n-card>
          <n-statistic :label="card.label" :value="card.value" />
        </n-card>
      </n-gi>
    </n-grid>

    <n-grid :cols="1" :x-gap="16" :y-gap="16" responsive="screen" item-responsive style="margin-top: 16px">
      <n-gi span="1 xl:1">
        <n-card title="咨询趋势">
          <div class="chart-panel">
            <div v-show="hasTrendData" ref="trendChartRef" class="chart-box" />
            <n-empty v-if="!hasTrendData" description="暂无趋势数据" class="chart-empty" />
          </div>
        </n-card>
      </n-gi>

      <n-gi span="1 xl:1">
        <n-card title="问题类型分布">
          <div class="chart-panel">
            <div v-show="hasProblemTypeData" ref="pieChartRef" class="chart-box" />
            <n-empty v-if="!hasProblemTypeData" description="暂无分布数据" class="chart-empty" />
          </div>
        </n-card>
      </n-gi>

      <n-gi span="1 xl:1">
        <n-card title="学院分布">
          <div class="chart-panel">
            <div v-show="hasDistData" ref="distChartRef" class="chart-box" />
            <n-empty v-if="!hasDistData" description="暂无学院分布数据" class="chart-empty" />
          </div>
        </n-card>
      </n-gi>

      <n-gi span="1 xl:1">
        <n-card title="咨询师工作量">
          <div class="chart-panel">
            <div v-show="hasWorkloadData" ref="workloadChartRef" class="chart-box" />
            <n-empty v-if="!hasWorkloadData" description="暂无工作量数据" class="chart-empty" />
          </div>
        </n-card>
      </n-gi>
    </n-grid>
  </div>
</template>

<style scoped>
.statistics-view {
  padding: 16px;
}

.search-actions {
  display: flex;
  justify-content: flex-end;
}

.chart-panel {
  min-height: 340px;
}

.chart-box {
  width: 100%;
  height: 340px;
}

.chart-empty {
  display: flex;
  min-height: 340px;
  align-items: center;
  justify-content: center;
}
</style>
