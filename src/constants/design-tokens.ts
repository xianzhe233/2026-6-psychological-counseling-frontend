/**
 * 设计令牌 TypeScript 常量
 * 与 src/styles/tokens.css 保持同步，供 Naive UI 主题、ECharts 等 JS 场景使用
 */

export const colors = {
  primary: {
    50: '#eef8f3',
    100: '#d4f0e4',
    200: '#a8e0c9',
    300: '#6ec9a5',
    400: '#3db28a',
    500: '#1f8f6a',
    600: '#167255',
    700: '#115c44',
    800: '#0d4634',
    900: '#082f23',
    DEFAULT: '#1f8f6a',
    hover: '#2aa17a',
    pressed: '#167255',
    subtle: 'rgba(31, 143, 106, 0.12)',
    muted: 'rgba(31, 143, 106, 0.18)',
  },
  semantic: {
    success: '#18a058',
    successSubtle: 'rgba(24, 160, 88, 0.12)',
    warning: '#f0a020',
    warningSubtle: 'rgba(240, 160, 32, 0.12)',
    error: '#d03050',
    errorSubtle: 'rgba(208, 48, 80, 0.12)',
    info: '#2080f0',
    infoSubtle: 'rgba(32, 128, 240, 0.12)',
  },
  risk: {
    low: '#18a058',
    lowSubtle: 'rgba(24, 160, 88, 0.12)',
    medium: '#f0a020',
    mediumSubtle: 'rgba(240, 160, 32, 0.12)',
    high: '#f56c6c',
    highSubtle: 'rgba(245, 108, 108, 0.12)',
    urgent: '#d03050',
    urgentSubtle: 'rgba(208, 48, 80, 0.15)',
  },
  text: {
    primary: '#18352b',
    secondary: '#537065',
    tertiary: '#658177',
    muted: '#6d877e',
    quaternary: '#698278',
    disabled: '#a8bdb4',
    inverse: '#ffffff',
  },
  background: {
    base: '#f4f7f1',
    elevated: '#ffffff',
    subtle: '#f8faf7',
    muted: '#eef4ec',
    accent: '#f3f8f4',
    warm: '#f8f6f0',
    overlay: 'rgba(255, 255, 255, 0.88)',
  },
  border: {
    default: '#dce8e1',
    subtle: '#e8f0eb',
    strong: '#b8cfc3',
  },
} as const

export const radius = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '18px',
  xl: '24px',
  '2xl': '32px',
  full: '9999px',
  button: '10px',
  card: '18px',
  input: '12px',
  sidebarBadge: '14px',
} as const

export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  pageX: '24px',
  pageY: '24px',
  section: '20px',
  cardPadding: '32px',
  formGap: '16px',
} as const

export const typography = {
  fontFamily: {
    base: "'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    mono: "'Cascadia Code', 'Consolas', 'Courier New', monospace",
  },
  fontSize: {
    xs: '12px',
    sm: '13px',
    base: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '28px',
    '3xl': '34px',
    '4xl': '44px',
    display: '72px',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const

export const shadows = {
  xs: '0 1px 2px rgba(29, 52, 45, 0.08)',
  sm: '0 4px 12px rgba(29, 52, 45, 0.08)',
  md: '0 8px 24px rgba(29, 52, 45, 0.08)',
  lg: '0 12px 30px rgba(29, 52, 45, 0.08)',
  xl: '0 18px 44px rgba(31, 53, 43, 0.12)',
  card: '0 12px 30px rgba(29, 52, 45, 0.08)',
  modal: '0 20px 50px rgba(29, 52, 45, 0.15)',
} as const

export const layout = {
  sidebarWidth: 240,
  sidebarCollapsedWidth: 64,
  headerHeight: 72,
  contentMaxWidth: 1440,
  loginCardWidth: 420,
} as const

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
  loading: 1800,
} as const

export const motion = {
  duration: {
    instant: 80,
    fast: 150,
    normal: 250,
    slow: 400,
    slower: 600,
  },
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const

/** ECharts / 统计图表色板 */
export const chartPalette = [
  colors.primary.DEFAULT,
  colors.semantic.info,
  colors.semantic.warning,
  colors.semantic.error,
  '#8b5cf6',
  '#06b6d4',
] as const

/** Naive UI themeOverrides 配置 */
export const naiveThemeOverrides = {
  common: {
    primaryColor: colors.primary.DEFAULT,
    primaryColorHover: colors.primary.hover,
    primaryColorPressed: colors.primary.pressed,
    borderRadius: radius.md,
    bodyColor: colors.background.base,
  },
  Card: {
    borderRadius: radius.card,
  },
  Button: {
    borderRadiusMedium: radius.button,
  },
} as const

/** 将 CSS 变量名转为可在样式中使用的 var() 字符串 */
export function cssVar(name: string, fallback?: string): string {
  return fallback ? `var(--${name}, ${fallback})` : `var(--${name})`
}

export type DesignColors = typeof colors
export type ChartPalette = typeof chartPalette
