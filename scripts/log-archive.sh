#!/bin/bash
# 日志归档脚本
# 用途：归档和清理游戏服务器日志

LOG_FILE="/tmp/log-archive.log"
GAME_LOG="/tmp/game-server.log"
ARCHIVE_DIR="/tmp/logs-archived"
MAX_LOG_SIZE_MB=100
MAX_KEEP_DAYS=7

# 记录日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# 创建归档目录
mkdir -p $ARCHIVE_DIR

log "🔄 开始日志归档..."

# 检查日志文件是否存在
if [ ! -f "$GAME_LOG" ]; then
    log "⚠️  日志文件不存在: $GAME_LOG"
    exit 0
fi

# 检查日志文件大小
LOG_SIZE_MB=$(du -m "$GAME_LOG" | awk '{print $1}')
log "📊 当前日志大小: ${LOG_SIZE_MB}MB"

if [ $LOG_SIZE_MB -lt $MAX_LOG_SIZE_MB ]; then
    log "✅ 日志文件小于 ${MAX_LOG_SIZE_MB}MB，无需归档"
    exit 0
fi

# 归档日志
DATE=$(date +%Y%m%d_%H%M%S)
ARCHIVE_FILE="$ARCHIVE_DIR/game-server.log.$DATE.gz"

log "📦 归档日志文件..."
mv "$GAME_LOG" "$ARCHIVE_FILE" || log "❌ 移动日志文件失败"
gzip "$ARCHIVE_FILE" || log "❌ 压缩日志文件失败"

if [ -f "$ARCHIVE_FILE.gz" ]; then
    ARCHIVED_SIZE=$(du -h "$ARCHIVE_FILE.gz" | awk '{print $1}')
    log "✅ 日志归档完成: $ARCHIVED_SIZE"
fi

# 清理超过7天的归档日志
log "🧹 清理 $MAX_KEEP_DAYS 天前的归档日志..."
DELETED_COUNT=$(find $ARCHIVE_DIR -name "*.gz" -mtime +$MAX_KEEP_DAYS | wc -l)
find $ARCHIVE_DIR -name "*.gz" -mtime +$MAX_KEEP_DAYS -delete

if [ $DELETED_COUNT -gt 0 ]; then
    log "✅ 已删除 $DELETED_COUNT 个旧归档日志"
else
    log "✅ 没有需要清理的归档日志"
fi

# 统计当前归档数量
ARCHIVE_COUNT=$(ls -1 $ARCHIVE_DIR/*.gz 2>/dev/null | wc -l)
log "📊 当前归档数量: $ARCHIVE_COUNT"

log "✅ 日志归档完成"
echo ""
