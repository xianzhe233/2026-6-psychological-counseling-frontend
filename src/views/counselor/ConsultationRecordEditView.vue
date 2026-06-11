<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  NButton,
  NSpin,
  useMessage,
} from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'

import ScheduleInfoCard from '@/components/counselor/ScheduleInfoCard.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import ActionBar from '@/components/ui/ActionBar.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import FormField from '@/components/ui/FormField.vue'
import FormSection from '@/components/ui/FormSection.vue'
import PageContainer from '@/components/ui/PageContainer.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
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
  <PageContainer class="record-edit-view bp-page bp-section-gap">
    <PageHeader
      title="咨询记录录入"
      description="录入本次正式咨询状态、咨询时间、摘要和后续计划。"
    >
      <n-button @click="handleBack">返回日程</n-button>
    </PageHeader>

    <n-spin :show="loading">
      <EmptyState
        v-if="!schedule && !loading"
        title="未找到咨询日程"
        description="请从「我的咨询日程」重新选择有效的日程记录"
        action-text="返回日程"
        @action="handleBack"
      />

      <div v-else-if="schedule" class="bp-section-gap">
        <ScheduleInfoCard :schedule="schedule" mode="schedule" />
        <ScheduleInfoCard :schedule="schedule" mode="student" />

        <SectionCard title="咨询记录表单">
          <FormSection title="本次咨询">
            <div class="bp-form-grid bp-form-grid--responsive">
              <FormField label="咨询状态" required>
                <select v-model="form.recordStatus" class="bp-form-control">
                  <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
              </FormField>

              <FormField label="咨询时间" required>
                <input
                  class="bp-form-control"
                  :value="toInputDateTime(form.consultationTime)"
                  type="datetime-local"
                  @input="form.consultationTime = fromInputDateTime(($event.target as HTMLInputElement).value)"
                >
              </FormField>
            </div>
          </FormSection>

          <FormField label="咨询摘要" hint="完成咨询时建议填写主要内容与学生状态">
            <textarea
              v-model="form.contentSummary"
              class="bp-form-control"
              rows="5"
              placeholder="填写本次咨询的主要内容、学生状态和关键观察"
            />
            <div class="bp-char-count">{{ form.contentSummary?.length || 0 }} 字</div>
          </FormField>

          <FormField label="后续计划">
            <textarea
              v-model="form.nextPlan"
              class="bp-form-control"
              rows="4"
              placeholder="填写下次咨询重点、建议或需要跟进的事项"
            />
          </FormField>

          <label class="switch-row">
            <input v-model="form.needClose" type="checkbox" :true-value="1" :false-value="0">
            <span>本次咨询后建议进入结案流程</span>
          </label>

          <div v-if="closeHintVisible" class="close-hint">
            当前记录已标记为结案相关状态，保存后可继续填写结案报告。
            <n-button size="small" type="primary" @click="handleGoReport">前往结案报告</n-button>
          </div>

          <ActionBar :sticky="false">
            <n-button @click="handleBack">返回</n-button>
            <n-button type="primary" :loading="submitting" @click="handleSubmit">保存记录</n-button>
          </ActionBar>
        </SectionCard>
      </div>
    </n-spin>
  </PageContainer>
</template>

<style scoped>
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
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  margin-bottom: var(--space-4);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  background: var(--color-info-subtle);
  color: var(--color-info);
}
</style>
