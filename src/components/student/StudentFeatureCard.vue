<script setup lang="ts">
import { NTag } from 'naive-ui'
import { useRouter } from 'vue-router'

const props = defineProps<{
  title: string
  desc: string
  tag: string
  tagType?: 'warning' | 'info' | 'success' | 'default'
  path?: string
}>()

const router = useRouter()

function handleClick() {
  if (props.path) {
    router.push(props.path)
  }
}
</script>

<template>
  <article
    class="sp-feature-card"
    :class="{ 'sp-feature-card--clickable': path }"
    role="button"
    tabindex="0"
    @click="handleClick"
    @keyup.enter="handleClick"
  >
    <div class="sp-feature-card__header">
      <h4 class="sp-feature-card__title">{{ title }}</h4>
      <n-tag size="small" :type="tagType || 'default'" :bordered="false">{{ tag }}</n-tag>
    </div>
    <p class="sp-feature-card__desc">{{ desc }}</p>
  </article>
</template>

<style scoped>
.sp-feature-card--clickable {
  cursor: pointer;
}
</style>
