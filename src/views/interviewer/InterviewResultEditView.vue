<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  NButton,
  NCard,
  NDatePicker,
  NDescriptions,
  NDescriptionsItem,
  NEmpty,
  NForm,
  NFormItem,
  NInput,
  NRadio,
  NRadioGroup,
  NSelect,
  NSpace,
  NSpin,
  useDialog,
  useMessage,
} from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'

import PageHeader from '@/components/common/PageHeader.vue'
import RiskTag from '@/components/common/RiskTag.vue'
import StatusTag from '@/components/common/StatusTag.vue'
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
      form.interviewTime = taskDetail.value.latestResult.interviewTime
      form.conclusion = taskDetail.value.latestResult.conclusion as InterviewResultRequest['conclusion']
      form.summary = taskDetail.value.latestResult.summary || ''
      form.nextAction = taskDetail.value.latestResult.nextAction || ''
    } else if (taskDetail.value) {
      form.interviewTime = `${taskDetail.value.appointmentDate} ${taskDetail.value.startTime}`
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
          interviewTime: form.interviewTime,
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
  <div class="interview-result-edit-view">
    <PageHeader
      title="初访结果录入"
      description="查看学生首访摘要，并提交危机等级、问题类型、初访结论与后续建议。"
    >
      <n-button @click="handleBack">返回列表</n-button>
    </PageHeader>

    <n-spin :show="loading">
      <n-empty v-if="!taskDetail && !loading" description="任务不存在或已失效" />

      <template v-else-if="taskDetail">
        <n-card title="学生信息">
          <n-descriptions bordered label-placement="left" :column="2">
            <n-descriptions-item label="预约编号">{{ taskDetail.appointmentNo }}</n-descriptions-item>
            <n-descriptions-item label="当前状态"><StatusTag :value="taskDetail.appointmentStatus" /></n-descriptions-item>
            <n-descriptions-item label="学生姓名">{{ taskDetail.studentName }}</n-descriptions-item>
            <n-descriptions-item label="学号">{{ taskDetail.studentNo }}</n-descriptions-item>
            <n-descriptions-item label="院系">{{ taskDetail.college || '-' }}</n-descriptions-item>
            <n-descriptions-item label="联系电话">{{ taskDetail.phone || '-' }}</n-descriptions-item>
            <n-descriptions-item label="预约时间">{{ taskDetail.appointmentDate }} {{ taskDetail.slotName }}</n-descriptions-item>
            <n-descriptions-item label="地点">{{ taskDetail.roomName || '-' }}</n-descriptions-item>
            <n-descriptions-item label="风险等级"><RiskTag :value="taskDetail.riskLevel" /></n-descriptions-item>
            <n-descriptions-item label="优先标记">{{ taskDetail.priorityFlag === 1 ? '是' : '否' }}</n-descriptions-item>
          </n-descriptions>
        </n-card>

        <n-card title="首访登记摘要" style="margin-top: 16px">
          <n-descriptions bordered label-placement="left" :column="2">
            <n-descriptions-item label="主要困扰">{{ taskDetail.mainProblem }}</n-descriptions-item>
            <n-descriptions-item label="期望帮助">{{ taskDetail.expectedHelp || '-' }}</n-descriptions-item>
            <n-descriptions-item label="问题描述" :span="2">{{ taskDetail.problemDescription || '-' }}</n-descriptions-item>
            <n-descriptions-item label="风险评分">{{ taskDetail.riskScore }}</n-descriptions-item>
            <n-descriptions-item label="风险等级"><RiskTag :value="taskDetail.riskLevel" /></n-descriptions-item>
            <n-descriptions-item label="情绪困扰">{{ taskDetail.moodScore }}/10</n-descriptions-item>
            <n-descriptions-item label="睡眠困扰">{{ taskDetail.sleepScore }}/10</n-descriptions-item>
            <n-descriptions-item label="压力程度">{{ taskDetail.stressScore }}/10</n-descriptions-item>
            <n-descriptions-item label="自伤倾向">{{ taskDetail.selfHarmFlag === 1 ? '是' : '否' }}</n-descriptions-item>
            <n-descriptions-item label="紧急求助">{{ taskDetail.emergencyFlag === 1 ? '是' : '否' }}</n-descriptions-item>
          </n-descriptions>
        </n-card>

        <n-card :title="readonlyMode ? '初访结果（已提交）' : '初访结果表单'" style="margin-top: 16px">
          <n-form :model="form" label-placement="left" label-width="100">
            <n-form-item label="危机等级" required>
              <n-select v-model:value="form.crisisLevel" :options="crisisLevelOptions" :disabled="readonlyMode" placeholder="请选择危机等级" />
            </n-form-item>

            <n-form-item label="问题类型" required>
              <n-select v-model:value="form.problemTypeId" :options="problemTypeOptions" :disabled="readonlyMode" placeholder="请选择问题类型" />
            </n-form-item>

            <n-form-item label="初访时间" required>
              <n-date-picker
                v-model:formatted-value="form.interviewTime"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm"
                :disabled="readonlyMode"
                style="width: 100%"
              />
            </n-form-item>

            <n-form-item label="初访结论" required>
              <n-radio-group v-model:value="form.conclusion" :disabled="readonlyMode">
                <n-space>
                  <n-radio v-for="option in conclusionOptions" :key="option.value" :value="option.value">{{ option.label }}</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>

            <n-form-item label="初访摘要">
              <n-input v-model:value="form.summary" type="textarea" :rows="4" :disabled="readonlyMode" placeholder="请输入初访摘要" />
            </n-form-item>

            <n-form-item label="后续建议" :required="nextActionRequired">
              <n-input v-model:value="form.nextAction" type="textarea" :rows="4" :disabled="readonlyMode" placeholder="转介送诊时需填写后续建议" />
            </n-form-item>

            <n-form-item>
              <n-space>
                <n-button v-if="!readonlyMode" type="primary" :loading="submitting" @click="handleSubmit">提交结果</n-button>
                <n-button @click="handleBack">{{ readonlyMode ? '返回列表' : '取消' }}</n-button>
              </n-space>
            </n-form-item>
          </n-form>
        </n-card>
      </template>
    </n-spin>
  </div>
</template>

<style scoped>
.interview-result-edit-view {
  padding: 16px;
}
</style>
