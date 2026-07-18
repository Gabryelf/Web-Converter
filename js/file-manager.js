// =============================================================
// ФАЙЛОВЫЙ ОБРАБОТЧИК - МЕНЕДЖЕР
// =============================================================

import { formatFileSize, getFileExtension } from './utils.js';

export class FileManager {
    constructor(state, uiController) {
        this.state = state;
        this.ui = uiController;
        this.fileInput = document.getElementById('sourceFileInput');
        this.dropArea = document.querySelector('.canvas-wrapper');
        
        this.initEventListeners();
    }

    initEventListeners() {
        // Клик по области загрузки
        document.getElementById('fileUploadArea').addEventListener('click', () => this.fileInput.click());
        
        // Выбор файла
        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                this.loadFile(e.target.files[0]);
            }
        });

        // Drag and drop
        this.dropArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropArea.style.border = '2px solid #64c8ff';
        });
        
        this.dropArea.addEventListener('dragleave', () => {
            this.dropArea.style.border = 'none';
        });
        
        this.dropArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropArea.style.border = 'none';
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.loadFile(files[0]);
                // Синхронизируем input
                const dt = new DataTransfer();
                dt.items.add(files[0]);
                this.fileInput.files = dt.files;
            }
        });
    }

    loadFile(file) {
        this.state.reset();
        this.state.currentFile = file;
        this.state.convertedBlob = null;
        this.ui.updateFileStatus(file);
        this.ui.showPreview(file);
        this.ui.hideProgress();
        this.updateSliderLimits(file);
    }

    updateSliderLimits(file) {
        if (file && file.type.startsWith('video/')) {
            const video = document.createElement('video');
            const url = URL.createObjectURL(file);
            video.src = url;
            video.onloadedmetadata = function() {
                const maxDuration = Math.floor(video.duration);
                const startSlider = document.getElementById('startTimeSlider');
                const durationSlider = document.getElementById('durationSlider');
                startSlider.max = Math.max(0, maxDuration - 0.5);
                durationSlider.max = Math.min(30, maxDuration);
                if (parseFloat(startSlider.value) + parseFloat(durationSlider.value) > maxDuration) {
                    startSlider.value = Math.max(0, maxDuration - parseFloat(durationSlider.value));
                    document.getElementById('startTimeVal').textContent = startSlider.value;
                }
                URL.revokeObjectURL(url);
            };
            video.load();
        }
    }
}