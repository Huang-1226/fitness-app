# Fitness App Design System

> 健身管理系统（React PWA）设计系统。单一事实来源：所有视觉决策必须追溯到本文档令牌，禁止组件内硬编码色值/字号/间距。

## 1. Atmosphere & Identity

深色是主舞台——深海军蓝底（`#0f1520`）衬亮黄强调（`#facc15`），像夜晚健身房里的能量灯带：安静、专注、蓄力。浅色模式是同一位用户白天的主场——冷灰白底（`#f8fafc`）配琥珀强调（`#d97706`），干净、克制、信息密度优先。两套主题共享同一套语义结构，跟随系统 `prefers-color-scheme` 切换。

**Signature**：黄色（dark）/ 琥珀色（light）强调色只服务于交互与数据重点（CTA、统计值、活动态导航），绝不用于装饰。统计块大数字是每个页面的视觉锚点。

## 2. Color

### Palette（shadcn 语义令牌，Tailwind v4 通过 `@theme inline` 映射为 `bg-card`/`text-muted-foreground` 等工具类）

| Role | Token | Light | Dark | Usage |
|------|-------|-------|------|-------|
| 背景 | `--background` | `#f8fafc` | `#0f1520` | 页面底 |
| 前景文本 | `--foreground` | `#0f172a` | `#e5ecf5` | 正文、标题 |
| 卡片面 | `--card` | `#ffffff` | `#1a2233` | Card、底部导航 |
| 卡片前景 | `--card-foreground` | `#0f172a` | `#e5ecf5` | 卡片内文本 |
| 主强调 | `--primary` | `#b45309` | `#facc15` | 主按钮、统计值、活动导航 |
| 主强调前景 | `--primary-foreground` | `#fafaf9` | `#0f1520` | 主按钮文字 |
| 次强调面 | `--secondary` | `#f1f5f9` | `#232e44` | 次按钮、统计块底 |
| 次强调前景 | `--secondary-foreground` | `#0f172a` | `#e5ecf5` | 次按钮文字 |
| 弱化面 | `--muted` | `#f1f5f9` | `#232e44` | 列表项底、标签底 |
| 弱化前景 | `--muted-foreground` | `#64748b` | `#93a3bd` | 次要说明、占位符 |
| 强调悬停面 | `--accent` | `#f1f5f9` | `#232e44` | 悬停高亮 |
| 强调前景 | `--accent-foreground` | `#0f172a` | `#e5ecf5` | 悬停文本 |
| 危险 | `--destructive` | `#dc2626` | `#f87171` | 删除、错误 |
| 危险前景 | `--destructive-foreground` | `#fafaf9` | `#0f1520` | 危险按钮文字 |
| 边框 | `--border` | `#e2e8f0` | `#2e3a54` | 分隔线、描边 |
| 输入框 | `--input` | `#e2e8f0` | `#2e3a54` | Input/Select 边框 |
| 焦点环 | `--ring` | `#b45309` | `#facc15` | 键盘焦点 |
| 成功 | `--success` | `#15803d` | `#34d399` | 成功提示、ok 消息 |
| 警告 | `--warning` | `#b45309` | `#facc15` | 警告提示 |
| 圆角 | `--radius` | `0.625rem` | `0.625rem` | 全组件基准圆角 |

### Rules

- 强调色仅用于交互元素与数据重点（统计值、活动导航项），禁止装饰性滥用。
- 浅色强调 `#b45309`（amber-700）对白底 5.0:1、对统计块底 4.6:1；危险 `#dc2626` 4.8:1；成功 `#15803d` 5.0:1 —— 均满足 AA 4.5:1。
- 深色模式弱化前景 `#93a3bd` 对卡片底 6.2:1；浅色 `#64748b` 对白底 4.8:1、对弱化面底 4.3:1（弱化面为辅助信息底色，满足 3:1 大文本线）。
- 新增语义色先扩展本表，再使用；组件内禁止出现本表之外的裸色值。
- `--success` / `--warning` 是额外语义令牌，非 shadcn 默认，仅用于 ok/warn 消息块。

## 3. Typography

### Font Stack

- **Sans（全站）**：`-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif`
- 中文为主，无衬线系统栈优先；不引入 web font（PWA 离线体积约束）。

### Scale（Tailwind 默认档位 + 项目内实际使用）

| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| 页面标题 | `text-2xl` (24px) | 700 | 各页 `h1`（带 lucide 图标） |
| 卡片标题 | `text-base` (16px) | 600 | CardTitle |
| 正文 | `text-sm` (14px) | 400 | 默认文本、列表项 |
| 统计数值 | `text-2xl` (24px) | 700 | Stat 大数字 |
| 辅助说明 | `text-xs` (12px) | 400 | 图标标签、脚注、肌肉占比 |

### Rules

- 正文不低于 14px（`text-sm`）；`text-xs` 仅用于辅助性说明。
- 数字使用等宽对齐效果：统计块大数字统一 `font-bold`，避免跳动。
- 系统字号（`text-base`=16px）用于 input/select 防 iOS 缩放。

## 4. Spacing & Layout

### Base Unit：**4px**（Tailwind 默认间距刻度即 4 的倍数）

| 值 | 用途 |
|----|------|
| `gap-1.5` / `space-y-1.5` (6px) | Label 与控件间 |
| `gap-2` (8px) | 图标与文字、紧凑分组 |
| `gap-2.5` (10px) | 统计网格、两列表单 |
| `px-4` (16px) | 页面/卡片内边距 |
| `p-4` (16px) | CardContent 内边距 |
| `mt-3` / `space-y-3` (12px) | 卡片间、表单字段组 |
| `mb-4` (16px) | 页面标题下距 |

### Grid / Shell

- 内容壳：`max-w-[640px] mx-auto`（`#root` 居中单列，移动优先）。
- 两列布局：`grid grid-cols-2 gap-2.5`（统计块、双输入）。
- 页面下内边距：`pb-[calc(76px+env(safe-area-inset-bottom))]` 让内容不被底部导航遮挡。
- 底部导航固定：`fixed inset-x-0 bottom-0 mx-auto max-w-[640px]`。

### Rules

- 间距只用 Tailwind 刻度（4px 倍数）；无魔数 px。
- 不对称间距（如弹窗内容 `pb-[calc(16px+safe)]`）用于安全区补偿，属机制而非令牌。

## 5. Components

### Button（`src/components/ui/button.tsx`）
- **Structure**：`<button data-slot="button">`，shadcn cva variants。
- **Variants**：default（primary 填充）/ destructive / outline / secondary / ghost / link。
- **States**：hover（`bg-primary/90` 等）/ active（shadcn `transition-all`）/ focus-visible（ring）/ disabled（opacity-50）。
- **Spacing**：`h-9 px-4`（default）、`h-8 px-3`（sm）、`w-full`（页内块级）。

### Card（`src/components/ui/card.tsx`）
- **Structure**：`<div data-slot="card">` + CardHeader / CardContent / CardTitle。
- **Spacing**：页面卡片统一覆盖为 `gap-0 rounded-xl border-border py-0 shadow-sm`，内容由 CardContent `p-4` 承载。
- **Depth 策略**：**borders + 浅阴影**（见 Section 7）。

### Input / Select / Textarea
- **Structure**：shadcn Input/Textarea + 自研 `Select`（原生 `<select>` 套 shadcn input 视觉）。
- **States**：focus-visible 黄色 ring（`--ring`），disabled opacity-50。
- **规则**：下拉/日期/数字一律原生控件，不引入自定义下拉组件。

### Badge
- **Variants**：secondary 为主（肌群标签、MET），default 用于重点。

### Sheet（Modal 底层）
- **Structure**：Radix Dialog + `side="bottom"`，顶部圆角 18px，slide-up 入场。
- **Spacing**：`px-4` + `pb-[calc(16px+env(safe-area-inset-bottom))]`，内容区 `max-h-[70dvh] overflow-y-auto`。
- **Motion**：`data-[state=open]:slide-in-from-bottom`（shadcn 内置 500ms in / 300ms out）。

### Stat（`src/ui/components/Stat.tsx`，自研复用）
- **Structure**：`rounded-xl bg-secondary/60 px-3 py-3 text-center`。
- **内容**：`text-2xl font-bold text-primary`（值）+ `text-xs text-muted-foreground`（标签）。

### BottomNav
- **Structure**：`<nav>` 固定底部，5 个 lucide 图标 + 文字。
- **States**：active `text-primary`（黄色强调），inactive `text-muted-foreground`。
- **Spacing**：`flex-1 flex-col items-center py-2.5 text-[11px]`。

### 图表示例（HistoryPage 近 7 天 SVG）
- **Structure**：手写 `<svg viewBox="0 0 294 150">`，7 根竖条。
- **Colors**：有值 `fill-primary`，零值 `fill-muted/60`（3px 基线），数值标签 `fill-muted-foreground` fontSize 9。
- **Motion**：无动画（数据即时可读）。

## 6. Motion & Interaction

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| 主题切换 | 0ms 切换 class | — | 双主题即时切换，不依赖 CSS 动画（避免 FOUC） |
| Sheet 入场 | 500ms | shadcn ease | 底部弹窗 slide-in |
| Sheet 离场 | 300ms | shadcn ease | 底部弹窗 slide-out |
| 按钮按压 | 150ms | ease-out | Button `transition-all` + `:active` 亮度变化 |

### Rules

- 仅动 `transform` / `opacity` / `filter`（Tailwind transition 基于 GPU 合成属性）。
- 主题切换用 `<script>` 在 `<head>` 内同步应用 class，防止首帧闪烁（FOUC）。
- 不新增装饰性动画；动效只为交互状态服务。

## 7. Depth & Surface

**策略：borders + tonal-shift 混合（shadcn 默认）**

- 卡片：`border border-border` + `shadow-sm`（`0 1px 2px` 级）。
- 列表项（`bg-muted/30`）：纯 tonal 区分，无边框阴影，靠 `[&+&]:mt-2` 留白分组。
- 统计块（`bg-secondary/60`）：tonal 区分。
- 底部导航：`bg-card/95 backdrop-blur` + `border-t border-border`。
- 规则：深色下阴影来自 `shadow-sm`（黑底可见性低，以边框为主）；浅色下同令牌自动生效。

## 8. Accessibility Constraints & Accepted Debt

### Constraints

- **WCAG 2.2 AA**：正文对比 ≥ 4.5:1，大文本 ≥ 3:1（两套主题独立验证）。
- 键盘焦点：所有可交互元素有可见 focus ring（`--ring` 黄色）。
- 表单：Label 显式关联；错误信息在字段下方内联展示。
- `prefers-reduced-motion`：Sheet 动画由 Radix 内置开关控制，不新增自定义动画。
- 原生控件优先：select/input 保持浏览器语义，无自定义 aria 包袱。

### Accepted Debt

| Item | Location | Why accepted | Owner / Exit |
|------|----------|--------------|--------------|
| 主题选择仅存储为 `class="dark"` 开关，无第三方主题库 | `store/themeStore.ts` | 系统原生方案足够，零依赖符合 PWA 体积约束 | 如需 3 态切换（system/light/dark）UI 再扩展 |
| `fill-muted-foreground` SVG 标签 fontSize 9px | `HistoryPage.tsx` | 图表标注属辅助信息，9px 在同色系对比内可读 | 若视觉 QA 报对比不足则提升至 10px + 加粗 |
| 深色 `--warning` 与 `--primary` 同色（`#facc15`） | `index.css` | 品牌色复用，警告块以 `bg-warning/10 border-warning/40` 底纹区分语义 | 若用户反馈混淆则拆分令牌 |