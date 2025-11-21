# Deployment Guide

轻量化部署平台推荐和部署指南。

## 推荐平台对比

| 平台 | 免费额度 | 特点 | 推荐度 |
|------|---------|------|--------|
| **Railway** | $5/月免费额度 | 简单易用，自动部署 | ⭐⭐⭐⭐⭐ |
| **Render** | 免费计划可用 | 稳定可靠，支持 Webhook | ⭐⭐⭐⭐⭐ |
| **Fly.io** | 免费计划 | 全球边缘部署，快速 | ⭐⭐⭐⭐ |
| **Koyeb** | 免费计划 | 简单，支持 Git 部署 | ⭐⭐⭐⭐ |
| **Glitch** | 免费 | 适合快速原型，有休眠限制 | ⭐⭐⭐ |

## 1. Railway (最推荐) ⭐

### 优点
- 每月 $5 免费额度（足够小型项目）
- 自动从 GitHub 部署
- 环境变量管理简单
- 自动 HTTPS
- 无休眠限制

### 部署步骤

1. **准备代码**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **推送到 GitHub**
   - 创建 GitHub 仓库
   - 推送代码

3. **在 Railway 部署**
   - 访问 [railway.app](https://railway.app)
   - 使用 GitHub 登录
   - 点击 "New Project" → "Deploy from GitHub repo"
   - 选择你的仓库
   - 添加环境变量：
     - `TELEGRAM_BOT_TOKEN`
     - `TELEGRAM_CHAT_ID`
     - `PORT` (Railway 会自动设置，但可以保留)
   - 部署完成后，Railway 会提供一个 URL，例如：`https://your-app.railway.app`

4. **配置 TradingView Webhook**
   - 使用 Railway 提供的 URL: `https://your-app.railway.app/webhook`

### Railway 配置文件 (可选)

创建 `railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## 2. Render ⭐

### 优点
- 免费计划可用（有休眠限制）
- 稳定可靠
- 支持 Webhook
- 自动 HTTPS

### 部署步骤

1. **准备代码并推送到 GitHub**

2. **在 Render 部署**
   - 访问 [render.com](https://render.com)
   - 注册账号（使用 GitHub）
   - 点击 "New" → "Web Service"
   - 连接 GitHub 仓库
   - 配置：
     - **Name**: telegram-alarm
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
   - 添加环境变量：
     - `TELEGRAM_BOT_TOKEN`
     - `TELEGRAM_CHAT_ID`
     - `PORT` (Render 会自动设置)
   - 点击 "Create Web Service"

3. **配置 TradingView Webhook**
   - 使用 Render 提供的 URL: `https://your-app.onrender.com/webhook`

**注意**: 免费计划在 15 分钟无活动后会休眠，首次请求可能需要等待几秒唤醒。

---

## 3. Fly.io ⭐⭐

### 优点
- 免费计划
- 全球边缘部署
- 快速响应
- 无休眠限制

### 部署步骤

1. **安装 Fly CLI**
   ```bash
   # macOS
   curl -L https://fly.io/install.sh | sh
   ```

2. **登录 Fly.io**
   ```bash
   fly auth login
   ```

3. **初始化项目**
   ```bash
   fly launch
   ```
   按提示操作，选择区域（推荐选择离你最近的）

4. **配置环境变量**
   ```bash
   fly secrets set TELEGRAM_BOT_TOKEN=your_token
   fly secrets set TELEGRAM_CHAT_ID=your_chat_id
   ```

5. **部署**
   ```bash
   fly deploy
   ```

6. **获取 URL**
   ```bash
   fly info
   ```

### Fly.io 配置文件

创建 `fly.toml`:
```toml
app = "your-app-name"
primary_region = "iad"

[build]

[env]
  PORT = "8080"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true
  min_machines_running = 1
  processes = ["app"]

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256
```

---

## 4. Koyeb ⭐⭐

### 优点
- 免费计划
- 简单易用
- 支持 Git 部署
- 无休眠限制

### 部署步骤

1. **推送到 GitHub**

2. **在 Koyeb 部署**
   - 访问 [koyeb.com](https://www.koyeb.com)
   - 注册账号
   - 点击 "Create App" → "GitHub"
   - 选择仓库
   - 配置：
     - **Name**: telegram-alarm
     - **Build Command**: `npm install`
     - **Run Command**: `npm start`
   - 添加环境变量
   - 点击 "Deploy"

---

## 环境变量配置

所有平台都需要配置以下环境变量：

```
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
PORT=3000  # 某些平台会自动设置，可以不填
```

---

## 部署后测试

部署完成后，测试 webhook：

```bash
curl -X POST https://your-app-url.com/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "time": "2024-01-01T12:00:00Z",
    "price": "50000",
    "signal": "BUY",
    "volume": "1000"
  }'
```

---

## 推荐选择

- **快速上手**: Railway 或 Render
- **全球部署**: Fly.io
- **完全免费**: Koyeb 或 Fly.io
- **生产环境**: Railway（付费）或 Render（付费）

---

## 注意事项

1. **免费计划限制**
   - Render: 15 分钟无活动后休眠
   - Koyeb: 可能有资源限制
   - Fly.io: 每月有限流量

2. **HTTPS**
   - 所有平台都自动提供 HTTPS，无需额外配置

3. **Webhook URL**
   - 部署后使用平台提供的 HTTPS URL
   - 格式: `https://your-app.platform.com/webhook`

4. **日志查看**
   - 各平台都提供日志查看功能
   - 可用于调试问题

