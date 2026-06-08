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

use([BarChart, LineChart, PieChart, GridComponent, LegendComponent, TitleComponent, TooltipComponent, CanvasRenderer])

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
  dateRange: null as [number, number] | null,
  counselorId: null as number | null,
  problemTypeId: null as number | null,
})

const trendChartRef = ref<HTMLDivElement | null>(null)
const pieChartRef = ref<HTMLDivElement | null>(null)
const crisisChartRef = ref<HTMLDivElement | null>(null)
const workloadChartRef = ref<HTMLDivElement | null>(null)

let trendChart: ECharts | null = null
let pieChart: ECharts | null = null
let crisisChart: ECharts | null = null
let workloadChart: ECharts | null = null

const hasTrendData = computed(() => !!monthlyTrend.value && monthlyTrend.value.series.some(item => item.data.some(value => value > 0)))
const hasProblemTypeData = computed(() => problemTypes.value.some(item => item.value > 0))
const hasCrisisData = computed(() => !!crisisLevels.value && crisisLevels.value.series.some(item => item.data.some(value => value > 0)))
const hasWorkloadData = computed(() => !!counselorWorkload.value && counselorWorkload.value.series.some(item => item.data.some(value => value > 0)))

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
    startDate: searchForm.dateRange ? dayjs(searchForm.dateRange[0]).format('YYYY-MM-DD') : undefined,
    endDate: searchForm.dateRange ? dayjs(searchForm.dateRange[1]).format('YYYY-MM-DD') : undefined,
    counselorId: searchForm.counselorId ?? undefined,
    problemTypeId: searchForm.problemTypeId ?? undefined,
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
  crisisChart?.dispose()
  workloadChart?.dispose()
  trendChart = null
  pieChart = null
  crisisChart = null
  workloadChart = null
}

function renderTrendChart() {
  const chart = ensureChart(trendChartRef.value, trendChart, nextChart => { trendChart = nextChart })
  if (!chart) return
  if (!hasTrendData.value || !monthlyTrend.value) {
    chart.clear()
    return
  }

  chart.setOption({
    color: ['#18A058', '#2080F0'],
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    grid: { left: 40, right: 24, top: 24, bottom: 48 },
    xAxis: { type: 'category', data: monthlyTrend.value.xAxis },
    yAxis: { type: 'value', minInterval: 1 },
    series: monthlyTrend.value.series.map(item => ({
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

function renderBarChart(
  container: HTMLDivElement | null,
  current: ECharts | null,
  data: BarChartVO | null,
  hasData: boolean,
  title: string,
  setter: (chart: ECharts | null) => void,
) {
  const chart = ensureChart(container, current, setter)
  if (!chart) return
  if (!hasData || !data) {
    chart.clear()
    return
  }

  chart.setOption({
    color: ['#18A058', '#2080F0'],
    title: { text: title, left: 'center', textStyle: { fontSize: 14, fontWeight: 500 } },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    grid: { left: 40, right: 24, top: 40, bottom: 48 },
    xAxis: { type: 'category', data: data.xAxis },
    yAxis: { type: 'value', minInterval: 1 },
    series: data.series.map(item => ({
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
  renderBarChart(crisisChartRef.value, crisisChart, crisisLevels.value, hasCrisisData.value, '危机等级分布', nextChart => { crisisChart = nextChart })
  renderBarChart(workloadChartRef.value, workloadChart, counselorWorkload.value, hasWorkloadData.value, '咨询师工作量', nextChart => { workloadChart = nextChart })
}

function handleResize() {
  trendChart?.resize()
  pieChart?.resize()
  crisisChart?.resize()
  workloadChart?.resize()
}

async function loadFilterOptions() {
  try {
    const [counselors, problemTypesData] = await Promise.all([
      getStaffOptions('COUNSELOR'),
      getConsultationProblemTypeOptions(),
    ])
    counselorOptions.value = counselors
    problemTypeOptions.value = problemTypesData
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载筛选选项失败')
  }
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
  searchForm.dateRange = null
  searchForm.counselorId = null
  searchForm.problemTypeId = null
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

watch([monthlyTrend, problemTypes, crisisLevels, counselorWorkload, hasTrendData, hasProblemTypeData, hasCrisisData, hasWorkloadData], async () => {
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

          <n-gi span="1 m:1">
            <n-form-item label="咨询师">
              <n-select
                v-model:value="searchForm.counselorId"
                :options="counselorOptions"
                clearable
                placeholder="全部咨询师"
              />
            </n-form-item>
          </n-gi>

          <n-gi span="1 m:1">
            <n-form-item label="问题类型">
              <n-select
                v-model:value="searchForm.problemTypeId"
                :options="problemTypeOptions"
                clearable
                placeholder="全部问题类型"
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
        <n-card title="月度趋势">
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
        <n-card title="危机等级分布">
          <div class="chart-panel">
            <div v-show="hasCrisisData" ref="crisisChartRef" class="chart-box" />
            <n-empty v-if="!hasCrisisData" description="暂无危机等级数据" class="chart-empty" />
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
