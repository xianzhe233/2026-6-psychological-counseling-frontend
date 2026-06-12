import { chartPalette, colors } from '@/constants/design-tokens'

/** ECharts 通用色板（与设计令牌对齐） */
export const echartsColors = [...chartPalette]

export const echartsTheme = {
  color: echartsColors,
  textStyle: {
    fontFamily: "'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    color: colors.text.secondary,
  },
  title: {
    textStyle: {
      fontSize: 14,
      fontWeight: 500,
      color: colors.text.primary,
    },
  },
  legend: {
    textStyle: {
      color: colors.text.muted,
    },
  },
  grid: {
    left: 40,
    right: 24,
    top: 24,
    bottom: 48,
  },
  categoryAxis: {
    axisLine: { lineStyle: { color: colors.border.subtle } },
    axisLabel: { color: colors.text.muted },
  },
  valueAxis: {
    axisLine: { lineStyle: { color: colors.border.subtle } },
    splitLine: { lineStyle: { color: colors.border.subtle } },
    axisLabel: { color: colors.text.muted },
  },
} as const

export function withChartTheme<T extends Record<string, unknown>>(option: T): T {
  return {
    color: echartsColors,
    ...option,
  }
}
