#!/bin/bash
# 运维总结生成脚本
# 用途：生成每日运维总结报告

LOG_FILE="/tmp/ops-daily-summary.log"
DATE=$(date '+%Y-%m-%d')
DATETIME=$(date '+%Y-%m-%d %H:%M:%S')
REPORT_FILE="/tmp/ops-summary-${DATE}.txt"

# 记录日志函数
log() {
    echo "[$DATETIME] $1" | tee -a $LOG_FILE
}

log "🔄 开始生成每日运维总结..."

# 初始化报告
cat > $REPORT_FILE << EOF
🔧 游戏网站每日运维总结
📅 日期: ${DATE}
🐱 运维: Tom the AI cat
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF

# 1. 服务状态
echo "1. 服务器状态" >> $REPORT_FILE
if pgrep -f "node.*game-server.js" > /dev/null; then
    PID=$(pgrep -f "node.*game-server.js")
    UPTIME=$(ps -p $PID -o etime= | tr -d ' ')
    echo "   ✅ 服务运行中 (PID: ${PID}, 运行时间: ${UPTIME})" >> $REPORT_FILE
else
    echo "   ❌ 服务未运行" >> $REPORT_FILE
fi

echo "" >> $REPORT_FILE

# 2. 端口状态
echo "2. 端口状态" >> $REPORT_FILE
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "   ✅ 端口8080监听正常" >> $REPORT_FILE
else
    echo "   ❌ 端口8080未监听" >> $REPORT_FILE
fi

echo "" >> $REPORT_FILE

# 3. API健康检查
echo "3. API健康状态" >> $REPORT_FILE
if curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
    echo "   ✅ API健康检查通过" >> $REPORT_FILE
else
    echo "   ❌ API健康检查失败" >> $REPORT_FILE
fi

echo "" >> $REPORT_FILE

# 4. 数据状态
echo "4. 数据状态" >> $REPORT_FILE
DATA_FILE="/root/myopencode/games/leaderboard-data.json"
if [ -f "$DATA_FILE" ]; then
    SIZE=$(du -h "$DATA_FILE" | awk '{print $1}')
    echo "   ✅ 数据文件存在 (大小: ${SIZE})" >> $REPORT_FILE

    # 统计各游戏排行榜数据量
    if command -v jq &> /dev/null; then
        SNAKE_COUNT=$(jq '.snake | length' "$DATA_FILE" 2>/dev/null || echo 0)
        SUDOKU_COUNT=$(jq '.sudoku | length' "$DATA_FILE" 2>/dev/null || echo 0)
        echo "   📊 贪吃蛇记录: ${SNAKE_COUNT} 条" >> $REPORT_FILE
        echo "   📊 数独记录: ${SUDOKU_COUNT} 条" >> $REPORT_FILE
    fi
else
    echo "   ❌ 数据文件不存在" >> $REPORT_FILE
fi

echo "" >> $REPORT_FILE

# 5. 备份状态
echo "5. 备份状态" >> $REPORT_FILE
BACKUP_DIR="/root/myopencode/games/backups"
if [ -d "$BACKUP_DIR" ]; then
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.backup.* 2>/dev/null | wc -l)
    echo "   📦 备份文件数量: ${BACKUP_COUNT}" >> $REPORT_FILE

    # 最新的备份文件
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/*.backup.* 2>/dev/null | head -1)
    if [ -n "$LATEST_BACKUP" ]; then
        BACKUP_AGE=$(find "$BACKUP_DIR" -name "*.backup.*" -mtime -1 | wc -l)
        echo "   ✅ 今日已备份" >> $REPORT_FILE
    fi
else
    echo "   ⚠️  备份目录不存在" >> $REPORT_FILE
fi

echo "" >> $REPORT_FILE

# 6. 磁盘空间
echo "6. 磁盘空间" >> $REPORT_FILE
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
DISK_AVAIL=$(df -h / | awk 'NR==2 {print $4}')
if [ $DISK_USAGE -gt 90 ]; then
    echo "   ⚠️  磁盘使用率: ${DISK_USAGE}% (需注意)" >> $REPORT_FILE
elif [ $DISK_USAGE -gt 80 ]; then
    echo "   ⚠️  磁盘使用率: ${DISK_USAGE}% (偏高)" >> $REPORT_FILE
else
    echo "   ✅ 磁盘使用率: ${DISK_USAGE}% (${DISK_AVAIL} 可用)" >> $REPORT_FILE
fi

echo "" >> $REPORT_FILE

# 7. 日志文件状态
echo "7. 日志文件状态" >> $REPORT_FILE
for log_file in /tmp/game-server.log /tmp/health-check.log /tmp/backup.log; do
    if [ -f "$log_file" ]; then
        SIZE=$(du -h "$log_file" | awk '{print $1}')
        echo "   📄 $(basename $log_file): ${SIZE}" >> $REPORT_FILE
    fi
done

echo "" >> $REPORT_FILE

# 8. 系统负载
echo "8. 系统负载" >> $REPORT_FILE
LOAD=$(uptime | awk -F'load average:' '{print $2}')
echo "   📊 系统负载: ${LOAD}" >> $REPORT_FILE

MEM_USAGE=$(free | grep Mem | awk '{printf "%.0f%%", $3/$2 * 100}')
echo "   📊 内存使用: ${MEM_USAGE}" >> $REPORT_FILE

echo "" >> $REPORT_FILE

# 9. 访问统计（估算）
echo "9. 最近24小时访问统计" >> $REPORT_FILE
if [ -f "/tmp/game-server.log" ]; then
    # 统计最近24小时内的请求数
    TODAY_REQUESTS=$(grep "$(date +%Y-%m-%d)" /tmp/game-server.log | wc -l)
    echo "   📱 今日请求数: ${TODAY_REQUESTS}" >> $REPORT_FILE

    # 统计API请求
    API_REQUESTS=$(grep "$(date +%Y-%m-%d)" /tmp/game-server.log | grep "api/leaderboard" | wc -l)
    echo "   📊 排行榜API请求: ${API_REQUESTS}" >> $REPORT_FILE
fi

echo "" >> $REPORT_FILE

# 10. 总结和建议
echo "10. 运维总结" >> $REPORT_FILE
if pgrep -f "node.*game-server.js" > /dev/null && curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
    echo "   ✅ 服务运行正常，无需特殊操作" >> $REPORT_FILE
else
    echo "   ⚠️  服务异常，需要检查" >> $REPORT_FILE
fi

if [ $DISK_USAGE -gt 80 ]; then
    echo "   💡 建议: 关注磁盘空间，考虑清理" >> $REPORT_FILE
fi

echo "" >> $REPORT_FILE
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> $REPORT_FILE
echo "💻 访问监控面板: http://150.40.177.181:8080/ops.html" >> $REPORT_FILE
echo "⚙️  管理面板: http://150.40.177.181:8080/admin.html" >> $REPORT_FILE
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> $REPORT_FILE

log "✅ 运维总结已生成: $REPORT_FILE"

# 输出报告内容
cat $REPORT_FILE

log "✅ 每日运维总结完成"
