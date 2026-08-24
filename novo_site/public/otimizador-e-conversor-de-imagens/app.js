/* 
 * Silva Digital Tech - Otimizador de Imagens PRO
 * Core Logic - Botões de Download Gigantes e Conversão Instantânea
 */
const $ = (id) => document.getElementById(id);

const state = {
    filesQueue: []
};

document.addEventListener("DOMContentLoaded", () => {
    bindDropzone();
    bindControls();
});

document.getElementById('headerAddBtn').addEventListener('click', () => {
    $('fileInput').click();
});

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
    $('downloadAllBtn').addEventListener('click', downloadAllZip);
}

function handleFiles(files) {
    if (!files.length) return;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/') && !file.name.endsWith('.ico') && !file.name.endsWith('.heic')) continue;
        
        const item = {
            id: 'img_' + Math.random().toString(36).substr(2, 9),
            file: file,
            name: file.name,
            originalSize: file.size,
            originalType: file.type || 'image/png',
            targetFormat: 'original',
            quality: 80,
            compressedBlob: null,
            compressedSize: 0,
            status: 'Aguardando',
            finalName: '',
            previewUrl: URL.createObjectURL(file)
        };
        state.filesQueue.push(item);
        // Processa automaticamente ao carregar
        setTimeout(() => processImageItem(item.id), 100);
    }
    renderQueue();
    toast("Imagens adicionadas e processadas com sucesso!");
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
        container.innerHTML = `<div class="empty-state"><p>Nenhuma imagem carregada na fila ainda. Selecione ou arraste acima.</p></div>`;
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

        // Formato legível para exibir no botão gigante
        const formatNames = {
            'original': 'Original',
            'image/webp': 'WebP',
            'image/jpeg': 'JPG',
            'image/png': 'PNG',
            'image/avif': 'AVIF',
            'image/x-icon': 'ICO',
            'image/bmp': 'BMP',
            'image/tiff': 'TIFF',
            'image/gif': 'GIF',
            'application/pdf': 'PDF'
        };
        const currentFormatName = formatNames[item.targetFormat] || 'Arquivo';

        html += `
            <div class="list-item" style="display: flex; flex-direction: column; align-items: stretch; gap: 12px; background: rgba(15,23,42,0.9); border: 1px solid rgba(6,182,212,0.3); border-radius: 14px; padding: 18px;">
                <div class="item-info" style="display: flex; align-items: center; gap: 16px;">
                    <img src="${item.previewUrl}" class="item-thumb" alt="Preview" style="width: 60px; height: 60px; border-radius: 10px; object-fit: cover;">
                    <div class="item-details" style="flex-grow: 1;">
                        <span class="item-name" style="font-size: 1rem; font-weight: bold; color: #fff;">${item.name}</span>
                        <div class="item-meta" style="display: flex; gap: 10px; margin-top: 4px; font-size: 0.85rem;">
                            <span>Original: <strong>${formatBytes(item.originalSize)}</strong></span>
                            <span>•</span>
                            <span>Final: <strong style="color: var(--accent);">${item.compressedSize ? formatBytes(item.compressedSize) : 'Processando...'}</strong></span>
                            ${savings > 0 ? `<span class="badge-savings">-${savings}%</span>` : ''}
                        </div>
                    </div>
                    <button class="danger-button" style="padding: 6px 12px; font-size: 0.8rem;" onclick="removeItem('${item.id}')">Remover</button>
                </div>

                <!-- Controles individuais limpos e profissionais -->
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 15px; background: rgba(0,0,0,0.4); padding: 12px 16px; border-radius: 10px; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <label style="font-size: 0.85rem; color: #fff; font-weight:600;">Converter para:</label>
                        <select onchange="updateItemFormat('${item.id}', this.value)" style="padding: 6px 12px; font-size: 0.9rem; border-radius: 8px; background: #0b0f19; color: #fff; border: 1px solid var(--line);">
                            <option value="original" ${item.targetFormat === 'original' ? 'selected' : ''}>Manter Formato Original</option>
                            <option value="image/webp" ${item.targetFormat === 'image/webp' ? 'selected' : ''}>WebP (Web)</option>
                            <option value="image/jpeg" ${item.targetFormat === 'image/jpeg' ? 'selected' : ''}>JPG / JPEG</option>
                            <option value="image/png" ${item.targetFormat === 'image/png' ? 'selected' : ''}>PNG</option>
                            <option value="image/avif" ${item.targetFormat === 'image/avif' ? 'selected' : ''}>AVIF (Alta Compressão)</option>
                            <option value="image/x-icon" ${item.targetFormat === 'image/x-icon' ? 'selected' : ''}>ICO (Favicon)</option>
                            <option value="image/bmp" ${item.targetFormat === 'image/bmp' ? 'selected' : ''}>BMP</option>
                            <option value="image/tiff" ${item.targetFormat === 'image/tiff' ? 'selected' : ''}>TIFF</option>
                            <option value="image/gif" ${item.targetFormat === 'image/gif' ? 'selected' : ''}>GIF</option>
                            <option value="application/pdf" ${item.targetFormat === 'application/pdf' ? 'selected' : ''}>PDF</option>
                        </select>
                    </div>

                    <div style="display: flex; align-items: center; gap: 10px;">
                        <label style="font-size: 0.85rem; color: #fff; font-weight:600;">Qualidade: <span id="q_lbl_${item.id}" style="color: var(--primary);">${item.quality}%</span></label>
                        <input type="range" min="10" max="100" value="${item.quality}" oninput="updateItemQuality('${item.id}', this.value)" style="width: 100px; accent-color: var(--accent);">
                    </div>

                    <!-- BOTÃO DE BAIXAR IMAGEM GIGANTE E DESTACADO COM O FORMATO ESCOLHIDO -->
                    <div>
                        ${item.compressedBlob ? `
                            <button class="primary-button" style="padding: 10px 24px; font-size: 0.95rem; background: linear-gradient(135deg, var(--accent), #059669); box-shadow: 0 4px 20px rgba(16,185,129,0.4);" onclick="downloadSingle('${item.id}')">
                                📥 Baixar Imagem (${currentFormatName})
                            </button>
                        ` : `
                            <button class="ghost-button" style="padding: 10px 20px; font-size: 0.9rem;" onclick="processImageItem('${item.id}')">Processar</button>
                        `}
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
    if(item) {
        item.targetFormat = fmt;
        processImageItem(id); // Converte automaticamente ao trocar o formato
    }
};

window.updateItemQuality = function(id, val) {
    const item = state.filesQueue.find(i => i.id === id);
    if(item) {
        item.quality = parseInt(val);
        const lbl = $(`q_lbl_${id}`);
        if(lbl) lbl.textContent = `${val}%`;
        processImageItem(id); // Recomprime automaticamente ao mover o slider
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
    toast(`Download concluído: ${item.finalName}`);
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

        if (targetFormat === 'application/pdf') {
            canvas.toBlob((blob) => {
                if (blob) {
                    item.compressedBlob = blob;
                    item.compressedSize = blob.size;
                    item.status = 'Pronto';
                    item.finalName = `${baseName}.pdf`;
                    renderQueue();
                }
            }, 'image/jpeg', quality);
            return;
        }

        canvas.toBlob((blob) => {
            if (blob) {
                item.compressedBlob = blob;
                item.compressedSize = blob.size;
                item.status = 'Pronto';
                item.finalName = `opt_${baseName}${ext}`;
                renderQueue();
            } else {
                item.status = 'Erro';
                renderQueue();
            }
        }, mimeType, quality);
    };
    img.onerror = () => {
        item.status = 'Erro';
        renderQueue();
    };
    img.src = item.previewUrl;
};

async function downloadAllZip() {
    if (typeof JSZip === 'undefined') return;
    const zip = new JSZip();
    let count = 0;
    
    state.filesQueue.forEach(item => {
        if (item.compressedBlob) {
            zip.file(item.finalName, item.compressedBlob);
            count++;
        }
    });
    
    if (count === 0) return;
    
    toast("Gerando arquivo ZIP...");
    try {
        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = "imagens_otimizadas_silvadigitaltech.zip";
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast("Download em lote concluído!");
    } catch(e) {
        toast("Erro ao gerar ZIP.");
    }
}

function toast(message) {
    const t = $('toast');
    if(!t) return;
    t.textContent = message;
    t.classList.add('show');
    clearTimeout(t.timer);
    t.timer = setTimeout(() => t.classList.remove('show'), 3000);
}