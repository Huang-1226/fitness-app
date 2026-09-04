# AGENTS.md

本项目为 React 19 + Vite + TypeScript 的健身 PWA。业务逻辑在 `src/core/`（纯 TS，无 UI），持久化在 `src/db/`（Dexie/IndexedDB），状态在 `src/store/`（Zustand），界面在 `src/ui/`。

## UI 开发约定（强制）

### 1. 组件选型

- **原生浏览器控件优先**：下拉菜单（`<select>`）、日期/数字输入等表单控件**尽可能使用原生 HTML 元素**，通过 Tailwind 类样式化，不引入自定义下拉/选择组件。
- **shadcn/ui 静态组件**：按钮、卡片、输入框、标签、弹窗等**静态样式组件**统一使用 `src/components/ui/` 下的 shadcn 组件（Button、Card、Input、Label、Badge、Sheet 等）。
- **弹窗**：底部弹窗/模态框使用 shadcn 的 `Sheet`（`side="bottom"`）或 `Dialog`，禁止手写遮罩层。

### 2. 图标

- **禁止使用 Emoji 作为 UI 图标**。
- 一律使用 `lucide-react` 图标库（如 `Dumbbell`、`BarChart3`、`ClipboardList`、`Library`、`Home` 等）。
- 装饰性/品牌性 Emoji（如标题前的 🏋️）同样替换为 lucide 图标。

### 3. 样式

- **禁止新增手写全局 CSS**。`src/index.css` 仅保留 Tailwind 入口与设计令牌（CSS 变量），不得再添加业务样式类。
- 页面/组件样式一律使用 **Tailwind 工具类**（`className`），避免内联 `style`。
- 需要复用的视觉模式（如统计块、列表项）优先抽象为小组件或组合 Tailwind 类，不写全局类。

### 4. 设计令牌

- 颜色、圆角、阴影等一律引用 `index.css` 中定义的语义令牌（`--background`、`--foreground`、`--primary`、`--card`、`--muted`、`--border` 等），在 Tailwind 中通过 `bg-card`、`text-muted-foreground`、`border-border` 等工具类使用。
- 禁止在组件里硬编码颜色值。

## 其他约定

- 类型严格：不引入 `any`、`as any`、`@ts-ignore`。
- 业务改动：`src/core/`、`src/db/`、`src/store/` 的公共 API 尽量保持稳定，UI 重构不得改变数据流。