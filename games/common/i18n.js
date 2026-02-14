/**
 * 游戏多语言支持 (i18n)
 * 支持中文和英文的国际化系统
 */

class I18nManager {
    constructor(options = {}) {
        this.locale = options.locale || 'zh';
        this.fallbackLocale = options.fallbackLocale || 'zh';
        this.translations = I18nManager.TRANSLATIONS;
        this.storageKey = options.storageKey || 'game-language';

        // 初始化
        this.loadFromStorage();
        this.detectBrowserLanguage();
    }

    /**
     * 获取翻译文本
     * @param {string} key - 翻译键
     * @param {object} params - 参数对象
     * @returns {string} 翻译后的文本
     */
    t(key, params = {}) {
        // 查找翻译
        let translation = this.getNestedValue(this.translations[this.locale], key);

        // 如果未找到，尝试回退语言
        if (!translation && this.locale !== this.fallbackLocale) {
            translation = this.getNestedValue(this.translations[this.fallbackLocale], key);
        }

        // 如果仍未找到，返回 key
        if (!translation) {
            console.warn(`❓ 未找到翻译: ${key}`);
            return key;
        }

        // 替换参数
        if (typeof translation === 'string' && params) {
            return this.interpolate(translation, params);
        }

        return translation;
    }

    /**
     * 获取嵌套对象的值
     * @param {object} obj - 对象
     * @param {string} path - 路径（用点分隔）
     * @returns {*} 值
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((a, b) => (a && a[b] !== undefined) ? a[b] : null, obj);
    }

    /**
     * 插值替换
     * @param {string} str - 模板字符串
     * @param {object} params - 参数对象
     * @returns {string} 替换后的字符串
     */
    interpolate(str, params) {
        return str.replace(/\{(\w+)\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    /**
     * 设置语言
     * @param {string} locale - 语言代码
     */
    setLocale(locale) {
        if (!this.translations[locale]) {
            console.warn(`❓ 不支持的语言: ${locale}`);
            return;
        }

        this.locale = locale;
        this.saveToStorage();
        this.updateElements();

        console.log(`🌐 语言已切换: ${locale}`);
    }

    /**
     * 切换语言
     */
    toggleLanguage() {
        const locales = Object.keys(this.translations);
        const currentIndex = locales.indexOf(this.locale);
        const nextIndex = (currentIndex + 1) % locales.length;
        this.setLocale(locales[nextIndex]);
    }

    /**
     * 获取当前语言
     */
    getLocale() {
        return this.locale;
    }

    /**
     * 获取所有支持的语言
     */
    getAvailableLocales() {
        return Object.keys(this.translations).map(locale => ({
            code: locale,
            name: this.translations[locale].name
        }));
    }

    /**
     * 更新页面上的翻译元素
     */
    updateElements() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);

            if (el.hasAttribute('data-i18n-attr')) {
                const attr = el.getAttribute('data-i18n-attr');
                el.setAttribute(attr, translation);
            } else {
                // 保留 HTML 标签如果有
                if (translation.includes('<') && translation.includes('>')) {
                    el.innerHTML = translation;
                } else {
                    el.textContent = translation;
                }
            }
        });

        // 更新占位符
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.setAttribute('placeholder', this.t(key));
        });
    }

    /**
     * 检测浏览器语言
     */
    detectBrowserLanguage() {
        const browserLang = navigator.language.slice(0, 2);
        if (this.translations[browserLang]) {
            this.setLocale(browserLang);
        }
    }

    /**
     * 从本地存储加载
     */
    loadFromStorage() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.locale = saved;
            }
        } catch (e) {
            console.warn('⚠️ 无法从本地存储加载语言设置');
        }
    }

    /**
     * 保存到本地存储
     */
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, this.locale);
        } catch (e) {
            console.warn('⚠️ 无法保存语言设置到本地存储');
        }
    }

    /**
     * 格式化数字（根据语言）
     * @param {number} num - 数字
     * @returns {string} 格式化后的字符串
     */
    formatNumber(num) {
        return new Intl.NumberFormat(this.locale).format(num);
    }

    /**
     * 格式化日期（根据语言）
     * @param {Date} date - 日期
     * @returns {string} 格式化后的字符串
     */
    formatDate(date) {
        return new Intl.DateTimeFormat(this.locale).format(date);
    }
}

/**
 * 翻译文本
 */
I18nManager.TRANSLATIONS = {
    zh: {
        name: '中文',

        // 通用
        common: {
            start: '开始',
            pause: '暂停',
            resume: '继续',
            restart: '重新开始',
            settings: '设置',
            back: '返回',
            cancel: '取消',
            confirm: '确认',
            save: '保存',
            load: '加载',
            close: '关闭',
            yes: '是',
            no: '否',
            help: '帮助'
        },

        // 游戏
        game: {
            score: '分数',
            time: '时间',
            moves: '步数',
            level: '等级',
            best: '最佳',
            highScore: '最高分',
            gameOver: '游戏结束',
            youWon: '你赢了！',
            youLost: '你输了！',
            playAgain: '再玩一次',
            leaderboard: '排行榜',
            saveScore: '保存成绩',
            yourName: '你的名字'
        },

        // 难度
        difficulty: {
            easy: '简单',
            medium: '中等',
            hard: '困难',
            expert: '专家'
        },

        // 模式
        mode: {
            pvp: '双人对战',
            pve: '人机对战'
        },

        // 主题
        theme: {
            name: '主题',
            default: '默认主题',
            dark: '暗黑主题',
            ocean: '海洋主题',
            forest: '森林主题',
            sunset: '日落主题'
        },

        // 语言
        language: {
            name: '语言',
            zh: '中文',
            en: 'English'
        },

        // 设置
        settings: {
            gameSettings: '游戏设置',
            sound: '音效',
            soundEnabled: '音效已开启',
            soundDisabled: '音效已关闭',
            volume: '音量',
            themeDisplay: '主题',
            languageDisplay: '语言',
            enabled: '开启',
            disabled: '关闭'
        },

        // 提示消息
        messages: {
            scoreSaved: '成绩已保存！',
            scoreSaveFailed: '保存失败，请重试',
            gamePaused: '游戏已暂停',
            levelComplete: '关卡完成！',
            congratulations: '恭喜！',
            tryAgain: '再试一次'
        }
    },

    en: {
        name: 'English',

        // 通用
        common: {
            start: 'Start',
            pause: 'Pause',
            resume: 'Resume',
            restart: 'Restart',
            settings: 'Settings',
            back: 'Back',
            cancel: 'Cancel',
            confirm: 'Confirm',
            save: 'Save',
            load: 'Load',
            close: 'Close',
            yes: 'Yes',
            no: 'No',
            help: 'Help'
        },

        // 游戏
        game: {
            score: 'Score',
            time: 'Time',
            moves: 'Moves',
            level: 'Level',
            best: 'Best',
            highScore: 'High Score',
            gameOver: 'Game Over',
            youWon: 'You Won!',
            youLost: 'You Lost!',
            playAgain: 'Play Again',
            leaderboard: 'Leaderboard',
            saveScore: 'Save Score',
            yourName: 'Your Name'
        },

        // 难度
        difficulty: {
            easy: 'Easy',
            medium: 'Medium',
            hard: 'Hard',
            expert: 'Expert'
        },

        // 模式
        mode: {
            pvp: 'PvP',
            pve: 'PvE'
        },

        // 主题
        theme: {
            name: 'Theme',
            default: 'Default',
            dark: 'Dark',
            ocean: 'Ocean',
            forest: 'Forest',
            sunset: 'Sunset'
        },

        // 语言
        language: {
            name: 'Language',
            zh: '中文',
            en: 'English'
        },

        // 设置
        settings: {
            gameSettings: 'Game Settings',
            sound: 'Sound',
            soundEnabled: 'Sound Enabled',
            soundDisabled: 'Sound Disabled',
            volume: 'Volume',
            themeDisplay: 'Theme',
            languageDisplay: 'Language',
            enabled: 'Enabled',
            disabled: 'Disabled'
        },

        // 提示消息
        messages: {
            scoreSaved: 'Score saved!',
            scoreSaveFailed: 'Save failed, please try again',
            gamePaused: 'Game paused',
            levelComplete: 'Level complete!',
            congratulations: 'Congratulations!',
            tryAgain: 'Try Again'
        }
    }
};

// 创建全局实例
const i18n = new I18nManager({
    locale: 'zh',
    fallbackLocale: 'zh',
    storageKey: 'game-language'
});

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { I18nManager, i18n };
}
