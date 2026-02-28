#!/bin/bash
# 健康检查和自动重启脚本
# 用途：检查游戏服务器健康状态，异常时自动重启

LOG_FILE="/tmp/health-check.log"
BACKUP_DIR="/root/mygame/games/backups"
MAX_BACKUP_DAYS=7

# 记录日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# 创建备份目录
mkdir -p $BACKUP_DIR

# 飞书提醒函数
send_feishu_notify() {
    local message="$1"
    openclaw message send --channel feishu --target "chat:oc_ab3b2955589b1427d85a997fc3a9d5fc" --message "$message" 2>/dev/null
}

# 检查进程运行状态
if ! pgrep -f "node.*game-server.js" > /dev/null; then
    log "❌ 服务进程未运行"
    send_feishu_notify "⚠️ mygame 服务进程未运行，正在尝试重启..."
else
    log "✅ 服务进程运行正常"
fi

# 检查端口监听状态
if ! lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    log "❌ 端口8080未监听"
    log "🔄 尝试重启服务..."
    send_feishu_notify "⚠️ mygame 端口8080未监听，正在重启..."
    cd /root/mygame/games && ./start-server.sh
    if [ $? -eq 0 ]; then
        log "✅ 服务重启成功"
    else
        log "❌ 服务重启失败"
        send_feishu_notify "❌ mygame 服务重启失败，请检查！"
    fi
else
    log "✅ 端口8080监听正常"
fi

# 检查API健康状态
if curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
    log "✅ API健康检查通过"
else
    log "❌ API健康检查失败"
    send_feishu_notify "⚠️ mygame API健康检查失败，正在重启..."
    log "🔄 尝试重启服务..."
    cd /root/mygame/games && ./stop-server.sh && sleep 2 && ./start-server.sh
    if [ $? -eq 0 ]; then
        log "✅ 服务重启成功"
    else
        log "❌ 服务重启失败"
        send_feishu_notify "❌ mygame 服务重启失败，请检查！"
    fi
fi

# 检查数据文件是否存在
DATA_FILE="/root/mygame/games/leaderboard-data.json"
if [ ! -f "$DATA_FILE" ]; then
    log "⚠️  数据文件不存在，创建空文件"
    echo '{}' > $DATA_FILE
else
    log "✅ 数据文件存在"
fi

# 检查磁盘空间
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
    log "⚠️  磁盘使用率过高: ${DISK_USAGE}%"
    send_feishu_notify "⚠️ mygame 服务器磁盘使用率过高: ${DISK_USAGE}%"
    log "🧹 清理旧备份..."
    cd $BACKUP_DIR
    find . -name "*.backup.*" -mtime +$MAX_BACKUP_DAYS -delete
    log "✅ 清理完成"
else
    log "✅ 磁盘使用率正常: ${DISK_USAGE}%"
fi

log "✅ 健康检查完成"
# 只在异常时发送提醒（上面已处理），正常不发送
echo ""
