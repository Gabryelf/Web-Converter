// =============================================================
// МАШИНА СОСТОЯНИЙ - МЕНЕДЖЕР
// =============================================================

export class AppState {
    constructor() {
        this.currentFile = null;
        this.convertedBlob = null;
        this.convertedFileName = '';
        this.isConverting = false;
        this.previewVideo = null;
        this.previewInterval = null;
        this.isPreviewing = false;
        this.previewStartTime = 0;
        this.previewDuration = 5;
        this.cancelRequested = false;
    }

    reset() {
        this.currentFile = null;
        this.convertedBlob = null;
        this.convertedFileName = '';
        this.isConverting = false;
        this.cancelRequested = false;
        this.stopPreview();
    }

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
    }
}