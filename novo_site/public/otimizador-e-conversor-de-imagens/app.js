/* 
 * Silva Digital Tech - Otimizador de Imagens PRO
 * Core Logic 
 */
const $ = (id) => document.getElementById(id);

const state = {
    filesQueue: []
};

document.addEventListener("DOMContentLoaded", () => {
    bindNavigation();
    bindDropzone();
    bindControls();
    
    // Auto-process trigger if quality changes
    $('qualityRange').addEventListener('input', (e) => {
        $('qualityValue').textContent = `${e.target.value}%`;
    });
});

function bindNavigation() {
    document.querySelectorAll("[data-view]").forEach((button) => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === button.dataset.view));
            document.querySelectorAll(".nav-button").forEach((btn) => {
                const active = btn.dataset.view === button.dataset.view;
                btn.classList.toggle("active", active);
            });
        });
    });
    
    $('headerAddBtn').addEventListener('click', () => {
        $('fileInput').click();
    });
}

function bindDropzone() {
    const dropzone = $('dropzone');
    const fileInput = $('fileInput');

    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault(); dropzone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault(); dropzone.classList.remove('dragover');
        }, false);
    });

    dropzone.addEventListener('drop', (e) => handleFiles(e.dataTransfer.files));
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
}

function bindControls() {
    $('clearAllBtn').addEventListener('click', () => {
        state.filesQueue = [];
        renderQueue();
    });
    $('processAllBtn').addEventListener('click', processAllImages);
    $('downloadAllBtn').addEventListener('click', downloadAllZip);
}

function handleFiles(files) {
    if (!files.length) return;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/') && !file.name.endsWith('.ico')) continue;
        
        state.filesQueue.push({
            id: 'img_' + Math.random().toString(36).substr(2, 9),
            file: file,
            name: file.name,
            originalSize: file.size,
            originalType: file.type || 'image/png',
            compressedBlob: null,
            compressedSize: 0,
            status: 'statusWaiting',
            finalName: '',
            previewUrl: URL.createObjectURL(file)
        });
    }
    renderQueue();
    toast(window.t('tAdded'));
    // Auto process upon drop
    processAllImages();
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function renderQueue() {
    const container = $('fileListContainer');
    const downloadBtn = $('downloadAllBtn');
    
    if (state.filesQueue.length === 0) {
        container.innerHTML = `<div class="empty-state"><p>${window.t('emptyQueue')}</p></div>`;
        downloadBtn.style.display = 'none';
        return;
    }

    let hasProcessed = false;
    let html = '';

    state.filesQueue.forEach(item => {
        if(item.compressedBlob) hasProcessed = true;
        const savings = item.compressedSize && item.compressedSize < item.originalSize 
            ? Math.round((1 - item.compressedSize / item.originalSize) * 100) 
            : 0;
            
        const statusClass = item.status === 'statusWaiting' ? 'status-waiting' : 'status-done';

        html += `
            <div class="list-item">
                <div class="item-info">
                    <img src="${item.previewUrl}" class="item-thumb" alt="Preview">
                    <div class="item-details">
                        <span class="item-name">${item.name}</span>
                        <div class="item-meta">
                            <span>${window.t('lblOriginal')} <strong>${formatBytes(item.originalSize)}</strong></span>
                            <span>•</span>
                            <span>${window.t('lblFinal')} <strong style="color: var(--accent);">${item.compressedSize ? formatBytes(item.compressedSize) : '-'}</strong></span>
                            ${savings > 0 ? `<span class="badge-savings">-${savings}%</span>` : ''}
                        </div>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap: 10px;">
                    <span class="status-badge ${statusClass}">${window.t(item.status)}</span>
                    ${item.compressedBlob ? `
                        <button class="ghost-button" style="min-height:30px; padding: 0 10px; font-size: 0.75rem;" onclick="downloadSingle('${item.id}')">${window.t('btnDownload')}</button>
                    ` : ''}
                    <button class="icon-button" style="color: var(--muted); background: transparent; border: 0;" onclick="removeItem('${item.id}')" title="Remover">×</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    downloadBtn.style.display = hasProcessed ? 'inline-flex' : 'none';
}

window.removeItem = function(id) {
    state.filesQueue = state.filesQueue.filter(item => item.id !== id);
    renderQueue();
};

window.downloadSingle = function(id) {
    const item = state.filesQueue.find(i => i.id === id);
    if (!item || !item.compressedBlob) return;
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(item.compressedBlob);
    link.download = item.finalName;
    document.body.appendChild(link);
    link.click();
    link.remove();
};

function processAllImages() {
    if(state.filesQueue.length === 0) return;
    
    const quality = parseInt($('qualityRange').value) / 100;
    const targetFormat = $('outputFormat').value;

    state.filesQueue.forEach((item) => {
        if(item.compressedBlob) return; // Skip already processed

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            let width = img.width;
            let height = img.height;

            let mimeType = item.originalType;
            let ext = item.name.substring(item.name.lastIndexOf('.'));
            const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;

            if (targetFormat !== 'original') {
                mimeType = targetFormat;
                const extMap = { 'image/webp': '.webp', 'image/jpeg': '.jpg', 'image/png': '.png', 'image/x-icon': '.ico' };
                ext = extMap[targetFormat] || ext;
            }

            if (mimeType === 'image/x-icon') {
                width = 32; height = 32;
                mimeType = 'image/png'; // Draw as PNG for ICO format compatibility in JS Blob
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (blob) {
                    item.compressedBlob = blob;
                    item.compressedSize = blob.size;
                    item.status = 'statusProcessed';
                    item.finalName = `opt_${baseName}${ext}`;
                    renderQueue();
                } else {
                    item.status = 'statusError';
                    renderQueue();
                }
            }, mimeType, quality);
        };
        img.onerror = () => {
            item.status = 'statusError';
            renderQueue();
        };
        img.src = item.previewUrl;
    });
}

async function downloadAllZip() {
    if (typeof JSZip === 'undefined') {
        toast("Biblioteca JSZip não carregada.");
        return;
    }
    
    const zip = new JSZip();
    let count = 0;
    
    state.filesQueue.forEach(item => {
        if (item.compressedBlob) {
            zip.file(item.finalName, item.compressedBlob);
            count++;
        }
    });
    
    if (count === 0) return;
    
    toast(window.t('tZipping'));
    try {
        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = "imagens_silva_digital_tech.zip";
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast("Download concluído!");
    } catch(e) {
        toast("Erro ao gerar ZIP.");
    }
}

function toast(message) {
    const t = $('toast');
    t.textContent = message;
    t.classList.add('show');
    clearTimeout(t.timer);
    t.timer = setTimeout(() => t.classList.remove('show'), 3000);
}
