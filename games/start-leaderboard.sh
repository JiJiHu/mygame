#!/bin/bash

echo "🎮 启动排行榜服务..."

# 检查是否已运行
PID=$(pgrep -f "node.*leaderboard-server.js")
if [ ! -z "$PID" ]; then
    echo "⚠️  排行榜服务已在运行 (PID: $PID)"
    echo "✅ 无需启动"
    exit 0
fi

# 启动服务
nohup node leaderboard-server.js > /tmp/leaderboard-server.log 2>&1 &
NEW_PID=$!

# 等待服务启动
sleep 2

# 检查是否启动成功
if ps -p $NEW_PID > /dev/null; then
    echo "✅ 排行榜服务已成功启动"
    echo "📋 进程ID: $NEW_PID"
    echo "📊 API地址: http://0.0.0.0:8081"
    echo "📄 日志文件: /tmp/leaderboard-server.log"
else
    echo "❌ 排行榜服务启动失败"
    echo "📄 查看日志: tail -f /tmp/leaderboard-server.log"
    exit 1
fi
