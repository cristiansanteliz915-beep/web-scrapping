 const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapingNormasLegales() {
    let browser;
    // URL real del Boletín Oficial de Normas Legales del Perú
    const TARGET_URL = 'https://diariooficial.elperuano.pe/Normas';
    
    console.log('[🚀 PRO-INIT] Inicializando extractor híbrido...');

    try {
        // 1. Orquestación del Navegador (Modo Incógnito / Huella Limpia)
        browser = await puppeteer.launch({ 
            headless: true, 
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        // Navegación con tiempo de espera controlado para evitar bloqueos
        await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 45000 });
        
        // Extraer el HTML renderizado dinámicamente
        const htmlContent = await page.content();
        console.log('[📦 HTML-STREAM] Código descargado correctamente. Liberando RAM...');

        // 2. Cierre temprano del proceso pesado para optimizar costos de computación
        await browser.close();

        // 3. Carga y parsing de alta velocidad con Cheerio
        const $ = cheerio.load(htmlContent);
        const boletinNormas = [];

        console.log('[🔍 PARSING] Analizando sumillas y dispositivos legales del día...');

        // Analizador iterativo basado en la estructura DOM real de El Peruano
        $('.links_normas').each((index, element) => {
            const tituloNorma = $(element).find('.titulo_norma').text().trim();
            const sumillaNorma = $(element).find('.texto_norma').text().trim();
            const enlaceDescarga = $(element).find('a').attr('href');

            // Sanity Check: Filtrar solo datos que contengan información jurídica útil
            if (tituloNorma && enlaceDescarga) {
                boletinNormas.push({
                    id: boletinNormas.length + 1,
                    entidad_emisora: tituloNorma,
                    descripcion: sumillaNorma || 'Sin descripción detallada disponible.',
                    url_pdf: enlaceDescarga.startsWith('http') ? enlaceDescarga : `https://diariooficial.elperuano.pe${enlaceDescarga}`,
                    fecha_extraccion: new Date().toISOString().split('T')[0]
                });
            }
        });

        // 4. Reporte de Métricas en Consola
        console.log(`[🎯 ANALYTICS] Pipeline ejecutado con éxito. Se procesaron ${boletinNormas.length} normas hoy.`);

        // 5. Persistencia de Datos Estructurados en JSON
        fs.writeFileSync('normas_legales_del_dia.json', JSON.stringify(boletinNormas, null, 2), 'utf-8');
        console.log('[💾 STORAGE] Datos guardados localmente en: normas_legales_del_dia.json');

        // 6. Generación del reporte optimizado para Excel (CSV con estándar en Español)
        let csvContent = 'ID;Entidad Emisora;Descripción / Sumilla;Enlace PDF;Fecha de Extracción\n';
        boletinNormas.forEach(norma => {
            const entidad = norma.entidad_emisora.replace(/;/g, ',').replace(/\n/g, ' ');
            const desc = norma.descripcion.replace(/;/g, ',').replace(/\n/g, ' ');
            csvContent += `${norma.id};"${entidad}";"${desc}";"${norma.url_pdf}";"${norma.fecha_extraccion}"\n`;
        });

        const BOM = '\uFEFF'; // Forzar a Excel a leer tildes y eñes correctamente
        fs.writeFileSync('reporte_normas_excel.csv', BOM + csvContent, 'utf-8');
        console.log('[📊 EXCEL-READY] Reporte CSV estructurado generado: reporte_normas_excel.csv');

    } catch (error) {
        console.error('[❌ PIPELINE CRASH]: Fallo crítico en el flujo de automatización:', error.message);
        if (browser) await browser.close();
    }
}

scrapingNormasLegales();
