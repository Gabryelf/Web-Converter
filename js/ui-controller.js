// =============================================================
// УПРАВЛЕНИЕ И КОНТРОЛЛЕР UI ЭЛЕМЕНТОВ
// =============================================================

import { formatFileSize, getFileExtension } from './utils.js';

export class UIController {
    constructor() {
        this.fileStatus = document.getElementById('fileStatus');
        this.overlay = document.getElementById('canvasOverlay');
        this.layerInfo = document.getElementById('layerInfo');
        this.progressEl = document.getElementById('exportProgress');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.convertBtn = document.getElementById('convertBtn');
        this.fromFormat = document.getElementById('fromFormat');
        this.canvas = document.getElementById('previewCanvas');
        this.ctx = this.canvas.getContext('2d');
    }

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
            this.downloadBtn.disabled = true;
        }
    }

    updateProgress(text) {
        this.progressEl.textContent = text;
        this.progressEl.className = 'progress-visible';
    }

    hideProgress() {
        this.progressEl.className = 'progress-hidden';
    }

    setConverting(isConverting) {
        this.convertBtn.disabled = isConverting;
    }

    setDownloadEnabled(enabled) {
        this.downloadBtn.disabled = !enabled;
    }

    setConvertedResult(blob, fileName) {
        this.downloadBtn.disabled = false;
        this.hideProgress();
        this.progressEl.textContent = '✅ Конвертация завершена!';
    }

    updateSliderLabels(startTime, duration) {
        document.getElementById('startTimeVal').textContent = startTime;
        document.getElementById('durationVal').textContent = duration;
    }

    showPreview(file) {
        // Делегируем PreviewManager
        // Этот метод будет переопределен через сеттер
    }

    showError(message) {
        this.progressEl.textContent = '❌ ' + message;
        this.progressEl.className = 'progress-hidden';
        setTimeout(() => {
            this.progressEl.textContent = '';
        }, 5000);
    }
}