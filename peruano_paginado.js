const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function scrapingConPaginacion() {
    let browser;
    const TARGET_URL = 'https://diariooficial.elperuano.pe/Normas';
    const totalPaginasAMonitorear = 3; 
    let paginaActual = 1;
    const todasLasNormas = [];

    console.log('[🚀 PAGINACIÓN-INIT] Lanzando pipeline con selectores de producción...');

    try {
        browser = await puppeteer.launch({ 
            headless: true, 
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        const page = await browser.newPage();
        
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        await page.setViewport({ width: 1280, height: 800 });

        let conexionExitosa = false;
        let intentos = 1;
        const maxIntentos = 4;

        while (!conexionExitosa && intentos <= maxIntentos) {
            try {
                console.log(`[🌐 CONNECT] Conectando a El Peruano (Intento ${intentos}/${maxIntentos})...`);
                // Esperamos que asiente el DOM base de la web
                await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
                conexionExitosa = true;
                console.log('[🎯 CONNECTED] ¡Conexión de red establecida!');
            } catch (err) {
                console.error(`[⚠️ ALERT] Fallo de red (${err.message}).`);
                if (intentos === maxIntentos) throw new Error('Servidor inaccesible.');
                const tiempoEspera = intentos * 4000;
                await esperar(tiempoEspera);
                intentos++;
            }
        }

        while (paginaActual <= totalPaginasAMonitorear) {
            console.log(`\n[📖 PAGE ${paginaActual}] Descargando tabla de resoluciones...`);
            
            // Pausa obligatoria para que los scripts del portal terminen de cargar el boletín
            await esperar(5000);

            const htmlContent = await page.content();
            const $ = cheerio.load(htmlContent);

            let registrosEnEstaPagina = 0;

            // RESTRUCTURACIÓN DE SELECTOR: Buscamos las clases nativas y cualquier bloque con enlace PDF del boletín
            $('a').each((index, element) => {
                const textoEnlace = $(element).text().trim();
                const enlaceUrl = $(element).attr('href');

                // Capturamos cualquier enlace que apunte a la descarga de una norma o cuadernillo PDF del día
                if (enlaceUrl && (enlaceUrl.includes('/Normas') || enlaceUrl.includes('.pdf') || enlaceUrl.includes('/descarga/'))) {
                    // Filtramos textos basura del menú o botones laterales cortos
                    if (textoEnlace.length > 12) {
                        todasLasNormas.push({
                            id: todasLasNormas.length + 1,
                            pagina_origen: paginaActual,
                            entidad_emisora: "Diario Oficial El Peruano",
                            descripcion: textoEnlace.replace(/\s+/g, ' '), // Limpia espacios en blanco extras
                            url_pdf: enlaceUrl.startsWith('http') ? enlaceUrl : `https://diariooficial.elperuano.pe${enlaceUrl}`
                        });
                        registrosEnEstaPagina++;
                    }
                }
            });

            console.log(`[🎯 PARSING] Éxito: Se indexaron ${registrosEnEstaPagina} registros en la página ${paginaActual}.`);

            // Si por un cambio severo de diseño en la página siguiente sale 0, rompemos para no ciclar el bot
            if (registrosEnEstaPagina === 0 || paginaActual === totalPaginasAMonitorear) {
                break;
            }

            // Buscar el botón interactivo de "Siguiente"
            const botonExiste = await page.evaluate(() => {
                const btn = document.querySelector('a.page-link[aria-label="Next"], .pagination .next a, li.next a, a[rel="next"], .next a');
                if (btn) return true;

                const enls = Array.from(document.querySelectorAll('a'));
                return enls.some(el => el.textContent.includes('Siguiente') || el.textContent.includes('>'));
            });

            if (botonExiste) {
                console.log(`[👉 ACTION] Clic virtual. Solicitando acceso a la página ${paginaActual + 1}...`);
                
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
                console.log('[🛑 END] Se alcanzó el límite de páginas de la plataforma.');
                break;
            }
        }

        await browser.close();
        console.log('\n[🔒 CLOSE] Instancia Chromium cerrada de forma segura.');

        // Guardar la data estructurada
        fs.writeFileSync('normas_paginadas.json', JSON.stringify(todasLasNormas, null, 2), 'utf-8');
        console.log(`[💾 STORAGE] Base de datos consolidada: ${todasLasNormas.length} registros guardados.`);

        // Inyección de filas al reporte nativo para Microsoft Excel
        let csvContent = 'ID;Página Origen;Entidad Emisora;Descripción Jurídica;Enlace de Descarga PDF\n';
        todasLasNormas.forEach(norma => {
            const descLimpia = norma.descripcion.replace(/;/g, ',').replace(/"/g, '""');
            csvContent += `${norma.id};${norma.pagina_origen};"${norma.entidad_emisora}";"${descLimpia}";"${norma.url_pdf}"\n`;
        });

        const BOM = '\uFEFF';
        fs.writeFileSync('reporte_paginado_excel.csv', BOM + csvContent, 'utf-8');
        console.log('[📊 EXCEL-READY] ¡Tu archivo Excel se actualizó físicamente con las nuevas filas!');

    } catch (error) {
        console.error('[❌ PIPELINE CRASH]: Fallo crítico general:', error.message);
        if (browser) await browser.close();
    }
}

scrapingConPaginacion();