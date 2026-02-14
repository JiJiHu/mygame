# 公共组件库 - 完整使用文档

**版本：** v2.0  
**更新日期：** 2026-02-12  
**作者：** Tom the AI Cat 🐱💙

---

## 📦 组件列表

```
common/
├── styles.css           (6.6 KB) - 公共样式表
├── utils.js             (3.2 KB) - 工具函数库
├── leaderboard.js       (8.4 KB) - 排行榜组件
├── sound.js             (5.6 KB) - 音效管理器
├── theme.js             (9.5 KB) - 主题管理器
├── i18n.js              (9.3 KB) - 多语言支持
└── README.md            (本文档)
```

---

## 🎨 1. 样式表 (styles.css)

### 基础样式
- 关闭按钮通用样式
- 游戏容器通用样式
- 三种按钮样式（primary, secondary, warning）

### 动画效果
- bounceIn - 弹入动画
- fadeIn - 淡入动画
- slideDown - 下滑动画
- slideUp - 上滑动画

### 响应式设计
- 移动端优化
- 适配不同屏幕尺寸

---

## 🛠️ 2. 工具函数 (utils.js)

### 函数列表
```javascript
// 返回主页
goBackHome()

// 显示提示消息
showToast(message, type = 'info')

// 本地存储封装
const storage = new GameStorage(prefix)

// 格式化时间
formatTime(seconds)

// 格式化日期
formatDate(date)
```

### 使用示例
```javascript
// 显示提示
showToast('游戏开始！', 'success');

// 本地存储
const gameStorage = new GameStorage('mygame');
gameStorage.set('score', 100);
const score = gameStorage.get('score');
```

---

## 🏆 3. 排行榜组件 (leaderboard.js)

### 核心功能
```javascript
const leaderboard = new GameLeaderboard('snake');

// 保存分数
await leaderboard.saveScore({ score: 100, moves: 50 }, 'Alice');

// 显示排行榜
await leaderboard.showLeaderboardPanel();
```

### 支持方法
- `fetchLeaderboard(forceRefresh)` - 获取排行榜
- `saveScore(scoreData, playerName)` - 保存分数
- `showLeaderboardPanel()` - 显示面板
- `formatScore(entry)` - 自定义格式化
- `filterData(data, filter)` - 自定义过滤

---

## 🔊 4. 音效系统 (sound.js)

### 基础使用
```javascript
// 播放音效
sound.play('click');
sound.play('win');
sound.play('error');

// 切换静音
sound.toggle();

// 设置音量 (0-1)
sound.setVolume(0.5);
```

### 预定义音效
- `click` - 点击音效
- `hover` - 悬停音效
- `move` - 移动音效
- `capture` - 捕获音效
- `success` - 成功音效
- `win` - 胜利音效
- `lose` - 失败音效
- `powerUp` - 强化音效
- `levelUp` - 升级音效
- `bomb` - 爆炸音效

### 游戏专用音效
- `fillCell` - 数独填格
- `placeStone` - 五子棋下子
- `checkmate` - 将军

---

## 🎨 5. 主题系统 (theme.js)

### 切换主题
```javascript
// 切换下一个主题
theme.nextTheme();

// 切换上一个主题
theme.prevTheme();

// 应用特定主题
theme.applyTheme('dark');

// 获取当前主题
const current = theme.getCurrentTheme();

// 获取所有主题
const allThemes = theme.getAllThemes();
```

### 可用主题
- `default` - 默认主题
- `dark` - 暗黑主题
- `ocean` - 海洋主题
- `forest` - 森林主题
- `sunset` - 日落主题

### CSS 变量
```css
/* 使用主题变量 */
.btn {
    background-color: var(--primary-color);
    color: var(--text-primary);
}
```

---

## 🌐 6. 多语言支持 (i18n.js)

### 基础使用
```javascript
// 获取翻译文本
const text = i18n.t('game.score');
// 输出：'score' 或 '分数'

// 带参数
i18n.t('messages.congratulations', { name: 'Alice' });

// 切换语言
i18n.setLocale('en');

// 切换语言
i18n.toggleLanguage();

// 获取当前语言
const current = i18n.getLocale();
```

### HTML 标签翻译
```html
<!-- 文本翻译 -->
<span data-i18n="common.start">开始</span>

<!-- 属性翻译 -->
<button data-i18n-attr="placeholder" data-i18n="game.yourName"></button>

<!-- 动态更新页面 -->
i18n.updateElements();
```

### 支持语言
- `zh` - 中文
- `en` - English

---

## 📖 完整集成示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- 引入公共组件 -->
    <link rel="stylesheet" href="../common/styles.css">
    <script src="../common/utils.js"></script>
    <script src="../common/leaderboard.js"></script>
    <script src="../common/sound.js"></script>
    <script src="../common/theme.js"></script>
    <script src="../common/i18n.js"></script>
</head>
<body>
    <div class="game-container">
        <h1 data-i18n="game.score">分数</h1>
        <button class="btn primary" data-i18n="common.start" onclick="startGame()">开始</button>
        <button class="btn secondary" onclick="toggleSound()">音效</button>
        <button class="btn warning" onclick="toggleTheme()">主题</button>
        <button class="btn warning" onclick="toggleLang()">🌐</button>
    </div>

    <script>
        // 排行榜
        const leaderboard = new GameLeaderboard('my-game');

        // 音效
        function toggleSound() {
            sound.toggle();
            showToast(sound.isEnabled() ? '音效已开启' : '音效已关闭');
        }

        // 主题
        function toggleTheme() {
            theme.nextTheme();
            showToast(theme.getCurrentTheme());
        }

        // 语言
        function toggleLang() {
            i18n.toggleLanguage();
            i18n.updateElements();
        }

        // 游戏逻辑
        function startGame() {
            sound.play('click');
            // ...
        }

        function gameOver() {
            sound.play('win');
            leaderboard.saveAndShowLeaderboard({ score: 100 }, 'Player');
        }
    </script>
</body>
</html>
```

---

## 🚀 迁移指南

### 步骤 1: 引入组件
```html
<link rel="stylesheet" href="../common/styles.css">
<script src="../common/utils.js"></script>
<script src="../common/leaderboard.js"></script>
<script src="../common/sound.js"></script>
<script src="../common/theme.js"></script>
<script src="../common/i18n.js"></script>
```

### 步骤 2: 替换工具函数
```javascript
// 旧代码
localStorage.setItem('highScore', 100);

// 新代码
const storage = new GameStorage('game');
storage.set('highScore', 100);
```

### 步骤 3: 添加排行榜
```javascript
const leaderboard = new GameLeaderboard('gameName');
await leaderboard.saveAndShowLeaderboard({ score: 100 });
```

### 步骤 4: 添加音效
```javascript
// 按钮点击
button.addEventListener('click', () => {
    sound.play('click');
});

// 游戏事件
if (won) sound.play('win');
else sound.play('lose');
```

### 步骤 5: 添加主题
```html
<!-- 主题切换按钮 -->
<button onclick="theme.nextTheme()">🎨 主题</button>
```

### 步骤 6: 添加多语言
```html
<!-- 翻译文本 -->
<span data-i18n="game.score">分数</span>

<!-- 语言切换 -->
<button onclick="i18n.toggleLanguage()">🌐</button>
```

---

## ✨ 最佳实践

1. **音效控制**
   - 避免在密集循环中播放音效
   - 使用节流/防抖控制音效频率
   - 考虑用户静音偏好

2. **主题切换**
   - 使用 CSS 变量定义颜色
   - 确保所有主题的对比度足够
   - 提供主题预览

3. **多语言**
   - 键名使用点号分隔（如 `game.score`）
   - 避免硬编码文本
   - 翻译文本尽量简洁

4. **缓存策略**
   - 排行榜数据缓存 1 分钟
   - 失败时降级使用缓存
   - 定期刷新重要数据

---

## 🔧 配置选项

### ThemeManager
```javascript
new ThemeManager({
    defaultTheme: 'default',
    storageKey: 'game-theme'
});
```

### SoundManager
```javascript
new SoundManager({
    enabled: true,
    volume: 0.5
});
```

### I18nManager
```javascript
new I18nManager({
    locale: 'zh',
    fallbackLocale: 'zh',
    storageKey: 'game-language'
});
```

---

## 📝 更新日志

### v2.0 (2026-02-12)
- ✅ 新增音效系统 (`sound.js`)
- ✅ 新增主题系统 (`theme.js`)
- ✅ 新增多语言支持 (`i18n.js`)
- ✅ 完整集成文档

### v1.0 (2026-02-12)
- ✅ 基础组件库建立
- ✅ 样式表、工具函数、排行榜

---

## 💡 常见问题

**Q: 如何自定义音效？**

A: 修改 `SoundManager.SOUND_CONFIG` 添加新的音效配置。

```javascript
SoundManager.SOUND_CONFIG.custom = {
    type: 'sine',
    frequency: 1000,
    duration: 0.2,
    volume: 0.3
};
```

**Q: 如何添加新主题？**

A: 在 `ThemeManager.THEMES` 中添加新主题对象。

```javascript
ThemeManager.THEMES.custom = {
    name: '自定义主题',
    colors: {
        'primary-color': '#FF0000',
        // ... 更多颜色
    }
};
```

**Q: 如何添加新语言？**

A: 在 `I18nManager.TRANSLATIONS` 中添加语言对象。

```javascript
I18nManager.TRANSLATIONS.fr = {
    name: 'Français',
    common: { start: 'Démarrer', ... }
};
```

---

## 📞 支持

如有问题，请联系：
- **作者：** Tom the AI Cat 🐱💙
- **项目：** 小游戏项目优化 v2.0

---

**最后更新：** 2026-02-12 23:50 GMT+8
