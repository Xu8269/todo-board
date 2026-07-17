# Prompt Log

> 说明：每条记录包含用户提问(Prompt) → AI 回答的关键输出(代码块)，并标注对应功能和文件路径。

---

## Prompt 1: 项目创建

**对应功能：** 项目初始化
**涉及文件：** Next.js 项目脚手架、package.json

```
Prompt: 我要完成以上项目我自己单独完成你只需一步一步把那一步的具体步骤和详细代码发给我就好了
```

AI 输出了完整的实施方案（4 阶段 13 步），包含文件结构、Git 提交节点、MongoDB 配置说明。

```bash
npx create-next-app@latest .
# 选项: TypeScript Yes, ESLint Yes, TailwindCSS Yes, No src, App Router Yes
npm install mongoose
```

---

## Prompt 2: 数据库连接 + 任务模型

**对应功能：** 后端持久层
**涉及文件：** `app/lib/mongodb.ts`、`app/lib/Task.ts`

```
Prompt: 下一步
```

**AI 输出（mongodb.ts）：**
```typescript
import mongoose from "mongoose";
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI!);
};
export default connectDB;
```

**AI 输出（Task.ts）：**
```typescript
export type TaskStatus = "todo" | "doing" | "done";
export type Priority = "normal" | "important" | "urgent";
// + Mongoose Schema with title/content/status/priority/deadline/createdAt
```

---

## Prompt 3: 三个 API 路由

**对应功能：** 后端 CRUD 接口
**涉及文件：** `app/api/tasks/route.ts`、`app/api/tasks/[id]/route.ts`、`app/api/stats/route.ts`

```
Prompt: 步骤6的API代码
```

AI 输出了 3 个路由文件，共 6 个端点：
| 端点 | 功能 |
|------|------|
| GET /api/tasks | 查询全部任务（按优先级→截止日期排序） |
| POST /api/tasks | 新建（校验标题非空） |
| GET /api/tasks/[id] | 查询单个 |
| PATCH /api/tasks/[id] | 更新状态/优先级/内容 |
| DELETE /api/tasks/[id] | 删除 |
| GET /api/stats | 返回 {total, todo, doing, done} |

所有接口统一返回 `{code: 200, data: xxx}` 或 `{code: 400, msg: "xxx"}`。

---

## Prompt 4: 前端组件（Header + AddTaskForm）

**对应功能：** 导航栏 + 新建任务表单
**涉及文件：** `app/components/Header.tsx`、`app/components/AddTaskForm.tsx`

```
Prompt: 步骤8和9
```

**AI 输出（Header.tsx）：**
```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
// 根据 pathname 高亮当前路由，三个导航链接：仪表盘/任务看板/新建任务
```

**AI 输出（AddTaskForm.tsx）：**
```tsx
// 表单字段：标题(必填)、详情(textarea)、优先级(select)、截止日期(date)
// 提交：fetch POST /api/tasks → 成功后 router.push("/tasks")
// 按钮 loading 状态
```

---

## Prompt 5: TaskCard + TaskBoard 组件

**对应功能：** 三栏看板 + 任务卡片
**涉及文件：** `app/components/TaskCard.tsx`、`app/components/TaskBoard.tsx`

```
Prompt: 步骤10和11
```

AI 输出了两个核心组件：
- **TaskCard**：展示标题/内容/优先级/截止日期、状态切换按钮、删除按钮、逾期标红
- **TaskBoard**：三栏 grid-cols-3 布局，按 status 筛选，列头显示计数

---

## Prompt 6: 仪表盘 + 文件夹 + Layout

**对应功能：** 首页统计 + 全局布局
**涉及文件：** `app/page.tsx`、`app/layout.tsx`

```
Prompt: 步骤12到15
```

AI 输出仪表盘页面（4 个统计卡片 + 空态提示）和全局布局（挂载 Header 导航栏）。

---

## Prompt 7: 修复看板刷新问题

**对应功能：** Server Action 数据刷新
**涉及文件：** `app/tasks/page.tsx`

```
Prompt: 状态切换的时候必须刷新才能切换，能不能点了就切换
```

**AI 输出：**
```typescript
async function refreshTasks() {
  "use server";
  revalidatePath("/tasks");
}
```
在 `refreshTasks` 中增加 `revalidatePath`，点击后自动刷新数据。

---

## Prompt 8: 编辑任务弹窗

**对应功能：** 任务编辑功能
**涉及文件：** `app/components/EditTaskModal.tsx`、`app/components/TaskCard.tsx`

```
Prompt: 编辑任务该怎么做
```

AI 输出了 EditTaskModal 组件（弹窗表单，预填当前数据，PATCH 接口保存）并修改 TaskCard 增加"编辑"按钮。

---

## Prompt 9: 逾期标红

**对应功能：** 逾期检测 + 视觉提示
**涉及文件：** `app/components/TaskCard.tsx`

```
Prompt: 逾期标红
```

AI 在 TaskCard 中添加 `isOverdue` 函数和过期样式（红色背景/徽章/边框）。后续优化：今天截止不算逾期，左边条保持优先级颜色。

---

## Prompt 10: 一键清理已完成

**对应功能：** 批量清除
**涉及文件：** `app/api/tasks/clear-done/route.ts`、`app/components/ClearDoneButton.tsx`

```
Prompt: 一键清理已完成
```

**AI 输出（API）：**
```typescript
export async function DELETE() {
  await connectDB();
  const result = await Task.deleteMany({ status: "done" });
  return NextResponse.json({ code: 200, msg: `已清除 ${result.deletedCount} 个已完成任务` });
}
```

**AI 输出（按钮）：**
在仪表盘标题右侧添加红色"一键清理已完成"按钮，调用 DELETE /api/tasks/clear-done，确认弹窗保护。

---

## Prompt 11: 摸鱼鱼缸（初版）

**对应功能：** 仪表盘互动动画
**涉及文件：** `app/components/FishTank.tsx`

```
Prompt: 能不能在仪表盘页加一个养鱼的功能
```

AI 输出了 Canvas 鱼缸组件，6 条彩色鱼自动游动，鼠标移动引鱼，点击喂食。

---

## Prompt 12: 鱼缸优化（画鱼→投放→喂养）

**对应功能：** 手绘鱼 + 定向投放
**涉及文件：** `app/components/FishTank.tsx`

```
Prompt: 我想让鱼由用户自己在页面上绘制然后命名投放到浴缸中
```

AI 重构 FishTank：加入绘制面板（画布 + 颜色/笔刷）→ 命名 → 投放鱼缸。最多 3 条，初始为空缸。鱼的数据持久化到 MongoDB。

---

## Prompt 13: 深色模式切换

**对应功能：** 深色/亮色切换
**涉及文件：** `app/lib/ThemeContext.tsx`、`app/globals.css`、`app/layout.tsx`、`app/components/Header.tsx`

```
Prompt: 切换深色模式
```

AI 输出：
- ThemeContext：createContext + Provider，localStorage 持久化
- globals.css：CSS 变量 `--bg-page`、`--text-primary` 等 + `[data-theme="dark"]`
- layout.tsx：包裹 ThemeProvider
- Header.tsx：切换按钮 ☀️/🌙

后续修复了多个组件的 hydratioin 错误（TaskBoard、TaskCard、Calendar、FishTank）。

---

## Prompt 14: 添加 try-catch 错误处理

**对应功能：** 后端健壮性
**涉及文件：** 全部 6 个 API 路由文件

```
Prompt: 要怎么加（健壮性）
```

AI 输出：给全部 API 路由（tasks、tasks/[id]、clear-done、stats、fish、fish/[id]）的外层包裹 try-catch，统一错误格式 `{code:500, msg:"服务器错误"}` + 服务端 `console.error` 日志。

---

## Prompt 15: 日历视图

**对应功能：** 仪表盘日历
**涉及文件：** `app/components/Calendar.tsx`、`app/page.tsx`

```
Prompt: 日历视图：在仪表盘左上位置放置一个日历，有任务截止的日期标黄
```

AI 输出 Calendar 组件：月份切换、今日高亮、截止日期标黄。page.tsx 中查询 deadline 不为空的任务，提取日期传入 Calendar。

---

## Prompt 16: 文档 + 代码审查

**对应功能：** 项目文档 + 质量检查
**涉及文件：** `API.md`、`README.md`、`prompt_log.md`

```
Prompt: 进行一次 Code Review，并给出一份报告
```

AI 输出了完整的 Code Review 报告（7 个发现项，0 严重问题），并生成了 API.md（11 个接口说明）、README.md（项目介绍+技术栈+运行指南+API 文档）、prompt_log.md（开发记录）。

## 阶段1：项目初始化
- 创建 Next.js 项目 + 安装 Mongoose
- 配置 MongoDB 连接（无密码版）
- 初始化 Git 并推送到 GitHub

## 阶段2：后端 API
- 数据库连接 + Task 模型
- 三个 API 路由：/api/tasks /api/tasks/[id] /api/stats
- 排序：按优先级→截止日期

## 阶段3：前端组件
- Header 导航栏
- AddTaskForm 新建任务表单
- TaskCard 任务卡片 + TaskBoard 三栏看板
- 仪表盘 + 鱼缸

## 阶段4：功能增强
- 编辑任务弹窗
- 逾期标红
- 确认删除弹窗
- 一键清理已完成
- 排序优先级+截止日期

## 阶段5：摸鱼系统
- Canvas 鱼缸动画
- 画鱼→命名投放→喂食长大
- 鱼数据保存到 MongoDB
- 最多 3 条，所画即所得

## 阶段6：深色模式
- ThemeContext 全局主题管理
- 所有组件适配深色
- localStorage 持久化
- 修复 hydration 错误

## 阶段7：健壮性
- 所有 API 加 try-catch
- 返回统一错误格式 { code, msg }
- 前端错误提示

## 阶段8：文档完善
- API.md 接口文档
- README.md 项目说明
- prompt_log.md 开发记录
