const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

async function ejecutarSuperScraper() {
    let browser;
    console.log('[🚀 SPEED-INIT] Arrancando navegador con Puppeteer...');

    try {
        // 1. Iniciamos Puppeteer solo para descargar el HTML de la página web
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.goto('https://ycombinator.com', { waitUntil: 'networkidle2' });

        // 2. Extraemos el código HTML puro de la página actual
        const htmlCompleto = await page.content();
        console.log('[📦 HTML-CAPTURED] HTML transferido con éxito a Cheerio.');

        // 3. Cerramos inmediatamente el navegador pesado para liberar tu memoria RAM
        await browser.close();
        console.log('[🔒 CLOSE] Navegador cerrado. Iniciando parseo ultra rápido...');

        // 4. Cargamos el HTML en Cheerio (Usamos '$' por estándar de la industria)
        const $ = cheerio.load(htmlCompleto);
        const resultados = [];

        // 5. Extraemos la información usando el selector universal de enlaces 'a'
        $('a').each((index, element) => {
            const titulo = $(element).text().trim();
            const enlace = $(element).attr('href');

            // Filtramos solo enlaces con textos reales y URLs completas
            if (titulo.length > 15 && enlace && enlace.startsWith('http')) {
                resultados.push({
                    id: resultados.length + 1,
                    title: titulo,
                    url: enlace,
                    scrapedWith: 'Puppeteer + Cheerio'
                });
            }
        });

        console.log(`[🎯 DATO-EXTRACTO] ¡Cheerio procesó ${resultados.length} artículos en milisegundos!`);

        // 6. Guardamos el reporte finalizado
        fs.writeFileSync('super_reporte.json', JSON.stringify(resultados, null, 2), 'utf-8');
        console.log('[💾 STORAGE] Archivo guardado con éxito como: super_reporte.json');

    } catch (error) {
        console.error('[❌ ERROR EN EL PIPELINE]:', error.message);
        if (browser) await browser.close();
    }
}

ejecutarSuperScraper();