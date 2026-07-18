// =============================================================
// КОНФИГУРАЦИИ ПРИЛОЖЕНИЯ - НАСТРОЙКИ 
// =============================================================

export const CONFIG = {
    SIZE_PRESETS: {
        'small': { width: 320, height: 240 },
        'medium': { width: 480, height: 360 },
        'large': { width: 640, height: 480 },
        'xlarge': { width: 854, height: 480 },
        'hd': { width: 1280, height: 720 }
    },
    QUALITY_MAP: {
        'low': 30,
        'medium': 15,
        'high': 5,
        'ultra': 2
    },
    MAX_CANVAS_SIZE: 1280,
    PREVIEW_FPS: 30,
    MAX_FRAMES_GIF: 900,
    MAX_FRAMES_WEBM: 500
};