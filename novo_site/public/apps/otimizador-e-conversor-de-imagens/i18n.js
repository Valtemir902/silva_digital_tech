/* 
 * Silva Digital Tech - Conversor e Redimensionador PRO
 * Multi-language Core de Elite (Formatos 100% Nativos)
 */
const translations = {
    pt: {
        title: "Conversor e Redimensionador PRO",
        navDashboard: "Painel de Otimização",
        securityBadge: "✓ Local & Seguro",
        securityTitle: "Modo Local 100% Seguro",
        securityDesc: "Processamento Client-Side. As imagens nunca são enviadas para nenhum servidor.",
        eyebrowDashboard: "Ferramenta Universal",
        dropTitle: "Clique ou arraste as imagens aqui",
        dropDesc: "Formatos 100% integrados (WebP, JPG, PNG, PDF, AVIF, SVG, ICO...)",
        btnSelect: "Selecionar Arquivos",
        btnConvert: "🚀 CONVERTER IMAGENS",
        btnConverting: "⏳ PROCESSANDO...",
        btnClear: "Limpar Todas as Imagens da Fila",
        emptyQueue: "Nenhuma imagem na fila. Adicione para começar.",
        footer: "© 2026 Silva Digital Tech - Processamento Client-Side (Sem Upload).",
        modeConvert: "🔄 Conversão Padrão",
        modeCrop: "✂️ Redimensionar & Recortar",
        lblFormat: "Formato Final:",
        // FORMATOS DE SAÍDA 100% REAIS
        fmtOriginal: "Manter Original",
        fmtJpg: "JPG / JPEG (Comum)",
        fmtPng: "PNG (Fundo Transparente)",
        fmtWebp: "WebP (Ideal para Sites)",
        fmtAvif: "AVIF (Ultra Compressão)",
        fmtPdf: "PDF (Documento Real)",
        fmtSvg: "SVG (Vetor Embutido)",
        fmtIco: "ICO (Ícone / Favicon)",
        // CONTROLES
        lblQuality: "Qualidade:",
        lblWidth: "Largura Fixa (px):",
        lblHeight: "Altura Fixa (px):",
        hintCrop: "💡 Arraste e dê zoom na imagem abaixo para enquadrar perfeitamente.",
        statusWaiting: "Aguardando Configuração",
        statusProcessing: "Processando...",
        statusDone: "Pronto",
        statusError: "Erro",
        lblOriginalSize: "Original:",
        lblNewSize: "Novo Tamanho:",
        btnRemove: "×",
        btnDownload: "📥 BAIXAR IMAGEM",
        toastAdded: "Imagens adicionadas com sucesso!",
        toastEmpty: "Nenhuma imagem aguardando conversão.",
        toastDone: "Processo Concluído! Botões de download liberados."
    },
    en: {
        title: "Image Converter & Resizer PRO",
        navDashboard: "Optimization Dashboard",
        securityBadge: "✓ Local & Secure",
        securityTitle: "100% Secure Local Mode",
        securityDesc: "Client-Side processing. Images are never uploaded to any server.",
        eyebrowDashboard: "Universal Tool",
        dropTitle: "Click or drag images here",
        dropDesc: "100% Integrated formats (WebP, JPG, PNG, PDF, AVIF, SVG, ICO...)",
        btnSelect: "Select Files",
        btnConvert: "🚀 CONVERT IMAGES",
        btnConverting: "⏳ PROCESSING...",
        btnClear: "Clear All Images",
        emptyQueue: "No images in the queue. Add some to start.",
        footer: "© 2026 Silva Digital Tech - Client-Side Processing (No Upload).",
        modeConvert: "🔄 Standard Conversion",
        modeCrop: "✂️ Resize & Crop",
        lblFormat: "Final Format:",
        fmtOriginal: "Keep Original",
        fmtJpg: "JPG / JPEG (Standard)",
        fmtPng: "PNG (Transparent Background)",
        fmtWebp: "WebP (Ideal for Web)",
        fmtAvif: "AVIF (Ultra Compression)",
        fmtPdf: "PDF (Real Document)",
        fmtSvg: "SVG (Embedded Vector)",
        fmtIco: "ICO (Icon / Favicon)",
        lblQuality: "Quality:",
        lblWidth: "Fixed Width (px):",
        lblHeight: "Fixed Height (px):",
        hintCrop: "💡 Drag and zoom the image below to frame it perfectly.",
        statusWaiting: "Waiting for Configuration",
        statusProcessing: "Processing...",
        statusDone: "Ready",
        statusError: "Error",
        lblOriginalSize: "Original:",
        lblNewSize: "New Size:",
        btnRemove: "×",
        btnDownload: "📥 DOWNLOAD IMAGE",
        toastAdded: "Images successfully added!",
        toastEmpty: "No images waiting for conversion.",
        toastDone: "Process Complete! Download buttons unlocked."
    },
    es: {
        title: "Conversor y Redimensionador PRO",
        navDashboard: "Panel de Optimización",
        securityBadge: "✓ Local y Seguro",
        securityTitle: "Modo Local 100% Seguro",
        securityDesc: "Procesamiento del lado del cliente. Las imágenes nunca se suben a ningún servidor.",
        eyebrowDashboard: "Herramienta Universal",
        dropTitle: "Haz clic o arrastra las imágenes aquí",
        dropDesc: "Formatos 100% integrados (WebP, JPG, PNG, PDF, AVIF, SVG, ICO...)",
        btnSelect: "Seleccionar Archivos",
        btnConvert: "🚀 CONVERTIR IMÁGENES",
        btnConverting: "⏳ PROCESANDO...",
        btnClear: "Limpiar Todas las Imágenes",
        emptyQueue: "No hay imágenes en la cola. Añade para empezar.",
        footer: "© 2026 Silva Digital Tech - Procesamiento Local (Sin Subidas).",
        modeConvert: "🔄 Conversión Estándar",
        modeCrop: "✂️ Redimensionar y Recortar",
        lblFormat: "Formato Final:",
        fmtOriginal: "Mantener Original",
        fmtJpg: "JPG / JPEG (Estándar)",
        fmtPng: "PNG (Fondo Transparente)",
        fmtWebp: "WebP (Ideal para Web)",
        fmtAvif: "AVIF (Ultra Compresión)",
        fmtPdf: "PDF (Documento Real)",
        fmtSvg: "SVG (Vector Integrado)",
        fmtIco: "ICO (Icono / Favicon)",
        lblQuality: "Calidad:",
        lblWidth: "Ancho Fijo (px):",
        lblHeight: "Alto Fijo (px):",
        hintCrop: "💡 Arrastra y haz zoom en la imagen para encuadrarla perfectamente.",
        statusWaiting: "Esperando Configuración",
        statusProcessing: "Procesando...",
        statusDone: "Listo",
        statusError: "Error",
        lblOriginalSize: "Original:",
        lblNewSize: "Nuevo Tamaño:",
        btnRemove: "×",
        btnDownload: "📥 DESCARGAR IMAGEN",
        toastAdded: "¡Imágenes añadidas con éxito!",
        toastEmpty: "No hay imágenes esperando conversión.",
        toastDone: "¡Proceso Completado! Botones de descarga desbloqueados."
    }
};

window.currentLang = localStorage.getItem('silva_img_lang') || navigator.language.slice(0, 2);
if(!translations[window.currentLang]) window.currentLang = 'pt';

window.t = function(key) {
    return translations[window.currentLang][key] || key;
};

function applyTranslations() {
    document.documentElement.lang = window.currentLang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.innerHTML = window.t(el.getAttribute('data-i18n'));
    });
    
    document.title = window.t('title') + " | Silva Digital Tech";
    const titleEl = document.getElementById('pageTitle');
    if(titleEl) titleEl.innerText = window.t('title');
    
    const langSelect = document.getElementById('langSelect');
    if(langSelect) langSelect.value = window.currentLang;
}

document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
});