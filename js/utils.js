// =============================================================
// ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ - УТИЛИТЫ
// =============================================================

export function calculateAspectRatio(width, height, targetWidth, targetHeight) {
    const aspectRatio = width / height;
    let finalWidth = Math.min(targetWidth, width);
    let finalHeight = Math.min(targetHeight, height);
    
    if (finalWidth / finalHeight > aspectRatio) {
        finalHeight = Math.round(finalWidth / aspectRatio);
    } else {
        finalWidth = Math.round(finalHeight * aspectRatio);
    }
    
    return { width: finalWidth, height: finalHeight };
}

export function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

export function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

export function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}
