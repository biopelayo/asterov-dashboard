# Liga Asterov Dashboard - Manual de Arranque

## Requisitos

- **Python 3.10+** con pip
- **Node.js 18+** con npm

## Estructura del proyecto

```
asterov-dashboard/
  scraper/          # Scraper Python que extrae datos de cdasterov.es
    scraper.py      # Script principal
    requirements.txt
    data/           # JSONs generados (standings, calendar, teams, etc.)
  dashboard/        # Dashboard React + Vite
    src/            # Código fuente React
    package.json
```

## Paso 1: Actualizar datos (scraper)

```bash
cd asterov-dashboard/scraper
pip install -r requirements.txt   # Solo la primera vez
python scraper.py
```

Esto genera los JSON en `scraper/data/`. Tarda ~30 segundos.
Ejecutar cada vez que quieras datos actualizados (la web se actualiza semanalmente).

## Paso 2: Arrancar el dashboard

```bash
cd asterov-dashboard/dashboard
npm install                        # Solo la primera vez
npm run dev
```

Abre `http://localhost:5173` en el navegador.

## Secciones del Dashboard

| Sección | Descripción |
|---------|-------------|
| **Resumen** | Vista general: stats de la liga + San Claudio destacado |
| **Clasificación** | Tabla de posiciones por división (1ª y 2ª) |
| **Calendario** | Partidos por jornada, filtrable por equipo |
| **Mi Equipo** | Ficha completa de San Claudio (o cualquier equipo) |
| **Estadísticas** | Rankings de jugadores (goles, tarjetas, etc.) |
| **Sanciones** | Jugadores sancionados |

## Equipo destacado

**San Claudio** (ID: 15612878) aparece destacado en dorado en todas las vistas.
Para cambiar el equipo destacado, editar en `scraper/scraper.py`:

```python
FEATURED_TEAM = "SAN CLAUDIO"
FEATURED_TEAM_ID = "15612878"
```

## Cualquier equipo puede consultarse

La sidebar lista todos los equipos de 1ª División con sus escudos.
Haciendo click en cualquiera se abre su ficha completa con plantilla, resultados y estadísticas.

## Datos extraídos

- Clasificaciones (2 divisiones, 26 equipos)
- Calendario completo (362 partidos, 26 jornadas por división)
- Plantillas (823 jugadores con fotos)
- Escudos de equipos
- Estadísticas individuales (goles, tarjetas)
- Sanciones
- Noticias
