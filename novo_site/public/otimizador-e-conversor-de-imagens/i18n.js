/* 
 * Silva Digital Tech - Otimizador de Imagens PRO
 * Multi-language Core
 */
const translations = {
    pt: {
        title: "Otimizador de Imagens PRO",
        navDashboard: "Painel de Otimização",
        navCompany: "Configurações Padrão",
        adLabel: "Publicidade - AdSense",
        securityTitle: "Modo Local 100% Seguro",
        securityDesc: "Processamento Client-Side. As imagens nunca são enviadas para nenhum servidor.",
        eyebrowDashboard: "Ferramenta Universal",
        eyebrowCompany: "Preferências",
        dropTitle: "Arraste e solte suas imagens",
        dropDesc: "Suporta PNG, JPG, WebP, ICO, GIF, SVG (Múltiplos arquivos)",
        btnSelect: "Selecionar Imagens",
        settingsTitle: "Configurações de Saída",
        lblFormat: "Formato de Conversão",
        fmtOriginal: "Manter Formato Original",
        fmtWebp: "WebP (Recomendado Web)",
        fmtJpg: "JPG / JPEG",
        fmtPng: "PNG",
        fmtIco: "ICO (Favicon / App)",
        lblQuality: "Qualidade da Imagem",
        btnProcess: "Processar e Comprimir Tudo",
        queueTitle: "Fila de Processamento",
        btnClear: "Limpar",
        btnDownloadAll: "Baixar Todas (ZIP)",
        emptyQueue: "Nenhuma imagem carregada na fila ainda.",
        lblOriginal: "Original:",
        lblFinal: "Final:",
        statusWaiting: "Aguardando",
        statusProcessed: "Concluído",
        statusError: "Erro",
        btnDownload: "Baixar",
        tAdded: "Imagens adicionadas à fila.",
        tZipping: "Gerando arquivo ZIP...",
        footer: "© 2026 Silva Digital Tech - Control Center PRO V4. Processamento 100% local."
    },
    en: {
        title: "Image Optimizer PRO",
        navDashboard: "Optimization Dashboard",
        navCompany: "Default Settings",
        adLabel: "Advertisement - AdSense",
        securityTitle: "100% Secure Local Mode",
        securityDesc: "Client-Side processing. Images are never uploaded to any server.",
        eyebrowDashboard: "Universal Tool",
        eyebrowCompany: "Preferences",
        dropTitle: "Drag and drop your images",
        dropDesc: "Supports PNG, JPG, WebP, ICO, GIF, SVG (Multiple files)",
        btnSelect: "Select Images",
        settingsTitle: "Output Settings",
        lblFormat: "Conversion Format",
        fmtOriginal: "Keep Original Format",
        fmtWebp: "WebP (Web Recommended)",
        fmtJpg: "JPG / JPEG",
        fmtPng: "PNG",
        fmtIco: "ICO (Favicon / App)",
        lblQuality: "Image Quality",
        btnProcess: "Process and Compress All",
        queueTitle: "Processing Queue",
        btnClear: "Clear",
        btnDownloadAll: "Download All (ZIP)",
        emptyQueue: "No images loaded in the queue yet.",
        lblOriginal: "Original:",
        lblFinal: "Final:",
        statusWaiting: "Waiting",
        statusProcessed: "Done",
        statusError: "Error",
        btnDownload: "Download",
        tAdded: "Images added to queue.",
        tZipping: "Generating ZIP file...",
        footer: "© 2026 Silva Digital Tech - Control Center PRO V4. 100% local processing."
    },
    es: {
        title: "Optimizador de Imágenes PRO",
        navDashboard: "Panel de Optimización",
        navCompany: "Ajustes Predeterminados",
        adLabel: "Publicidad - AdSense",
        securityTitle: "Modo Local 100% Seguro",
        securityDesc: "Procesamiento del lado del cliente. Las imágenes nunca se suben a ningún servidor.",
        eyebrowDashboard: "Herramienta Universal",
        eyebrowCompany: "Preferencias",
        dropTitle: "Arrastra y suelta tus imágenes",
        dropDesc: "Soporta PNG, JPG, WebP, ICO, GIF, SVG (Múltiples archivos)",
        btnSelect: "Seleccionar Imágenes",
        settingsTitle: "Ajustes de Salida",
        lblFormat: "Formato de Conversión",
        fmtOriginal: "Mantener Formato Original",
        fmtWebp: "WebP (Recomendado)",
        fmtJpg: "JPG / JPEG",
        fmtPng: "PNG",
        fmtIco: "ICO (Favicon / App)",
        lblQuality: "Calidad de Imagen",
        btnProcess: "Procesar y Comprimir Todo",
        queueTitle: "Cola de Procesamiento",
        btnClear: "Limpiar",
        btnDownloadAll: "Descargar Todas (ZIP)",
        emptyQueue: "Aún no hay imágenes en la cola.",
        lblOriginal: "Original:",
        lblFinal: "Final:",
        statusWaiting: "Esperando",
        statusProcessed: "Completado",
        statusError: "Error",
        btnDownload: "Descargar",
        tAdded: "Imágenes añadidas a la cola.",
        tZipping: "Generando archivo ZIP...",
        footer: "© 2026 Silva Digital Tech - Control Center PRO V4. Procesamiento 100% local."
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
        el.innerHTML = t(el.getAttribute('data-i18n'));
    });
    document.title = t('title') + " | Silva Digital Tech";
    
    const langSelect = document.getElementById('langSelect');
    if(langSelect) langSelect.value = window.currentLang;
}

document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            localStorage.setItem('silva_img_lang', e.target.value);
            window.location.reload();
        });
    }
});
