// =============================================================
// ОСНОВНАЯ ТОЧКА ВХОДА ПРИЛОЖЕНИЯ
// =============================================================

import { AppState } from './state.js';
import { UIController } from './modules/ui/ui-controller.js';
import { TabsManager } from './tabs-manager.js';
import { VideoProcessor } from './modules/editor/video-processor.js';
import { GifConverter } from './modules/converters/gif-converter.js';
import { WebmConverter } from './modules/converters/webm-converter.js';
import { AudioConverter } from './modules/converters/audio-converter.js';

// Инициализация
const state = new AppState();
const ui = new UIController();
const tabsManager = new TabsManager();
const videoProcessor = new VideoProcessor();

// Модули конвертации
const gifConverter = new GifConverter(state, ui);
const webmConverter = new WebmConverter(state, ui);
const audioConverter = new AudioConverter();

// Подключаем previewManager к UI
ui.showPreview = (file) => {
    // Если есть видео в редакторе, используем его
    if (videoProcessor.videoElement) {
        const canvas = document.getElementById('previewCanvas');
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoProcessor.videoElement, 0, 0, canvas.width, canvas.height);
    }
};

// =============================================================
// УПРАВЛЕНИЕ ВКЛАДКАМИ
// =============================================================

document.addEventListener('tabChanged', (event) => {
    const tab = event.detail.tab;
    console.log(`📑 Переключено на: ${tab}`);
    state.currentTab = tab;
    
    if (tab === 'editor') {
        ui.hideProgress();
        document.querySelector('#tab-editor').style.display = 'block';
        // Скрываем некоторые элементы конвертера
        document.querySelector('#tab-converter .sidebar-actions').style.display = 'none';
    } else {
        document.querySelector('#tab-editor').style.display = 'none';
        document.querySelector('#tab-converter .sidebar-actions').style.display = 'flex';
    }
});

// =============================================================
// КОНВЕРТЕР - DOM элементы
// =============================================================

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
const fileInput = document.getElementById('sourceFileInput');
const fileUploadArea = document.getElementById('fileUploadArea');

// =============================================================
// КОНВЕРТЕР - ЗАГРУЗКА ФАЙЛА
// =============================================================

fileUploadArea?.addEventListener('click', () => fileInput.click());

fileInput?.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
        state.currentFile = e.target.files[0];
        state.converter.convertedBlob = null;
        downloadBtn.disabled = true;
        ui.updateFileStatus(state.currentFile);
        ui.showPreview(state.currentFile);
        ui.hideProgress();
        updateSliderLimits(state.currentFile);
    }
});

// Drag and drop для конвертера
const dropArea = document.querySelector('.canvas-wrapper');
dropArea?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.style.border = '2px solid #64c8ff';
});

dropArea?.addEventListener('dragleave', () => {
    dropArea.style.border = 'none';
});

dropArea?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.style.border = 'none';
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        state.currentFile = files[0];
        state.converter.convertedBlob = null;
        downloadBtn.disabled = true;
        ui.updateFileStatus(state.currentFile);
        ui.showPreview(state.currentFile);
        ui.hideProgress();
        updateSliderLimits(state.currentFile);
        const dt = new DataTransfer();
        dt.items.add(state.currentFile);
        fileInput.files = dt.files;
    }
});

// =============================================================
// КОНВЕРТЕР - СЛАЙДЕРЫ
// =============================================================

startTimeSlider?.addEventListener('input', () => {
    ui.updateSliderLabels(startTimeSlider.value, durationSlider.value);
});

durationSlider?.addEventListener('input', () => {
    ui.updateSliderLabels(startTimeSlider.value, durationSlider.value);
});

function updateSliderLimits(file) {
    if (file && file.type.startsWith('video/')) {
        const video = document.createElement('video');
        const url = URL.createObjectURL(file);
        video.src = url;
        video.onloadedmetadata = function() {
            const maxDuration = Math.floor(video.duration);
            startTimeSlider.max = Math.max(0, maxDuration - 0.5);
            durationSlider.max = Math.min(30, maxDuration);
            if (parseFloat(startTimeSlider.value) + parseFloat(durationSlider.value) > maxDuration) {
                startTimeSlider.value = Math.max(0, maxDuration - parseFloat(durationSlider.value));
                startTimeVal.textContent = startTimeSlider.value;
            }
            URL.revokeObjectURL(url);
        };
        video.load();
    }
}

// =============================================================
// КОНВЕРТЕР - ПРЕДПРОСМОТР
// =============================================================

previewSelectionBtn?.addEventListener('click', () => {
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

stopPreviewBtn?.addEventListener('click', () => {
    previewManager.stopPreview();
});

// =============================================================
// КОНВЕРТЕР - КОНВЕРТАЦИЯ
// =============================================================

convertBtn?.addEventListener('click', async () => {
    if (!state.currentFile) {
        alert('Сначала загрузите файл!');
        return;
    }

    if (state.converter.isConverting) {
        alert('Конвертация уже выполняется');
        return;
    }

    const to = toFormat.value;
    const quality = qualitySelect.value;
    const fps = parseInt(fpsSelect.value);
    const size = sizeSelect.value;
    const startTime = parseFloat(startTimeSlider.value);
    const duration = parseFloat(durationSlider.value);

    // Проверка для 60 FPS
    if (fps === 60 && to === 'gif') {
        const estimatedFrames = duration * fps;
        const confirm = window.confirm(
            `⚠️ ВЫБРАНО 60 FPS!\n\n` +
            `Это создаст ${Math.round(estimatedFrames)} кадров.\n` +
            `Время конвертации: может занять несколько минут.\n\n` +
            `Рекомендации:\n` +
            `• Уменьшите длительность до 5-10 секунд\n` +
            `• Используйте качество "Низкое" или "Среднее"\n` +
            `• Выберите размер "Маленький" или "Средний"\n\n` +
            `Продолжить?`
        );
        if (!confirm) return;
    }

    // Проверка длительности для видео
    if (state.currentFile.type.startsWith('video/')) {
        const valid = await validateVideoRange(state.currentFile, startTime, duration);
        if (!valid) return;
    }

    state.converter.isConverting = true;
    convertBtn.disabled = true;
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
                reader.onerror = (err) => {
                    reject(new Error('Ошибка чтения файла: ' + err.message));
                };
                reader.readAsArrayBuffer(state.currentFile);
            });
            ext = to;
        }

        if (blob) {
            state.converter.convertedBlob = blob;
            state.converter.convertedFileName = `converted_${Date.now()}.${ext}`;
            downloadBtn.disabled = false;
            ui.hideProgress();
            ui.updateProgress('✅ Конвертация завершена!');
            
            // Показываем результат
            if (ext === 'gif') {
                showGifPreview(blob);
            } else if (ext === 'mp4' || ext === 'webm') {
                showVideoResult(blob);
            } else {
                showAudioResult(ext);
            }
            
            console.log(`✅ Конвертация завершена! Размер: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
        }
    } catch (err) {
        console.error('Conversion error:', err);
        ui.showError('Ошибка конвертации: ' + err.message);
    } finally {
        state.converter.isConverting = false;
        convertBtn.disabled = false;
    }
});

// =============================================================
// КОНВЕРТЕР - ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// =============================================================

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
        video.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(true);
        };
        video.load();
    });
}

function showGifPreview(blob) {
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
        canvas.width = Math.min(img.width, 1280);
        canvas.height = Math.min(img.height, 720);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
    };
    img.onerror = () => {
        const vid = document.createElement('video');
        vid.src = url;
        vid.muted = true;
        vid.onloadeddata = () => {
            canvas.width = Math.min(vid.videoWidth || 640, 1280);
            canvas.height = Math.min(vid.videoHeight || 360, 720);
            ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
        };
        vid.load();
    };
    img.src = url;
}

function showVideoResult(blob) {
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    const url = URL.createObjectURL(blob);
    const vid = document.createElement('video');
    vid.src = url;
    vid.muted = true;
    vid.onloadeddata = () => {
        canvas.width = Math.min(vid.videoWidth || 640, 1280);
        canvas.height = Math.min(vid.videoHeight || 360, 720);
        ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
    };
    vid.load();
}

function showAudioResult(format) {
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f121b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#64c8ff';
    ctx.font = '24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`✅ Конвертировано в ${format.toUpperCase()}`, canvas.width/2, canvas.height/2);
}

// =============================================================
// КОНВЕРТЕР - СБРОС И СКАЧИВАНИЕ
// =============================================================

resetBtn?.addEventListener('click', () => {
    state.resetConverter();
    state.currentFile = null;
    downloadBtn.disabled = true;
    fileInput.value = '';
    ui.updateFileStatus(null);
    ui.hideProgress();
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('canvasOverlay').classList.remove('hidden');
    startTimeSlider.value = 0;
    startTimeVal.textContent = '0';
    durationSlider.value = 5;
    durationVal.textContent = '5';
});

downloadBtn?.addEventListener('click', () => {
    if (!state.converter.convertedBlob) {
        alert('Сначала выполните конвертацию');
        return;
    }
    const link = document.createElement('a');
    link.href = URL.createObjectURL(state.converter.convertedBlob);
    link.download = state.converter.convertedFileName || `converted_${Date.now()}.bin`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
        URL.revokeObjectURL(link.href);
    }, 1000);
});

toFormat?.addEventListener('change', () => {
    state.converter.convertedBlob = null;
    downloadBtn.disabled = true;
    ui.hideProgress();
    ui.updateProgress('Формат изменён, конвертируйте заново');
});

// =============================================================
// РЕДАКТОР - ЗАГРУЗКА ВИДЕО
// =============================================================

const editorUploadArea = document.getElementById('editorUploadArea');
const editorFileInput = document.getElementById('editorFileInput');
const editorFileStatus = document.getElementById('editorFileStatus');
const exportVideoBtn = document.getElementById('exportVideoBtn');

editorUploadArea?.addEventListener('click', () => editorFileInput.click());

editorFileInput?.addEventListener('change', async (e) => {
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        try {
            await videoProcessor.loadVideo(file);
            editorFileStatus.textContent = `📁 ${file.name}`;
            exportVideoBtn.disabled = false;
            
            // Обновляем слайдеры
            const video = videoProcessor.videoElement;
            const editorEndTimeSlider = document.getElementById('editorEndTimeSlider');
            const editorEndTimeVal = document.getElementById('editorEndTimeVal');
            editorEndTimeSlider.max = Math.floor(video.duration);
            editorEndTimeSlider.value = Math.min(video.duration, 10);
            editorEndTimeVal.textContent = Math.min(video.duration, 10);
            videoProcessor.trimEnd = Math.min(video.duration, 10);
            
            // Скрываем оверлей
            document.getElementById('canvasOverlay').classList.add('hidden');
            
            ui.updateProgress('✅ Видео загружено в редактор');
            setTimeout(() => ui.hideProgress(), 2000);
        } catch (err) {
            console.error('Error loading video:', err);
            ui.showError('Ошибка загрузки видео');
        }
    }
});

// =============================================================
// РЕДАКТОР - ЭФФЕКТЫ
// =============================================================

document.querySelectorAll('.effect-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.effect-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const effect = btn.dataset.effect;
        state.editor.currentEffect = effect;
        videoProcessor.setEffect(effect, parseInt(document.getElementById('effectIntensitySlider')?.value || 50));
        
        // Показываем контролы интенсивности
        const controls = document.getElementById('effectControls');
        if (effect !== 'none') {
            controls.style.display = 'block';
        } else {
            controls.style.display = 'none';
        }
    });
});

// Интенсивность эффекта
const effectIntensitySlider = document.getElementById('effectIntensitySlider');
const effectIntensityVal = document.getElementById('effectIntensityVal');

effectIntensitySlider?.addEventListener('input', (e) => {
    const val = e.target.value;
    effectIntensityVal.textContent = val;
    state.editor.effectIntensity = parseInt(val);
    const activeEffect = document.querySelector('.effect-btn.active');
    if (activeEffect) {
        videoProcessor.setEffect(activeEffect.dataset.effect, parseInt(val));
    }
});

// =============================================================
// РЕДАКТОР - ОБРЕЗКА
// =============================================================

const editorStartTimeSlider = document.getElementById('editorStartTimeSlider');
const editorStartTimeVal = document.getElementById('editorStartTimeVal');
const editorEndTimeSlider = document.getElementById('editorEndTimeSlider');
const editorEndTimeVal = document.getElementById('editorEndTimeVal');

editorStartTimeSlider?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    editorStartTimeVal.textContent = val;
    state.editor.trimStart = val;
    videoProcessor.setTrim(val, parseFloat(editorEndTimeSlider.value));
});

editorEndTimeSlider?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    editorEndTimeVal.textContent = val;
    state.editor.trimEnd = val;
    videoProcessor.setTrim(parseFloat(editorStartTimeSlider.value), val);
});

// =============================================================
// РЕДАКТОР - АУДИО
// =============================================================

const audioAction = document.getElementById('audioAction');
const audioUploadArea = document.getElementById('audioUploadArea');
const audioFileInput = document.getElementById('audioFileInput');
const audioFileUploadArea = document.getElementById('audioFileUploadArea');
const audioFileStatus = document.getElementById('audioFileStatus');

audioAction?.addEventListener('change', (e) => {
    const action = e.target.value;
    state.editor.audioAction = action;
    audioUploadArea.style.display = action === 'replace' ? 'block' : 'none';
});

audioFileUploadArea?.addEventListener('click', () => audioFileInput.click());

audioFileInput?.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
        state.editor.audioFile = e.target.files[0];
        audioFileStatus.textContent = `🎵 ${state.editor.audioFile.name}`;
    }
});

// =============================================================
// РЕДАКТОР - ВОДЯНЫЕ ЗНАКИ
// =============================================================

const watermarkType = document.getElementById('watermarkType');
const watermarkTextControls = document.getElementById('watermarkTextControls');
const watermarkImageControls = document.getElementById('watermarkImageControls');
const watermarkText = document.getElementById('watermarkText');
const watermarkPosition = document.getElementById('watermarkPosition');
const watermarkColor = document.getElementById('watermarkColor');
const watermarkOpacity = document.getElementById('watermarkOpacity');
const watermarkOpacityVal = document.getElementById('watermarkOpacityVal');
const watermarkImageInput = document.getElementById('watermarkImageInput');
const watermarkImageUpload = document.getElementById('watermarkImageUpload');

watermarkType?.addEventListener('change', (e) => {
    const type = e.target.value;
    state.editor.watermarkType = type;
    watermarkTextControls.style.display = type === 'text' ? 'block' : 'none';
    watermarkImageControls.style.display = type === 'image' ? 'block' : 'none';
});

watermarkText?.addEventListener('input', (e) => {
    state.editor.watermarkText = e.target.value;
});

watermarkPosition?.addEventListener('change', (e) => {
    state.editor.watermarkPosition = e.target.value;
});

watermarkColor?.addEventListener('input', (e) => {
    state.editor.watermarkColor = e.target.value;
});

watermarkOpacity?.addEventListener('input', (e) => {
    const val = e.target.value;
    watermarkOpacityVal.textContent = val;
    state.editor.watermarkOpacity = parseInt(val);
});

watermarkImageUpload?.addEventListener('click', () => watermarkImageInput.click());

watermarkImageInput?.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
        state.editor.watermarkImage = e.target.files[0];
        ui.updateProgress('🖼️ Изображение загружено');
        setTimeout(() => ui.hideProgress(), 1500);
    }
});

// =============================================================
// РЕДАКТОР - ПРИМЕНЕНИЕ ИЗМЕНЕНИЙ
// =============================================================

const applyEffectsBtn = document.getElementById('applyEffectsBtn');

applyEffectsBtn?.addEventListener('click', async () => {
    if (!videoProcessor.videoElement) {
        alert('Сначала загрузите видео!');
        return;
    }

    state.editor.isProcessing = true;
    applyEffectsBtn.disabled = true;
    ui.updateProgress('🎬 Применение эффектов...');

    try {
        // Применяем все изменения к видео
        const settings = {
            trimStart: state.editor.trimStart,
            trimEnd: state.editor.trimEnd,
            effect: state.editor.currentEffect,
            effectIntensity: state.editor.effectIntensity,
            audioAction: state.editor.audioAction,
            audioFile: state.editor.audioFile,
            watermark: {
                type: state.editor.watermarkType,
                text: state.editor.watermarkText,
                position: state.editor.watermarkPosition,
                color: state.editor.watermarkColor,
                opacity: state.editor.watermarkOpacity / 100,
                image: state.editor.watermarkImage
            }
        };

        // Экспортируем видео
        await videoProcessor.exportVideo(settings);
        
        ui.updateProgress('✅ Изменения применены!');
        setTimeout(() => ui.hideProgress(), 2000);
    } catch (err) {
        console.error('Error applying effects:', err);
        ui.showError('Ошибка применения эффектов: ' + err.message);
    } finally {
        state.editor.isProcessing = false;
        applyEffectsBtn.disabled = false;
    }
});

// =============================================================
// РЕДАКТОР - СБРОС
// =============================================================

const resetEditorBtn = document.getElementById('resetEditorBtn');

resetEditorBtn?.addEventListener('click', () => {
    state.resetEditor();
    videoProcessor.destroy();
    
    // Сбрасываем UI
    editorFileStatus.textContent = 'Файл не выбран';
    exportVideoBtn.disabled = true;
    document.getElementById('canvasOverlay').classList.remove('hidden');
    
    // Сбрасываем эффекты
    document.querySelectorAll('.effect-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.effect-btn[data-effect="none"]')?.classList.add('active');
    document.getElementById('effectControls').style.display = 'none';
    effectIntensitySlider.value = 50;
    effectIntensityVal.textContent = '50';
    
    // Сбрасываем обрезку
    editorStartTimeSlider.value = 0;
    editorStartTimeVal.textContent = '0';
    editorEndTimeSlider.value = 10;
    editorEndTimeVal.textContent = '10';
    
    // Сбрасываем аудио
    audioAction.value = 'keep';
    audioUploadArea.style.display = 'none';
    audioFileStatus.textContent = 'Аудио не выбрано';
    
    // Сбрасываем водяные знаки
    watermarkType.value = 'none';
    watermarkTextControls.style.display = 'none';
    watermarkImageControls.style.display = 'none';
    watermarkOpacity.value = 50;
    watermarkOpacityVal.textContent = '50';
    
    ui.updateProgress('🗑️ Редактор сброшен');
    setTimeout(() => ui.hideProgress(), 1500);
});

// =============================================================
// РЕДАКТОР - ЭКСПОРТ
// =============================================================

exportVideoBtn?.addEventListener('click', async () => {
    if (!videoProcessor.videoElement) {
        alert('Сначала загрузите видео!');
        return;
    }

    if (state.editor.isProcessing) {
        alert('Обработка уже выполняется');
        return;
    }

    state.editor.isProcessing = true;
    exportVideoBtn.disabled = true;
    ui.updateProgress('⏳ Экспорт видео...');

    try {
        const settings = {
            trimStart: state.editor.trimStart,
            trimEnd: state.editor.trimEnd,
            effect: state.editor.currentEffect,
            effectIntensity: state.editor.effectIntensity,
            audioAction: state.editor.audioAction,
            audioFile: state.editor.audioFile,
            watermark: {
                type: state.editor.watermarkType,
                text: state.editor.watermarkText,
                position: state.editor.watermarkPosition,
                color: state.editor.watermarkColor,
                opacity: state.editor.watermarkOpacity / 100,
                image: state.editor.watermarkImage
            }
        };

        const blob = await videoProcessor.exportVideo(settings);
        
        if (blob) {
            // Скачиваем результат
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `edited_video_${Date.now()}.mp4`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(link.href), 1000);
            
            ui.updateProgress('✅ Видео экспортировано!');
            setTimeout(() => ui.hideProgress(), 2000);
        }
    } catch (err) {
        console.error('Error exporting video:', err);
        ui.showError('Ошибка экспорта: ' + err.message);
    } finally {
        state.editor.isProcessing = false;
        exportVideoBtn.disabled = false;
    }
});

// =============================================================
// ИНИЦИАЛИЗАЦИЯ
// =============================================================

// Устанавливаем начальное состояние
document.querySelector('#tab-editor').style.display = 'none';
document.querySelector('.effect-btn[data-effect="none"]')?.classList.add('active');

console.log('🔄 ConvertPro v3.0 loaded!');
console.log('📋 Доступные модули:');
console.log('  • Конвертер: GIF, WebM, WAV');
console.log('  • Редактор: Эффекты, обрезка, аудио, водяные знаки');
console.log('📊 Состояние:', state);