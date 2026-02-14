const GameUtils = (function() {
    'use strict';

    const CONFIG = {
        HOME_URL: '../../index.html',
        STORAGE_PREFIX: 'game_'
    };

    function goBackHome() {
        window.location.href = window.location.pathname.includes('/games/')
            ? '../index.html'
            : './index.html';
    }

    function showToast(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 9999;
            animation: toastSlideDown 0.3s ease-out;
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastSlideUp 0.3s ease-in';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    const GameStorage = {
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.error('保存失败:', e);
            }
        },

        get(key, defaultValue = null) {
            try {
                const value = localStorage.getItem(key);
                return value ? JSON.parse(value) : defaultValue;
            } catch (e) {
                console.error('读取失败:', e);
                return defaultValue;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.error('删除失败:', e);
            }
        },

        clear() {
            try {
                localStorage.clear();
            } catch (e) {
                console.error('清空失败:', e);
            }
        }
    };

    const Storage = {
        set(key, value, usePrefix = true) {
            const fullKey = usePrefix ? CONFIG.STORAGE_PREFIX + key : key;
            try {
                localStorage.setItem(fullKey, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('Storage set error:', e);
                return false;
            }
        },

        get(key, defaultValue = null, usePrefix = true) {
            const fullKey = usePrefix ? CONFIG.STORAGE_PREFIX + key : key;
            try {
                const item = localStorage.getItem(fullKey);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.error('Storage get error:', e);
                return defaultValue;
            }
        },

        remove(key, usePrefix = true) {
            const fullKey = usePrefix ? CONFIG.STORAGE_PREFIX + key : key;
            try {
                localStorage.removeItem(fullKey);
                return true;
            } catch (e) {
                console.error('Storage remove error:', e);
                return false;
            }
        },

        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (e) {
                console.error('Storage clear error:', e);
                return false;
            }
        },

        clearByPrefix(prefix = CONFIG.STORAGE_PREFIX) {
            try {
                for (let i = localStorage.length - 1; i >= 0; i--) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith(prefix)) {
                        localStorage.removeItem(key);
                    }
                }
                return true;
            } catch (e) {
                console.error('Storage clearByPrefix error:', e);
                return false;
            }
        }
    };

    function formatTime(seconds) {
        if (seconds === undefined || seconds === null || isNaN(seconds)) {
            return '00:00';
        }
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function formatNumber(num) {
        if (num === undefined || num === null || isNaN(num)) {
            return '0';
        }
        return num.toLocaleString('zh-CN');
    }

    function formatDate(date) {
        return new Date(date).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
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
        return translations[difficulty] || difficulty || '未知';
    }

    function debounce(func, wait = 300, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }

    function throttle(func, limit = 300) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    function shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        if (Array.isArray(obj)) {
            return obj.map(item => deepClone(item));
        }
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = deepClone(obj[key]);
            }
        }
        return cloned;
    }

    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    function isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    function vibrate(pattern = 50) {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    function playSound(frequency = 440, duration = 200, type = 'sine') {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            
            const ctx = new AudioContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);
            
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + duration / 1000);
        } catch (e) {
            console.error('Play sound error:', e);
        }
    }

    function requestFullscreen(element) {
        const el = element || document.documentElement;
        const methods = [
            'requestFullscreen',
            'webkitRequestFullscreen',
            'mozRequestFullScreen',
            'msRequestFullscreen'
        ];
        
        for (const method of methods) {
            if (el[method]) {
                el[method]();
                return true;
            }
        }
        return false;
    }

    function exitFullscreen() {
        const methods = [
            'exitFullscreen',
            'webkitExitFullscreen',
            'mozCancelFullScreen',
            'msExitFullscreen'
        ];
        
        for (const method of methods) {
            if (document[method]) {
                document[method]();
                return true;
            }
        }
        return false;
    }

    function isFullscreen() {
        return !!(document.fullscreenElement || 
                  document.webkitFullscreenElement || 
                  document.mozFullScreenElement || 
                  document.msFullscreenElement);
    }

    function parseQueryString(url = window.location.search) {
        const params = {};
        const queryString = url.replace(/^\?/, '');
        
        if (!queryString) return params;
        
        queryString.split('&').forEach(param => {
            const [key, value] = param.split('=');
            if (key) {
                params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
            }
        });
        
        return params;
    }

    function buildQueryString(params) {
        return Object.keys(params)
            .filter(key => params[key] !== undefined && params[key] !== null)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
    }

    function copyToClipboard(text) {
        if (navigator.clipboard) {
            return navigator.clipboard.writeText(text);
        }
        
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            return success ? Promise.resolve() : Promise.reject(new Error('Copy failed'));
        } catch (e) {
            document.body.removeChild(textarea);
            return Promise.reject(e);
        }
    }

    function downloadFile(content, filename, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function retry(fn, maxAttempts = 3, delay = 1000) {
        return new Promise((resolve, reject) => {
            const attempt = async (currentAttempt) => {
                try {
                    const result = await fn();
                    resolve(result);
                } catch (error) {
                    if (currentAttempt >= maxAttempts) {
                        reject(error);
                    } else {
                        setTimeout(() => attempt(currentAttempt + 1), delay);
                    }
                }
            };
            attempt(1);
        });
    }

    const ToastAnimations = `
        @keyframes toastSlideDown {
            from {
                transform: translateX(-50%) translateY(-100%);
                opacity: 0;
            }
            to {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
        }

        @keyframes toastSlideUp {
            from {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
            to {
                transform: translateX(-50%) translateY(-100%);
                opacity: 0;
            }
        }
    `;

    const style = document.createElement('style');
    style.textContent = ToastAnimations;
    document.head.appendChild(style);

    return {
        CONFIG,
        goBackHome,
        showToast,
        GameStorage,
        Storage,
        formatTime,
        formatNumber,
        formatDate,
        translateDifficulty,
        debounce,
        throttle,
        shuffleArray,
        generateId,
        clamp,
        randomInt,
        deepClone,
        isMobile,
        isTouchDevice,
        vibrate,
        playSound,
        requestFullscreen,
        exitFullscreen,
        isFullscreen,
        parseQueryString,
        buildQueryString,
        copyToClipboard,
        downloadFile,
        formatFileSize,
        wait,
        retry
    };
})();

if (typeof window !== 'undefined') {
    window.GameUtils = GameUtils;
    window.goBackHome = GameUtils.goBackHome;
    window.showToast = GameUtils.showToast;
    window.GameStorage = GameUtils.GameStorage;
    window.formatTime = GameUtils.formatTime;
    window.formatDate = GameUtils.formatDate;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameUtils;
}
