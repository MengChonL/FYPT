# 🚀 快速启动指南

## 当前情况说明

当你运行 `wrangler pages dev ...` 时：
- ✅ **后端已启动**：Cloudflare Functions 处理所有 `/api/*` 请求
- ✅ **可与前端联动**：推荐通过 `npm run dev` 同时启动 Vite + Functions
- ❌ **环境变量缺失**：需要创建 `.dev.vars` 文件，否则会出现 `Missing Supabase environment variables!`

## 解决步骤

### 1. 创建环境变量文件

```bash
cd source/FYP_Project

# 复制示例文件
cp .dev.vars.example .dev.vars

# 编辑 .dev.vars 文件，填入你的真实环境变量
# 可以使用任何文本编辑器
```

`.dev.vars` 文件内容示例：
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DEEPSEEK_API_KEY=sk-xxxxx...
```

### 2. 统一启动命令（推荐）

现在你可以使用一个命令同时启动前端和后端：

```bash
npm run dev
```

这个命令会：
1. 启动 Vite 前端（HMR，默认 http://localhost:5173）
2. 启动 Wrangler Pages Functions（默认 http://localhost:8789）
3. Vite 会自动把 `/api` 代理到 `http://localhost:8789`

### 3. 或者分步启动

```bash
# 终端 A：启动前端
npm run dev:vite

# 终端 B：启动 Functions
npm run dev:cf
```

## 访问地址

启动成功后：
- **前端界面**: http://localhost:5173
- **API 端点**: http://localhost:8789/api/*
- **前端调用 API**: 直接请求 `/api/*`（由 Vite 代理到 8789）

## 部署到 Cloudflare Pages

### 方式一：通过 GitHub 自动部署（推荐）

1. 推送代码到 GitHub
2. 在 Cloudflare Dashboard 中：
   - 进入 **Pages** > 你的项目
   - 进入 **Settings** > **Environment Variables**
   - 添加所有环境变量（与 `.dev.vars` 中的相同）
3. Cloudflare 会自动部署

### 方式二：手动部署

```bash
# 构建项目
npm run build

# 部署到 Cloudflare
wrangler pages deploy dist
```

## 环境变量说明

| 变量名 | 说明 | 获取方式 |
|--------|------|----------|
| `SUPABASE_URL` | Supabase 项目 URL | Supabase Dashboard > Settings > API |
| `SUPABASE_ANON_KEY` | Supabase 匿名密钥 | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务角色密钥 | Supabase Dashboard > Settings > API |
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | DeepSeek 官网注册获取 |

## 常见问题

### Q: 为什么 API 调用失败？

**A**: 检查以下几点：
1. ✅ `.dev.vars` 文件是否存在
2. ✅ 环境变量是否正确填写
3. ✅ 是否在项目根目录（`source/FYP_Project/`）运行命令

### Q: 可以只启动前端吗？

**A**: 可以，运行 `npm run dev`，但 API 调用会失败（因为没有后端）

### Q: 本地开发和 Cloudflare 部署有什么区别？

**A**: 
- **本地开发**: 使用 `.dev.vars` 文件
- **Cloudflare 部署**: 在 Dashboard 中设置环境变量

两者功能完全相同，只是环境变量的来源不同。

## 下一步

1. ✅ 创建 `.dev.vars` 文件
2. ✅ 运行 `npm run dev:full`
3. ✅ 访问 http://localhost:8788 测试
4. ✅ 准备部署时，在 Cloudflare Dashboard 设置环境变量

