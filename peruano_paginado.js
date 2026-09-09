const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

// FUNCIÓN AUXILIAR: Añade pausas explícitas asíncronas
const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function scrapingConPaginacion() {
    let browser;
    const TARGET_URL = 'https://elperuano.pe';
    const totalPaginasAMonitorear = 3; 
    let paginaActual = 1;
    const todasLasNormas = [];

    console.log('[🚀 PAGINACIÓN-INIT] Inicializando pipeline tolerante a fallos de red...');

    try {
        browser = await puppeteer.launch({ 
            headless: true, 
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        const page = await browser.newPage();
        
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        await page.setViewport({ width: 1280, height: 800 });

        // --- SISTEMA DE REINTENTOS AUTOMÁTICOS CONTRA CAÍDAS DEL SERVIDOR ---
        let conexionExitosa = false;
        let intentos = 1;
        const maxIntentos = 4;

        while (!conexionExitosa && intentos <= maxIntentos) {
            try {
                console.log(`[🌐 CONNECT] Intentando conectar a El Peruano (Intento ${intentos}/${maxIntentos})...`);
                // Usamos 'domcontentloaded' que es más rápido y menos propenso a colgarse
                await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
                conexionExitosa = true;
                console.log('[🎯 CONNECTED] ¡Conexión establecida con éxito!');
            } catch (err) {
                console.error(`[⚠️ ALERT] El servidor no responde (${err.message}).`);
                if (intentos === maxIntentos) throw new Error('El portal del Estado está totalmente caído. Reintentos agotados.');
                
                const tiempoEspera = intentos * 5000; // Espera 5s, luego 10s, luego 15s...
                console.log(`[⏳ RETRY] Servidor saturado. Reintentando automáticamente en ${tiempoEspera / 1000} segundos...`);
                await esperar(tiempoEspera);
                intentos++;
            }
        }

        // --- BUCLE PRINCIPAL DE EXTRACCIÓN Y PAGINACIÓN ---
        while (paginaActual <= totalPaginasAMonitorear) {
            console.log(`\n[📖 PAGE ${paginaActual}] Procesando datos dinámicos del boletín...`);

            // Espera de asentamiento para que carguen los scripts internos de la web
            await esperar(4000);

            const htmlContent = await page.content();
            const $ = cheerio.load(htmlContent);

            let registrosEnEstaPagina = 0;

            // Selector universal por palabras clave legales en Perú
            $('a').each((index, element) => {
                const textoEnlace = $(element).text().trim();
                const enlaceUrl = $(element).attr('href');
                const textoMinuscula = textoEnlace.toLowerCase();

                const esNormaLegitima = 
                    textoMinuscula.includes('decreto') || 
                    textoMinuscula.includes('resolucion') || 
                    textoMinuscula.includes('ley ') || 
                    textoMinuscula.includes('directiva') || 
                    textoMinuscula.includes('ordenanza');

                if (enlaceUrl && esNormaLegitima && textoEnlace.length > 15) {
                    todasLasNormas.push({
                        id: todasLasNormas.length + 1,
                        pagina_origen: paginaActual,
                        entidad_emisora: "Diario Oficial El Peruano",
                        descripcion: textoEnlace,
                        url_pdf: enlaceUrl.startsWith('http') ? enlaceUrl : `https://elperuano.pe${enlaceUrl}`
                    });
                    registrosEnEstaPagina++;
                }
            });

            console.log(`[🎯 PARSING] Se extrajeron ${registrosEnEstaPagina} normas en la página ${paginaActual}.`);

            if (registrosEnEstaPagina === 0 || paginaActual === totalPaginasAMonitorear) {
                break;
            }

            // Buscar botón Siguiente de forma segura en el DOM
            const botonExiste = await page.evaluate(() => {
                const btn = document.querySelector('a.page-link[aria-label="Next"], .pagination .next a, li.next a, a[rel="next"], .next a');
                if (btn) return true;

                const enls = Array.from(document.querySelectorAll('a'));
                return enls.some(el => el.textContent.includes('Siguiente') || el.textContent.includes('>'));
            });

            if (botonExiste) {
                console.log(`[👉 ACTION] Avanzando de forma autónoma a la página ${paginaActual + 1}...`);
                
                await page.evaluate(() => {
                    const btn = document.querySelector('a.page-link[aria-label="Next"], .pagination .next a, li.next a, a[rel="next"], .next a');
                    if (btn) {
                        btn.click();
                    } else {
                        const enls = Array.from(document.querySelectorAll('a'));
                        const btnTxt = enls.find(el => el.textContent.includes('Siguiente') || el.textContent.includes('>'));
                        if (btnTxt) btnTxt.click();
                    }
                });

                paginaActual++;
            } else {
                console.log('[🛑 END] Se llegó al final de las páginas web disponibles.');
                break;
            }
        }

        await browser.close();
        console.log('\n[🔒 CLOSE] Navegador web liberado.');

        // Guardar la data consolidada
        fs.writeFileSync('normas_paginadas.json', JSON.stringify(todasLasNormas, null, 2), 'utf-8');
        console.log(`[💾 STORAGE] Base de datos JSON actualizada: ${todasLasNormas.length} registros.`);

        // Estructurar reporte para Microsoft Excel
        let csvContent = 'ID;Página Origen;Entidad Emisora;Descripción / Sumilla;Enlace PDF\n';
        todasLasNormas.forEach(norma => {
            const descLimpia = norma.descripcion.replace(/;/g, ',').replace(/\n/g, ' ');
            csvContent += `${norma.id};${norma.pagina_origen};"${norma.entidad_emisora}";"${descLimpia}";"${norma.url_pdf}"\n`;
        });

        const BOM = '\uFEFF';
        fs.writeFileSync('reporte_paginado_excel.csv', BOM + csvContent, 'utf-8');
        console.log('[📊 EXCEL-READY] ¡Tu reporte de Excel fue re-generado con éxito!');

    } catch (error) {
        console.error('[❌ PIPELINE CRASH]: Fallo definitivo de red:', error.message);
        if (browser) await browser.close();
    }
}

scrapingConPaginacion();