<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, onMounted, reactive, ref } from 'vue'
import {
  NButton,
  NDatePicker,
  NInput,
  NRadio,
  NRadioGroup,
  NSelect,
  NSpin,
  useDialog,
  useMessage,
} from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'

import PageHeader from '@/components/common/PageHeader.vue'
import RiskTag from '@/components/common/RiskTag.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import ActionBar from '@/components/ui/ActionBar.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import FormField from '@/components/ui/FormField.vue'
import FormSection from '@/components/ui/FormSection.vue'
import InfoDescriptions from '@/components/ui/InfoDescriptions.vue'
import PageContainer from '@/components/ui/PageContainer.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import { getInterviewTaskDetailReal, getProblemTypeOptionsReal, submitInterviewResultReal } from '@/api/interviewer'
import type { InterviewResultRequest, RealInterviewTaskDetailVO } from '@/api/interviewer'
import type { OptionItem } from '@/api/admin'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const dialog = useDialog()

const taskId = computed(() => Number(route.params.id))
const loading = ref(false)
const submitting = ref(false)
const taskDetail = ref<RealInterviewTaskDetailVO | null>(null)
const problemTypeOptions = ref<OptionItem[]>([])

const form = reactive<InterviewResultRequest>({
  crisisLevel: 'MEDIUM',
  problemTypeId: 0,
  interviewTime: '',
  conclusion: 'NO_NEED',
  summary: '',
  nextAction: '',
})

const crisisLevelOptions = [
  { label: '低风险', value: 'LOW' },
  { label: '中风险', value: 'MEDIUM' },
  { label: '高风险', value: 'HIGH' },
  { label: '紧急风险', value: 'URGENT' },
]

const conclusionOptions = [
  { label: '无需咨询', value: 'NO_NEED' },
  { label: '安排咨询', value: 'ARRANGE_CONSULTATION' },
  { label: '转介送诊', value: 'TRANSFER' },
]

const nextActionRequired = computed(() => form.conclusion === 'TRANSFER')
const readonlyMode = computed(() => taskDetail.value?.appointmentStatus === 'COMPLETED')

const studentInfoItems = computed(() => {
  const detail = taskDetail.value
  if (!detail) return []

  return [
    { label: '预约编号', value: detail.appointmentNo },
    { label: '学生姓名', value: detail.studentName },
    { label: '学号', value: detail.studentNo },
    { label: '院系', value: detail.college || '—' },
    { label: '联系电话', value: detail.phone || '—' },
    { label: '预约时间', value: `${detail.appointmentDate} ${detail.slotName}` },
    { label: '地点', value: detail.roomName || '—' },
    { label: '风险等级', value: detail.riskLevel },
    { label: '优先标记', value: detail.priorityFlag === 1 ? '是' : '否' },
  ]
})

const firstVisitSummaryItems = computed(() => {
  const detail = taskDetail.value
  if (!detail) return []

  return [
    { label: '主要困扰', value: detail.mainProblem },
    { label: '期望帮助', value: detail.expectedHelp || '—' },
    { label: '问题描述', value: detail.problemDescription || '—', span: 2 as const },
    { label: '风险评分', value: detail.riskScore },
    { label: '风险等级', value: detail.riskLevel },
    { label: '情绪困扰', value: `${detail.moodScore}/10` },
    { label: '睡眠困扰', value: `${detail.sleepScore}/10` },
    { label: '压力程度', value: `${detail.stressScore}/10` },
    { label: '自伤倾向', value: detail.selfHarmFlag === 1 ? '是' : '否' },
    { label: '紧急求助', value: detail.emergencyFlag === 1 ? '是' : '否' },
  ]
})
const displayDateTimeFormat = 'YYYY-MM-DD HH:mm'
const submitDateTimeFormat = 'YYYY-MM-DD HH:mm:ss'

function formatDisplayDateTime(value?: string) {
  if (!value) {
    return ''
  }
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format(displayDateTimeFormat) : value
}

function formatSubmitDateTime(value: string) {
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format(submitDateTimeFormat) : value
}

// 通过真实后端接口加载任务详情和问题类型选项
async function fetchTaskDetail() {
  if (!taskId.value) {
    message.error('任务参数无效')
    return
  }

  loading.value = true
  try {
    const [detailRes, problemTypesRes] = await Promise.all([
      getInterviewTaskDetailReal(taskId.value),
      getProblemTypeOptionsReal(),
    ])
    taskDetail.value = detailRes.data.data
    problemTypeOptions.value = problemTypesRes.data.data

    if (taskDetail.value?.latestResult) {
      form.crisisLevel = taskDetail.value.latestResult.crisisLevel as InterviewResultRequest['crisisLevel']
      form.problemTypeId = taskDetail.value.latestResult.problemTypeId
      form.interviewTime = formatDisplayDateTime(taskDetail.value.latestResult.interviewTime)
      form.conclusion = taskDetail.value.latestResult.conclusion as InterviewResultRequest['conclusion']
      form.summary = taskDetail.value.latestResult.summary || ''
      form.nextAction = taskDetail.value.latestResult.nextAction || ''
    } else if (taskDetail.value) {
      form.interviewTime = formatDisplayDateTime(`${taskDetail.value.appointmentDate} ${taskDetail.value.startTime}`)
    }
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载任务详情失败')
  } finally {
    loading.value = false
  }
}

function validateForm() {
  if (!form.crisisLevel) {
    message.warning('请选择危机等级')
    return false
  }
  if (!form.problemTypeId) {
    message.warning('请选择问题类型')
    return false
  }
  if (!form.interviewTime) {
    message.warning('请选择初访时间')
    return false
  }
  if (!form.conclusion) {
    message.warning('请选择初访结论')
    return false
  }
  if (nextActionRequired.value && !form.nextAction.trim()) {
    message.warning('转介送诊时必须填写后续建议')
    return false
  }
  return true
}

function handleBack() {
  router.push('/interviewer/tasks')
}

function handleSubmit() {
  if (readonlyMode.value) {
    handleBack()
    return
  }
  if (!validateForm()) return

  const urgentExtra = form.crisisLevel === 'URGENT' ? '该学生将被标记为紧急，请确认信息准确。' : ''
  dialog.warning({
    title: '确认提交初访结果',
    content: urgentExtra || '提交后任务状态将更新为已完成，确认继续吗？',
    positiveText: '确认提交',
    negativeText: '取消',
    onPositiveClick: async () => {
      submitting.value = true
      try {
        await submitInterviewResultReal(taskId.value, {
          crisisLevel: form.crisisLevel,
          problemTypeId: form.problemTypeId,
          interviewTime: formatSubmitDateTime(form.interviewTime),
          conclusion: form.conclusion,
          summary: form.summary,
          nextAction: form.nextAction,
        })
        message.success('初访结果已提交')
        router.push('/interviewer/tasks')
      } catch (error) {
        message.error(error instanceof Error ? error.message : '提交初访结果失败')
      } finally {
        submitting.value = false
      }
    },
  })
}

onMounted(() => {
  void fetchTaskDetail()
})
</script>

<template>
  <PageContainer class="sp-section-gap bp-page">
    <PageHeader
      title="初访结果录入"
      description="查看学生首访摘要，并提交危机等级、问题类型、初访结论与后续建议。"
    >
      <n-button @click="handleBack">返回列表</n-button>
    </PageHeader>

    <n-spin :show="loading">
      <EmptyState
        v-if="!taskDetail && !loading"
        title="任务不存在或已失效"
        description="请从「我的初访任务」重新选择有效任务"
        action-text="返回列表"
        @action="handleBack"
      />

      <div v-else-if="taskDetail" class="sp-section-gap">
        <SectionCard title="学生信息" subtitle="预约与学生基本资料">
          <template #extra>
            <StatusTag :value="taskDetail.appointmentStatus" type="appointment" strong />
          </template>
          <InfoDescriptions :items="studentInfoItems" :columns="2">
            <template #value-7>
              <RiskTag :value="taskDetail!.riskLevel" />
            </template>
          </InfoDescriptions>
        </SectionCard>

        <SectionCard title="首访登记摘要" subtitle="学生提交的首访登记表内容">
          <InfoDescriptions :items="firstVisitSummaryItems" :columns="2">
            <template #value-4>
              <RiskTag :value="taskDetail.riskLevel" />
            </template>
          </InfoDescriptions>
        </SectionCard>

        <SectionCard
          :title="readonlyMode ? '初访结果（已提交）' : '初访结果表单'"
          :subtitle="readonlyMode ? '结果已锁定，仅可查看' : '请根据初访情况填写评估结论'"
        >
          <FormSection title="评估信息">
            <div class="bp-form-grid bp-form-grid--responsive">
              <FormField label="危机等级" required>
                <n-select
                  v-model:value="form.crisisLevel"
                  :options="crisisLevelOptions"
                  :disabled="readonlyMode"
                  placeholder="请选择危机等级"
                />
              </FormField>

              <FormField label="问题类型" required>
                <n-select
                  v-model:value="form.problemTypeId"
                  :options="problemTypeOptions"
                  :disabled="readonlyMode"
                  placeholder="请选择问题类型"
                />
              </FormField>

              <FormField label="初访时间" required>
                <n-date-picker
                  v-model:formatted-value="form.interviewTime"
                  type="datetime"
                  value-format="yyyy-MM-dd HH:mm"
                  :disabled="readonlyMode"
                  style="width: 100%"
                />
              </FormField>
            </div>
          </FormSection>

          <FormField label="初访结论" required>
            <n-radio-group v-model:value="form.conclusion" :disabled="readonlyMode">
              <n-radio
                v-for="option in conclusionOptions"
                :key="option.value"
                :value="option.value"
                style="margin-right: 16px"
              >
                {{ option.label }}
              </n-radio>
            </n-radio-group>
          </FormField>

          <FormField label="初访摘要">
            <n-input
              v-model:value="form.summary"
              type="textarea"
              :rows="4"
              :disabled="readonlyMode"
              placeholder="请输入初访摘要"
            />
          </FormField>

          <FormField label="后续建议" :required="nextActionRequired">
            <n-input
              v-model:value="form.nextAction"
              type="textarea"
              :rows="4"
              :disabled="readonlyMode"
              placeholder="转介送诊时需填写后续建议"
            />
          </FormField>

          <ActionBar :sticky="false">
            <n-button @click="handleBack">{{ readonlyMode ? '返回列表' : '取消' }}</n-button>
            <n-button
              v-if="!readonlyMode"
              type="primary"
              :loading="submitting"
              @click="handleSubmit"
            >
              提交结果
            </n-button>
          </ActionBar>
        </SectionCard>
      </div>
    </n-spin>
  </PageContainer>
</template>
