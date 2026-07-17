# TaskPlanner API 接口文档

## 基础信息
- 基础地址：`http://localhost:3000`
- 返回格式：`{ code: number, data?: any, msg?: string }`

---

## 1. 任务相关

### GET /api/tasks
查询全部任务（按优先级→截止日期排序）
```
{
  "code": 200,
  "data": [
    { "_id": "...", "title": "修复登录页Bug", "priority": "urgent", "status": "todo", "deadline": "2026-07-18", "content": "...", "createdAt": "..." }
  ]
}
```

### POST /api/tasks
新建任务
- 请求头: `Content-Type: application/json`
- 请求体: `{ "title": "必填", "content": "", "priority": "normal|important|urgent", "deadline": "2026-07-20" }`
- 校验：title 不能为空

### GET /api/tasks/[id]
查询单个任务
- 任务不存在返回 `{ code: 400, msg: "任务不存在" }`

### PATCH /api/tasks/[id]
更新任务
- 可更新字段: title / content / status / priority / deadline
- 请求体示例: `{ "status": "doing" }`

### DELETE /api/tasks/[id]
删除任务

### DELETE /api/tasks/clear-done
一键清除所有已完成任务
- 返回: `{ code: 200, msg: "已清除 3 个已完成任务" }`

---

## 2. 统计

### GET /api/stats
获取任务数量统计
```
{ "code": 200, "data": { "total": 10, "todo": 6, "doing": 3, "done": 1 } }
```

---

## 3. 鱼相关（摸鱼功能）

### GET /api/fish
查询所有鱼

### POST /api/fish
新建鱼
- 请求体: `{ "name": "鱼名", "drawing": "data:image/png;base64,...", "weight": 10, "size": 40 }`
- 校验：name 和 drawing 不能为空

### PATCH /api/fish/[id]
更新鱼的数据（体重/体长）

### DELETE /api/fish/[id]
删除鱼

---

## 错误码说明

| code | 说明 |
|------|------|
| 200  | 成功 |
| 400  | 参数错误（标题为空、ID不存在等） |
| 500  | 服务器内部错误（被 try-catch 捕获） |

所有异常情况均被 try-catch 捕获，不会导致服务崩溃。
