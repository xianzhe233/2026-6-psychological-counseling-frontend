<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import {
  NCard,
  NButton,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NDatePicker,
  NRadioGroup,
  NRadio,
  NDescriptions,
  NDescriptionsItem,
  NSpace,
  NDivider,
  useMessage,
  useDialog
} from 'naive-ui'
import { useRouter, useRoute } from 'vue-router'
import RiskTag from '@/components/common/RiskTag.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import { getInterviewTaskDetail, submitInterviewResult } from '@/api/interviewer'
import type { InterviewTaskDetailVO, InterviewResultRequest } from '@/api/interviewer'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const dialog = useDialog()

// 任务ID
const taskId = computed(() => Number(route.params.id))

// 任务详情
const taskDetail = ref<InterviewTaskDetailVO | null>(null)
const loading = ref(false)

// 表单数据
const form = reactive<InterviewResultRequest>({
  crisisLevel: 'MEDIUM',
  problemTypeId: 0,
  interviewTime: '',
  conclusion: 'NO_NEED',
  summary: '',
  nextAction: ''
})

// 选项数据
const crisisLevelOptions = [
  { label: '低风险', value: 'LOW' },
  { label: '中风险', value: 'MEDIUM' },
  { label: '高风险', value: 'HIGH' },
  { label: '紧急风险', value: 'URGENT' }
]

const conclusionOptions = [
  { label: '无需咨询', value: 'NO_NEED' },
  { label: '安排咨询', value: 'ARRANGE_CONSULTATION' },
  { label: '转介送诊', value: 'TRANSFER' }
]

// 问题类型选项（模拟数据，实际应从接口获取）
const problemTypeOptions = [
  { label: '学业压力', value: 1 },
  { label: '人际关系', value: 2 },
  { label: '情感问题', value: 3 },
  { label: '家庭问题', value: 4 },
  { label: '职业规划', value: 5 },
  { label: '情绪困扰', value: 6 },
  { label: '其他', value: 7 }
]

// 是否显示后续建议必填提示
const showNextActionRequired = computed(() => form.conclusion === 'TRANSFER')

// 加载任务详情
const loadTaskDetail = async () => {
  if (!taskId.value) return
  
  loading.value = true
  try {
    const res = await getInterviewTaskDetail(taskId.value)
    taskDetail.value = res.data.data
    
    // 设置默认初访时间为预约时间
    if (taskDetail.value) {
      form.interviewTime = `${taskDetail.value.appointmentDate} ${taskDetail.value.startTime}`
    }
  } catch (error: any) {
    message.error(error.message || '获取任务详情失败')
  } finally {
    loading.value = false
  }
}

// 提交前验证
const validateForm = (): boolean => {
  if (!form.crisisLevel) {
    message.error('请选择危机等级')
    return false
  }
  if (!form.problemTypeId) {
    message.error('请选择问题类型')
    return false
  }
  if (!form.interviewTime) {
    message.error('请选择初访时间')
    return false
  }
  if (!form.conclusion) {
    message.error('请选择初访结论')
    return false
  }
  if (form.conclusion === 'TRANSFER' && !form.nextAction) {
    message.error('转介送诊时，后续建议必填')
    return false
  }
  return true
}

// 提交结果
const handleSubmit = () => {
  if (!validateForm()) return

  const content = form.conclusion === 'TRANSFER' 
    ? '确认提交初访结果？该学生将被转介送诊。'
    : '确认提交初访结果？'

  dialog.success({
    title: '确认提交',
    content,
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await submitInterviewResult(taskId.value, form)
        message.success('提交成功')
        router.push('/interviewer/tasks')
      } catch (error: any) {
        message.error(error.message || '提交失败')
      }
    }
  })
}

// 返回列表
const handleBack = () => {
  router.push('/interviewer/tasks')
}

onMounted(() => {
  loadTaskDetail()
})
</script>

<template>
  <div class="interview-result-edit-view">
    <n-card title="初访结果录入">
      <template #header-extra>
        <n-button @click="handleBack">返回列表</n-button>
      </template>

      <n-spin :show="loading">
        <template v-if="taskDetail">
          <!-- 学生信息卡片 -->
          <n-card title="学生信息" size="small">
            <n-descriptions label-placement="left" bordered :column="2">
              <n-descriptions-item label="学生姓名">
                {{ taskDetail.studentName }}
              </n-descriptions-item>
              <n-descriptions-item label="学号">
                {{ taskDetail.studentNo }}
              </n-descriptions-item>
              <n-descriptions-item label="院系">
                {{ taskDetail.college || '-' }}
              </n-descriptions-item>
              <n-descriptions-item label="联系电话">
                {{ taskDetail.phone || '-' }}
              </n-descriptions-item>
              <n-descriptions-item label="预约编号">
                {{ taskDetail.appointmentNo }}
              </n-descriptions-item>
              <n-descriptions-item label="预约时间">
                {{ taskDetail.appointmentDate }} {{ taskDetail.slotName }}
              </n-descriptions-item>
              <n-descriptions-item label="地点">
                {{ taskDetail.roomName || '-' }}
              </n-descriptions-item>
              <n-descriptions-item label="风险等级">
                <risk-tag :value="taskDetail.riskLevel" />
              </n-descriptions-item>
            </n-descriptions>
          </n-card>

          <!-- 首访登记摘要 -->
          <n-card title="首访登记摘要" size="small" style="margin-top: 16px;">
            <n-descriptions label-placement="left" bordered :column="2">
              <n-descriptions-item label="主要困扰">
                {{ taskDetail.mainProblem }}
              </n-descriptions-item>
              <n-descriptions-item label="问题描述">
                {{ taskDetail.problemDescription || '-' }}
              </n-descriptions-item>
              <n-descriptions-item label="期望帮助">
                {{ taskDetail.expectedHelp || '-' }}
              </n-descriptions-item>
              <n-descriptions-item label="风险评分">
                {{ taskDetail.riskScore }}
              </n-descriptions-item>
              <n-descriptions-item label="情绪困扰">
                {{ taskDetail.moodScore }}/10
              </n-descriptions-item>
              <n-descriptions-item label="睡眠困扰">
                {{ taskDetail.sleepScore }}/10
              </n-descriptions-item>
              <n-descriptions-item label="压力程度">
                {{ taskDetail.stressScore }}/10
              </n-descriptions-item>
              <n-descriptions-item label="自伤倾向">
                {{ taskDetail.selfHarmFlag === 1 ? '是' : '否' }}
              </n-descriptions-item>
              <n-descriptions-item label="紧急求助">
                {{ taskDetail.emergencyFlag === 1 ? '是' : '否' }}
              </n-descriptions-item>
            </n-descriptions>
          </n-card>

          <!-- 初访结果表单 -->
          <n-card title="初访结果" size="small" style="margin-top: 16px;">
            <n-form :model="form" label-placement="left" label-width="100">
              <n-form-item label="危机等级" required>
                <n-select
                  v-model:value="form.crisisLevel"
                  :options="crisisLevelOptions"
                  placeholder="请选择危机等级"
                />
              </n-form-item>

              <n-form-item label="问题类型" required>
                <n-select
                  v-model:value="form.problemTypeId"
                  :options="problemTypeOptions"
                  placeholder="请选择问题类型"
                />
              </n-form-item>

              <n-form-item label="初访时间" required>
                <n-date-picker
                  v-model:value="form.interviewTime"
                  type="datetime"
                  placeholder="请选择初访时间"
                  style="width: 100%"
                />
              </n-form-item>

              <n-form-item label="初访结论" required>
                <n-radio-group v-model:value="form.conclusion">
                  <n-space>
                    <n-radio value="NO_NEED">无需咨询</n-radio>
                    <n-radio value="ARRANGE_CONSULTATION">安排咨询</n-radio>
                    <n-radio value="TRANSFER">转介送诊</n-radio>
                  </n-space>
                </n-radio-group>
              </n-form-item>

              <n-form-item label="初访摘要">
                <n-input
                  v-model:value="form.summary"
                  type="textarea"
                  placeholder="请输入初访摘要"
                  :rows="4"
                />
              </n-form-item>

              <n-form-item
                label="后续建议"
                :required="showNextActionRequired"
              >
                <n-input
                  v-model:value="form.nextAction"
                  type="textarea"
                  placeholder="请输入后续建议"
                  :rows="4"
                />
                <template v-if="showNextActionRequired" #feedback>
                  <span style="color: #d03050;">转介送诊时，后续建议必填</span>
                </template>
              </n-form-item>

              <n-form-item>
                <n-space>
                  <n-button type="primary" @click="handleSubmit">提交结果</n-button>
                  <n-button @click="handleBack">取消</n-button>
                </n-space>
              </n-form-item>
            </n-form>
          </n-card>
        </template>

        <template v-else-if="!loading">
          <n-card>
            <div style="text-align: center; padding: 40px 0;">
              任务不存在或已失效
            </div>
          </n-card>
        </template>
      </n-spin>
    </n-card>
  </div>
</template>

<style scoped>
.interview-result-edit-view {
  padding: 16px;
}
</style>
