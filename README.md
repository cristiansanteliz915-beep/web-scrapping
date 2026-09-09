# Legaltech Data Pipeline: Extractores de Normas Legales ⚖️🤖

Un set de pipelines automatizados de alto rendimiento desarrollados en **Node.js** y **TypeScript**, enfocados en la extracción, estructuración y procesamiento de boletines del Estado. Diseñados específicamente como soluciones de arquitectura base para sectores de **Legaltech e Inteligencia Artificial (LLM ingestion)**.

El repositorio cuenta con dos soluciones de ingeniería de datos adaptadas a diferentes escenarios de producción:

---

## 🚀 1. Extractor Básico Estático (`peruano_scraper.js`)
Diseñado para escaneos rápidos y de bajo consumo en la portada del boletín oficial.

* **Arquitectura Híbrida:** Utiliza **Puppeteer** en modo headless únicamente para descargar el árbol DOM base de la web, cerrando el navegador inmediatamente para **liberar memoria RAM**.
* **Server-Side Parsing:** Transfiere el HTML plano a **Cheerio** para procesar y limpiar miles de nodos de texto en milisegundos.

---

## ⚡ 2. Pipeline Avanzado Paginado y Tolerante a Fallos (`peruano_paginado.js`)
Nuestra solución premium diseñada para entornos reales de alta inestabilidad en servidores gubernamentales.

### 🛠️ Decisiones de Arquitectura Avanzada:
1. **Paginación Interactiva y Autónoma:** El bot extrae la información de la primera página, busca de manera dinámica el botón "Siguiente" en el DOM profundo, emula el clic humano y navega automáticamente a través de múltiples niveles de la web de forma secuencial.
2. **Estrategia Resiliente Anti-Caídas (Retry System):** Al trabajar con portales del Estado (propensos a errores `ERR_TIMED_OUT` o saturación de tráfico), el script implementa un **bucle de reintentos asíncronos con tiempos de espera escalonados (Backoff)**. Si el servidor no responde, el pipeline se protege y vuelve a intentar la conexión automáticamente sin tumbar el proceso.
3. **Data Sanity Check & Limpieza de Buffer:** Aplica expresiones regulares y mapeos por palabras clave jurídicas (`Decreto`, `Resolución`, `Ley`) para descartar anuncios o menús basura, exportando solo información legal pura.

---

## 📦 Requisitos e Instalación

Asegúrate de contar con [Node.js](https://nodejs.org) instalado en tu entorno operativo.

1. Instala las dependencias necesarias de la arquitectura:
   ```bash
   npm install puppeteer cheerio
   ```
2. Instala los binarios del navegador de automatización:
   ```bash
   npx puppeteer browsers install chrome
   ```

## 💻 Modos de Uso

### Para ejecutar el escaneo básico:
```bash
node peruano_scraper.js
```

### Para ejecutar el pipeline avanzado con paginación y tolerancia a fallos:
```bash
node peruano_paginado.js
```

### Outputs Generados de forma automática:
* `normas_paginadas.json`: Estructura NoSQL tipada lista para indexar en vectores o bases de datos de IA.
* `reporte_paginado_excel.csv`: Hoja de cálculo optimizada con codificación UTF-8 con BOM para su apertura nativa e inmediata en **Microsoft Excel** (con soporte correcto para eñes y tildes).
