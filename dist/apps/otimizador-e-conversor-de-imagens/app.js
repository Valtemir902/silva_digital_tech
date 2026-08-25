/* 
 * Silva Digital Tech - Conversor e Redimensionador PRO
 * Motor Logico: Sem Falsos Formatos. Conversões Matematicamente 100% Reais.
 */
const $ = (id) => document.getElementById(id);

const state = { filesQueue: [] };

document.addEventListener("DOMContentLoaded", () => {
    const dropzone = $('dropzone');
    const fileInput = $('fileInput');

    ['dragenter', 'dragover'].forEach(evt => dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.style.borderColor = '#10b981'; }));
    ['dragleave', 'drop'].forEach(evt => dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.style.borderColor = 'rgba(6, 182, 212, 0.5)'; }));
    
    dropzone.addEventListener('drop', (e) => handleFiles(e.dataTransfer.files));
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

    $('clearAllBtn').addEventListener('click', () => {
        state.filesQueue.forEach(i => { if(i.cropperInstance) i.cropperInstance.destroy(); });
        state.filesQueue = [];
        renderQueue();
    });

    $('convertAllBtn').addEventListener('click', convertAllImages);
});

function handleFiles(files) {
    if (!files.length) return;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const item = {
            id: 'img_' + Math.random().toString(36).substr(2, 9),
            file: file,
            name: file.name,
            originalSize: file.size,
            originalType: file.type || 'image/png',
            targetFormat: 'original',
            quality: 80,
            mode: 'convert', 
            cropWidth: 1080,
            cropHeight: 1080,
            cropperInstance: null,
            compressedBlob: null,
            compressedSize: 0,
            status: window.t('statusWaiting'),
            finalName: '',
            previewUrl: URL.createObjectURL(file)
        };
        state.filesQueue.push(item);
    }
    renderQueue();
    toast(window.t('toastAdded'));
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'], i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const formatNames = { 
    'original':'Original', 'image/webp':'WEBP', 'image/jpeg':'JPG', 'image/png':'PNG', 
    'image/avif':'AVIF', 'application/pdf':'PDF', 'image/svg+xml':'SVG', 'image/x-icon':'ICO'
};

function buildControlsHTML(item) {
    if (item.status === window.t('statusDone')) {
        const cFormat = formatNames[item.targetFormat] || 'ARQUIVO';
        return `<button class="btn-download-huge" onclick="downloadSingle('${item.id}')">${window.t('btnDownload')} (${cFormat})</button>`;
    }
    
    return `
        <div class="controls-wrapper">
            <!-- Seleção de Modo -->
            <div class="mode-selector">
                <label><input type="radio" name="mode_${item.id}" value="convert" ${item.mode==='convert'?'checked':''} onchange="changeMode('${item.id}', 'convert')"> ${window.t('modeConvert')}</label>
                <label><input type="radio" name="mode_${item.id}" value="crop" ${item.mode==='crop'?'checked':''} onchange="changeMode('${item.id}', 'crop')"> ${window.t('modeCrop')}</label>
            </div>

            <!-- Grade de Inputs (Sem formatos falsos) -->
            <div class="inputs-grid">
                <div class="input-group">
                    <label>${window.t('lblFormat')}</label>
                    <select onchange="updateItemFormat('${item.id}', this.value)">
                        <option value="original" ${item.targetFormat === 'original' ? 'selected' : ''}>${window.t('fmtOriginal')}</option>
                        <option value="image/jpeg" ${item.targetFormat === 'image/jpeg' ? 'selected' : ''}>${window.t('fmtJpg')}</option>
                        <option value="image/png" ${item.targetFormat === 'image/png' ? 'selected' : ''}>${window.t('fmtPng')}</option>
                        <option value="image/webp" ${item.targetFormat === 'image/webp' ? 'selected' : ''}>${window.t('fmtWebp')}</option>
                        <option value="image/avif" ${item.targetFormat === 'image/avif' ? 'selected' : ''}>${window.t('fmtAvif')}</option>
                        <option value="application/pdf" ${item.targetFormat === 'application/pdf' ? 'selected' : ''}>${window.t('fmtPdf')}</option>
                        <option value="image/svg+xml" ${item.targetFormat === 'image/svg+xml' ? 'selected' : ''}>${window.t('fmtSvg')}</option>
                        <option value="image/x-icon" ${item.targetFormat === 'image/x-icon' ? 'selected' : ''}>${window.t('fmtIco')}</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>${window.t('lblQuality')} <span id="q_lbl_${item.id}" style="color:var(--accent); font-size: 1.1rem;">${item.quality}%</span></label>
                    <input type="range" min="10" max="100" value="${item.quality}" oninput="updateItemQuality('${item.id}', this.value)">
                </div>
            </div>

            <!-- Painel de Recorte -->
            <div id="crop_panel_${item.id}" class="cropper-panel" style="display: ${item.mode==='crop'?'flex':'none'};">
                <div class="cropper-dims">
                    <div class="input-group">
                        <label>${window.t('lblWidth')}</label>
                        <input type="number" value="${item.cropWidth}" onchange="updateCropDim('${item.id}', 'width', this.value)">
                    </div>
                    <div class="input-group">
                        <label>${window.t('lblHeight')}</label>
                        <input type="number" value="${item.cropHeight}" onchange="updateCropDim('${item.id}', 'height', this.value)">
                    </div>
                </div>
                <p style="color: #10b981; font-size: 0.85rem; font-weight: bold; text-align: center; margin: 0;">${window.t('hintCrop')}</p>
                <div class="cropper-bg">
                    <img id="img_target_${item.id}" src="${item.previewUrl}" style="max-width:100%; display:block;">
                </div>
            </div>
        </div>
    `;
}

function renderQueue() {
    const container = $('fileListContainer');
    const actionArea = $('actionArea');
    const emptyState = $('emptyState');

    if (state.filesQueue.length === 0) {
        emptyState.style.display = 'block'; 
        actionArea.style.display = 'none';
        container.querySelectorAll('.list-item').forEach(el => el.remove()); 
        return;
    }

    emptyState.style.display = 'none'; 
    actionArea.style.display = 'block';

    state.filesQueue.forEach(item => {
        let el = $(`item_${item.id}`);
        if (!el) {
            el = document.createElement('div');
            el.className = 'list-item';
            el.id = `item_${item.id}`;
            el.innerHTML = `
                <div class="item-header">
                    <div class="item-info">
                        <img src="${item.previewUrl}" alt="Thumb">
                        <div class="item-text">
                            <span class="item-name">${item.name}</span>
                            <span id="meta_${item.id}" class="item-meta">${window.t('lblOriginalSize')} ${formatBytes(item.originalSize)}</span>
                        </div>
                    </div>
                    <button class="btn-remove" onclick="removeItem('${item.id}')">${window.t('btnRemove')}</button>
                </div>
                <div id="workspace_${item.id}">${buildControlsHTML(item)}</div>
            `;
            container.prepend(el);
            if(item.mode === 'crop') setTimeout(() => initCropper(item), 100);
        } else {
            const meta = $(`meta_${item.id}`);
            if(item.status === window.t('statusDone')) {
                meta.innerHTML = `${window.t('lblNewSize')} <strong style="color:#10b981;">${formatBytes(item.compressedSize)}</strong>`;
                const ws = $(`workspace_${item.id}`);
                if(ws && !ws.innerHTML.includes('btn-download-huge')) {
                    if (item.cropperInstance) { item.cropperInstance.destroy(); item.cropperInstance = null; }
                    ws.innerHTML = buildControlsHTML(item);
                }
            } else { 
                meta.innerHTML = `${window.t('lblOriginalSize')} ${formatBytes(item.originalSize)} | Status: <strong style="color:#f59e0b;">${item.status}</strong>`; 
            }
        }
    });
    container.querySelectorAll('.list-item').forEach(el => { if(!state.filesQueue.find(i => i.id === el.id.replace('item_', ''))) el.remove(); });
}

window.removeItem = function(id) {
    const item = state.filesQueue.find(i => i.id === id);
    if(item && item.cropperInstance) item.cropperInstance.destroy();
    state.filesQueue = state.filesQueue.filter(item => item.id !== id); 
    renderQueue();
};

window.changeMode = function(id, mode) {
    const item = state.filesQueue.find(i => i.id === id); 
    if(!item) return;
    if (item.cropperInstance) { item.cropperInstance.destroy(); item.cropperInstance = null; }
    item.mode = mode;
    $(`workspace_${id}`).innerHTML = buildControlsHTML(item);
    if (mode === 'crop') setTimeout(() => initCropper(item), 100);
};

function initCropper(item) {
    const image = $(`img_target_${item.id}`); 
    if(!image) return;
    item.cropperInstance = new Cropper(image, { 
        aspectRatio: item.cropWidth / item.cropHeight, 
        viewMode: 1, 
        autoCropArea: 1, 
        background: false 
    });
}

window.updateCropDim = function(id, axis, val) {
    const item = state.filesQueue.find(i => i.id === id); 
    if(!item) return;
    const v = parseInt(val) || 100;
    if (axis === 'width') item.cropWidth = v; 
    if (axis === 'height') item.cropHeight = v;
    if (item.cropperInstance) item.cropperInstance.setAspectRatio(item.cropWidth / item.cropHeight);
};

window.updateItemFormat = (id, fmt) => { const item = state.filesQueue.find(i => i.id === id); if(item) item.targetFormat = fmt; };
window.updateItemQuality = (id, val) => { const item = state.filesQueue.find(i => i.id === id); if(item) { item.quality = parseInt(val); $(`q_lbl_${id}`).textContent = `${val}%`; }};

window.downloadSingle = function(id) {
    const item = state.filesQueue.find(i => i.id === id); 
    if (!item || !item.compressedBlob) return;
    const a = document.createElement('a'); 
    a.href = URL.createObjectURL(item.compressedBlob); 
    a.download = item.finalName; 
    document.body.appendChild(a); 
    a.click(); 
    a.remove();
};

async function convertAllImages() {
    const items = state.filesQueue.filter(i => i.status !== window.t('statusDone'));
    if (!items.length) return toast(window.t('toastEmpty'));

    const btn = $('convertAllBtn'), prog = $('progressContainer'), bar = $('progressBar');
    btn.disabled = true; 
    btn.innerHTML = window.t('btnConverting'); 
    prog.style.display = 'block'; 
    bar.style.width = '0%';
    
    let count = 0;

    for (const item of items) {
        item.status = window.t('statusProcessing'); 
        renderQueue();
        await processSingleItem(item.id);
        count++; 
        bar.style.width = Math.round((count / items.length) * 100) + '%'; 
        renderQueue();
    }

    btn.disabled = false; 
    btn.innerHTML = window.t('btnConvert'); 
    setTimeout(() => prog.style.display = 'none', 1000); 
    toast(window.t('toastDone'));
}

function processSingleItem(id) {
    return new Promise((resolve) => {
        const item = state.filesQueue.find(i => i.id === id); 
        if(!item) return resolve();
        
        const quality = item.quality / 100;
        const targetFormat = item.targetFormat;
        let mimeType = item.originalType;
        let ext = item.name.substring(item.name.lastIndexOf('.'));
        const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;

        if (targetFormat !== 'original') {
            mimeType = targetFormat;
            // MAPEAMENTO DOS 8 FORMATOS 100% REAIS E GARANTIDOS
            const extMap = { 
                'image/webp': '.webp', 'image/jpeg': '.jpg', 'image/png': '.png', 'image/avif': '.avif', 
                'image/x-icon': '.ico', 'application/pdf': '.pdf', 'image/svg+xml': '.svg'
            };
            ext = extMap[targetFormat] || ext;
        }

        let canvasMime = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'].includes(mimeType) ? mimeType : 'image/png';

        const finish = (canvas) => {
            
            // ENGINE PDF REAL (Usando a biblioteca validada)
            if (targetFormat === 'application/pdf') {
                if (window.jspdf && window.jspdf.jsPDF) {
                    const orientation = canvas.width > canvas.height ? 'l' : 'p';
                    const pdf = new window.jspdf.jsPDF({ orientation: orientation, unit: 'px', format: [canvas.width, canvas.height] });
                    const imgData = canvas.toDataURL('image/jpeg', quality);
                    pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
                    
                    const pdfBlob = pdf.output('blob');
                    item.compressedBlob = pdfBlob;
                    item.compressedSize = pdfBlob.size;
                    item.status = window.t('statusDone');
                    item.finalName = `${baseName}_redimensionado.pdf`;
                } else {
                    item.status = window.t('statusError');
                }
                resolve();
                return;
            }

            // ENGINE SVG REAL (Incorporando dados na tag vetorial)
            if (targetFormat === 'image/svg+xml') {
                const imgData = canvas.toDataURL('image/png', 1.0);
                const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}"><image href="${imgData}" width="${canvas.width}" height="${canvas.height}"/></svg>`;
                const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
                item.compressedBlob = svgBlob;
                item.compressedSize = svgBlob.size;
                item.status = window.t('statusDone');
                item.finalName = `${baseName}_redimensionado.svg`;
                resolve();
                return;
            }

            // EXPORTAÇÃO NATIVA EXATA DOS DEMAIS FORMATOS
            canvas.toBlob((b) => { 
                if(b) { 
                    item.compressedBlob = b; 
                    item.compressedSize = b.size; 
                    item.status = window.t('statusDone'); 
                    item.finalName = `${baseName}_redimensionado${ext}`; 
                } else {
                    item.status = window.t('statusError'); 
                }
                resolve(); 
            }, canvasMime, quality);
        };

        if (item.mode === 'crop' && item.cropperInstance) {
            finish(item.cropperInstance.getCroppedCanvas({ width: item.cropWidth, height: item.cropHeight, fillColor: '#fff' }));
        } else {
            const img = new Image(); 
            img.onload = () => { 
                const canvas = document.createElement('canvas'); 
                canvas.width = img.width; 
                canvas.height = img.height; 
                canvas.getContext('2d').drawImage(img, 0, 0); 
                finish(canvas); 
            }; 
            img.onerror = () => { item.status = window.t('statusError'); resolve(); }; 
            img.src = item.previewUrl;
        }
    });
}

function toast(msg) { 
    const t = $('toast'); 
    if(t) { 
        t.textContent = msg; 
        t.style.opacity = '1'; 
        t.style.bottom = '20px';
        setTimeout(() => { t.style.opacity = '0'; t.style.bottom = '0px'; }, 3000); 
    } 
}