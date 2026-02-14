#!/bin/bash

echo "🛑 停止排行榜服务..."

# 查找进程并停止
PIDS=$(pgrep -f "node.*leaderboard-server.js")

if [ -z "$PIDS" ]; then
    echo "ℹ️  排行榜服务未运行"
    exit 0
fi

echo "📋 找到进程:"
for PID in $PIDS; do
    echo "   PID: $PID"
done

# 停止进程
kill $PIDS 2>/dev/null

# 等待进程结束
sleep 1

# 检查是否已停止
REMAINING=$(pgrep -f "node.*leaderboard-server.js")
if [ -z "$REMAINING" ]; then
    echo "✅ 排行榜服务已成功停止"
else
    echo "⚠️  部分进程仍在运行，强制终止..."
    pkill -9 -f "node.*leaderboard-server.js"
    sleep 1
    echo "✅ 排行榜服务已强制停止"
fi
