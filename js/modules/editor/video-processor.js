// =============================================================
// ОБРАБОТКА ВИДЕО - ЭФФЕКТЫ И ОБРЕЗКА
// =============================================================

export class VideoProcessor {
    constructor() {
        this.canvas = document.getElementById('previewCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.videoElement = null;
        this.sourceVideo = null;
        this.currentEffect = 'none';
        this.effectIntensity = 50;
        this.trimStart = 0;
        this.trimEnd = 10;
    }

    loadVideo(file) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            const video = document.createElement('video');
            video.src = url;
            video.muted = true;

            video.onloadedmetadata = () => {
                this.videoElement = video;
                this.sourceVideo = file;
                this.canvas.width = Math.min(video.videoWidth, 1280);
                this.canvas.height = Math.min(video.videoHeight, 720);
                this.trimEnd = Math.min(video.duration, 30);
                resolve(video);
            };

            video.onerror = reject;
            video.load();
        });
    }

    setEffect(effect, intensity = 50) {
        this.currentEffect = effect;
        this.effectIntensity = intensity;
        this.applyEffectToFrame();
    }

    setTrim(start, end) {
        this.trimStart = start;
        this.trimEnd = end;
        this.applyEffectToFrame();
    }

    applyEffectToFrame() {
        if (!this.videoElement) return;

        const video = this.videoElement;
        const ctx = this.ctx;
        const canvas = this.canvas;

        // Очищаем канвас
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Рисуем видео
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Получаем данные пикселей
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Применяем эффекты
        this.applyEffect(data, imageData);

        // Отображаем результат
        ctx.putImageData(imageData, 0, 0);

        // Рисуем рамку обрезки
        this.drawTrimBox();
    }

    applyEffect(data, imageData) {
        const intensity = this.effectIntensity / 100;

        switch (this.currentEffect) {
            case 'grayscale':
                this.grayscaleEffect(data);
                break;
            case 'sepia':
                this.sepiaEffect(data);
                break;
            case 'brightness':
                this.brightnessEffect(data, intensity);
                break;
            case 'contrast':
                this.contrastEffect(data, intensity);
                break;
            case 'blur':
                this.blurEffect(data, imageData, intensity);
                break;
            case 'pixelate':
                this.pixelateEffect(imageData, intensity);
                break;
            case 'invert':
                this.invertEffect(data);
                break;
            default:
                break;
        }
    }

    // ===== ЭФФЕКТЫ =====

    grayscaleEffect(data) {
        for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
        }
    }

    sepiaEffect(data) {
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            data[i] = Math.min(255, (r * 0.393 + g * 0.769 + b * 0.189));
            data[i + 1] = Math.min(255, (r * 0.349 + g * 0.686 + b * 0.168));
            data[i + 2] = Math.min(255, (r * 0.272 + g * 0.534 + b * 0.131));
        }
    }

    brightnessEffect(data, intensity) {
        const adjustment = Math.round(255 * intensity * 0.5);
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, data[i] + adjustment));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + adjustment));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + adjustment));
        }
    }

    contrastEffect(data, intensity) {
        const factor = (259 * (intensity * 100 + 255)) / (255 * (259 - intensity * 100));
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
            data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
            data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
        }
    }

    blurEffect(data, imageData, intensity) {
        // Простое размытие (box blur)
        const radius = Math.max(1, Math.floor(intensity * 5));
        const width = imageData.width;
        const height = imageData.height;
        const copy = new Uint8ClampedArray(data);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0, count = 0;
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            const idx = (ny * width + nx) * 4;
                            r += copy[idx];
                            g += copy[idx + 1];
                            b += copy[idx + 2];
                            count++;
                        }
                    }
                }
                const idx = (y * width + x) * 4;
                data[idx] = r / count;
                data[idx + 1] = g / count;
                data[idx + 2] = b / count;
            }
        }
    }

    pixelateEffect(imageData, intensity) {
        const blockSize = Math.max(2, Math.floor(intensity * 10));
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;

        for (let y = 0; y < height; y += blockSize) {
            for (let x = 0; x < width; x += blockSize) {
                let r = 0, g = 0, b = 0, count = 0;
                for (let dy = 0; dy < blockSize && y + dy < height; dy++) {
                    for (let dx = 0; dx < blockSize && x + dx < width; dx++) {
                        const idx = ((y + dy) * width + (x + dx)) * 4;
                        r += data[idx];
                        g += data[idx + 1];
                        b += data[idx + 2];
                        count++;
                    }
                }
                r /= count;
                g /= count;
                b /= count;
                for (let dy = 0; dy < blockSize && y + dy < height; dy++) {
                    for (let dx = 0; dx < blockSize && x + dx < width; dx++) {
                        const idx = ((y + dy) * width + (x + dx)) * 4;
                        data[idx] = r;
                        data[idx + 1] = g;
                        data[idx + 2] = b;
                    }
                }
            }
        }
    }

    invertEffect(data) {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
        }
    }

    drawTrimBox() {
        const canvas = this.canvas;
        const ctx = this.ctx;
        const duration = this.videoElement ? this.videoElement.duration : 10;
        const startPercent = this.trimStart / duration;
        const endPercent = this.trimEnd / duration;

        const boxX = canvas.width * startPercent;
        const boxWidth = canvas.width * (endPercent - startPercent);

        // Затемняем область вне обрезки
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.clearRect(boxX, 0, boxWidth, canvas.height);

        // Рисуем рамку
        ctx.strokeStyle = '#64c8ff';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(boxX, 0, boxWidth, canvas.height);
        ctx.setLineDash([]);

        // Информация о времени
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(boxX + 8, 8, 120, 24);
        ctx.fillStyle = '#64c8ff';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText(`⏱ ${this.trimStart.toFixed(1)}с - ${this.trimEnd.toFixed(1)}с`, boxX + 14, 25);
    }

    async exportVideo(settings) {
        // Экспорт видео с примененными эффектами
        // Будет реализовано с использованием MediaRecorder
        console.log('🎬 Экспорт видео:', settings);
        // TODO: Реализация экспорта
    }

    destroy() {
        if (this.videoElement) {
            this.videoElement.pause();
            this.videoElement.src = '';
            this.videoElement = null;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}