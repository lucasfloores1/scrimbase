# Scrimbase · frontend

React 19 + Vite + Tailwind v4 + shadcn/ui (Radix). Estado de servidor con TanStack Query, ruteo con React Router 7.

## Correr

```bash
npm install
cp .env.example .env    # VITE_API_URL, VITE_ASSETS_URL, VITE_DEV_BYPASS_AUTH
npm run dev
```

`VITE_API_URL` lleva el prefijo `/api` (por el `setGlobalPrefix` del NestJS) y `VITE_ASSETS_URL` no,
porque `/uploads` cuelga de la raíz:

```
VITE_API_URL=http://localhost:3000/api
VITE_ASSETS_URL=http://localhost:3000
```

## Estructura

```
src/
  app/            layouts, providers, router y guards
  components/ui   shadcn (se regeneran con la CLI, no editar a mano)
  features/       auth, onboarding, scrims, strats, team, marketing
  shared/
    api/          un cliente por recurso (scrims, strats, teams, users, dashboard, players)
    constants/    catálogo de Valorant: mapas, agentes por rol, tipos, lados
    hooks/        useTeam / useScrims / useObjectUrl / useDebounced
    lib/          format (fechas, %, etiquetas, errores) y validation
    types/        DTOs espejo del backend
    ui/           piezas propias: valorant/ (MapImage, AgentChip, AgentSelect, Lightbox),
                  data/ (Score, OutcomeBadge, StatTile, RecordBar, Donut, Sparkline, ScrimRow),
                  forms/, feedback/, layout/, toast/
```

## Sistema visual (rediseño)

Base grafito casi negro con deriva azul, superficies elevadas **por capas** (borde superior
iluminado + sombra profunda, no por marcos) y un único acento plasma violeta→cian para lo
accionable. Ámbar reservado a las cifras que importan (winrate, ACS). Todo sale de las variables
de `src/index.css`; ninguna página tiene colores hardcodeados.

| token | uso |
| --- | --- |
| `--background` | fondo |
| `--surface-1/2/3` | paneles, filas y controles |
| `--primary` + `--plasma-2` | acento de marca (`.bg-plasma`, `.text-plasma`) |
| `--amber` | cifras destacadas |
| `--win` / `--loss` / `--draw` | semántica de resultado |

- Tipografía: **Inter** para UI, **Chakra Petch** para títulos y cifras (`.num`).
- Utilidades: `.surface`, `.surface-2`, `.surface-hover`, `.rail`, `.eyebrow`, `.text-plasma`,
  `.bg-plasma`, `.glow-plasma`, `.rise`.

### 3D

Dos piezas, ambas con transformaciones CSS reales (sin three.js ni WebGL, 0 KB de dependencias):

- `GridPlane` — plano en perspectiva (`perspective` + `rotateX`) con la malla desplazándose hacia
  el horizonte. Se usa en la landing y en el panel de login.
- `TiltCard` — inclinación siguiendo al puntero con reflejo que acompaña la normal. Muta el
  `transform` directamente, sin re-renderizar React por frame. Se usa en las tarjetas de la
  landing, el hero del dashboard y las strats.

Se probó primero con un shader WebGL propio y se descartó: se veía distinto según la GPU y en
rasterizado por software quedaba lavado. La versión CSS se ve igual en todos lados.

> Nota Tailwind v4: los degradados interpolan en OKLAB, así que un tramo hacia `transparent`
> pasa por gris. Hay que usar el mismo color con alfa 0 (`to-background/0`).

### Imágenes de mapas

Salen de la API pública **valorant-api.com** (`media.valorant-api.com`), con los uuid en
`shared/constants/valorant.ts`. Tres variantes según el contexto: `splash` (hero), `displayicon`
(minimapa, para strats) y `listviewicon` (franja, para filas). Si el CDN falla, `MapImage` cae en un
degradado estable derivado del nombre. No se descarga ningún asset al repo.

## Contrato con el backend

Los catálogos de `shared/constants/valorant.ts` copian **exactamente** los enums
`ValorantMap` y `ValorantAgent` del backend: si se agrega un mapa o un agente allá, hay que
agregarlo acá o el POST vuelve 400.

El listado de scrims **no filtra en el cliente**: manda `map`, `type`, `outcome`, `opponentName`,
`agents`, `exactComposition`, `playerId`, `from`, `to` y `limit` como query params, tal como los
espera `ListScrimsQueryDto`.

## Planes y cupo (etapa 2)

El front asume este contrato. **Si el backend todavía no lo expone, no pasa nada**: ante un 404
`useSubscription` asume "sin tope" y toda la interfaz de planes queda oculta.

```
GET  /teams/:teamId/subscription
  → { plan: "FREE"|"PRO", status: "ACTIVE"|"PAST_DUE"|"CANCELED",
      currentPeriodEnd?: ISO|null,
      quota: { period: "DAY"|"MONTH", limit: number|null, used: number,
               remaining: number|null, resetsAt: ISO } }

POST /teams/:teamId/subscription/checkout   body { plan: "PRO" }   (solo admin)
  → { url: "https://..." }        el front redirige a esa URL

402 { error: { code: "QUOTA_EXCEEDED", message } }   cuando no queda cupo
```

Dos cosas importantes del lado del servidor:

1. El cupo tiene que validarse **también en `POST /scrims/parse-screenshot`**, no solo al crear la
   scrim. El análisis es lo que consume Gemini: si solo se valida al guardar, se puede analizar
   sin límite y no guardar nada.
2. `limit: null` significa ilimitado (Pro). El front nunca bloquea si `limit` es `null`.

## Desarrollo sin backend

```bash
npm run mock   # API falsa en :3000 con el mismo contrato (admin@scrimbase.gg / password)
npm run dev
```

## Smoke test end-to-end

Con `npm run mock` y `npm run dev` corriendo:

```bash
pip install playwright && playwright install chromium
python e2e/smoke.py    # 31 pasos por toda la app; capturas en e2e/shots/
```

## Peso

~10 KB gzip de código propio inicial + ~160 KB gzip de vendor (React, Router, Radix, TanStack, axios)
cacheable entre deploys; cada pantalla se descarga al visitarla (2–4 KB gzip). Sin librerías de
gráficos ni de 3D: sparklines, donuts y la inclinación de las tarjetas son SVG y CSS.
