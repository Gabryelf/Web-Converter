// =============================================================
// МОДУЛЬ ПРЕДПРОСМОТРА
// =============================================================

import { CONFIG } from './config.js';

export class PreviewManager {
    constructor(state, uiController) {
        this.state = state;
        this.ui = uiController;
        this.canvas = document.getElementById('previewCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.previewVideo = null;
        this.previewInterval = null;
        this.isPreviewing = false;
    }

    showPreview(file) {
        const type = file.type;
        if (type.startsWith('video/')) {
            this.showVideoPreview(file);
        } else if (type.startsWith('audio/')) {
            this.showAudioPreview();
        }
    }

    showVideoPreview(file) {
        const url = URL.createObjectURL(file);
        const video = document.createElement('video');
        video.src = url;
        video.muted = true;
        video.onloadeddata = () => {
            this.canvas.width = Math.min(video.videoWidth, CONFIG.MAX_CANVAS_SIZE);
            this.canvas.height = Math.min(video.videoHeight, CONFIG.MAX_CANVAS_SIZE);
            this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
            URL.revokeObjectURL(url);
        };
        video.load();
        
        // Fallback для быстрого отображения
        setTimeout(() => {
            if (this.canvas.width === CONFIG.MAX_CANVAS_SIZE && this.canvas.height === CONFIG.MAX_CANVAS_SIZE) {
                this.ctx.fillStyle = '#141824';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.fillStyle = '#64c8ff';
                this.ctx.font = '22px Inter, sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('🎬 Видео загружено', this.canvas.width/2, this.canvas.height/2);
            }
        }, 1000);
    }

    showAudioPreview() {
        this.ctx.fillStyle = '#0f121b';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#64c8ff';
        this.ctx.font = '28px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎵 Аудиофайл загружен', this.canvas.width/2, this.canvas.height/2 - 20);
        this.ctx.font = '16px Inter, sans-serif';
        this.ctx.fillStyle = '#8a9bb0';
        this.ctx.fillText('Для конвертации нажмите "Конвертировать"', this.canvas.width/2, this.canvas.height/2 + 30);
    }

    // ===== ПОЛНАЯ РЕАЛИЗАЦИЯ ПРЕДПРОСМОТРА =====
    previewSelection(file, startTime, duration, size) {
        // Останавливаем предыдущий предпросмотр
        this.stopPreview();

        if (!file || !file.type.startsWith('video/')) {
            this.ui.showError('Загрузите видеофайл для предпросмотра');
            return;
        }

        const video = document.createElement('video');
        const url = URL.createObjectURL(file);
        video.src = url;
        video.muted = true;
        video.currentTime = startTime;

        video.onloadedmetadata = () => {
            // Проверяем, что выбранная область не выходит за пределы видео
            if (startTime + duration > video.duration) {
                this.ui.showError(`Область выходит за пределы видео. Макс: ${(video.duration - startTime).toFixed(1)}с`);
                URL.revokeObjectURL(url);
                return;
            }

            // Устанавливаем размеры canvas
            this.canvas.width = Math.min(video.videoWidth, CONFIG.MAX_CANVAS_SIZE);
            this.canvas.height = Math.min(video.videoHeight, CONFIG.MAX_CANVAS_SIZE);
            
            // Запускаем воспроизведение
            video.play().then(() => {
                this.isPreviewing = true;
                this.previewVideo = video;
                
                let startTime2 = performance.now();
                let elapsed = 0;
                const previewDuration = duration;
                const fps = CONFIG.PREVIEW_FPS || 30;
                const sizePreset = CONFIG.SIZE_PRESETS[size] || CONFIG.SIZE_PRESETS.medium;

                // Очищаем предыдущий интервал
                if (this.previewInterval) {
                    clearInterval(this.previewInterval);
                    this.previewInterval = null;
                }

                this.previewInterval = setInterval(() => {
                    if (video.ended || elapsed >= previewDuration || !this.isPreviewing) {
                        this.stopPreview();
                        // Показываем последний кадр
                        this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
                        return;
                    }
                    
                    elapsed = (performance.now() - startTime2) / 1000;
                    
                    // Очищаем и рисуем видео
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
                    
                    // Показываем прогресс
                    const progress = Math.min(Math.round((elapsed / previewDuration) * 100), 100);
                    this.ui.updateProgress(`🎬 Предпросмотр: ${progress}%`);

                    // Рисуем рамку области захвата
                    this.drawCaptureBox(sizePreset);

                    // Если время вышло, останавливаем
                    if (elapsed >= previewDuration) {
                        this.stopPreview();
                        this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
                        this.ui.updateProgress('✅ Предпросмотр завершён');
                        setTimeout(() => {
                            this.ui.hideProgress();
                        }, 2000);
                    }
                }, 1000 / fps);
            }).catch((err) => {
                console.error('Preview error:', err);
                this.stopPreview();
                this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
                this.ui.showError('Ошибка предпросмотра');
                setTimeout(() => {
                    this.ui.hideProgress();
                }, 3000);
            });
        };

        video.onerror = () => {
            this.stopPreview();
            this.ui.showError('Ошибка загрузки видео для предпросмотра');
            URL.revokeObjectURL(url);
        };
        
        video.load();
    }

    // ===== ВСПОМОГАТЕЛЬНЫЙ МЕТОД ДЛЯ РИСОВКИ РАМКИ =====
    drawCaptureBox(sizePreset) {
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        // Вычисляем масштаб
        const videoAspect = canvasWidth / canvasHeight;
        const boxAspect = sizePreset.width / sizePreset.height;
        
        let boxWidth, boxHeight;
        
        if (boxAspect > videoAspect) {
            // Ограничиваем по ширине
            boxWidth = canvasWidth * 0.7;
            boxHeight = boxWidth / boxAspect;
        } else {
            // Ограничиваем по высоте
            boxHeight = canvasHeight * 0.7;
            boxWidth = boxHeight * boxAspect;
        }
        
        // Центрируем рамку
        const boxX = (canvasWidth - boxWidth) / 2;
        const boxY = (canvasHeight - boxHeight) / 2;
        
        // Рисуем полупрозрачный фон
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Вырезаем область внутри рамки
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(boxX, boxY, boxWidth, boxHeight);
        this.ctx.clip();
        
        // Рисуем видео внутри рамки
        // (видео уже нарисовано, просто показываем его через clip)
        this.ctx.restore();
        
        // Рисуем рамку
        this.ctx.strokeStyle = 'rgba(100, 200, 255, 0.9)';
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = 'rgba(100, 200, 255, 0.3)';
        this.ctx.shadowBlur = 10;
        this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        this.ctx.shadowBlur = 0;
        
        // Рисуем углы рамки
        const cornerSize = 15;
        this.ctx.strokeStyle = '#64c8ff';
        this.ctx.lineWidth = 3;
        
        // Верхний левый угол
        this.ctx.beginPath();
        this.ctx.moveTo(boxX, boxY + cornerSize);
        this.ctx.lineTo(boxX, boxY);
        this.ctx.lineTo(boxX + cornerSize, boxY);
        this.ctx.stroke();
        
        // Верхний правый угол
        this.ctx.beginPath();
        this.ctx.moveTo(boxX + boxWidth - cornerSize, boxY);
        this.ctx.lineTo(boxX + boxWidth, boxY);
        this.ctx.lineTo(boxX + boxWidth, boxY + cornerSize);
        this.ctx.stroke();
        
        // Нижний левый угол
        this.ctx.beginPath();
        this.ctx.moveTo(boxX, boxY + boxHeight - cornerSize);
        this.ctx.lineTo(boxX, boxY + boxHeight);
        this.ctx.lineTo(boxX + cornerSize, boxY + boxHeight);
        this.ctx.stroke();
        
        // Нижний правый угол
        this.ctx.beginPath();
        this.ctx.moveTo(boxX + boxWidth - cornerSize, boxY + boxHeight);
        this.ctx.lineTo(boxX + boxWidth, boxY + boxHeight);
        this.ctx.lineTo(boxX + boxWidth, boxY + boxHeight - cornerSize);
        this.ctx.stroke();
        
        // Информация о размере
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(boxX + 8, boxY + 8, 100, 28);
        this.ctx.fillStyle = '#64c8ff';
        this.ctx.font = '12px Inter, sans-serif';
        this.ctx.fillText(`${sizePreset.width}x${sizePreset.height}`, boxX + 16, boxY + 28);
        
        // Информация о времени
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(boxX + boxWidth - 80, boxY + 8, 72, 28);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`⏱ ${Math.round(this.state?.previewDuration || 0)}с`, boxX + boxWidth - 44, boxY + 28);
        this.ctx.textAlign = 'start';
    }

    // ===== ПОКАЗ РЕЗУЛЬТАТА =====
    showConvertedResult(blob, format) {
        if (format === 'gif') {
            this.showGifPreview(blob);
        } else if (format === 'mp4' || format === 'webm') {
            this.showVideoResult(blob);
        } else {
            this.showAudioResult(format);
        }
    }

    showGifPreview(blob) {
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            this.canvas.width = Math.min(img.width, CONFIG.MAX_CANVAS_SIZE);
            this.canvas.height = Math.min(img.height, CONFIG.MAX_CANVAS_SIZE);
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
            URL.revokeObjectURL(url);
        };
        img.onerror = () => {
            const vid = document.createElement('video');
            vid.src = url;
            vid.muted = true;
            vid.onloadeddata = () => {
                this.canvas.width = Math.min(vid.videoWidth || 640, CONFIG.MAX_CANVAS_SIZE);
                this.canvas.height = Math.min(vid.videoHeight || 360, CONFIG.MAX_CANVAS_SIZE);
                this.ctx.drawImage(vid, 0, 0, this.canvas.width, this.canvas.height);
                URL.revokeObjectURL(url);
            };
            vid.load();
        };
        img.src = url;
    }

    showVideoResult(blob) {
        const url = URL.createObjectURL(blob);
        const vid = document.createElement('video');
        vid.src = url;
        vid.muted = true;
        vid.onloadeddata = () => {
            this.canvas.width = Math.min(vid.videoWidth || 640, CONFIG.MAX_CANVAS_SIZE);
            this.canvas.height = Math.min(vid.videoHeight || 360, CONFIG.MAX_CANVAS_SIZE);
            this.ctx.drawImage(vid, 0, 0, this.canvas.width, this.canvas.height);
            URL.revokeObjectURL(url);
        };
        vid.load();
    }

    showAudioResult(format) {
        this.ctx.fillStyle = '#0f121b';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#64c8ff';
        this.ctx.font = '24px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`✅ Конвертировано в ${format.toUpperCase()}`, this.canvas.width/2, this.canvas.height/2);
    }

    // ===== ОСТАНОВКА ПРЕДПРОСМОТРА =====
    stopPreview() {
        this.isPreviewing = false;
        if (this.previewInterval) {
            clearInterval(this.previewInterval);
            this.previewInterval = null;
        }
        if (this.previewVideo) {
            this.previewVideo.pause();
            this.previewVideo.currentTime = 0;
            this.previewVideo.src = '';
            this.previewVideo = null;
        }
        this.ui.hideProgress();
        // Возвращаем обычный превью
        if (this.state && this.state.currentFile) {
            this.showPreview(this.state.currentFile);
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}