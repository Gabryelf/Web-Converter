// =============================================================
// УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЬСКИМ ИНТЕРФЕЙСОМ
// =============================================================

import { formatFileSize, getFileExtension } from '../../utils.js';

export class UIController {
    constructor() {
        // DOM элементы
        this.fileStatus = document.getElementById('fileStatus');
        this.overlay = document.getElementById('canvasOverlay');
        this.layerInfo = document.getElementById('layerInfo');
        this.progressEl = document.getElementById('exportProgress');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.convertBtn = document.getElementById('convertBtn');
        this.fromFormat = document.getElementById('fromFormat');
        this.canvas = document.getElementById('previewCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Элементы редактора
        this.editorFileStatus = document.getElementById('editorFileStatus');
        this.exportVideoBtn = document.getElementById('exportVideoBtn');
        this.applyEffectsBtn = document.getElementById('applyEffectsBtn');
        
        // Инициализация
        this.init();
    }

    init() {
        // Устанавливаем начальное состояние
        this.hideProgress();
        this.setDownloadEnabled(false);
        this.setConverting(false);
        
        // Показываем оверлей
        if (this.overlay) {
            this.overlay.classList.remove('hidden');
        }
    }

    // =============================================================
    // УПРАВЛЕНИЕ ФАЙЛАМИ
    // =============================================================

    updateFileStatus(file) {
        if (file) {
            const size = formatFileSize(file.size);
            this.fileStatus.textContent = `📁 ${file.name} (${size})`;
            
            const ext = getFileExtension(file.name);
            if (['mp4', 'webm', 'mp3', 'wav', 'ogg'].includes(ext)) {
                this.fromFormat.value = ext;
            } else {
                this.fromFormat.value = 'auto';
            }
            
            this.layerInfo.textContent = `Файл: ${file.name} | Размер: ${size}`;
            this.overlay.classList.add('hidden');
        } else {
            this.fileStatus.textContent = 'Файл не выбран';
            this.layerInfo.textContent = 'Файл: — | Размер: —';
            this.overlay.classList.remove('hidden');
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.setDownloadEnabled(false);
        }
    }

    updateEditorFileStatus(file) {
        if (this.editorFileStatus) {
            if (file) {
                const size = formatFileSize(file.size);
                this.editorFileStatus.textContent = `📁 ${file.name} (${size})`;
            } else {
                this.editorFileStatus.textContent = 'Файл не выбран';
            }
        }
    }

    // =============================================================
    // УПРАВЛЕНИЕ ПРОГРЕССОМ
    // =============================================================

    updateProgress(text) {
        if (this.progressEl) {
            this.progressEl.textContent = text;
            this.progressEl.className = 'progress-visible';
        }
    }

    hideProgress() {
        if (this.progressEl) {
            this.progressEl.className = 'progress-hidden';
            this.progressEl.textContent = '';
        }
    }

    showProgress(text, duration = 0) {
        this.updateProgress(text);
        if (duration > 0) {
            setTimeout(() => this.hideProgress(), duration);
        }
    }

    // =============================================================
    // УПРАВЛЕНИЕ КНОПКАМИ
    // =============================================================

    setConverting(isConverting) {
        if (this.convertBtn) {
            this.convertBtn.disabled = isConverting;
            this.convertBtn.textContent = isConverting ? '⏳ Конвертация...' : '🔄 Конвертировать';
        }
    }

    setDownloadEnabled(enabled) {
        if (this.downloadBtn) {
            this.downloadBtn.disabled = !enabled;
        }
    }

    setExportEnabled(enabled) {
        if (this.exportVideoBtn) {
            this.exportVideoBtn.disabled = !enabled;
        }
    }

    setApplyEffectsEnabled(enabled) {
        if (this.applyEffectsBtn) {
            this.applyEffectsBtn.disabled = !enabled;
        }
    }

    // =============================================================
    // УПРАВЛЕНИЕ СЛАЙДЕРАМИ
    // =============================================================

    updateSliderLabels(startTime, duration) {
        const startTimeVal = document.getElementById('startTimeVal');
        const durationVal = document.getElementById('durationVal');
        if (startTimeVal) startTimeVal.textContent = startTime;
        if (durationVal) durationVal.textContent = duration;
    }

    updateEditorSliderLabels(startTime, endTime) {
        const startTimeVal = document.getElementById('editorStartTimeVal');
        const endTimeVal = document.getElementById('editorEndTimeVal');
        if (startTimeVal) startTimeVal.textContent = startTime;
        if (endTimeVal) endTimeVal.textContent = endTime;
    }

    // =============================================================
    // УПРАВЛЕНИЕ ОВЕРЛЕЕМ
    // =============================================================

    showOverlay(message = 'Загрузите файл и выберите режим работы') {
        if (this.overlay) {
            this.overlay.classList.remove('hidden');
            const content = this.overlay.querySelector('.overlay-content');
            if (content) {
                const p = content.querySelector('p');
                if (p) p.textContent = message;
            }
        }
    }

    hideOverlay() {
        if (this.overlay) {
            this.overlay.classList.add('hidden');
        }
    }

    // =============================================================
    // УПРАВЛЕНИЕ КАНВАСОМ
    // =============================================================

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawOnCanvas(image, width, height) {
        this.canvas.width = width || this.canvas.width;
        this.canvas.height = height || this.canvas.height;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);
    }

    drawTextOnCanvas(text, x, y, options = {}) {
        const defaultOptions = {
            color: '#ffffff',
            fontSize: 24,
            fontFamily: 'Inter, sans-serif',
            textAlign: 'center',
            textBaseline: 'middle'
        };
        const opts = { ...defaultOptions, ...options };
        
        this.ctx.fillStyle = opts.color;
        this.ctx.font = `${opts.fontSize}px ${opts.fontFamily}`;
        this.ctx.textAlign = opts.textAlign;
        this.ctx.textBaseline = opts.textBaseline;
        this.ctx.fillText(text, x, y);
    }

    // =============================================================
    // УПРАВЛЕНИЕ СООБЩЕНИЯМИ
    // =============================================================

    showMessage(message, type = 'info', duration = 3000) {
        // Создаем элемент сообщения
        const msgEl = document.createElement('div');
        msgEl.className = `message message-${type}`;
        msgEl.textContent = message;
        
        // Стилизуем
        msgEl.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            border-radius: 8px;
            color: white;
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            z-index: 9999;
            max-width: 80%;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
        `;
        
        // Цвет в зависимости от типа
        const colors = {
            info: '#64c8ff',
            success: '#4caf50',
            warning: '#ff9800',
            error: '#f44336'
        };
        msgEl.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(msgEl);
        
        // Автоматическое скрытие
        if (duration > 0) {
            setTimeout(() => {
                msgEl.style.opacity = '0';
                msgEl.style.transform = 'translateX(-50%) translateY(20px)';
                setTimeout(() => msgEl.remove(), 300);
            }, duration);
        }
        
        return msgEl;
    }

    showError(message, duration = 5000) {
        return this.showMessage(message, 'error', duration);
    }

    showSuccess(message, duration = 3000) {
        return this.showMessage(message, 'success', duration);
    }

    showInfo(message, duration = 3000) {
        return this.showMessage(message, 'info', duration);
    }

    // =============================================================
    // УПРАВЛЕНИЕ СОСТОЯНИЕМ ЭФФЕКТОВ
    // =============================================================

    setActiveEffect(effectName) {
        document.querySelectorAll('.effect-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.effect === effectName);
        });
    }

    getActiveEffect() {
        const active = document.querySelector('.effect-btn.active');
        return active ? active.dataset.effect : 'none';
    }

    // =============================================================
    // УПРАВЛЕНИЕ ВОДЯНЫМИ ЗНАКАМИ
    // =============================================================

    updateWatermarkPreview(text, color, opacity, position) {
        // Метод для обновления превью водяного знака
        // Будет реализован позже
    }

    // =============================================================
    // ОБНОВЛЕНИЕ ИНФОРМАЦИИ О ВИДЕО
    // =============================================================

    updateVideoInfo(duration, width, height, fps) {
        const info = [];
        if (duration) info.push(`Длительность: ${duration.toFixed(1)}с`);
        if (width && height) info.push(`Разрешение: ${width}x${height}`);
        if (fps) info.push(`FPS: ${fps}`);
        this.layerInfo.textContent = info.join(' | ') || 'Файл: — | Размер: —';
    }

    // =============================================================
    // ОБНОВЛЕНИЕ ПРОГРЕССА ЭКСПОРТА
    // =============================================================

    updateExportProgress(progress, message = '') {
        const progressBar = document.getElementById('exportProgressBar');
        const progressText = document.getElementById('exportProgressText');
        
        if (progressBar) {
            progressBar.style.width = `${Math.min(progress, 100)}%`;
        }
        if (progressText) {
            progressText.textContent = message || `${Math.round(progress)}%`;
        }
    }

    // =============================================================
    // ОБНОВЛЕНИЕ ТЕМЫ
    // =============================================================

    setTheme(theme) {
        // Переключение темы (светлая/темная)
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('convertpro_theme', theme);
    }

    getTheme() {
        return localStorage.getItem('convertpro_theme') || 'dark';
    }

    // =============================================================
    // ОБНОВЛЕНИЕ ЯЗЫКА
    // =============================================================

    setLanguage(lang) {
        // Переключение языка интерфейса
        localStorage.setItem('convertpro_lang', lang);
        // Здесь можно добавить загрузку переводов
    }

    getLanguage() {
        return localStorage.getItem('convertpro_lang') || 'ru';
    }

    // =============================================================
    // ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ
    // =============================================================

    setConvertedResult(blob, fileName) {
        this.setDownloadEnabled(true);
        this.hideProgress();
        this.showProgress('✅ Конвертация завершена!', 2000);
    }

    showPreview(file) {
        // Метод для показа превью файла
        // Будет переопределен в main.js
        console.log('Preview file:', file);
    }

    // =============================================================
    // ОЧИСТКА РЕСУРСОВ
    // =============================================================

    destroy() {
        this.hideProgress();
        this.clearCanvas();
        this.setDownloadEnabled(false);
        this.setConverting(false);
        this.showOverlay();
    }
}