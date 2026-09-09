const fs = require('fs');

try {
    console.log('[📂 INFO] Cargando base de datos local...');
    
    // 1. Leer el archivo JSON original que creaste
    const rawData = fs.readFileSync('documentos_legales.json', 'utf-8');
    const items = JSON.parse(rawData);

    console.log(`[📊 ANALISIS] Total de registros encontrados: ${items.length}`);

    // 2. Aplicar lógica de filtrado de Ciencia de Datos
    const palabrasClave = ['ai', 'startup', 'show hn', 'launch', 'tech'];
    
    const resultadosFiltrados = items.filter(item => {
        const tituloEnMinusculas = item.title.toLowerCase();
        // Verifica si el título incluye al menos una de nuestras palabras clave
        return palabrasClave.some(palabra => tituloEnMinusculas.includes(palabra));
    });

    console.log(`[🎯 FILTRADO] Registros de interés tecnológico encontrados: ${resultadosFiltrados.length}`);

    // 3. Guardar el nuevo reporte filtrado
    fs.writeFileSync('reporte_filtrado.json', JSON.stringify(resultadosFiltrados, null, 2), 'utf-8');
    console.log('[💾 STORAGE] ¡Prueba completada! Se creó el archivo: reporte_filtrado.json');

} catch (error) {
    console.error('[❌ ERROR]: Asegúrate de que el archivo documentos_legales.json exista en la misma carpeta.', error.message);
}