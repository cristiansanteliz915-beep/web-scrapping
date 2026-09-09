# Legaltech Data Pipeline: Extractor Automatizado de Normas Legales ⚖️🤖

Un pipeline automatizado de alto rendimiento desarrollado en **Node.js** enfocado en la extracción, estructuración y procesamiento de boletines del Estado. Diseñado específicamente como solución base para sectores de **Legaltech e Inteligencia Artificial**.

El bot monitorea y recopila la separata oficial de Normas Legales del **Diario Oficial El Peruano** de manera diaria, transformando datos HTML desestructurados en formatos de analítica empresarial (`JSON` y `CSV`).

## 🛠️ Decisiones de Arquitectura e Ingeniería

A diferencia de los scripts convencionales que sobrecargan la memoria del servidor, este proyecto utiliza una **estructura híbrida optimizada**:

1. **Puppeteer (Navegación / Headless Browser):** Se utiliza exclusivamente para emular el comportamiento humano, saltar firewalls básicos y descargar el árbol DOM completo una sola vez.
2. **Cheerio (Server-Side HTML Parsing):** Inmediatamente después de capturar el HTML, la instancia del navegador de Puppeteer se cierra para **liberar memoria RAM**. Cheerio toma el control procesando miles de nodos de texto en milisegundos.
3. **Data Sanity Check:** Implementa filtros y limpiadores de caracteres lógicos para evitar la inyección de saltos de línea basura que distorsionen las celdas al importar la data en Microsoft Excel.

## 📦 Requisitos e Instalación

Asegúrate de contar con [Node.js (versión LTS)](https://nodejs.org) instalado en tu entorno operativo.

1. Instala las dependencias necesarias:
   ```bash
   npm install puppeteer cheerio
   ```
2. Instala los binarios de prueba para automatización:
   ```bash
   npx puppeteer browsers install chrome
   ```

## 🚀 Uso Operativo

Ejecuta el pipeline principal de extracción lanzando el comando:
```bash
node peruano_scraper.js
```

### Outputs Generados:
* `normas_legales_del_dia.json`: Estructura limpia y tipada lista para su indexación en modelos LLM o bases de datos NoSQL.
* `reporte_normas_excel.csv`: Formato plano separado por punto y coma (`;`) adaptado con codificación UTF-8 con BOM para su compatibilidad nativa e inmediata con hojas de cálculo en Microsoft Excel.