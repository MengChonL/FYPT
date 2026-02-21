<<<<<<< HEAD
# Cloudflare Pages 部署指南

本项目已配置为支持 Cloudflare Pages 托管，包括前端 React 应用和后端 API Functions。

## 项目结构

```
source/FYP_Project/
├── package.json          # React 前端依赖
├── vite.config.js        # Vite 构建配置
├── src/                  # React 前端源代码
├── functions/            # Cloudflare Functions (后端 API)
│   ├── api/
│   │   └── [[path]].js   # 动态路由处理器（处理所有 /api/* 请求）
│   └── utils/
│       ├── supabase.js   # Supabase 数据库操作
│       └── deepseek.js   # DeepSeek AI 分析
└── wrangler.toml         # Cloudflare 配置（可选）
```

## 部署步骤

### 1. 准备环境变量

在 Cloudflare Dashboard 中设置以下环境变量：

- `SUPABASE_URL` - Supabase 项目 URL
- `SUPABASE_ANON_KEY` - Supabase 匿名密钥
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase 服务角色密钥（用于管理员操作）
- `DEEPSEEK_API_KEY` - DeepSeek API 密钥（用于 AI 分析）

### 2. 在 Cloudflare Pages 中创建项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** > **Create a project**
3. 连接你的 GitHub 仓库：`MengChonL/FYPT`
4. 配置构建设置：
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `source/FYP_Project`

### 3. 设置环境变量

在项目设置中添加上述环境变量。

### 4. 部署

Cloudflare Pages 会自动：
- 构建 React 前端应用
- 部署 `functions/` 目录中的 Cloudflare Functions
- 所有 `/api/*` 请求会自动路由到 `functions/api/[[path]].js`

## API 路由

所有 API 端点保持不变，现在通过 Cloudflare Functions 处理：

- `GET /api/health` - 健康检查
- `GET /api/phases` - 获取所有阶段
- `GET /api/scenarios` - 获取所有场景
- `GET /api/scenarios/:code` - 获取特定场景
- `GET /api/users/:userId` - 获取用户信息
- `POST /api/users` - 创建用户
- `POST /api/attempts/start` - 开始尝试
- `POST /api/attempts/complete` - 完成尝试
- ... 等等

## 本地开发

### 使用 Wrangler CLI（推荐）

```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 在项目根目录运行
cd source/FYP_Project
wrangler pages dev dist --compatibility-date=2024-01-01
```

### 使用 Vite 开发服务器（仅前端）

```bash
cd source/FYP_Project
npm install
npm run dev
```

注意：使用 Vite 开发服务器时，API 请求需要指向 Cloudflare Functions 或本地后端服务器。

## 注意事项

1. **环境变量**：确保所有必需的环境变量都在 Cloudflare Dashboard 中正确设置
2. **CORS**：Functions 已配置 CORS 头，允许跨域请求
3. **依赖**：确保 `package.json` 包含所有必需的依赖（`@supabase/supabase-js` 和 `openai`）
4. **构建输出**：确保 Vite 构建输出到 `dist` 目录

## 迁移说明

- 原来的 `Back_end/db/index.js` Express 服务器已转换为 Cloudflare Functions
- 所有 API 路由保持不变，前端代码无需修改
- 数据库操作逻辑保持不变，只是适配了 Cloudflare Functions 的环境变量获取方式

=======
# Cloudflare Pages 部署指南

本项目已配置为支持 Cloudflare Pages 托管，包括前端 React 应用和后端 API Functions。

## 项目结构

```
source/FYP_Project/
├── package.json          # React 前端依赖
├── vite.config.js        # Vite 构建配置
├── src/                  # React 前端源代码
├── functions/            # Cloudflare Functions (后端 API)
│   ├── api/
│   │   └── [[path]].js   # 动态路由处理器（处理所有 /api/* 请求）
│   └── utils/
│       ├── supabase.js   # Supabase 数据库操作
│       └── deepseek.js   # DeepSeek AI 分析
└── wrangler.toml         # Cloudflare 配置（可选）
```

## 部署步骤

### 1. 准备环境变量

在 Cloudflare Dashboard 中设置以下环境变量（**Settings** > **Environment variables**）：

| 變數名稱 | 說明 | 取得方式 |
|---------|------|----------|
| `SUPABASE_URL` | Supabase 專案 URL | Supabase Dashboard > Project Settings > API |
| `SUPABASE_ANON_KEY` | Supabase 匿名金鑰 | 同上 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服務角色金鑰 | 同上（需啟用 service_role） |
| `DEEPSEEK_API_KEY` | DeepSeek API 金鑰 | [DeepSeek Platform](https://platform.deepseek.com/) |
| `JWT_SECRET` | Admin 後台 JWT 簽名密鑰 | 自訂字串（至少 32 字元） |

**常見錯誤檢查：**
- 複製時勿多餘空格或換行
- `SUPABASE_URL` 格式應為 `https://xxxxx.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` 必須使用 **service_role**（非 anon key），否則報告生成、用戶建立等會失敗
- `DEEPSEEK_API_KEY` 錯誤時，AI 分析會回傳 fallback 內容，報告會顯示「全部正確」等預設建議

### 2. 在 Cloudflare Pages 中创建项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** > **Create a project**
3. 连接你的 GitHub 仓库：`MengChonL/FYPT`
4. 配置构建设置：
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `source/FYP_Project`

### 3. 设置环境变量

在项目设置中添加上述环境变量。

### 4. 部署

Cloudflare Pages 会自动：
- 构建 React 前端应用
- 部署 `functions/` 目录中的 Cloudflare Functions
- 所有 `/api/*` 请求会自动路由到 `functions/api/[[path]].js`

## API 路由

所有 API 端点保持不变，现在通过 Cloudflare Functions 处理：

- `GET /api/health` - 健康检查
- `GET /api/phases` - 获取所有阶段
- `GET /api/scenarios` - 获取所有场景
- `GET /api/scenarios/:code` - 获取特定场景
- `GET /api/users/:userId` - 获取用户信息
- `POST /api/users` - 创建用户
- `POST /api/attempts/start` - 开始尝试
- `POST /api/attempts/complete` - 完成尝试
- ... 等等

## 本地开发

### 使用 Wrangler CLI（推荐）

```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 在项目根目录运行
cd source/FYP_Project
wrangler pages dev dist --compatibility-date=2024-01-01
```

### 使用 Vite 开发服务器（仅前端）

```bash
cd source/FYP_Project
npm install
npm run dev
```

注意：使用 Vite 开发服务器时，API 请求需要指向 Cloudflare Functions 或本地后端服务器。

## 注意事项

1. **环境变量**：确保所有必需的环境变量都在 Cloudflare Dashboard 中正确设置
2. **CORS**：Functions 已配置 CORS 头，允许跨域请求
3. **依赖**：确保 `package.json` 包含所有必需的依赖（`@supabase/supabase-js` 和 `openai`）
4. **构建输出**：确保 Vite 构建输出到 `dist` 目录

## 迁移说明

- 原来的 `Back_end/db/index.js` Express 服务器已转换为 Cloudflare Functions
- 所有 API 路由保持不变，前端代码无需修改
- 数据库操作逻辑保持不变，只是适配了 Cloudflare Functions 的环境变量获取方式

>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
