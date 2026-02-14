#!/bin/bash
# 游戏服务器停止脚本（合并版 - 单端口8080）

echo "🛑 停止游戏服务器..."

# ===== 停止合并服务器（端口8080） =====
SERVER_PID=$(lsof -ti :8080)

if [ ! -z "$SERVER_PID" ]; then
    echo "📋 找到服务器 PID: $SERVER_PID"

    # 尝试优雅停止
    kill $SERVER_PID 2>/dev/null
    sleep 1

    # 检查是否还活着
    if ps -p $SERVER_PID > /dev/null 2>&1; then
        echo "⚠️  优雅停止失败，强制终止..."
        kill -9 $SERVER_PID 2>/dev/null
        sleep 1
    fi

    echo "✅ 服务器已停止"
else
    echo "ℹ️  服务器未运行"
fi

# ===== 清理可能残留的旧进程 =====
# 停止所有可能残留的Python服务器
if pgrep -f "python3 -m http.server 8080" > /dev/null; then
    echo "📋 清理残留的Python服务器..."
    pkill -f "python3 -m http.server 8080"
fi

# 停止所有可能残留的排行榜API服务
if pgrep -f "node.*leaderboard-server.js" > /dev/null; then
    echo "📋 清理残留的排行榜API服务..."
    pkill -f "node.*leaderboard-server.js"
fi

# 最终检查
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "❌ 端口 8080 仍有进程占用"
    echo "📊 占用进程:"
    lsof -i :8080
else
    echo "✅ 所有服务已成功停止"
fi
