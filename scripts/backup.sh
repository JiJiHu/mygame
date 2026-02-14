#!/bin/bash
# 每日数据备份脚本
# 用途：备份排行榜数据和关键文件

LOG_FILE="/tmp/backup.log"
BACKUP_DIR="/root/myopencode/games/backups"
DATE=$(date +%Y%m%d)
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# 记录日志函数
log() {
    echo "[$TIMESTAMP] $1" | tee -a $LOG_FILE
}

# 创建备份目录
mkdir -p $BACKUP_DIR

log "🔄 开始每日备份..."

# 备份排行榜数据
DATA_FILE="/root/myopencode/games/leaderboard-data.json"
BACKUP_FILE="$BACKUP_DIR/leaderboard-data.json.backup.$DATE"

if [ -f "$DATA_FILE" ]; then
    cp $DATA_FILE $BACKUP_FILE
    if [ $? -eq 0 ]; then
        log "✅ 排行榜数据备份完成: $BACKUP_FILE"
        # 显示备份文件大小
        SIZE=$(du -h $BACKUP_FILE | awk '{print $1}')
        log "📦 备份大小: $SIZE"
    else
        log "❌ 排行榜数据备份失败"
    fi
else
    log "⚠️  数据文件不存在: $DATA_FILE"
fi

# 清理超过7天的备份
MAX_DAYS=7
log "🧹 清理 $MAX_DAYS 天前的备份..."
cd $BACKUP_DIR
DELETED_COUNT=$(find . -name "*.backup.*" -mtime +$MAX_DAYS | wc -l)
find . -name "*.backup.*" -mtime +$MAX_DAYS -delete

if [ $DELETED_COUNT -gt 0 ]; then
    log "✅ 已删除 $DELETED_COUNT 个旧备份"
else
    log "✅ 没有需要清理的旧备份"
fi

# 统计当前备份数量
BACKUP_COUNT=$(ls -1 *.backup.* 2>/dev/null | wc -l)
log "📊 当前备份数量: $BACKUP_COUNT"

log "✅ 每日备份完成"
echo ""
