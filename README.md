# Legaltech Data Pipeline & API Interceptors ⚖️🤖

Un ecosistema avanzado de pipelines automatizados desarrollados en **Node.js**, enfocados en la extracción, estructuración y procesamiento de datos masivos. Diseñado como solución de arquitectura base para sectores de **Legaltech e Ingestión de Datos para Modelos de Inteligencia Artificial (LLMs)**.

El repositorio cuenta con tres soluciones de ingeniería de datos adaptadas a diferentes escenarios de producción:

---

## 🚀 1. Extractor Básico Estático (`peruano_scraper.js`)
Diseñado para escaneos rápidos y de bajo consumo en la portada del boletín oficial.
* **Arquitectura Híbrida:** Utiliza **Puppeteer** en modo headless únicamente para descargar el árbol DOM base de la web, liberando memoria RAM de inmediato.
* **Server-Side Parsing:** Transfiere el HTML plano a **Cheerio** para procesar y limpiar miles de nodos de texto en milisegundos.

---

## ⚡ 2. Pipeline Avanzado Paginado y Tolerante a Fallos (`peruano_paginado.js`)
Nuestra solución premium diseñada para entornos reales de alta inestabilidad en servidores gubernamentales.
* **Paginación Interactiva y Autónoma:** El bot busca de manera dinámica el botón "Siguiente" en el DOM profundo, emula el clic humano y navega automáticamente a través de múltiples niveles.
* **Estrategia Resiliente Anti-Caídas (Retry System):** Implementa un **bucle de reintentos asíncronos con tiempos de espera escalonados (Backoff)**. Si el servidor del Estado no responde o sufre un Timeout, el pipeline se protege y reintenta la conexión de forma automática.

---

## 🕵️‍♂️ 3. Radar de Intercepción de Tráfico de Red (`api_interceptor.js`)
Herramienta de ingeniería inversa para auditoría y extracción en **plataformas web dinámicas modernas**.
* **Network Sniffing:** Activa un escucha asíncrono sobre el protocolo de red de Puppeteer (`page.on('response')`).
* **API Capturing:** Filtra y captura de forma automática peticiones de tipo `fetch` y `xhr` en segundo plano, **robando los objetos JSON estructurados y limpios** antes de que la página los procese, evadiendo selectores HTML complejos.

---

## 📦 Requisitos e Instalación

Asegúrate de contar con [Node.js](https://nodejs.org) instalado en tu entorno operativo.

1. Instala las dependencias de la arquitectura:
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

### Para ejecutar el pipeline con paginación y tolerancia a fallos:
```bash
node peruano_paginado.js
```

### Para arrancar el radar espía de APIs ocultas:
```bash
node api_interceptor.js
```
