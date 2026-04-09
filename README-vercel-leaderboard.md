# Vercel 排行榜系统配置指南

## 问题原因

排行榜服务 (`leaderboard-server.js`) 是 Node.js 后端服务，Vercel 静态部署无法运行。

## 解决方案

使用 **Upstash Redis** (免费层) 作为云端数据库，配合 Vercel Serverless Functions。

### 步骤 1: 创建 Upstash Redis 数据库

1. 访问 https://upstash.com/
2. 注册/登录账号
3. 点击 "Create Database"
4. 选择区域（推荐 `aws-ap-southeast-1` 新加坡，国内访问较快）
5. 选择 "TLS enabled"
6. 点击 "Create Database"

### 步骤 2: 获取环境变量

创建完成后，在数据库页面找到：
- **UPSTASH_REDIS_REST_URL** (类似 `https://xxx-yyy.ap-southeast-1.upstash.io`)
- **UPSTASH_REDIS_REST_TOKEN** (长字符串)

### 步骤 3: 配置 Vercel 环境变量

```bash
cd /root/mygame

# 设置环境变量
vercel env add UPSTASH_REDIS_REST_URL
# 粘贴你的 UPSTASH_REDIS_REST_URL

vercel env add UPSTASH_REDIS_REST_TOKEN
# 粘贴你的 UPSTASH_REDIS_REST_TOKEN

# 确认环境变量对所有部署生效
# 选择：Production, Preview, Development
```

或者在 Vercel 控制台设置：
1. 访问 https://vercel.com/dashboard
2. 选择 "mygame" 项目
3. 点击 "Settings" → "Environment Variables"
4. 添加两个变量：
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### 步骤 4: 部署到 Vercel

```bash
cd /root/mygame

# 提交更改
git add -A
git commit -m "feat: 添加 Vercel 排行榜 API (使用 Upstash Redis)"
git push origin main

# 部署
vercel --prod
```

### 步骤 5: 测试

访问 Vercel 部署的网址，打开任意游戏，保存分数后查看排行榜。

## 本地开发

本地运行时仍使用原有的 `leaderboard-server.js`：

```bash
cd /root/mygame/games
bash start-leaderboard.sh
```

## 数据迁移

如需将本地排行榜数据迁移到云端：

```bash
# 导出本地数据
cat /root/mygame/games/leaderboard-data.json

# 手动导入或使用脚本（待创建）
```

## 免费额度

Upstash Redis 免费层：
- 每日命令数：10,000
- 存储空间：256MB
- 对于小游戏排行榜完全够用

## 故障排查

### 1. 保存失败 - 未配置 Redis

检查 Vercel 环境变量是否正确设置：
```bash
vercel env ls
```

### 2. CORS 错误

API 已配置 `Access-Control-Allow-Origin: *`，应该没问题。

### 3. 游戏仍然调用本地 API

检查游戏的 leaderboard 配置，确保 API 端点正确。
