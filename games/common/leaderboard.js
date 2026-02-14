/**
 * 游戏排行榜公共模块
 * 提供所有游戏通用的排行榜功能
 * 支持 Class 方式和函数方式两种调用
 */

class GameLeaderboard {
    constructor(gameName, options = {}) {
        this.gameName = gameName;
        this.apiEndpoint = window.location.origin + `/api/leaderboard/${gameName}`;
        this.cacheKey = `leaderboard_${gameName}_cache`;
        this.cacheTimeKey = `leaderboard_${gameName}_cache_time`;
        this.cacheDuration = options.cacheDuration || 60000;
        this.leaderboardData = [];
        this.cache = null;
    }

    async fetchLeaderboard(forceRefresh = false) {
        if (!forceRefresh && this.cache) {
            const cacheTime = localStorage.getItem(this.cacheTimeKey);
            if (cacheTime && Date.now() - parseInt(cacheTime) < this.cacheDuration) {
                return this.cache;
            }
        }

        try {
            const response = await fetch(this.apiEndpoint, { cache: 'no-store' });
            const result = await response.json();

            if (result.success) {
                this.leaderboardData = result.leaderboard || [];
                this.cache = this.leaderboardData;
                localStorage.setItem(this.cacheKey, JSON.stringify(this.cache));
                localStorage.setItem(this.cacheTimeKey, Date.now().toString());
                return this.leaderboardData;
            } else {
                throw new Error(result.error || '获取排行榜失败');
            }
        } catch (error) {
            console.error('获取排行榜失败:', error);
            const cachedData = localStorage.getItem(this.cacheKey);
            if (cachedData) {
                this.cache = JSON.parse(cachedData);
                return this.cache;
            }
            return [];
        }
    }

    async saveScore(scoreData) {
        try {
            console.log(`正在保存${this.gameName}分数:`, scoreData);

            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(scoreData)
            });

            if (!response.ok) {
                console.error('API响应错误:', response.status, response.statusText);
                return false;
            }

            const result = await response.json();
            console.log('API返回:', result);

            if (result.success) {
                this.leaderboardData = result.leaderboard || [];
                this.cache = this.leaderboardData;
                localStorage.setItem(this.cacheKey, JSON.stringify(this.cache));
                localStorage.setItem(this.cacheTimeKey, Date.now().toString());
                return true;
            } else {
                console.error('API返回错误:', result.error);
                return false;
            }
        } catch (error) {
            console.error('保存分数失败:', error);
            return false;
        }
    }

    async showLeaderboardPanel(filter = 'all', renderItem = null) {
        const panelId = `${this.gameName}LeaderboardPanel`;
        const overlayId = `${this.gameName}LeaderboardOverlay`;
        const bodyId = `${this.gameName}LeaderboardBody`;

        let panel = document.getElementById(panelId);
        let overlay = document.getElementById(overlayId);

        if (!panel) {
            panel = document.createElement('div');
            panel.id = panelId;
            panel.className = 'leaderboard-panel';
            panel.style.display = 'none';

            panel.innerHTML = `
                <h3 class="settings-title">🏆 ${this.gameName}排行榜</h3>
                <div class="leaderboard-container">
                    <table class="leaderboard-table">
                        <thead>
                            <tr>
                                <th>排名</th>
                                <th>玩家</th>
                                <th id="scoreHeader">分数</th>
                                <th>日期</th>
                            </tr>
                        </thead>
                        <tbody id="${bodyId}">
                        </tbody>
                    </table>
                </div>
                <div class="leaderboard-controls">
                    <button class="btn-primary" onclick="document.getElementById('${panelId}').style.display='none'; document.getElementById('${overlayId}').style.display='none'">关闭</button>
                </div>
            `;

            document.body.appendChild(panel);

            overlay = document.createElement('div');
            overlay.id = overlayId;
            overlay.className = 'leaderboard-overlay';
            document.body.appendChild(overlay);
        }

        const scoreHeader = document.getElementById('scoreHeader');
        if (scoreHeader && typeof this.getScoreLabel === 'function') {
            scoreHeader.textContent = this.getScoreLabel();
        }

        panel.style.display = 'block';
        overlay.style.display = 'block';

        const tbody = document.getElementById(bodyId);
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 30px;">加载中...</td></tr>';

        await this.filterAndDisplay(filter, tbody, renderItem);
    }

    async filterAndDisplay(filter, tbody, renderItem = null) {
        const data = await this.fetchLeaderboard();

        let filteredData = data;
        if (filter !== 'all' && typeof this.filterData === 'function') {
            filteredData = this.filterData(data, filter);
        }

        tbody.innerHTML = '';

        if (filteredData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #666;">暂无记录，快来创造第一个记录吧！</td></tr>';
            return;
        }

        filteredData.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.className = index < 3 ? `rank-${index + 1}` : '';

            if (renderItem && typeof renderItem === 'function') {
                row.innerHTML = renderItem(entry, index);
            } else {
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${entry.name || '匿名玩家'}</td>
                    <td>${this.formatScore(entry)}</td>
                    <td>${new Date(entry.date).toLocaleDateString()}</td>
                `;
            }

            tbody.appendChild(row);
        });
    }

    formatScore(entry) {
        if (entry.score !== undefined) return entry.score;
        if (entry.moves !== undefined) return `${entry.moves}步`;
        if (entry.time !== undefined) return `${entry.time}秒`;
        return '-';
    }

    getScoreLabel() {
        return '分数';
    }

    filterData(data, filter) {
        return data;
    }

    async saveAndShowLeaderboard(scoreData, playerName) {
        if (!playerName || playerName.trim() === '') {
            playerName = '匿名玩家';
        }

        scoreData.name = playerName;
        scoreData.date = new Date().toISOString();

        const success = await this.saveScore(scoreData);
        if (success) {
            await this.showLeaderboardPanel();
        }
    }
}

const LeaderboardAPI = (function() {
    'use strict';

    const CONFIG = {
        API_BASE: window.location.origin + '/api/leaderboard',
        CACHE_DURATION: 5 * 60 * 1000,
        MAX_ENTRIES: 50,
        DEFAULT_GAME: 'default'
    };

    const cache = new Map();

    async function fetchLeaderboard(gameName, useCache = true) {
        const cacheKey = `leaderboard_${gameName}`;
        
        if (useCache && cache.has(cacheKey)) {
            const cached = cache.get(cacheKey);
            if (Date.now() - cached.timestamp < CONFIG.CACHE_DURATION) {
                console.log(`[Leaderboard] 使用缓存数据: ${gameName}`);
                return cached.data;
            }
        }

        try {
            const response = await fetch(`${CONFIG.API_BASE}/${gameName}?t=${Date.now()}`, {
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                cache.set(cacheKey, {
                    data: result.leaderboard || [],
                    timestamp: Date.now()
                });
                return result.leaderboard || [];
            } else {
                throw new Error(result.error || '获取排行榜失败');
            }
        } catch (error) {
            console.error(`[Leaderboard] 获取排行榜失败: ${gameName}`, error);
            if (cache.has(cacheKey)) {
                console.log(`[Leaderboard] 使用过期缓存数据: ${gameName}`);
                return cache.get(cacheKey).data;
            }
            return [];
        }
    }

    async function saveScoreToAPI(gameName, scoreData) {
        try {
            console.log(`[Leaderboard] 正在保存分数: ${gameName}`, scoreData);

            const normalizedData = normalizeScoreData(scoreData);
            
            const response = await fetch(`${CONFIG.API_BASE}/${gameName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(normalizedData)
            });

            if (!response.ok) {
                console.error('[Leaderboard] API响应错误:', response.status, response.statusText);
                return false;
            }

            const result = await response.json();
            console.log('[Leaderboard] API返回:', result);

            if (result.success) {
                const cacheKey = `leaderboard_${gameName}`;
                cache.set(cacheKey, {
                    data: result.leaderboard || [],
                    timestamp: Date.now()
                });
                return true;
            } else {
                console.error('[Leaderboard] API返回错误:', result.error);
                return false;
            }
        } catch (error) {
            console.error('[Leaderboard] 保存分数失败:', error);
            return false;
        }
    }

    function normalizeScoreData(data) {
        const normalized = { ...data };
        
        if (!normalized.name && !normalized.playerName) {
            normalized.name = '匿名玩家';
        } else if (normalized.playerName && !normalized.name) {
            normalized.name = normalized.playerName;
        }

        if (!normalized.date) {
            normalized.date = new Date().toISOString();
        }
        if (!normalized.timestamp) {
            normalized.timestamp = Date.now();
        }

        if (normalized.score === undefined) {
            if (normalized.time !== undefined) {
                normalized.score = normalized.time;
            } else if (normalized.moves !== undefined) {
                normalized.score = normalized.moves;
            }
        }

        return normalized;
    }

    function hideLeaderboardPanel() {
        const panels = document.querySelectorAll('.leaderboard-panel');
        const overlays = document.querySelectorAll('.leaderboard-overlay');
        
        panels.forEach(panel => panel.style.display = 'none');
        overlays.forEach(overlay => overlay.style.display = 'none');
    }

    function formatTime(seconds) {
        if (seconds === undefined || seconds === null) return '-';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function translateDifficulty(difficulty) {
        const translations = {
            'easy': '简单',
            'medium': '中等',
            'hard': '困难',
            'beginner': '初级',
            'intermediate': '中级',
            'expert': '高级',
            'pvp': '双人对战',
            'pve': '人机对战'
        };
        return translations[difficulty] || difficulty || '-';
    }

    function clearCache() {
        cache.clear();
        console.log('[Leaderboard] 缓存已清空');
    }

    return {
        fetchLeaderboard,
        saveScoreToAPI,
        hideLeaderboardPanel,
        formatTime,
        translateDifficulty,
        clearCache,
        CONFIG
    };
})();

if (typeof window !== 'undefined') {
    window.GameLeaderboard = GameLeaderboard;
    window.LeaderboardAPI = LeaderboardAPI;
    
    window.fetchLeaderboard = (gameName) => LeaderboardAPI.fetchLeaderboard(gameName);
    window.saveScoreToAPI = (gameName, scoreData) => LeaderboardAPI.saveScoreToAPI(gameName, scoreData);
    window.hideLeaderboardPanel = () => LeaderboardAPI.hideLeaderboardPanel();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameLeaderboard, LeaderboardAPI };
}

// 导出供其他游戏使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameLeaderboard;
}
