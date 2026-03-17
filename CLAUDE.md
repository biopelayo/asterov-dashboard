# Asterov Dashboard — Instrucciones para Claude

## Servidor de desarrollo

**preview_start NO FUNCIONA en este entorno Windows.** El MCP siempre falla con `spawn npm ENOENT`.

El servidor Vite se arranca con Bash:
```bash
cd D:/Antigravity/asterov-dashboard/dashboard && npm run dev
```

Para verificar que está activo:
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/
```

Para verificar cambios en el navegador usar `mcp__Claude_in_Chrome__navigate` y `mcp__Claude_in_Chrome__computer screenshot`.

## Estructura del proyecto

- `scraper/` — Python scraper (BeautifulSoup). Datos en `scraper/data/*.json`
- `dashboard/` — React + Vite app
- `dashboard/src/pages/` — páginas del dashboard
- `scraper/data/san_claudio_players.json` — perfiles manuales de la plantilla del San Claudio

## Equipo destacado

San Claudio, ID: 15612878, 1ª División (ID: 3636052)

## Notas técnicas

- Vite publicDir apunta a `../scraper/data` para servir los JSON estáticos
- HashRouter (no BrowserRouter) para evitar problemas con rutas en Vite
- CSS custom properties en `:root` y `:root.dark` para modo claro/oscuro
