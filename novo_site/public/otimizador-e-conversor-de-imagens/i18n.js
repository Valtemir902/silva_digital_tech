/* 
 * Silva Digital Tech - Otimizador de Imagens PRO
 * Multi-language Core
 */
const translations = {
    pt: {
        title: "Otimizador de Imagens PRO",
        navDashboard: "Painel de Otimização",
        navCompany: "Configurações Padrão",
        securityTitle: "Modo Local 100% Seguro",
        securityDesc: "Processamento Client-Side. As imagens nunca são enviadas para nenhum servidor.",
        eyebrowDashboard: "Ferramenta Universal",
        eyebrowCompany: "Preferências",
        dropTitle: "Arraste e solte suas imagens",
        dropDesc: "Suporta PNG, JPG, WebP, ICO, GIF, SVG, AVIF, BMP, TIFF, HEIC",
        btnSelect: "Selecionar Imagens",
        settingsTitle: "Configurações de Saída",
        lblDefaultFormat: "Formato de Saída Padrão ao Adicionar",
        btnProcess: "Processar Tudo",
        queueTitle: "Fila de Processamento & Conversão Direta",
        btnClear: "Limpar Fila",
        btnDownloadAll: "Baixar Todas (ZIP)",
        emptyQueue: "Nenhuma imagem carregada na fila ainda.",
        lblOriginal: "Original:",
        lblFinal: "Final:",
        statusWaiting: "Aguardando",
        statusProcessed: "Pronto",
        statusError: "Erro",
        btnDownload: "Baixar",
        tAdded: "Imagens adicionadas à fila e processadas.",
        tZipping: "Gerando arquivo ZIP...",
        footer: "© 2026 Silva Digital Tech - Control Center PRO V4. Processamento 100% local."
    },
    en: {
        title: "Image Optimizer PRO",
        navDashboard: "Optimization Dashboard",
        navCompany: "Default Settings",
        securityTitle: "100% Secure Local Mode",
        securityDesc: "Client-Side processing. Images are never uploaded to any server.",
        eyebrowDashboard: "Universal Tool",
        eyebrowCompany: "Preferences",
        dropTitle: "Drag and drop your images",
        dropDesc: "Supports PNG, JPG, WebP, ICO, GIF, SVG, AVIF, BMP, TIFF, HEIC",
        btnSelect: "Select Images",
        settingsTitle: "Output Settings",
        lblDefaultFormat: "Default Output Format on Upload",
        btnProcess: "Process All",
        queueTitle: "Processing & Direct Conversion Queue",
        btnClear: "Clear Queue",
        btnDownloadAll: "Download All (ZIP)",
        emptyQueue: "No images loaded in the queue yet.",
        lblOriginal: "Original:",
        lblFinal: "Final:",
        statusWaiting: "Waiting",
        statusProcessed: "Ready",
        statusError: "Error",
        btnDownload: "Download",
        tAdded: "Images added to queue and processed.",
        tZipping: "Generating ZIP file...",
        footer: "© 2026 Silva Digital Tech - Control Center PRO V4. 100% local processing."
    },
    es: {
        title: "Optimizador de Imágenes PRO",
        navDashboard: "Panel de Optimización",
        navCompany: "Ajustes Predeterminados",
        securityTitle: "Modo Local 100% Seguro",
        securityDesc: "Procesamiento del lado del cliente. Las imágenes nunca se suben a ningún servidor.",
        eyebrowDashboard: "Herramienta Universal",
        eyebrowCompany: "Preferencias",
        dropTitle: "Arrastra y suelta tus imágenes",
        dropDesc: "Soporta PNG, JPG, WebP, ICO, GIF, SVG, AVIF, BMP, TIFF, HEIC",
        btnSelect: "Seleccionar Imágenes",
        settingsTitle: "Ajustes de Salida",
        lblDefaultFormat: "Formato de Salida Predeterminado al Subir",
        btnProcess: "Procesar Todo",
        queueTitle: "Cola de Procesamiento y Conversión Directa",
        btnClear: "Limpiar Cola",
        btnDownloadAll: "Descargar Todas (ZIP)",
        emptyQueue: "Aún no hay imágenes en la cola.",
        lblOriginal: "Original:",
        lblFinal: "Final:",
        statusWaiting: "Esperando",
        statusProcessed: "Listo",
        statusError: "Error",
        btnDownload: "Descargar",
        tAdded: "Imágenes añadidas a la cola y procesadas.",
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