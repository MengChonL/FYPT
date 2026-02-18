# 项目结构说明

## Cloudflare Pages 部署结构

本项目已配置为支持 Cloudflare Pages 托管，结构如下：

```
source/FYP_Project/
├── package.json              # React 前端依赖（包含 @supabase/supabase-js 和 openai）
├── vite.config.js           # Vite 构建配置
├── wrangler.toml            # Cloudflare 配置（可选）
├── src/                     # React 前端源代码
│   ├── api/
│   │   └── index.js        # 前端 API 调用（已配置为支持 Cloudflare）
│   ├── components/         # React 组件
│   ├── pages/              # 页面组件
│   └── ...
├── functions/               # Cloudflare Functions（后端 API）
│   ├── api/
│   │   └── [[path]].js     # 动态路由处理器（处理所有 /api/* 请求）
│   └── utils/
│       ├── supabase.js     # Supabase 数据库操作（适配 Cloudflare）
│       └── deepseek.js    # DeepSeek AI 分析（适配 Cloudflare）
└── dist/                    # 构建输出目录（由 Vite 生成）
```

## 主要变化

### 1. 后端 API 迁移

- **原位置**: `Back_end/db/index.js` (Express 服务器)
- **新位置**: `functions/api/[[path]].js` (Cloudflare Functions)
- **变化**: 
  - Express 路由 → Cloudflare Functions `onRequest` 处理器
  - `req/res` → `Request/Response` 对象
  - `dotenv` → Cloudflare 环境变量 (`env` 参数)

### 2. 工具函数迁移

- **原位置**: `Back_end/db/config/supabase.js` 和 `Back_end/db/config/deepseek.js`
- **新位置**: `functions/utils/supabase.js` 和 `functions/utils/deepseek.js`
- **变化**: 
  - 移除 `dotenv.config()`
  - 所有函数接受 `env` 参数以获取环境变量
  - 初始化函数改为 `initSupabase(env)` 和 `initDeepSeek(env)`

### 3. 前端 API 配置

- **文件**: `src/api/index.js`
- **变化**: 
  - 本地开发: `http://localhost:3001/api`
  - Cloudflare 部署: `/api` (相对路径)

### 4. 依赖更新

- **package.json**: 添加了 `openai` 依赖（用于 DeepSeek AI）

## API 路由映射

所有 API 端点保持不变，现在通过 Cloudflare Functions 处理：

| 原 Express 路由 | Cloudflare Functions 路径 | 说明 |
|----------------|-------------------------|------|
| `GET /api/phases` | `functions/api/[[path]].js` | 获取所有阶段 |
| `GET /api/scenarios` | `functions/api/[[path]].js` | 获取所有场景 |
| `POST /api/users` | `functions/api/[[path]].js` | 创建用户 |
| `POST /api/attempts/start` | `functions/api/[[path]].js` | 开始尝试 |
| ... | ... | 所有其他路由 |

## 环境变量

在 Cloudflare Dashboard 中需要设置：

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DEEPSEEK_API_KEY`

## 部署说明

详见 `CLOUDFLARE_DEPLOY.md`

