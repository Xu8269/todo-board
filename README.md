# TaskPlanner

任务看板系统，支持待办/进行中/已完成三栏管理，附带日历和摸鱼小游戏。

## 技术栈

- Next.js 16 (App Router)
- TypeScript
- TailwindCSS
- Mongoose + MongoDB

## 功能

| 模块 | 功能 |
|------|------|
| 任务管理 | 新建/编辑/删除任务，三栏看板，优先级设置，截止日期 |
| 搜索筛选 | 按优先级排序，逾期自动标红 |
| 一键清理 | 清除所有已完成任务 |
| 仪表盘 | 统计卡片，日历视图（截止日期标黄） |
| 深色模式 | 一键切换，本地存储持久化 |
| 摸鱼 | 手绘鱼→命名投放→喂食长大，数据持久化到数据库 |

## API 接口

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | /api/tasks | 查询全部任务（按优先级→截止日期排序） |
| POST | /api/tasks | 新建任务（标题必填） |
| GET | /api/tasks/[id] | 查询单个任务 |
| PATCH | /api/tasks/[id] | 更新任务（支持 title/content/status/priority/deadline） |
| DELETE | /api/tasks/[id] | 删除任务 |
| DELETE | /api/tasks/clear-done | 一键清除所有已完成任务 |
| GET | /api/stats | 任务统计（total/todo/doing/done） |
| GET | /api/fish | 查询所有鱼 |
| POST | /api/fish | 新建手绘鱼 |
| PATCH | /api/fish/[id] | 更新鱼数据（体重/体长） |
| DELETE | /api/fish/[id] | 删除鱼 |

**返回格式：** `{ code: 200, data: ... }` 成功 / `{ code: 400, msg: "..." }` 参数错误 / `{ code: 500, msg: "服务器错误" }` 异常

## 项目结构

```
todo-board
├── app
│   ├── lib/           # MongoDB连接 + 数据模型
│   ├── api/           # RESTful API 接口
│   │   ├── tasks/     # 任务 CRUD
│   │   ├── stats/     # 统计
│   │   └── fish/      # 鱼相关
│   ├── components/    # 客户端组件
│   │   ├── Header.tsx
│   │   ├── TaskBoard.tsx / TaskCard.tsx
│   │   ├── AddTaskForm.tsx / EditTaskModal.tsx
│   │   ├── Calendar.tsx / FishTank.tsx
│   │   └── ClearDoneButton.tsx
│   ├── page.tsx       # 仪表盘
│   ├── tasks/
│   │   ├── page.tsx   # 看板页
│   │   └── new/page.tsx  # 新建任务页
│   └── layout.tsx
├── API.md             # 接口文档
└── README.md
```

## 本地运行

```bash
# 1. 安装依赖
npm install

# 2. 确保本地 MongoDB 已启动

# 3. 配置环境变量 .env.local
MONGODB_URI="mongodb://localhost:27017/taskDB"

# 4. 启动开发服务器
npm run dev

# 5. 浏览器打开 http://localhost:3000
```

## 前端路由

| 路径 | 页面 |
|------|------|
| `/` | 仪表盘（日历 + 统计 + 鱼缸） |
| `/tasks` | 三栏看板 |
| `/tasks/new` | 新建任务 |

## API 接口（共 11 个）

详见 [API.md](./API.md)

## 健壮性

- 所有 API 使用 try-catch 包裹，异常返回 `{ code: 500, msg: "服务器错误" }`
- 前端 fetch 操作有错误提示
- 删除操作有确认弹窗
- MongoDB 断开不会导致服务崩溃
