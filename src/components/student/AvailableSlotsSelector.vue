<script setup lang="ts">
import { ref, watch } from 'vue'
import { NDatePicker, NSelect, NCard, NList, NListItem, NTag, NSpace, NButton, NEmpty } from 'naive-ui'
import { getAvailableSlots } from '@/api/student'
import type { AvailableSlot } from '@/types/student'

interface Props {
  modelValue?: AvailableSlot | null
  formId?: number | null
}

interface Emits {
  (e: 'update:modelValue', value: AvailableSlot | null): void
  (e: 'select', value: AvailableSlot): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedDate = ref<string | null>(null)
const selectedInterviewerId = ref<number | null>(null)
const availableSlots = ref<AvailableSlot[]>([])
const loading = ref(false)

// 监听日期变化
watch(selectedDate, async (newDate) => {
  if (newDate) {
    await fetchAvailableSlots()
  } else {
    availableSlots.value = []
  }
})

// 获取可预约时间段
async function fetchAvailableSlots() {
  if (!selectedDate.value) return
  
  loading.value = true
  try {
    const { data } = await getAvailableSlots(selectedDate.value, selectedInterviewerId.value || undefined)
    availableSlots.value = data.data || []
  } catch (error) {
    console.error('获取可预约时间段失败:', error)
    availableSlots.value = []
  } finally {
    loading.value = false
  }
}

// 选择时间段
function selectSlot(slot: AvailableSlot) {
  if (!slot.available) return
  emit('update:modelValue', slot)
  emit('select', slot)
}

// 格式化时间
function formatTime(time: string) {
  return time ? time.substring(0, 5) : ''
}

// 获取状态标签类型
function getStatusType(slot: AvailableSlot) {
  return slot.available ? 'success' : 'error'
}

// 获取状态文本
function getStatusText(slot: AvailableSlot) {
  return slot.available ? `剩余${slot.remaining}个名额` : '已约满'
}
</script>

<template>
  <div class="available-slots-selector">
    <n-space vertical>
      <n-space>
        <n-date-picker
          v-model:formatted-value="selectedDate"
          type="date"
          placeholder="选择预约日期"
          clearable
          :is-date-disabled="(timestamp: number) => {
            const date = new Date(timestamp)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            return date < today
          }"
        />
      </n-space>
      
      <n-card v-if="selectedDate" title="可预约时间段" :loading="loading">
        <n-empty v-if="!loading && availableSlots.length === 0" description="暂无可用时间段" />
        
        <n-list v-else>
          <n-list-item v-for="slot in availableSlots" :key="slot.dutyScheduleId">
            <n-space align="center" justify="space-between">
              <n-space vertical>
                <n-space align="center">
                  <span class="slot-time">
                    {{ formatTime(slot.startTime) }} - {{ formatTime(slot.endTime) }}
                  </span>
                  <n-tag :type="getStatusType(slot)" size="small">
                    {{ getStatusText(slot) }}
                  </n-tag>
                </n-space>
                <n-space>
                  <span class="slot-info">初访员: {{ slot.interviewerName }}</span>
                  <span class="slot-info">咨询室: {{ slot.roomName }}</span>
                </n-space>
              </n-space>
              
              <n-button
                v-if="slot.available"
                type="primary"
                size="small"
                :disabled="!formId"
                @click="selectSlot(slot)"
              >
                选择
              </n-button>
            </n-space>
          </n-list-item>
        </n-list>
      </n-card>
      
      <n-card v-if="props.modelValue" title="已选时间段">
        <n-space align="center">
          <span>
            {{ props.modelValue.appointmentDate }} 
            {{ formatTime(props.modelValue.startTime) }} - {{ formatTime(props.modelValue.endTime) }}
          </span>
          <span>初访员: {{ props.modelValue.interviewerName }}</span>
          <span>咨询室: {{ props.modelValue.roomName }}</span>
          <n-button type="warning" size="small" @click="emit('update:modelValue', null)">
            取消选择
          </n-button>
        </n-space>
      </n-card>
    </n-space>
  </div>
</template>

<style scoped>
.available-slots-selector {
  margin-top: 16px;
}

.slot-time {
  font-weight: bold;
  font-size: 16px;
}

.slot-info {
  color: #666;
  font-size: 14px;
}
</style>