<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  NButton,
  NCard,
  NDescriptions,
  NDescriptionsItem,
  NEmpty,
  NSpin,
  useMessage,
} from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'

import PageHeader from '@/components/common/PageHeader.vue'
import RiskTag from '@/components/common/RiskTag.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import {
  getRecordBySchedule,
  getScheduleDetail,
  saveConsultationRecord,
} from '@/api/counselor'
import type { ConsultationRecordRequest, CounselorScheduleVO, RecordStatus } from '@/api/counselor'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const scheduleId = computed(() => Number(route.params.scheduleId || 0))
const loading = ref(false)
const submitting = ref(false)
const schedule = ref<CounselorScheduleVO | null>(null)

const form = reactive<ConsultationRecordRequest>({
  recordStatus: 'COMPLETED',
  consultationTime: '',
  contentSummary: '',
  nextPlan: '',
  needClose: 0,
})

const statusOptions = [
  { label: '完成咨询', value: 'COMPLETED' },
  { label: '旷约', value: 'ABSENT' },
  { label: '请假', value: 'LEAVE' },
  { label: '脱落', value: 'DROPPED' },
  { label: '结案', value: 'CLOSED' },
]

const closeHintVisible = computed(() => form.recordStatus === 'CLOSED' || form.needClose === 1)

function toInputDateTime(value: string) {
  return value ? value.replace(' ', 'T') : ''
}

function fromInputDateTime(value: string) {
  return value ? value.replace('T', ' ') : ''
}

async function fetchPageData() {
  if (!scheduleId.value) return

  loading.value = true
  try {
    const [scheduleDetail, record] = await Promise.all([
      getScheduleDetail(scheduleId.value),
      getRecordBySchedule(scheduleId.value),
    ])
    schedule.value = scheduleDetail
    form.consultationTime = record?.consultationTime || `${scheduleDetail.consultationDate} ${scheduleDetail.startTime}`
    form.recordStatus = record?.recordStatus || (scheduleDetail.status === 'RESERVED' ? 'COMPLETED' : scheduleDetail.status as RecordStatus)
    form.contentSummary = record?.contentSummary || ''
    form.nextPlan = record?.nextPlan || ''
    form.needClose = record?.needClose || 0
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载咨询记录失败')
  } finally {
    loading.value = false
  }
}

function validateForm() {
  if (!form.recordStatus) {
    message.warning('请选择咨询状态')
    return false
  }
  if (!form.consultationTime) {
    message.warning('请选择咨询时间')
    return false
  }
  if (form.recordStatus === 'COMPLETED' && !form.contentSummary?.trim()) {
    message.warning('完成咨询时建议填写咨询摘要')
    return false
  }
  return true
}

async function handleSubmit() {
  if (!scheduleId.value || !validateForm()) return

  submitting.value = true
  try {
    await saveConsultationRecord(scheduleId.value, {
      recordStatus: form.recordStatus,
      consultationTime: form.consultationTime,
      contentSummary: form.contentSummary,
      nextPlan: form.nextPlan,
      needClose: form.needClose,
    })
    message.success('咨询记录已保存')
    await fetchPageData()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '保存咨询记录失败')
  } finally {
    submitting.value = false
  }
}

function handleBack() {
  router.push('/counselor/schedules')
}

function handleGoReport() {
  if (!schedule.value) return
  router.push({ path: '/counselor/case-reports', query: { studentId: schedule.value.studentId } })
}

onMounted(() => {
  void fetchPageData()
})
</script>

<template>
  <div class="record-edit-view">
    <PageHeader
      title="咨询记录录入"
      description="录入本次正式咨询状态、咨询时间、摘要和后续计划。"
    >
      <n-button @click="handleBack">返回日程</n-button>
    </PageHeader>

    <n-spin :show="loading">
      <n-empty v-if="!schedule && !loading" description="未找到咨询日程" />

      <template v-else-if="schedule">
        <n-card title="日程信息">
          <n-descriptions bordered label-placement="left" :column="2">
            <n-descriptions-item label="咨询编号">{{ schedule.scheduleNo }}</n-descriptions-item>
            <n-descriptions-item label="状态"><StatusTag :value="schedule.status" type="schedule" /></n-descriptions-item>
            <n-descriptions-item label="咨询日期">{{ schedule.consultationDate }}</n-descriptions-item>
            <n-descriptions-item label="时间段">{{ schedule.slotName }} {{ schedule.startTime }}-{{ schedule.endTime }}</n-descriptions-item>
            <n-descriptions-item label="地点">{{ schedule.roomName }}</n-descriptions-item>
            <n-descriptions-item label="第几次">第 {{ schedule.sessionIndex }} 次</n-descriptions-item>
          </n-descriptions>
        </n-card>

        <n-card title="学生信息" style="margin-top: 16px">
          <n-descriptions bordered label-placement="left" :column="2">
            <n-descriptions-item label="姓名">{{ schedule.studentName }}</n-descriptions-item>
            <n-descriptions-item label="学号">{{ schedule.studentNo }}</n-descriptions-item>
            <n-descriptions-item label="院系">{{ schedule.college }}</n-descriptions-item>
            <n-descriptions-item label="联系电话">{{ schedule.phone }}</n-descriptions-item>
            <n-descriptions-item label="问题类型">{{ schedule.problemTypeLabel }}</n-descriptions-item>
            <n-descriptions-item label="危机等级"><RiskTag :value="schedule.crisisLevel" /></n-descriptions-item>
            <n-descriptions-item label="初访摘要" :span="2">{{ schedule.firstVisitSummary }}</n-descriptions-item>
            <n-descriptions-item label="后续建议" :span="2">{{ schedule.nextAction || '-' }}</n-descriptions-item>
          </n-descriptions>
        </n-card>

        <n-card title="咨询记录表单" style="margin-top: 16px">
          <div class="form-grid">
            <label class="form-field">
              <span>咨询状态 <em>*</em></span>
              <select v-model="form.recordStatus">
                <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
              </select>
            </label>

            <label class="form-field">
              <span>咨询时间 <em>*</em></span>
              <input
                :value="toInputDateTime(form.consultationTime)"
                type="datetime-local"
                @input="form.consultationTime = fromInputDateTime(($event.target as HTMLInputElement).value)"
              >
            </label>
          </div>

          <label class="form-field form-field--full">
            <span>咨询摘要</span>
            <textarea v-model="form.contentSummary" rows="5" placeholder="填写本次咨询的主要内容、学生状态和关键观察" />
          </label>

          <label class="form-field form-field--full">
            <span>后续计划</span>
            <textarea v-model="form.nextPlan" rows="4" placeholder="填写下次咨询重点、建议或需要跟进的事项" />
          </label>

          <label class="switch-row">
            <input v-model="form.needClose" type="checkbox" :true-value="1" :false-value="0">
            <span>本次咨询后建议进入结案流程</span>
          </label>

          <div v-if="closeHintVisible" class="close-hint">
            当前记录已标记为结案相关状态，保存后可继续填写结案报告。
            <n-button size="small" type="primary" @click="handleGoReport">前往结案报告</n-button>
          </div>

          <div class="form-actions">
            <n-button type="primary" :loading="submitting" @click="handleSubmit">保存记录</n-button>
            <n-button @click="handleBack">返回</n-button>
          </div>
        </n-card>
      </template>
    </n-spin>
  </div>
</template>

<style scoped>
.record-edit-view {
  padding: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  color: #4b5563;
  font-size: 14px;
}

.form-field em {
  color: #ef4444;
  font-style: normal;
}

.form-field input,
.form-field select,
.form-field textarea {
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  font: inherit;
}

.form-field--full {
  margin-top: 4px;
}

.switch-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0 16px;
  color: #374151;
}

.close-hint {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  margin-bottom: 16px;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  background: #eff6ff;
  color: #1d4ed8;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
