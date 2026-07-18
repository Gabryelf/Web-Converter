// =============================================================
// МОДУЛЬ КОНВЕРТАЦИИ --> GIF 
// =============================================================

import { CONFIG } from '../../config.js';
import { calculateAspectRatio } from '../../utils.js';

export class GifConverter {
    constructor(state, uiController) {
        this.state = state;
        this.ui = uiController;
    }

    async convert(videoFile, fps, duration, quality, startTime, size) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            const url = URL.createObjectURL(videoFile);
            video.src = url;
            video.muted = true;
            video.currentTime = startTime;

            const onLoaded = () => {
                const sizePreset = CONFIG.SIZE_PRESETS[size] || CONFIG.SIZE_PRESETS.medium;
                const dimensions = calculateAspectRatio(
                    video.videoWidth, 
                    video.videoHeight,
                    sizePreset.width, 
                    sizePreset.height
                );

                // ===== ИСПРАВЛЕНИЕ: Правильный расчет FPS =====
                // Используем точный FPS без автоматического снижения
                const effectiveFps = Math.min(fps, 60);
                
                // Рассчитываем количество кадров
                let totalFrames = Math.floor(duration * effectiveFps);
                
                // Ограничиваем только если слишком много кадров
                const MAX_FRAMES = 1200;
                if (totalFrames > MAX_FRAMES) {
                    console.warn(`⚠️ Слишком много кадров (${totalFrames}), ограничиваем до ${MAX_FRAMES}`);
                    totalFrames = MAX_FRAMES;
                }

                // ===== ГЛАВНОЕ ИСПРАВЛЕНИЕ: Правильная задержка =====
                // gifshot ожидает задержку в МИЛЛИСЕКУНДАХ между кадрами
                // Задержка = 1000 / FPS
                const frameDelay = Math.round(1000 / effectiveFps);
                
                // Для gifshot также нужно указать frameDuration в МИЛЛИСЕКУНДАХ
                // но в некоторых версиях это центисекунды (1/100 секунды)
                // Проверяем оба варианта
                const frameDuration = Math.round(100 / effectiveFps);

                console.log(`🎬 Параметры GIF:`);
                console.log(`  • Кадров: ${totalFrames}`);
                console.log(`  • FPS: ${effectiveFps}`);
                console.log(`  • Задержка (мс): ${frameDelay}`);
                console.log(`  • frameDuration: ${frameDuration}`);

                const captureCanvas = document.createElement('canvas');
                captureCanvas.width = dimensions.width;
                captureCanvas.height = dimensions.height;
                const captureCtx = captureCanvas.getContext('2d');

                let frameDataUrls = [];
                let currentFrame = 0;
                let videoStartTime = startTime;

                const captureFrame = () => {
                    if (currentFrame >= totalFrames || video.ended || this.state.cancelRequested) {
                        if (this.state.cancelRequested) {
                            reject(new Error('Конвертация отменена'));
                            return;
                        }
                        // Создаем GIF с правильной задержкой
                        this.createGifFromDataUrls(
                            frameDataUrls, 
                            frameDelay,  // Передаем задержку в МИЛЛИСЕКУНДАХ
                            quality, 
                            resolve, 
                            reject
                        );
                        return;
                    }

                    const progress = Math.round((currentFrame / totalFrames) * 50);
                    this.ui.updateProgress(`🎬 Захват кадров: ${progress}% (${currentFrame}/${totalFrames})`);

                    captureCtx.clearRect(0, 0, dimensions.width, dimensions.height);
                    const sx = (video.videoWidth - dimensions.width) / 2;
                    const sy = (video.videoHeight - dimensions.height) / 2;
                    captureCtx.drawImage(video, sx, sy, dimensions.width, dimensions.height, 0, 0, dimensions.width, dimensions.height);
                    frameDataUrls.push(captureCanvas.toDataURL('image/png'));

                    currentFrame++;
                    
                    const nextTime = videoStartTime + (currentFrame / effectiveFps);
                    if (nextTime < videoStartTime + duration) {
                        video.currentTime = nextTime;
                    } else {
                        // Завершаем
                        this.createGifFromDataUrls(
                            frameDataUrls, 
                            frameDelay,
                            quality, 
                            resolve, 
                            reject
                        );
                    }
                };

                video.onseeked = captureFrame;

                video.play().then(() => {
                    video.pause();
                    captureFrame();
                }).catch((err) => {
                    console.error('Video play error:', err);
                    reject(new Error('Ошибка воспроизведения видео: ' + err.message));
                });
            };

            video.onloadeddata = onLoaded;
            video.onerror = (err) => {
                console.error('Video load error:', err);
                reject(new Error('Ошибка загрузки видео'));
            };
            video.load();
        });
    }

    createGifFromDataUrls(dataUrls, delayMs, quality, resolve, reject) {
        if (typeof gifshot === 'undefined') {
            reject(new Error('Библиотека gifshot не загружена'));
            return;
        }

        if (dataUrls.length === 0) {
            reject(new Error('Нет кадров для создания GIF'));
            return;
        }

        const qualityMap = CONFIG.QUALITY_MAP;
        let sampleInterval = qualityMap[quality] || 15;

        console.log(`📊 Создание GIF:`);
        console.log(`  • Кадров: ${dataUrls.length}`);
        console.log(`  • Задержка: ${delayMs}ms`);
        console.log(`  • sampleInterval: ${sampleInterval}`);

        this.ui.updateProgress(`🎞️ Загрузка ${dataUrls.length} кадров...`);

        const imagePromises = dataUrls.map((dataUrl) => {
            return new Promise((resolveImg) => {
                const img = new Image();
                img.onload = () => resolveImg(img);
                img.onerror = () => {
                    // Fallback
                    const canvas = document.createElement('canvas');
                    canvas.width = 100;
                    canvas.height = 100;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = '#000';
                    ctx.fillRect(0, 0, 100, 100);
                    const fallbackImg = new Image();
                    fallbackImg.onload = () => resolveImg(fallbackImg);
                    fallbackImg.onerror = () => resolveImg(null);
                    fallbackImg.src = canvas.toDataURL();
                };
                img.src = dataUrl;
            });
        });

        Promise.all(imagePromises).then((images) => {
            const validImages = images.filter(img => img && img.complete && img.naturalWidth > 0);
            
            if (validImages.length === 0) {
                reject(new Error('Не удалось загрузить ни одного кадра'));
                return;
            }

            this.ui.updateProgress(`🖼️ Создание GIF из ${validImages.length} кадров...`);

            // Определяем размер GIF
            const firstImg = validImages[0];
            const maxWidth = 480;
            const maxHeight = 360;
            let gifWidth = Math.min(firstImg.naturalWidth, maxWidth);
            let gifHeight = Math.min(firstImg.naturalHeight, maxHeight);
            
            const aspect = firstImg.naturalWidth / firstImg.naturalHeight;
            if (gifWidth / gifHeight > aspect) {
                gifHeight = Math.round(gifWidth / aspect);
            } else {
                gifWidth = Math.round(gifHeight * aspect);
            }

            console.log(`📐 Размер GIF: ${gifWidth}x${gifHeight}`);

            // ===== ГЛАВНОЕ ИСПРАВЛЕНИЕ =====
            // gifshot использует frameDuration в МИЛЛИСЕКУНДАХ
            // но в некоторых версиях это центисекунды
            // Используем оба параметра для надежности
            const options = {
                images: validImages,
                gifWidth: gifWidth,
                gifHeight: gifHeight,
                frameDuration: delayMs / 10, // Пробуем центисекунды (1/100 сек)
                sampleInterval: sampleInterval,
                numWorkers: 2,
                backgroundColor: '#000000',
                transparent: null,
                progressCallback: (progress) => {
                    const pct = Math.round(50 + (progress / 100) * 40);
                    this.ui.updateProgress(`🎞️ Создание GIF: ${pct}%`);
                }
            };

            console.log(`🔄 frameDuration: ${options.frameDuration} (${delayMs}ms / 10)`);

            gifshot.createGIF(options, (obj) => {
                if (!obj.error && obj.image) {
                    this.ui.updateProgress('✅ GIF готов!');
                    
                    try {
                        const byteString = atob(obj.image.split(',')[1]);
                        const ab = new ArrayBuffer(byteString.length);
                        const ia = new Uint8Array(ab);
                        for (let i = 0; i < byteString.length; i++) {
                            ia[i] = byteString.charCodeAt(i);
                        }
                        const blob = new Blob([ab], { type: 'image/gif' });
                        
                        console.log(`✅ GIF создан! Размер: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
                        resolve(blob);
                    } catch (err) {
                        reject(new Error('Ошибка обработки GIF: ' + err.message));
                    }
                } else {
                    reject(new Error('Ошибка создания GIF: ' + (obj.error || 'Неизвестная ошибка')));
                }
            });
        }).catch((err) => {
            console.error('Promise.all error:', err);
            reject(new Error('Ошибка загрузки кадров: ' + err.message));
        });
    }
}