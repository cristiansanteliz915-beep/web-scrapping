const puppeteer = require('puppeteer');

async function interceptarTraficoDeRed() {
    console.log('[🚀 INTERCEPTOR-INIT] Arrancando navegador con radar de red activo...');
    
    // Abrimos Puppeteer de forma normal en modo headless
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();

    // 1. ACTIVAMOS EL ESCUCHA DE RED DE PUPPETEER
    // Esta función se ejecuta CADA VEZ que la página web pide un dato o un JSON de fondo
    page.on('response', async (response) => {
        const url = response.url();
        const tipoDeRecurso = response.request().resourceType();

        // 2. FILTRAMOS: Si la web está llamando a una API oculta (tipo fetch o xhr), la capturamos
        if (tipoDeRecurso === 'fetch' || tipoDeRecurso === 'xhr') {
            console.log(`\n[🕵️‍♂️ API DETECTADA] URL Oculta: ${url}`);
            
            try {
                // Le robamos el JSON directo antes de que la página lo use
                const datosLimpios = await response.json();
                console.log('[📊 CONTENIDO CAPTURADO]:', JSON.stringify(datosLimpios, null, 2).substring(0, 250) + '...\n');
            } catch (err) {
                // Algunas peticiones no devuelven JSON estándar (son texto o blobs), las ignoramos de forma segura
            }
        }
    });

    console.log('[🌐 NAVEGANDO] Entrando a la plataforma dinámica de prueba...');
    
    // Entramos a Hacker News, que hace llamadas dinámicas en segundo plano
    await page.goto('https://ycombinator.com', { waitUntil: 'networkidle0', timeout: 60000 });

    console.log('[🔒 CLOSE] Finalizando monitoreo de red y cerrando radar.');
    await browser.close();
}

interceptarTraficoDeRed();