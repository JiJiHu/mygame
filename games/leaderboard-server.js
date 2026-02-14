const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 8081;

// 数据文件路径
const DATA_FILE = path.join(__dirname, 'leaderboard-data.json');

// 中间件 - 配置CORS允许所有来源
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 请求日志中间件
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url} - ${req.ip}`);
    next();
});

// 初始化数据文件
function initDataFile() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify({}), 'utf8');
        console.log('✅ 创建排行榜数据文件');
    }
}

// 读取数据
function readData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ 读取数据失败:', error);
        return {};
    }
}

// 写入数据
function writeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('❌ 写入数据失败:', error);
        return false;
    }
}

// 获取游戏排行榜
app.get('/api/leaderboard/:game', (req, res) => {
    try {
        const { game } = req.params;
        const data = readData();
        const leaderboard = data[game] || [];

        console.log(`📊 获取 ${game} 排行榜: ${leaderboard.length} 条记录`);

        res.json({success: true, leaderboard: leaderboard});
    } catch (error) {
        console.error('❌ 获取排行榜失败:', error);
        res.status(500).json({ success: false, error: '获取排行榜失败' });
    }
});

// 添加分数到排行榜
app.post('/api/leaderboard/:game', (req, res) => {
    try {
        const { game } = req.params;
        let scoreData = req.body;

        // 验证数据 - 兼容多种字段名
        if (!scoreData || (
            scoreData.score === undefined &&
            scoreData.score === null &&
            (!scoreData.time && scoreData.time !== 0) &&
            (!scoreData.moves && scoreData.moves !== 0)
        )) {
            console.error('❌ 无效的分数数据:', scoreData);
            return res.status(400).json({ success: false, error: '无效的分数数据' });
        }

        // 标准化字段名（兼容性处理）
        if (scoreData.score === undefined && scoreData.score !== null) {
            if (scoreData.moves !== undefined) scoreData.score = scoreData.moves;
            else if (scoreData.time !== undefined) scoreData.score = scoreData.time;
        }

        // 添加时间戳
        scoreData.date = new Date().toISOString();
        scoreData.timestamp = Date.now();

        // 读取数据
        const data = readData();

        // 初始化游戏排行榜
        if (!data[game]) {
            data[game] = [];
        }

        console.log(`📝 接收 ${game} 分数: ${scoreData.playerName} - ${scoreData.score}`);

        // 添加新分数
        data[game].push(scoreData);

        // 根据不同游戏排序
        if (game === 'sudoku') {
            // 数独按时间排序（越短越好）
            data[game].sort((a, b) => (a.time || a.score) - (b.time || b.score));
        } else if (game === 'sokoban') {
            // 推箱子按步数排序（越少越好），步数相同按推箱次数排序
            data[game].sort((a, b) => {
                const movesA = a.moves || a.score;
                const movesB = b.moves || b.score;
                if (movesA !== movesB) return movesA - movesB;
                return (a.pushes || 0) - (b.pushes || 0);
            });
        } else if (game === 'gomoku') {
            // 五子棋按分数排序
            data[game].sort((a, b) => b.score - a.score);
        } else if (game === 'minesweeper' || game === 'sliding-puzzle') {
            // 扫雷和滑块拼图按时间/步数排序（越短越好）
            data[game].sort((a, b) => (a.score || 0) - (b.score || 0));
        } else {
            // 其他游戏（贪吃蛇）按分数排序（越高越好）
            data[game].sort((a, b) => b.score - a.score);
        }

        // 只保留前50名
        data[game] = data[game].slice(0, 50);

        // 写入数据
        if (writeData(data)) {
            console.log(`✅ 保存 ${game} 分数: ${scoreData.playerName} - ${scoreData.score}`);
            res.json({ success: true, leaderboard: data[game] });
        } else {
            res.status(500).json({ success: false, error: '保存失败' });
        }
    } catch (error) {
        console.error('❌ 保存分数失败:', error);
        res.status(500).json({ success: false, error: '保存失败: ' + error.message });
    }
});

// 清空游戏排行榜
app.delete('/api/leaderboard/:game', (req, res) => {
    try {
        const { game } = req.params;
        const data = readData();

        if (game === 'all') {
            // 清空所有排行榜
            const count = Object.keys(data).length;
            fs.writeFileSync(DATA_FILE, JSON.stringify({}), 'utf8');
            console.log(`🗑️  清空所有排行榜: ${count} 个游戏`);
            res.json({ success: true, leaderboard: {} });
        } else {
            // 清空指定游戏排行榜
            data[game] = [];
            writeData(data);
            console.log(`🗑️  清空 ${game} 排行榜`);
            res.json({ success: true, leaderboard: data[game] });
        }
    } catch (error) {
        console.error('❌ 清空排行榜失败:', error);
        res.status(500).json({ success: false, error: '清空失败' });
    }
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: '排行榜服务运行中' });
});

// 启动服务器
app.listen(PORT, '::', () => {
    console.log('🎮 排行榜服务启动');
    console.log(`📡 监听端口: ${PORT}`);
    console.log(`🌐 地址: http://0.0.0.0:${PORT}`);
    console.log(`📊 API端点:`);
    console.log(`   GET  /api/leaderboard/:game  - 获取排行榜`);
    console.log(`   POST /api/leaderboard/:game  - 保存分数`);
    console.log(`   DELETE /api/leaderboard/:game - 清空排行榜`);
    initDataFile();
});
