#!/bin/bash
# 游戏服务器启动脚本（合并版 - 单端口8080）

echo "🎮 启动游戏服务器..."

cd /root/mygame/games

# ===== 停止旧服务 =====
# 停止Python HTTP服务器（如果还在运行）
if pgrep -f "python3 -m http.server 8080" > /dev/null; then
    echo "⚠️  检测到旧的HTTP服务器，正在停止..."
    pkill -f "python3 -m http.server 8080"
    sleep 1
fi

# 停止独立的排行榜API服务（如果还在运行）
if pgrep -f "node.*leaderboard-server.js" > /dev/null; then
    echo "⚠️  检测到旧的排行榜API服务，正在停止..."
    pkill -f "node.*leaderboard-server.js"
    sleep 1
fi

# ===== 启动新的合并服务器 =====
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  端口 8080 已被占用，正在停止现有进程..."
    fuser -k 8080/tcp 2>/dev/null
    sleep 1
fi

echo "🚀 启动合并服务器 (端口8080)..."
nohup node game-server.js > /tmp/game-server.log 2>&1 &
SERVER_PID=$!

sleep 2

if ps -p $SERVER_PID > /dev/null; then
    echo "✅ 服务器已成功启动 (PID: $SERVER_PID)"
else
    echo "❌ 服务器启动失败"
    echo "📄 查看日志: tail -f /tmp/game-server.log"
    exit 1
fi

# 等待服务完全启动
sleep 1

# 健康检查
if curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
    echo "✅ 健康检查通过"
else
    echo "⚠️  健康检查失败，但服务器可能仍在启动..."
fi

echo ""
echo "✅ 所有服务已启动（单端口模式）"
echo ""
echo "📱 访问地址："
echo "   游戏网站: http://localhost:8080"
echo "   排行榜API: http://localhost:8080/api/leaderboard/:game"
echo "   管理面板: http://localhost:8080/admin.html"
echo ""
echo "🌐 外网访问："
echo "   游戏网站: http://150.40.177.181:8080"
echo "   排行榜API: http://150.40.177.181:8080/api/leaderboard/:game"
echo "   管理面板: http://150.40.177.181:8080/admin.html"
echo ""
echo "📋 进程信息："
echo "   服务器 PID: $SERVER_PID"
echo ""
echo "📄 日志文件："
echo "   服务器日志: /tmp/game-server.log"
echo ""
echo "⏹️  停止服务器: ./stop-server.sh"
echo "📊 查看日志: tail -f /tmp/game-server.log"
echo ""
