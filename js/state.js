// =============================================================
// ГЛОБАЛЬНОЕ СОСТОЯНИЕ ПРИЛОЖЕНИЯ
// =============================================================

export class AppState {
    constructor() {
        // Общее состояние
        this.currentFile = null;
        this.currentTab = 'converter';
        
        // Состояние конвертера
        this.converter = {
            convertedBlob: null,
            convertedFileName: '',
            isConverting: false,
            previewVideo: null,
            previewInterval: null,
            isPreviewing: false,
            cancelRequested: false
        };
        
        // Состояние редактора
        this.editor = {
            videoFile: null,
            currentEffect: 'none',
            effectIntensity: 50,
            trimStart: 0,
            trimEnd: 10,
            audioAction: 'keep',
            audioFile: null,
            watermarkType: 'none',
            watermarkText: '© ConvertPro',
            watermarkPosition: 'bottom-left',
            watermarkOpacity: 50,
            isProcessing: false
        };
    }

    resetConverter() {
        this.converter.convertedBlob = null;
        this.converter.convertedFileName = '';
        this.converter.isConverting = false;
        this.converter.cancelRequested = false;
        this.converter.isPreviewing = false;
        if (this.converter.previewInterval) {
            clearInterval(this.converter.previewInterval);
            this.converter.previewInterval = null;
        }
        if (this.converter.previewVideo) {
            this.converter.previewVideo.pause();
            this.converter.previewVideo.src = '';
            this.converter.previewVideo = null;
        }
    }

    resetEditor() {
        this.editor.videoFile = null;
        this.editor.currentEffect = 'none';
        this.editor.effectIntensity = 50;
        this.editor.trimStart = 0;
        this.editor.trimEnd = 10;
        this.editor.audioAction = 'keep';
        this.editor.audioFile = null;
        this.editor.watermarkType = 'none';
        this.editor.isProcessing = false;
    }

    resetAll() {
        this.currentFile = null;
        this.resetConverter();
        this.resetEditor();
    }
}