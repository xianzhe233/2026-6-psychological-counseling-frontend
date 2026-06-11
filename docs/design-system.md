# 设计系统（Design System）

> PR-1：设计令牌与设计系统基础  
> 分支：`dev-zyt`  
> 类型：前端 UI 美化（无功能变更）

本文档描述心理咨询管理系统前端的视觉设计令牌与使用规范。

---

## 1. 文件结构

| 文件 | 用途 |
|------|------|
| `src/styles/tokens.css` | CSS 自定义属性（设计令牌主文件） |
| `src/constants/design-tokens.ts` | TypeScript 常量，供 Naive UI、ECharts 等 JS 场景 |
| `src/styles/global.css` | 全局 reset、字体、链接、focus、selection |
| `src/styles/theme.css` | 布局壳层（登录、侧栏、顶栏、页头、错误页） |
| `src/App.vue` | 引用 `naiveThemeOverrides` 注入 Naive UI 主题 |

**加载顺序**：`main.ts` → `global.css`（内含 `@import tokens.css`）→ `theme.css`

---

## 2. 品牌色

主色为心理咨询主题绿色，传达安全、治愈、专业感。

| 令牌 | 值 | 用途 |
|------|-----|------|
| `--color-primary` | `#1f8f6a` | 主按钮、链接、强调 |
| `--color-primary-hover` | `#2aa17a` | 悬停态 |
| `--color-primary-pressed` | `#167255` | 按下态 |
| `--color-primary-subtle` | `rgba(31,143,106,0.12)` | 浅色背景、选中高亮 |
| `--color-primary-400` | `#3db28a` | 渐变终点、图表辅色 |

完整色阶：`--color-primary-50` ~ `--color-primary-900`

---

## 3. 语义色

| 类型 | 令牌 | 值 |
|------|------|-----|
| 成功 | `--color-success` | `#18a058` |
| 警告 | `--color-warning` | `#f0a020` |
| 错误 | `--color-error` | `#d03050` |
| 信息 | `--color-info` | `#2080f0` |

每种语义色均有 `-subtle` 浅色背景变体，用于 Alert、Tag、提示条。

---

## 4. 危机等级色

与 `RiskTag.vue` 业务语义对齐，后续 PR 将统一引用。

| 等级 | 令牌 | 色值 |
|------|------|------|
| LOW | `--color-risk-low` | `#18a058` |
| MEDIUM | `--color-risk-medium` | `#f0a020` |
| HIGH | `--color-risk-high` | `#f56c6c` |
| URGENT | `--color-risk-urgent` | `#d03050` |

---

## 5. 文字色

| 令牌 | 用途 |
|------|------|
| `--color-text-primary` | 标题、正文主色 `#18352b` |
| `--color-text-secondary` | 副标题、说明段落 |
| `--color-text-tertiary` | 卡片内次要说明 |
| `--color-text-muted` | 侧栏副标题、顶栏提示 |
| `--color-text-quaternary` | 页头描述 |
| `--color-text-disabled` | 禁用态 |
| `--color-text-inverse` | 深色背景上的白字 |

---

## 6. 背景色

| 令牌 | 用途 |
|------|------|
| `--color-bg-base` | 页面底色 `#f4f7f1` |
| `--color-bg-elevated` | 卡片、浮层 `#ffffff` |
| `--color-bg-overlay` | 顶栏毛玻璃 `rgba(255,255,255,0.88)` |
| `--color-bg-accent` / `--color-bg-muted` / `--color-bg-warm` | 登录页渐变 |

---

## 7. 间距 Scale

| 令牌 | 值 |
|------|-----|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-16` | 64px |

语义别名：`--space-page-x`、`--space-section`、`--space-card-padding`

---

## 8. 字号 Scale

| 令牌 | 值 | 典型场景 |
|------|-----|----------|
| `--font-size-xs` | 12px | 徽章、标签 |
| `--font-size-sm` | 13px | 侧栏副标题 |
| `--font-size-base` | 14px | 正文默认 |
| `--font-size-lg` | 18px | 登录介绍 |
| `--font-size-xl` | 20px | 顶栏标题 |
| `--font-size-2xl` | 28px | 页面标题 |
| `--font-size-4xl` | 44px | 登录大标题 |
| `--font-size-display` | 72px | 404/403 大数字 |

---

## 9. 圆角

| 令牌 | 值 | 用途 |
|------|-----|------|
| `--radius-md` | 12px | 全局默认、输入框 |
| `--radius-button` | 10px | 按钮 |
| `--radius-card` | 18px | 卡片 |
| `--radius-xl` | 24px | 登录卡片 |
| `--radius-full` | 9999px | 胶囊徽章 |

---

## 10. 阴影

| 令牌 | 用途 |
|------|------|
| `--shadow-sm` | 轻微浮起 |
| `--shadow-card` | 卡片、占位页 |
| `--shadow-xl` | 登录卡片 |
| `--shadow-modal` | 弹窗 |

---

## 11. 动效

| 令牌 | 值 |
|------|-----|
| `--duration-fast` | 150ms |
| `--duration-normal` | 250ms |
| `--ease-out` | `cubic-bezier(0,0,0.2,1)` |
| `--transition-color` | 颜色过渡组合 |
| `--transition-normal` | 通用过渡 |

---

## 12. 布局常量

| 令牌 | 值 |
|------|-----|
| `--layout-sidebar-width` | 240px |
| `--layout-header-height` | 72px |
| `--layout-content-max-width` | 1440px |
| `--layout-login-card-width` | 420px |

---

## 13. Z-Index 层级

```
dropdown(1000) → sticky(1100) → fixed(1200) → modal(1400) → toast(1700)
```

完整定义见 `tokens.css` 中 `--z-*` 系列。

---

## 14. 图表色板

TypeScript 导出：`chartPalette`（`design-tokens.ts`）

```ts
import { chartPalette } from '@/constants/design-tokens'
```

CSS 变量：`--chart-color-series-1` ~ `--chart-color-series-6`  
后续 PR-10 统计页美化时将统一引用。

---

## 15. 暗色模式（预留）

`tokens.css` 中已定义 `[data-theme='dark']` 覆盖变量，默认未启用。  
后续 PR 可通过 `useTheme` composable 在 `<html>` 上切换 `data-theme`。

---

## 16. 使用示例

### CSS / Vue scoped

```css
.my-card {
  padding: var(--space-card-padding);
  border-radius: var(--radius-card);
  background: var(--color-bg-elevated);
  box-shadow: var(--shadow-card);
  color: var(--color-text-primary);
}
```

### TypeScript（Naive UI）

```ts
import { colors, naiveThemeOverrides, chartPalette } from '@/constants/design-tokens'
```

### 辅助函数

```ts
import { cssVar } from '@/constants/design-tokens'

const primary = cssVar('color-primary', '#1f8f6a')
// → "var(--color-primary, #1f8f6a)"
```

---

## 17. 维护约定

1. **新增颜色**：先在 `tokens.css` 定义 CSS 变量，再同步到 `design-tokens.ts`
2. **禁止硬编码**：`theme.css`、布局组件中应使用 `var(--*)`；页面级样式后续 PR 逐步迁移
3. **Naive UI**：主题覆盖统一走 `naiveThemeOverrides`，不在 `App.vue` 内联色值
4. **功能不变**：令牌迁移仅替换视觉常量，不改变组件行为与 API 调用

---

## 18. 测试检查清单

- [ ] `npm run dev` 正常启动
- [ ] 登录页渐变、卡片阴影与迁移前一致
- [ ] 侧栏品牌徽章渐变正常
- [ ] 顶栏毛玻璃与标题颜色正常
- [ ] 主色按钮、Tag 仍为绿色主题
- [ ] 各角色页面布局无错位
- [ ] `npm run build` 通过
