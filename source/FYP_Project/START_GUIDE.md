# 项目启动指南

## 📁 项目结构说明

```
source/FYP_Project/
├── 📄 package.json              # 项目依赖配置
├── 📄 vite.config.js           # Vite 构建工具配置
├── 📄 wrangler.toml            # Cloudflare 配置（部署用）
│
├── 📂 src/                      # React 前端源代码
│   ├── api/
│   │   └── index.js            # 前端 API 调用封装
│   ├── components/             # React 组件
│   ├── pages/                  # 页面组件
│   ├── context/                # React Context
│   ├── hooks/                  # 自定义 Hooks
│   └── ...
│
├── 📂 functions/               # Cloudflare Functions（后端 API）
│   ├── api/
│   │   └── [[path]].js         # 动态路由处理器（处理所有 /api/* 请求）
│   └── utils/
│       ├── supabase.js         # Supabase 数据库操作
│       └── deepseek.js         # DeepSeek AI 分析
│
├── 📂 Back_end/                # 旧的后端代码（已迁移到 functions/）
│   ├── db/                     # 数据库相关（已迁移）
│   └── admin/                  # 管理后台（独立项目）
│
└── 📂 dist/                    # 构建输出目录（运行 build 后生成）
```

## 🚀 启动项目

### 方式一：本地开发（仅前端，需要后端 API）

适用于：快速开发前端界面，API 请求指向 Cloudflare 或本地后端服务器

```bash
# 1. 进入项目目录
cd source/FYP_Project

# 2. 安装依赖（首次运行）
npm install

# 3. 启动开发服务器
npm run dev
```

**访问地址**: `http://localhost:5173` (Vite 默认端口)

**注意**: 
- 这种方式只启动前端，API 请求会指向 `http://localhost:3001/api`（开发模式）
- 如果后端未运行，API 调用会失败
- 适合纯前端开发和调试

---

### 方式二：使用 Wrangler 本地开发（前端 + Cloudflare Functions）

适用于：完整测试前端和后端 API（推荐日常开发），模拟 Cloudflare Pages 环境

```bash
# 进入项目目录
cd source/FYP_Project

# 安装依赖
npm install

# 复制环境变量模板并填入真实值
cp .dev.vars.example .dev.vars

# 一键启动（Vite + Functions）
npm run dev
```

**访问地址**: `http://localhost:5173`

**说明**：Functions 默认端口为 `8789`（避免你之前占用 `8788` 造成冲突），Vite 已配置自动把 `/api` 代理到 `http://localhost:8789`。

**环境变量设置**:
在项目根目录创建 `.dev.vars` 文件（不会被提交到 Git）。Wrangler 通过 `--env-file .dev.vars` 读取：

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
DEEPSEEK_API_KEY=your_deepseek_api_key
```

**优点**:
- ✅ 完整模拟 Cloudflare Pages 环境
- ✅ 前端和后端 API 都在本地运行
- ✅ 可以测试所有功能

---

### 方式三：使用旧的 Express 后端（不推荐，仅用于过渡）

如果暂时不想使用 Cloudflare Functions，可以使用旧的后端：

```bash
# 1. 启动后端（在 Back_end/db 目录）
cd Back_end/db
npm install
npm start  # 或 npm run dev

# 2. 启动前端（在 source/FYP_Project 目录）
cd ../../source/FYP_Project
npm install
npm run dev
```

**注意**: 这种方式需要修改 `src/api/index.js` 中的 `API_BASE` 为 `http://localhost:3001/api`

---

## 🌐 部署到 Cloudflare Pages

### 步骤 1: 准备环境变量

在 Cloudflare Dashboard 中设置以下环境变量：

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入你的 Pages 项目
3. 进入 **Settings** > **Environment Variables**
4. 添加以下变量：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `SUPABASE_URL` | Supabase 项目 URL | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase 匿名密钥 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务角色密钥 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | `sk-xxxxx...` |

### 步骤 2: 连接 GitHub 仓库

1. 进入 Cloudflare Dashboard > **Pages**
2. 点击 **Create a project**
3. 选择 **Connect to Git**
4. 选择仓库：`MengChonL/FYPT`
5. 配置构建设置：

```
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: source/FYP_Project
```

### 步骤 3: 部署

Cloudflare 会自动：
- ✅ 检测到 Git 推送
- ✅ 运行 `npm install` 和 `npm run build`
- ✅ 部署 `dist/` 目录作为前端
- ✅ 部署 `functions/` 目录作为后端 API
- ✅ 所有 `/api/*` 请求自动路由到 Functions

---

## 📋 常用命令

```bash
# 开发相关
npm run dev          # 一键启动：Vite 前端 + Wrangler Functions（推荐）
npm run dev:vite     # 只启动前端
npm run dev:cf       # 只启动 Functions（需要 .dev.vars）
npm run dev:dist     # 用 dist 作为静态资源运行（更接近生产）
npm run build        # 构建生产版本
npm run preview      # 预览构建结果
npm run lint         # 代码检查

# Cloudflare 相关
wrangler pages dev public --port 8788 --env-file .dev.vars   # 只启动 Functions（本地）
wrangler pages dev dist --port 8788 --env-file .dev.vars     # 用 dist 本地运行（需要先 build）
wrangler pages deploy dist           # 部署到 Cloudflare Pages
wrangler pages project list          # 查看所有 Pages 项目
```

---

## 🔧 环境变量说明

### 本地开发（.dev.vars）

在 `source/FYP_Project/` 目录创建 `.dev.vars` 文件：

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_key_here
DEEPSEEK_API_KEY=your_deepseek_key_here
```

**注意**: `.dev.vars` 文件已在 `.gitignore` 中，不会被提交到 Git

### Cloudflare Pages

在 Cloudflare Dashboard 中设置环境变量（见上方"部署到 Cloudflare Pages"部分）

---

## 🐛 常见问题

### Q1: 本地开发时 API 请求失败

**原因**: 前端指向 `http://localhost:3001/api`，但后端未运行

**解决方案**:
- 使用 Wrangler 方式启动（方式二）
- 或启动旧的 Express 后端（方式三）
- 或修改 `src/api/index.js` 中的 API_BASE 指向 Cloudflare 部署地址

### Q2: Wrangler 提示找不到环境变量

**解决方案**: 创建 `.dev.vars` 文件（见上方"环境变量说明"）

### Q3: 构建失败

**解决方案**:
```bash
# 清理并重新安装依赖
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Q4: Functions 不工作

**检查清单**:
- ✅ `functions/` 目录存在
- ✅ `functions/api/[[path]].js` 文件存在
- ✅ 环境变量已正确设置
- ✅ 代码语法正确（运行 `npm run lint` 检查）

---

## 📚 相关文档

- `CLOUDFLARE_DEPLOY.md` - 详细的 Cloudflare 部署指南
- `STRUCTURE.md` - 项目结构详细说明
- `README.md` - 项目基本说明

---

## 💡 推荐工作流程

### 日常开发
```bash
# 1. 启动开发服务器
npm run dev

# 2. 在浏览器中打开
# http://localhost:5173

# 3. 代码修改后自动热更新
```

### 测试完整功能
```bash
# 1. 构建前端
npm run build

# 2. 使用 Wrangler 启动（包含 Functions）
wrangler pages dev dist --compatibility-date=2024-01-01

# 3. 在浏览器中打开
# http://localhost:8788
```

### 部署到生产环境
```bash
# 1. 提交代码到 GitHub
git add .
git commit -m "Update"
git push

# 2. Cloudflare 自动部署（如果已配置 CI/CD）
# 或手动部署：
wrangler pages deploy dist
```

