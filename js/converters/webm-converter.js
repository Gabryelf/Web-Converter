// =============================================================
// МОДУЛЬ КОНВЕРТАЦИИ --> WEBM
// =============================================================

import { CONFIG } from '../config.js';
import { calculateAspectRatio } from '../utils.js';

export class WebmConverter {
    constructor(state, uiController) {
        this.state = state;
        this.ui = uiController;
    }

    async convert(videoFile, fps, duration, startTime, size) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            const url = URL.createObjectURL(videoFile);
            video.src = url;
            video.muted = true;
            video.currentTime = startTime;

            video.onloadeddata = () => {
                const sizePreset = CONFIG.SIZE_PRESETS[size] || CONFIG.SIZE_PRESETS.medium;
                const dimensions = calculateAspectRatio(
                    video.videoWidth,
                    video.videoHeight,
                    sizePreset.width,
                    sizePreset.height
                );

                const totalFrames = Math.min(Math.floor(duration * fps), CONFIG.MAX_FRAMES_WEBM);
                const captureCanvas = document.createElement('canvas');
                captureCanvas.width = dimensions.width;
                captureCanvas.height = dimensions.height;
                const captureCtx = captureCanvas.getContext('2d');

                const stream = captureCanvas.captureStream(fps);
                const recorder = new MediaRecorder(stream, {
                    mimeType: 'video/webm;codecs=vp9',
                    videoBitsPerSecond: 8000000
                });

                const chunks = [];
                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) chunks.push(e.data);
                };

                recorder.onstop = () => {
                    const blob = new Blob(chunks, { type: 'video/webm' });
                    resolve(blob);
                };

                recorder.start(100);

                let currentFrame = 0;
                let videoStartTime = startTime;

                const captureFrame = () => {
                    if (currentFrame >= totalFrames || video.ended || this.state.cancelRequested) {
                        recorder.stop();
                        return;
                    }

                    const progress = Math.round((currentFrame / totalFrames) * 100);
                    this.ui.updateProgress(`🎬 Запись WebM: ${progress}%`);

                    captureCtx.clearRect(0, 0, dimensions.width, dimensions.height);
                    const sx = (video.videoWidth - dimensions.width) / 2;
                    const sy = (video.videoHeight - dimensions.height) / 2;
                    captureCtx.drawImage(video, sx, sy, dimensions.width, dimensions.height, 0, 0, dimensions.width, dimensions.height);
                    currentFrame++;
                    video.currentTime = videoStartTime + (currentFrame / fps);
                };

                video.onseeked = captureFrame;

                video.play().then(() => {
                    video.pause();
                    captureFrame();
                }).catch(reject);
            };

            video.onerror = reject;
            video.load();
        });
    }
}