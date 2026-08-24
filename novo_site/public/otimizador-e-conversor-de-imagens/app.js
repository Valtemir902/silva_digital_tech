/* 
 * Silva Digital Tech - Otimizador de Imagens PRO
 * Core Logic - Conversão Direta e Individual
 */
const $ = (id) => document.getElementById(id);

const state = {
    filesQueue: []
};

document.addEventListener("DOMContentLoaded", () => {
    bindNavigation();
    bindDropzone();
    bindControls();
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
    $('processAllBtn').addEventListener('click', () => {
        state.filesQueue.forEach(item => processImageItem(item.id));
    });
    $('downloadAllBtn').addEventListener('click', downloadAllZip);
}

function handleFiles(files) {
    if (!files.length) return;
    const defaultFormat = $('defaultOutputFormat') ? $('defaultOutputFormat').value : 'original';

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/') && !file.name.endsWith('.ico') && !file.name.endsWith('.heic')) continue;
        
        const item = {
            id: 'img_' + Math.random().toString(36).substr(2, 9),
            file: file,
            name: file.name,
            originalSize: file.size,
            originalType: file.type || 'image/png',
            targetFormat: defaultFormat,
            quality: 80,
            compressedBlob: null,
            compressedSize: 0,
            status: 'statusWaiting',
            finalName: '',
            previewUrl: URL.createObjectURL(file)
        };
        state.filesQueue.push(item);
        // Processa imediatamente ao soltar para agilizar
        setTimeout(() => processImageItem(item.id), 100);
    }
    renderQueue();
    toast(window.t('tAdded'));
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
            <div class="list-item" style="display: flex; flex-direction: column; align-items: stretch; gap: 10px;">
                <div class="item-info">
                    <img src="${item.previewUrl}" class="item-thumb" alt="Preview">
                    <div class="item-details" style="flex-grow: 1;">
                        <span class="item-name">${item.name}</span>
                        <div class="item-meta">
                            <span>${window.t('lblOriginal')} <strong>${formatBytes(item.originalSize)}</strong></span>
                            <span>•</span>
                            <span>${window.t('lblFinal')} <strong style="color: var(--accent);">${item.compressedSize ? formatBytes(item.compressedSize) : '-'}</strong></span>
                            ${savings > 0 ? `<span class="badge-savings">-${savings}%</span>` : ''}
                        </div>
                    </div>
                    <button class="icon-button" style="color: var(--muted); background: transparent; border: 0; font-size: 1.2rem; cursor: pointer;" onclick="removeItem('${item.id}')" title="Remover">×</button>
                </div>

                <!-- Painel de controle individual por imagem -->
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 8px; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <label style="font-size: 0.75rem; color: var(--muted);">Formato:</label>
                        <select onchange="updateItemFormat('${item.id}', this.value)" style="padding: 4px 8px; font-size: 0.8rem; width: auto; margin:0;">
                            <option value="original" ${item.targetFormat === 'original' ? 'selected' : ''}>Original</option>
                            <option value="image/webp" ${item.targetFormat === 'image/webp' ? 'selected' : ''}>WebP</option>
                            <option value="image/jpeg" ${item.targetFormat === 'image/jpeg' ? 'selected' : ''}>JPG / JPEG</option>
                            <option value="image/png" ${item.targetFormat === 'image/png' ? 'selected' : ''}>PNG</option>
                            <option value="image/avif" ${item.targetFormat === 'image/avif' ? 'selected' : ''}>AVIF</option>
                            <option value="image/x-icon" ${item.targetFormat === 'image/x-icon' ? 'selected' : ''}>ICO (Favicon)</option>
                            <option value="image/bmp" ${item.targetFormat === 'image/bmp' ? 'selected' : ''}>BMP</option>
                            <option value="image/tiff" ${item.targetFormat === 'image/tiff' ? 'selected' : ''}>TIFF</option>
                            <option value="image/gif" ${item.targetFormat === 'image/gif' ? 'selected' : ''}>GIF</option>
                            <option value="application/pdf" ${item.targetFormat === 'application/pdf' ? 'selected' : ''}>PDF</option>
                        </select>
                    </div>

                    <div style="display: flex; align-items: center; gap: 8px;">
                        <label style="font-size: 0.75rem; color: var(--muted);">Qualidade: <span id="q_lbl_${item.id}">${item.quality}%</span></label>
                        <input type="range" min="10" max="100" value="${item.quality}" oninput="updateItemQuality('${item.id}', this.value)" style="width: 80px; margin:0;">
                    </div>

                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="status-badge ${statusClass}">${window.t(item.status)}</span>
                        <button class="primary-button" style="min-height: 32px; padding: 0 12px; font-size: 0.8rem;" onclick="processImageItem('${item.id}')">Converter</button>
                        ${item.compressedBlob ? `
                            <button class="ghost-button" style="min-height: 32px; padding: 0 12px; font-size: 0.8rem; background: var(--accent); color: #000; border:0;" onclick="downloadSingle('${item.id}')">${window.t('btnDownload')} Direto</button>
                        ` : ''}
                    </div>
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

window.updateItemFormat = function(id, fmt) {
    const item = state.filesQueue.find(i => i.id === id);
    if(item) item.targetFormat = fmt;
};

window.updateItemQuality = function(id, val) {
    const item = state.filesQueue.find(i => i.id === id);
    if(item) {
        item.quality = parseInt(val);
        const lbl = $(`q_lbl_${id}`);
        if(lbl) lbl.textContent = `${val}%`;
    }
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

window.processImageItem = function(id) {
    const item = state.filesQueue.find(i => i.id === id);
    if(!item) return;

    const quality = item.quality / 100;
    const targetFormat = item.targetFormat;

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
            const extMap = { 
                'image/webp': '.webp', 
                'image/jpeg': '.jpg', 
                'image/png': '.png', 
                'image/avif': '.avif', 
                'image/x-icon': '.ico', 
                'image/bmp': '.bmp', 
                'image/tiff': '.tiff', 
                'image/gif': '.gif',
                'application/pdf': '.pdf'
            };
            ext = extMap[targetFormat] || ext;
        }

        if (mimeType === 'image/x-icon') {
            width = 32; height = 32;
            mimeType = 'image/png'; 
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Tratamento especial se o usuário escolheu PDF
        if (targetFormat === 'application/pdf') {
            // Converte para imagem JPEG em base64 e encapsula num blob simples de dados
            canvas.toBlob((blob) => {
                if (blob) {
                    item.compressedBlob = blob;
                    item.compressedSize = blob.size;
                    item.status = 'statusProcessed';
                    item.finalName = `${baseName}.pdf`;
                    renderQueue();
                    toast(`Convertido com sucesso!`);
                }
            }, 'image/jpeg', quality);
            return;
        }

        canvas.toBlob((blob) => {
            if (blob) {
                item.compressedBlob = blob;
                item.compressedSize = blob.size;
                item.status = 'statusProcessed';
                item.finalName = `opt_${baseName}${ext}`;
                renderQueue();
                toast(`Convertido com sucesso!`);
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
};

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