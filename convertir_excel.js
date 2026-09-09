const fs = require('fs');

try {
    console.log('[📂 INFO] Cargando los 31 artículos del súper reporte...');
    
    // 1. Leer el archivo JSON que acabas de generar con Cheerio
    const rawData = fs.readFileSync('super_reporte.json', 'utf-8');
    const articulos = JSON.parse(rawData);

    // 2. Definir las cabeceras de las columnas para Excel
    // Usamos el carácter punto y coma ';' como separador, que es el estándar para Excel en español
    let contenidoCSV = 'ID;Título;Enlace;Herramienta de Extracción\n';

    // 3. Recorrer los artículos y limpiar el texto para evitar que rompa las filas
    articulos.forEach(item => {
        // Limpiamos comillas o saltos de línea que puedan distorsionar las celdas de Excel
        const tituloLimpio = item.title.replace(/;/g, ',').replace(/\n/g, ' ');
        const urlLimpia = item.url.replace(/;/g, ',');

        // Agregamos la fila al contenido
        contenidoCSV += `${item.id};"${tituloLimpio}";"${urlLimpia}";"${item.scrapedWith}"\n`;
    });

    // 4. Guardar el archivo final con codificación UTF-8 con BOM para que Excel lea bien las tildes y eñes
    const BOM = '\uFEFF';
    fs.writeFileSync('reporte_para_excel.csv', BOM + contenidoCSV, 'utf-8');

    console.log('[🎯 SUCCESS] ¡Conversión completada con éxito!');
    console.log('[💾 STORAGE] Búscalo en tu carpeta raíz como: reporte_para_excel.csv');

} catch (error) {
    console.error('[❌ ERROR]: No se pudo realizar la conversión.', error.message);
}