/**
 * 游戏音效管理器
 * 统一管理所有游戏的音效播放
 */

class SoundManager {
    constructor(options = {}) {
        this.sounds = {};
        this.enabled = options.enabled !== undefined ? options.enabled : true;
        this.volume = options.volume !== undefined ? options.volume : 0.5;
        this.audioContext = null;
        this.initialized = false;
    }

    /**
     * 初始化音频上下文
     */
    init() {
        if (this.initialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            console.log('🔊 音效系统已初始化');
        } catch (e) {
            console.warn('⚠️ 音效系统初始化失败，浏览器可能不支持 Web Audio API');
        }
    }

    /**
     * 确保音频上下文已初始化
     */
    ensureInit() {
        if (!this.initialized) {
            this.init();
        }
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    /**
     * 播放音效
     * @param {string} soundType - 音效类型
     * @param {object} options - 音效选项
     */
    play(soundType, options = {}) {
        if (!this.enabled) return;

        this.ensureInit();

        const config = SoundManager.SOUND_CONFIG[soundType];
        if (!config) {
            console.warn(`❓ 未知音效类型: ${soundType}`);
            return;
        }

        // 合并选项
        const finalConfig = {
            ...config,
            ...options,
            volume: (config.volume || 0.5) * this.volume
        };

        // 生成并播放音效
        this.generateSound(finalConfig);

        // 触觉反馈（如果支持）
        if (finalConfig.vibrate && options.vibrate !== false) {
            navigator.vibrate?.(finalConfig.vibrate);
        }
    }

    /**
     * 生成音效
     * @param {object} config - 音效配置
     */
    generateSound(config) {
        if (!this.audioContext) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // 设置波形
        oscillator.type = config.type || 'sine';

        // 设置频率
        if (config.frequency) {
            oscillator.frequency.setValueAtTime(config.frequency, now);
        }

        // 音量包络
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(config.volume || 0.3, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + (config.duration || 0.1));

        // 启动和停止
        oscillator.start(now);
        oscillator.stop(now + (config.duration || 0.1));
    }

    /**
     * 切换静音
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    /**
     * 设置音量
     * @param {number} volume - 音量 (0-1)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    /**
     * 获取是否启用
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * 获取当前音量
     */
    getVolume() {
        return this.volume;
    }

    /**
     * 销毁音效管理器
     */
    destroy() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
            this.initialized = false;
        }
    }
}

/**
 * 预定义音效配置
 */
SoundManager.SOUND_CONFIG = {
    // UI 音效
    click: {
        type: 'sine',
        frequency: 800,
        duration: 0.05,
        volume: 0.2,
        vibrate: 10
    },

    hover: {
        type: 'sine',
        frequency: 600,
        duration: 0.03,
        volume: 0.1
    },

    // 游戏事件
    move: {
        type: 'sine',
        frequency: 400,
        duration: 0.05,
        volume: 0.15
    },

    capture: {
        type: 'square',
        frequency: 300,
        duration: 0.1,
        volume: 0.25,
        vibrate: 20
    },

    // 成功/失败
    success: {
        type: 'sine',
        frequency: 523.25,
        duration: 0.15,
        volume: 0.3,
        vibrate: 50
    },

    win: {
        type: 'sine',
        frequency: 523.25,
        duration: 0.2,
        volume: 0.4,
        vibrate: [50, 50, 50]
    },

    lose: {
        type: 'sawtooth',
        frequency: 200,
        duration: 0.3,
        volume: 0.3,
        vibrate: [100, 50, 100]
    },

    // 特殊音效
    powerUp: {
        type: 'sine',
        frequency: 400,
        duration: 0.2,
        volume: 0.3,
        vibrate: 30
    },

    levelUp: {
        type: 'sine',
        frequency: 600,
        duration: 0.2,
        volume: 0.35,
        vibrate: [20, 20, 20, 20]
    },

    bomb: {
        type: 'sawtooth',
        frequency: 100,
        duration: 0.3,
        volume: 0.4,
        vibrate: [100]
    },

    // 数独专用
    fillCell: {
        type: 'sine',
        frequency: 500,
        duration: 0.04,
        volume: 0.15
    },

    error: {
        type: 'sawtooth',
        frequency: 150,
        duration: 0.1,
        volume: 0.2,
        vibrate: 30
    },

    // 五子棋专用
    placeStone: {
        type: 'sine',
        frequency: 450,
        duration: 0.06,
        volume: 0.2
    },

    checkmate: {
        type: 'square',
        frequency: 700,
        duration: 0.3,
        volume: 0.35,
        vibrate: [100, 50, 50]
    }
};

// 创建全局实例
const sound = new SoundManager({
    enabled: true,
    volume: 0.5
});

// 自动初始化（用户交互后）
document.addEventListener('click', () => sound.init(), { once: true });
document.addEventListener('touchstart', () => sound.init(), { once: true });

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SoundManager, sound };
}
