# 登录注册与学习进度数据结构

本文档用于后续接入后端前统一数据模型。当前项目仍保持静态原型，不在本阶段新增后端服务。

## 推荐技术栈

- Runtime：Node.js
- Web 框架：Express
- 数据库：SQLite，当前实现使用 Node 自带 `node:sqlite`
- 密码哈希：bcryptjs
- 会话策略：开发阶段可用 httpOnly session cookie；如果后续前后端分离部署，再评估 token。

## 用户模型

`users`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | integer primary key | 用户 ID |
| `username` | text unique not null | 用户名 |
| `email` | text unique | 邮箱，可选 |
| `password_hash` | text not null | bcrypt 哈希后的密码 |
| `created_at` | text not null | ISO 时间 |
| `updated_at` | text not null | ISO 时间 |

约束：

- 不保存明文密码。
- `username` 是当前前端显示用的主标识。
- 邮箱验证、忘记密码不在第一版实现范围内，除非 PRD 后续明确要求。

## 关卡进度模型

`level_progress`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | integer primary key | 记录 ID |
| `user_id` | integer not null | 关联 `users.id` |
| `level_id` | text not null | 例如 `1-1`、`2-1` |
| `completed` | integer not null default 0 | 是否完成，SQLite 中用 0/1 |
| `best_stars` | integer not null default 0 | 历史最高星级 |
| `best_time_seconds` | integer | 最短完成时间 |
| `used_hint_on_best` | integer not null default 0 | 最佳记录是否使用提示 |
| `completed_at` | text | 最近一次完成时间 |
| `updated_at` | text not null | 最近更新时间 |

唯一约束：

```sql
unique(user_id, level_id)
```

更新规则：

- 新星级高于旧星级时，更新 `best_stars`。
- 新完成时间短于旧时间时，更新 `best_time_seconds`。
- `completed` 一旦为 true，不因重玩失败回退。
- `used_hint_on_best` 应对应最佳成绩；如果只是普通重玩用了提示，不覆盖更好的无提示记录。

## 前端本地进度对象

当前静态版本使用 `localStorage` 中的 `ch_progress`：

```json
{
  "levels": {
    "1-1": {
      "completed": true,
      "stars": 3,
      "bestTime": 90,
      "usedHint": false
    }
  }
}
```

与后端字段映射：

| 前端字段 | 后端字段 |
| --- | --- |
| `levelId` | `level_id` |
| `completed` | `completed` |
| `stars` | `best_stars` |
| `bestTime` | `best_time_seconds` |
| `usedHint` | `used_hint_on_best` |

## API 草案

### 注册

`POST /api/auth/register`

请求：

```json
{
  "username": "luna",
  "email": "luna@example.com",
  "password": "plain password from form"
}
```

响应：

```json
{
  "user": {
    "id": 1,
    "username": "luna",
    "email": "luna@example.com"
  }
}
```

### 登录

`POST /api/auth/login`

请求：

```json
{
  "username": "luna",
  "password": "plain password from form"
}
```

响应：

```json
{
  "user": {
    "id": 1,
    "username": "luna",
    "email": "luna@example.com"
  }
}
```

### 当前用户

`GET /api/me`

响应：

```json
{
  "user": {
    "id": 1,
    "username": "luna",
    "email": "luna@example.com"
  }
}
```

### 获取进度

`GET /api/progress`

响应：

```json
{
  "levels": {
    "1-1": {
      "completed": true,
      "stars": 3,
      "bestTime": 90,
      "usedHint": false
    }
  }
}
```

### 提交关卡结果

`POST /api/progress`

请求：

```json
{
  "levelId": "1-1",
  "stars": 3,
  "elapsed": 90,
  "usedHint": false
}
```

响应：

```json
{
  "levelId": "1-1",
  "completed": true,
  "stars": 3,
  "bestTime": 90,
  "usedHint": false
}
```

## 后续迁移策略

1. 保留 `ProgressStore` 作为前端统一入口。
2. 后端可用时，让 `ProgressStore` 增加 API 版本实现。
3. 登录后首次拉取 `/api/progress`，覆盖或合并本地 `ch_progress`。
4. 未登录时继续允许本地游客进度，避免阻断课堂演示。
