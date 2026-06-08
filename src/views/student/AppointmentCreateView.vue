<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NAlert, NCard, NButton, NSpace, useMessage } from 'naive-ui'
import PageHeader from '@/components/common/PageHeader.vue'
import AvailableSlotsSelector from '@/components/student/AvailableSlotsSelector.vue'
import { createAppointment } from '@/api/student'
import type { AvailableSlot } from '@/types/student'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const formId = computed(() => {
  const rawValue = Array.isArray(route.query.formId) ? route.query.formId[0] : route.query.formId
  const parsed = Number(rawValue)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
})

const selectedSlot = ref<AvailableSlot | null>(null)
const submitting = ref(false)

// 提交预约
async function handleSubmitAppointment() {
  if (!formId.value) {
    message.error('缺少首访登记表ID')
    return
  }
  
  if (!selectedSlot.value) {
    message.error('请选择预约时间段')
    return
  }
  
  submitting.value = true
  try {
    const { data } = await createAppointment({
      formId: formId.value,
      dutyScheduleId: selectedSlot.value.dutyScheduleId,
      appointmentDate: selectedSlot.value.appointmentDate,
      slotId: selectedSlot.value.slotId,
      interviewerId: selectedSlot.value.interviewerId,
      roomId: selectedSlot.value.roomId || 0
    })
    
    message.success('预约提交成功')
    router.push('/student/appointments')
  } catch (error: any) {
    message.error(error.response?.data?.message || '预约提交失败')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="appointment-create-view">
    <PageHeader title="初访预约" description="选择合适的时间段进行预约" />
    <n-card class="appointment-card">
      <n-alert v-if="formId" type="success" class="appointment-alert">
        已接收首访登记表编号 {{ formId }}，请继续选择预约时间段。
      </n-alert>
      <n-alert v-else type="warning" class="appointment-alert">
        当前未携带 formId。正式联调时应从"知情同意书"页面完成签署后进入此页。
      </n-alert>
      
      <AvailableSlotsSelector
        v-model="selectedSlot"
        :form-id="formId"
        @select="(slot) => selectedSlot = slot"
      />
      
      <n-space v-if="selectedSlot" justify="end" class="submit-section">
        <n-button
          type="primary"
          :loading="submitting"
          :disabled="!formId || !selectedSlot"
          @click="handleSubmitAppointment"
        >
          提交预约
        </n-button>
      </n-space>
    </n-card>
  </div>
</template>

<style scoped>
.appointment-create-view {
  padding: 24px;
}

.appointment-card {
  margin-top: 24px;
}

.appointment-alert {
  margin-bottom: 16px;
}

.submit-section {
  margin-top: 24px;
}
</style>