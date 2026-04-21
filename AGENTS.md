# UI 设计指南

> **设计类型**: App 设计（应用架构设计）
> **确认检查**: 本指南适用于可交互的应用/网站/工具。

> ℹ️ Section 1-2 为设计意图与决策上下文。Code agent 实现时以 Section 3 及之后的具体参数为准。

## 1. Design Archetype (设计原型)

### 1.1 内容理解

- **目标用户**: CNC加工从业者、机械加工工程师、学徒学习者、工艺师，需要在工作场景快速查询知识和计算参数
- **核心目的**: 提供系统化CNC知识查询、加工参数计算和AI辅助能力，帮助加工人员提升工作效率、降低学习门槛
- **期望情绪**: 专业可靠、高效便捷、清晰易读
- **需避免的感受**: 杂乱无章、华而不实、信息过载、阅读困难

### 1.2 设计语言

- **Aesthetic Direction**: 扁平化科技风格，专业简洁清晰，以内容易读性为核心，兼顾功能完整性和视觉舒适度
- **Visual Signature**: 
  1. 顶栏固定标签页导航，提供快速切换功能模块
  2. 卡片式内容布局，圆角8px统一形态
  3. 阿里云风格科技蓝主色调，专业信任感
  4. 清晰信息层级，强调数据可读性
  5. 全响应式适配，支持PC车间现场和移动端查阅
- **Emotional Tone**: 专业可靠 - 面向工业领域，配色沉稳，信息层级清晰，让用户产生信任感；高效便捷 - 功能入口直观，减少点击次数，支持快速检索
- **Design Style**: 扁平化科技风格 — 用户明确指定，阿里云科技感工具界面，主色#165DFF，扁平化卡片式设计，符合专业工具定位
- **Application Type**: Tool - 多标签页工具类应用，面向CNC加工从业者的专业知识工具助手

## 2. Design Principles (设计理念)

1. **内容优先**: 知识展示以可读性为第一目标，保持足够行高和留白，避免装饰元素干扰阅读
2. **专业可信**: 采用沉稳科技蓝主色调，清晰的信息层级，传递工业工具的专业可靠感
3. **高效便捷**: 功能入口直观可见，标签页设计支持快速切换，减少用户操作路径
4. **响应适应**: 全响应式适配PC和移动端，满足车间现场查阅需求，触摸区域足够大
5. **一致性**: 统一的圆角、间距、色彩规范，让用户形成稳定交互预期

## 3. Color System (色彩系统)

> 基于内容理解推导配色方案，确保整体协调。

**配色设计理由**：用户已指定主色#165DFF，这是阿里云标准科技蓝，能够建立专业可靠的信任感，辅助色#36BFFA提供交互高亮，背景#F5F7FA提供柔和阅读环境，符合扁平化科技风格定位。

### 3.1 主题颜色

> **Color Token 语义速查（供 code agent 参考）**:
> - `primary` → 主行动：按钮填充、激活态高亮、关键操作 CTA
> - `accent` → 状态反馈：Ghost/Outline 按钮 hover、DropdownMenu focus、Toggle 激活、Skeleton 占位背景
> - `muted` → 静态非交互：禁用态背景、次级说明背景、占位文字色（`text-muted-foreground`）
> - **选择原则**：用户"可以点击" → primary；交互"正在发生" → accent；内容"不可操作" → muted

| 角色               | CSS 变量               | Tailwind Class            | HSL 值                    
| ------------------ | ---------------------- | ------------------------- | --------------------------
| bg                 | `--background`         | `bg-background`           | hsl(220 27% 96%)
| card               | `--card`               | `bg-card`                 | hsl(0 0% 100%)
| text               | `--foreground`         | `text-foreground`         | hsl(220 20% 14%)
| textMuted          | `--muted-foreground`   | `text-muted-foreground`   | hsl(220 10% 40%)
| primary            | `--primary`            | `bg-primary`              | hsl(213 94% 45%)
| primary-foreground | `--primary-foreground` | `text-primary-foreground` | hsl(0 0% 100%)
| accent             | `--accent`             | `bg-accent`               | hsl(213 94% 96%)
| accent-foreground  | `--accent-foreground`  | `text-accent-foreground`  | hsl(213 94% 45%)
| border             | `--border`             | `border-border`           | hsl(220 13% 91%)

### 3.3 Topbar/Header 设计策略（仅当使用顶部导航时定义）

> **定义时机**：仅当 Navigation Type 为 Topbar / Fixed Top / Sticky Top 时，必须定义此章节
> **设计原则**：顶部导航使用主配色系统，不需要独立的 CSS 变量。说明如何应用现有颜色角色。

**背景策略**：
- 使用 `bg-card` 白色背景，底部添加 `border-border` 细线分隔，与背景色区分开
- 顶栏固定在页面顶部，不使用模糊透明效果，确保工业场景下清晰度

**文字与图标**：
- 默认态：使用 `text-foreground` 主文字色
- 激活态：使用 `text-primary` 蓝色 + 底部蓝色下划线标识当前激活标签
- Hover 态：使用 `bg-accent` 浅蓝色背景作为高亮

**边框与分隔**：
- 底部使用 `border-border` 1px 细线分隔导航栏与内容区
- 保持简洁，不使用阴影

### 3.4 语义颜色（可选）

| 用途        | CSS 变量         | HSL 值                  |
| ----------- | ---------------- | ----------------------- |
| success     | `--success`      | hsl(140 76% 36%)       |
| success-foreground | `--success-foreground` | hsl(0 0% 100%) |
| warning     | `--warning`      | hsl(38 92% 50%)        |
| warning-foreground | `--warning-foreground` | hsl(220 20% 14%) |
| error       | `--error`        | hsl(0 84% 60%)         |
| error-foreground | `--error-foreground` | hsl(0 0% 100%) |
| info        | `--info`         | hsl(196 100% 55%)      |
| info-foreground | `--info-foreground` | hsl(0 0% 100%) |

## 4. Typography (字体排版)

- **Heading**: 思源黑体 (Source Han Sans CN) → 回退: `system-ui, -apple-system, sans-serif`
- **Body**: 思源黑体 (Source Han Sans CN) → 回退: `system-ui, -apple-system, sans-serif`
- **Code**: JetBrains Mono → 回退: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
- **字体导入**: 使用系统字体栈，无需引入外部资源

**排版层级规范**：

| 类型        | 字号        | 字重      | 行高    |
| ----------- | ----------- | --------- | ------- |
| 页面标题    | text-3xl    | font-bold | 1.4     |
| 区块标题    | text-xl     | font-semibold | 1.5 |
| 卡片标题    | text-lg     | font-semibold | 1.5 |
| 正文        | text-base   | font-normal | 1.6 (16px行间距) |
| 辅助文字    | text-sm     | font-normal | 1.5 |
| 小字/注释   | text-xs     | font-normal | 1.4 |

## 5. Layout Strategy (布局策略)

### 5.1 结构方向

**导航策略**：顶部固定标签页导航
- 用户明确要求顶栏标签页布局，所有功能模块通过顶部标签切换
- 采用粘性顶部导航，滚动时保持可见，方便用户快速切换功能
- 桌面端显示完整标签，移动端折叠为可展开菜单

**页面架构特征**：
- 工具类应用，功能模块清晰划分，每个标签页对应一个功能模块
- 内容区采用卡片式布局，模块间距20px，保持信息区块独立性
- 知识库详情保持合理阅读宽度(max-w-4xl)，提升内容可读性
- 计算器采用左右分栏（桌面端），输入区与结果区清晰划分

### 5.2 响应式原则

**断点策略**：
- 桌面端 (>1024px): 显示完整顶部标签导航，多列布局展示内容
- 平板 (768px-1024px): 标签可横向滚动，单列布局
- 移动端 (<768px): 顶部标签折叠为汉堡菜单，单列流式布局

**内容密度**：
- 移动端单列展示所有内容卡片，增大可点击区域至至少48px
- 桌面端根据内容类型使用双列/多卡片网格布局
- 知识库详情在大屏限制阅读宽度，避免行宽过长影响可读性

## 6. Visual Language (视觉语言)

**形态特征**：
- 圆角统一为 8px (`rounded-lg`)，符合用户指定设计规范
- 阴影采用 `shadow-sm`，扁平化风格，轻微阴影区分卡片层次
- 边框使用 `border` 1px 细边框，分隔内容模块
- 模块间距为 20px (`gap-5`)，符合用户指定设计规范

**装饰策略**：
- 极简扁平化科技风格，不使用多余装饰元素
- 仅在首页快捷功能区可使用轻微渐变或几何点缀，不干扰功能
- 所有装饰元素不超过页面的5%，保持内容清晰可读

**动效原则**：
- 标签切换、卡片hover使用快速过渡动画，时长150-200ms
- 所有可交互元素必须有hover/focus状态反馈
- 按钮点击有明确的active反馈，交互干脆利落
- 滚动平滑，避免生硬跳转

**可及性保障**：

- 文字与背景对比度 ≥ 4.5:1（大字号 ≥ 3:1），主文字对比度约12:1，满足WCAG AA标准
- 复杂背景需要遮罩层或文字投影确保可读性，本设计使用浅色背景，无需额外处理
- 交互元素有明确的视觉反馈，按钮hover变暗，标签激活态颜色区分明显
- 语义化颜色标识状态：绿色成功、红色错误、蓝色信息，符合用户认知习惯

**间距规范总结**：

| 场景         | 间距值  | Tailwind  |
| ------------ | ------- | ---------- |
| 模块间距     | 20px    | `gap-5`    |
| 卡片内边距   | 24px    | `p-6`      |
| 段落间距     | 16px    | `space-y-4`|
| 行高（正文） | 16px    | `leading-6` |

**组件状态规范**：

- 主按钮: `bg-primary text-primary-foreground` → hover 降饱和度 10%
- 次要按钮: `bg-accent text-accent-foreground` → hover 加深背景
- 卡片: `bg-card border rounded-lg shadow-sm` → hover 轻微抬升 `shadow`
- 输入框: `border` → focus: `ring-2 ring-primary/20 border-primary`
- 标签激活态: `text-primary border-b-2 border-primary`
- 标签默认态: `text-muted-foreground hover:text-foreground`
- 代码区域: `bg-muted rounded-lg p-4` 使用 JetBrains Mono 等宽字体