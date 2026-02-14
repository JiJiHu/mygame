/**
 * 游戏主题管理器
 * 使用 CSS 变量驱动的主题切换系统
 */

class ThemeManager {
    constructor(options = {}) {
        this.themes = ThemeManager.THEMES;
        this.currentTheme = options.defaultTheme || 'default';
        this.storageKey = options.storageKey || 'game-theme';

        // 初始化
        this.loadFromStorage();
        this.applyTheme(this.currentTheme);
    }

    /**
     * 应用主题
     * @param {string} themeName - 主题名称
     */
    applyTheme(themeName) {
        const theme = this.themes[themeName];
        if (!theme) {
            console.warn(`❓ 未知主题: ${themeName}`);
            return;
        }

        const root = document.documentElement;

        // 应用 CSS 变量
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });

        this.currentTheme = themeName;
        this.saveToStorage();

        console.log(`🎨 已应用主题: ${theme.name}`);
    }

    /**
     * 切换下一个主题
     */
    nextTheme() {
        const themeNames = Object.keys(this.themes);
        const currentIndex = themeNames.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themeNames.length;
        this.applyTheme(themeNames[nextIndex]);
    }

    /**
     * 切换上一个主题
     */
    prevTheme() {
        const themeNames = Object.keys(this.themes);
        const currentIndex = themeNames.indexOf(this.currentTheme);
        const prevIndex = (currentIndex - 1 + themeNames.length) % themeNames.length;
        this.applyTheme(themeNames[prevIndex]);
    }

    /**
     * 获取当前主题
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * 获取所有主题
     */
    getAllThemes() {
        return this.themes;
    }

    /**
     * 从本地存储加载主题
     */
    loadFromStorage() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved && this.themes[saved]) {
                this.currentTheme = saved;
            }
        } catch (e) {
            console.warn('⚠️ 无法从本地存储加载主题');
        }
    }

    /**
     * 保存主题到本地存储
     */
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, this.currentTheme);
        } catch (e) {
            console.warn('⚠️ 无法保存主题到本地存储');
        }
    }
}

/**
 * 预定义主题
 */
ThemeManager.THEMES = {
    default: {
        name: '默认主题',
        colors: {
            // 主色调
            'primary-color': '#4CAF50',
            'primary-hover': '#45a049',
            'secondary-color': '#2196F3',
            'warning-color': '#FF9800',
            'danger-color': '#f44336',

            // 背景色
            'bg-body': '#f5f5f5',
            'bg-card': '#ffffff',
            'bg-game': '#fafafa',

            // 文字颜色
            'text-primary': '#333333',
            'text-secondary': '#666666',
            'text-light': '#999999',

            // 边框颜色
            'border-color': '#dddddd',
            'border-light': '#eeeeee',

            // 阴影
            'shadow-sm': '0 2px 4px rgba(0,0,0,0.1)',
            'shadow-md': '0 4px 8px rgba(0,0,0,0.12)',
            'shadow-lg': '0 8px 16px rgba(0,0,0,0.15)',

            // 游戏专用
            'snake-bg': '#f0f0f0',
            'snake-head': '#4CAF50',
            'snake-body': '#81C784',
            'snake-food': '#FF5722',

            'gomoku-bg': '#d4a574',
            'gomoku-black': '#333333',
            'gomoku-white': '#f0f0f0',
            'gomoku-grid': '#8B4513',

            'sudoku-bg': '#ffffff',
            'sudoku-cell': '#ffffff',
            'sudoku-fixed': '#333333',
            'sudoku-input': '#2196F3',
            'sudoku-border': '#333333',
            'sudoku-block-border': '#666666'
        }
    },

    dark: {
        name: '暗黑主题',
        colors: {
            // 主色调
            'primary-color': '#66BB6A',
            'primary-hover': '#81C784',
            'secondary-color': '#42A5F5',
            'warning-color': '#FFA726',
            'danger-color': '#EF5350',

            // 背景色
            'bg-body': '#121212',
            'bg-card': '#1E1E1E',
            'bg-game': '#252525',

            // 文字颜色
            'text-primary': '#ffffff',
            'text-secondary': '#B0B0B0',
            'text-light': '#757575',

            // 边框颜色
            'border-color': '#424242',
            'border-light': '#616161',

            // 阴影
            'shadow-sm': '0 2px 4px rgba(0,0,0,0.3)',
            'shadow-md': '0 4px 8px rgba(0,0,0,0.4)',
            'shadow-lg': '0 8px 16px rgba(0,0,0,0.5)',

            // 游戏专用
            'snake-bg': '#2d2d2d',
            'snake-head': '#66BB6A',
            'snake-body': '#4CAF50',
            'snake-food': '#FF7043',

            'gomoku-bg': '#8B7355',
            'gomoku-black': '#424242',
            'gomoku-white': '#E0E0E0',
            'gomoku-grid': '#5D4037',

            'sudoku-bg': '#1E1E1E',
            'sudoku-cell': '#252525',
            'sudoku-fixed': '#ffffff',
            'sudoku-input': '#42A5F5',
            'sudoku-border': '#BDBDBD',
            'sudoku-block-border': '#757575'
        }
    },

    ocean: {
        name: '海洋主题',
        colors: {
            // 主色调
            'primary-color': '#00BCD4',
            'primary-hover': '#26C6DA',
            'secondary-color': '#009688',
            'warning-color': '#FFB74D',
            'danger-color': '#FF7043',

            // 背景色
            'bg-body': '#E0F7FA',
            'bg-card': '#ffffff',
            'bg-game': '#B2EBF2',

            // 文字颜色
            'text-primary': '#006064',
            'text-secondary': '#00838F',
            'text-light': '#0097A7',

            // 边框颜色
            'border-color': '#80DEEA',
            'border-light': '#B2EBF2',

            // 阴影
            'shadow-sm': '0 2px 4px rgba(0,188,212,0.1)',
            'shadow-md': '0 4px 8px rgba(0,188,212,0.15)',
            'shadow-lg': '0 8px 16px rgba(0,188,212,0.2)',

            // 游戏专用
            'snake-bg': '#E0F2F1',
            'snake-head': '#00BCD4',
            'snake-body': '#26C6DA',
            'snake-food': '#FF5722',

            'gomoku-bg': '#B0BEC5',
            'gomoku-black': '#006064',
            'gomoku-white': '#E0F7FA',
            'gomoku-grid': '#546E7A',

            'sudoku-bg': '#E0F7FA',
            'sudoku-cell': '#ffffff',
            'sudoku-fixed': '#006064',
            'sudoku-input': '#00BCD4',
            'sudoku-border': '#00ACC1',
            'sudoku-block-border': '#00838F'
        }
    },

    forest: {
        name: '森林主题',
        colors: {
            // 主色调
            'primary-color': '#4CAF50',
            'primary-hover': '#66BB6A',
            'secondary-color': '#8BC34A',
            'warning-color': '#FFA726',
            'danger-color': '#EF5350',

            // 背景色
            'bg-body': '#F1F8E9',
            'bg-card': '#ffffff',
            'bg-game': '#DCEDC8',

            // 文字颜色
            'text-primary': '#33691E',
            'text-secondary': '#558B2F',
            'text-light': '#7CB342',

            // 边框颜色
            'border-color': '#C5E1A5',
            'border-light': '#DCEDC8',

            // 阴影
            'shadow-sm': '0 2px 4px rgba(76,175,80,0.1)',
            'shadow-md': '0 4px 8px rgba(76,175,80,0.15)',
            'shadow-lg': '0 8px 16px rgba(76,175,80,0.2)',

            // 游戏专用
            'snake-bg': '#F1F8E9',
            'snake-head': '#4CAF50',
            'snake-body': '#81C784',
            'snake-food': '#FF9800',

            'gomoku-bg': '#C5E1A5',
            'gomoku-black': '#33691E',
            'gomoku-white': '#FFFFFF',
            'gomoku-grid': '#558B2F',

            'sudoku-bg': '#F1F8E9',
            'sudoku-cell': '#ffffff',
            'sudoku-fixed': '#33691E',
            'sudoku-input': '#4CAF50',
            'sudoku-border': '#689F38',
            'sudoku-block-border': '#7CB342'
        }
    },

    sunset: {
        name: '日落主题',
        colors: {
            // 主色调
            'primary-color': '#FF7043',
            'primary-hover': '#FF8A65',
            'secondary-color': '#FFA726',
            'warning-color': '#FFD54F',
            'danger-color': '#E57373',

            // 背景色
            'bg-body': '#FFF3E0',
            'bg-card': '#ffffff',
            'bg-game': '#FFE0B2',

            // 文字颜色
            'text-primary': '#BF360C',
            'text-secondary': '#E64A19',
            'text-light': '#F57C00',

            // 边框颜色
            'border-color': '#FFCC80',
            'border-light': '#FFE0B2',

            // 阴影
            'shadow-sm': '0 2px 4px rgba(255,112,67,0.1)',
            'shadow-md': '0 4px 8px rgba(255,112,67,0.15)',
            'shadow-lg': '0 8px 16px rgba(255,112,67,0.2)',

            // 游戏专用
            'snake-bg': '#FFF3E0',
            'snake-head': '#FF7043',
            'snake-body': '#FF8A65',
            'snake-food': '#7B1FA2',

            'gomoku-bg': '#FFE0B2',
            'gomoku-black': '#BF360C',
            'gomoku-white': '#FFF3E0',
            'gomoku-grid': '#F57C00',

            'sudoku-bg': '#FFF3E0',
            'sudoku-cell': '#ffffff',
            'sudoku-fixed': '#BF360C',
            'sudoku-input': '#FF7043',
            'sudoku-border': '#F57C00',
            'sudoku-block-border': '#FF9800'
        }
    }
};

// 创建全局实例
const theme = new ThemeManager({
    defaultTheme: 'default',
    storageKey: 'game-theme'
});

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ThemeManager, theme };
}
