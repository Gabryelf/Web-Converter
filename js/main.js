// =============================================================
// ОСНОВНАЯ ТОЧКА ВХОДА ПРИЛОЖЕНИЯ
// =============================================================

import { AppState } from './state.js';
import { UIController } from './ui-controller.js';
import { FileManager } from './file-manager.js';
import { PreviewManager } from './preview.js';
import { GifConverter } from './converters/gif-converter.js';
import { WebmConverter } from './converters/webm-converter.js';
import { AudioConverter } from './converters/audio-converter.js';

// Инициализация
const state = new AppState();
const ui = new UIController();
const fileManager = new FileManager(state, ui);
const previewManager = new PreviewManager(state, ui);
const gifConverter = new GifConverter(state, ui);
const webmConverter = new WebmConverter(state, ui);
const audioConverter = new AudioConverter();

// Подключаем previewManager к UI
ui.showPreview = (file) => previewManager.showPreview(file);

// DOM элементы
const convertBtn = document.getElementById('convertBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');
const previewSelectionBtn = document.getElementById('previewSelectionBtn');
const stopPreviewBtn = document.getElementById('stopPreviewBtn');
const startTimeSlider = document.getElementById('startTimeSlider');
const durationSlider = document.getElementById('durationSlider');
const toFormat = document.getElementById('toFormat');
const qualitySelect = document.getElementById('qualitySelect');
const fpsSelect = document.getElementById('fpsSelect');
const sizeSelect = document.getElementById('sizeSelect');

// Обновление меток слайдеров
startTimeSlider.addEventListener('input', () => {
    ui.updateSliderLabels(startTimeSlider.value, durationSlider.value);
});

durationSlider.addEventListener('input', () => {
    ui.updateSliderLabels(startTimeSlider.value, durationSlider.value);
});

// Предпросмотр
previewSelectionBtn.addEventListener('click', () => {
    if (!state.currentFile || !state.currentFile.type.startsWith('video/')) {
        alert('Загрузите видеофайл для предпросмотра');
        return;
    }
    previewManager.previewSelection(
        state.currentFile,
        parseFloat(startTimeSlider.value),
        parseFloat(durationSlider.value),
        sizeSelect.value
    );
});

stopPreviewBtn.addEventListener('click', () => {
    previewManager.stopPreview();
});

// Конвертация
convertBtn.addEventListener('click', async () => {
    if (!state.currentFile) {
        alert('Сначала загрузите файл!');
        return;
    }

    if (state.isConverting) {
        alert('Конвертация уже выполняется');
        return;
    }

    const to = toFormat.value;
    const quality = qualitySelect.value;
    const fps = parseInt(fpsSelect.value);
    const size = sizeSelect.value;
    const startTime = parseFloat(startTimeSlider.value);
    const duration = parseFloat(durationSlider.value);

    // Проверка длительности для видео
    if (state.currentFile.type.startsWith('video/')) {
        const valid = await validateVideoRange(state.currentFile, startTime, duration);
        if (!valid) return;
    }

    state.isConverting = true;
    ui.setConverting(true);
    ui.updateProgress('⏳ Подготовка...');

    try {
        let blob = null;
        let ext = to;

        if (to === 'gif' && state.currentFile.type.startsWith('video/')) {
            blob = await gifConverter.convert(state.currentFile, fps, duration, quality, startTime, size);
            ext = 'gif';
        } else if (to === 'webm' && state.currentFile.type.startsWith('video/')) {
            blob = await webmConverter.convert(state.currentFile, fps, duration, startTime, size);
            ext = 'webm';
        } else if (to === 'wav' && state.currentFile.type.startsWith('audio/')) {
            blob = await audioConverter.convertToWav(state.currentFile);
            ext = 'wav';
        } else {
            // Прямое копирование
            const reader = new FileReader();
            blob = await new Promise((resolve) => {
                reader.onload = (e) => {
                    const mimeMap = {
                        'mp4': 'video/mp4',
                        'webm': 'video/webm',
                        'gif': 'image/gif',
                        'mp3': 'audio/mpeg',
                        'wav': 'audio/wav',
                        'ogg': 'audio/ogg'
                    };
                    const mime = mimeMap[to] || 'application/octet-stream';
                    resolve(new Blob([e.target.result], { type: mime }));
                };
                reader.readAsArrayBuffer(state.currentFile);
            });
            ext = to;
        }

        if (blob) {
            state.convertedBlob = blob;
            state.convertedFileName = `converted_${Date.now()}.${ext}`;
            ui.setConvertedResult(blob, state.convertedFileName);
            previewManager.showConvertedResult(blob, ext);
            // После конвертации, в блоке if (blob)
            if (blob && ext === 'gif') {
                // Проверяем размер и скорость GIF
                console.log(`✅ GIF создан!`);
                console.log(`  • Размер: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
                console.log(`  • Кадров: ${Math.round(duration * fps)}`);
                console.log(`  • Ожидаемая длительность: ${duration}с`);
                
                // Показываем информацию пользователю
                ui.updateProgress(`✅ GIF готов! Размер: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
            }
        }


    } catch (err) {
        console.error('Conversion error:', err);
        ui.showError('Ошибка конвертации: ' + err.message);
    } finally {
        state.isConverting = false;
        ui.setConverting(false);
    }
});

// Сброс
resetBtn.addEventListener('click', () => {
    state.reset();
    previewManager.clearCanvas();
    ui.updateFileStatus(null);
    ui.hideProgress();
    ui.setDownloadEnabled(false);
    document.getElementById('fileInput').value = '';
    document.getElementById('startTimeSlider').value = 0;
    document.getElementById('durationSlider').value = 5;
    ui.updateSliderLabels(0, 5);
    ui.overlay.classList.remove('hidden');
});

// Скачивание
downloadBtn.addEventListener('click', () => {
    if (!state.convertedBlob) {
        alert('Сначала выполните конвертацию');
        return;
    }
    const link = document.createElement('a');
    link.href = URL.createObjectURL(state.convertedBlob);
    link.download = state.convertedFileName || `converted_${Date.now()}.bin`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
});

// Смена формата
toFormat.addEventListener('change', () => {
    state.convertedBlob = null;
    ui.setDownloadEnabled(false);
    ui.hideProgress();
    ui.progressEl.textContent = 'Формат изменён, конвертируйте заново';
});

// Вспомогательная функция
function validateVideoRange(file, startTime, duration) {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        const url = URL.createObjectURL(file);
        video.src = url;
        video.onloadedmetadata = function() {
            if (startTime + duration > video.duration) {
                alert(`Выбранная область выходит за пределы видео. Максимальная длительность: ${(video.duration - startTime).toFixed(1)} сек`);
                URL.revokeObjectURL(url);
                resolve(false);
            } else {
                URL.revokeObjectURL(url);
                resolve(true);
            }
        };
        video.load();
    });
}

console.log('🔄 ConvertPro v2.0 loaded!');