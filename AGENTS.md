# AGENTS.md

Instrucciones para agentes de código (Claude Code, Codex, Cursor…) que trabajen en este repositorio.

## Qué es este repo

FlowSync: ejercicio del curso AI4Devs (S1). Monorepo sin workspaces con dos apps independientes: `backend/` (API AdonisJS 7) y `frontend/` (Vite + React 19). El `README.md` raíz es el enunciado del ejercicio, **generado a partir de la lección: no se edita a mano**. Se trabaja en la rama `harness-<iniciales>` (base `s1/start`). Entregables: `docs/harness/comparacion.md` y `prompts.md`.

`prompt_track.md` lo rellenan automáticamente los hooks `UserPromptSubmit` (prompt) y `Stop` (resumen de la salida) de `.claude/hooks/log-prompt.mjs`: no dupliques entradas a mano.

## Jira

Servidor MCP `atlassian` declarado a nivel de proyecto en `.mcp.json` (OAuth la primera vez). Sitio `https://ingslopez.atlassian.net` (cloudId `f9159622-79e2-4208-942c-02178f798954`), proyecto **FLOW**. Estados del flujo: «Por hacer» → «En curso» → «Listo».

Requiere **Node 24+** (con Node 20 falla con `Unknown file extension ".ts"`).

## Comandos

Backend (`cd backend`, sirve en http://localhost:3333):

```bash
npm install && cp .env.example .env && node ace generate:key   # primera vez
node ace migration:run      # crea/actualiza tmp/db.sqlite3 y regenera database/schema.ts
npm run dev                 # node ace serve --hmr
npm test                    # node ace test (Japa)
node ace test unit          # una suite: unit | functional
node ace test --files="tests/functional/auth.spec.ts"   # un archivo
node ace test --tests="nombre del test"                  # un test por título
npm run lint                # eslint (@adonisjs/eslint-config)
npm run typecheck           # tsc --noEmit
npm run format              # prettier (@adonisjs/prettier-config)
```

Frontend (`cd frontend`, en otra terminal, sirve en http://localhost:5173):

```bash
npm run dev       # vite
npm run build     # tsc -b && vite build
npm run lint      # oxlint
npm run format    # prettier --write src (sin `;`, comillas simples: .prettierrc.json)
```

Un hook `PostToolUse` (`.claude/settings.json` → `.claude/hooks/format-frontend.mjs`) formatea con Prettier cada archivo de `frontend/src/` que edite el agente. El frontend no tiene test runner.

## Arquitectura del backend

- **Rutas** (`start/routes.ts`): todo bajo `/api/v1`.
  - `POST /auth/signup` → `NewAccountController.store`, `POST /auth/login` → `AccessTokensController.store` (públicas).
  - `GET /account/profile`, `POST /account/logout` con middleware `auth()`.
- **Auth** (`config/auth.ts`): guard por defecto `api` = access tokens opacos (prefijo `oat_`, tabla `auth_access_tokens`) vía `User.accessTokens` (`DbAccessTokensProvider`). Existe también un guard `web` de sesión. El frontend debe mandar `Authorization: Bearer <token>`.
- **Respuestas**: `providers/api_provider.ts` registra un serializer que envuelve los payloads en `{ data: ... }`; los modelos se exponen mediante transformers (`app/transformers/`). El middleware `force_json_response` fuerza JSON.
- **Validación**: VineJS en `app/validators/` (signup: email único, password 8–32 con `passwordConfirmation`).
- **BD**: SQLite (better-sqlite3) en `backend/tmp/db.sqlite3`; migraciones en `database/migrations/`. Modelo `User` compone `UserSchema` (generado) + `withAuthFinder`.
- **Código generado — no editar a mano**: `backend/database/schema.ts` (lo regenera `migration:run`; reglas manuales en `database/schema_rules.ts`) y todo `backend/.adonisjs/` (índice de controllers/eventos y cliente/registry de Tuyau, regenerados por los hooks `indexEntities`/`generateRegistry` de `adonisrc.ts` al arrancar). Es normal que aparezcan modificados en `git status`.
- **Tests**: Japa con suites `unit` (`tests/unit/**/*.spec.ts`) y `functional` (`tests/functional/**/*.spec.ts`), declaradas en `adonisrc.ts`. `tests/bootstrap.ts` carga assert, api-client con auth/sesión, aserciones de BD y el registry tipado de rutas. Aún no hay tests escritos.

## Arquitectura del frontend

Todavía es la plantilla de Vite (`src/App.tsx` con el contador): sin router, sin gestión de estado, sin cliente HTTP, sin proxy en `vite.config.ts`, CSS plano. El backend exporta `./data` y `./registry` en su `package.json` para consumir un cliente tipado de Tuyau, pero el frontend aún no lo usa. Si se llama a la API desde `localhost:5173`, hay que configurar `CORS_ORIGIN` en `backend/.env` (está comentado en `.env.example`) o añadir un proxy en Vite.

## Reglas de proceso

1. **Rama nueva antes de tocar código**: nunca edites sobre `main` ni sobre la rama actual de entrega; crea una rama desde ella (`git checkout -b <tipo>-<ticket>-<desc>`, p. ej. `feat-flow-5-login`).
2. **Al cerrar**: commitea con `/commit` y abre el pull request con `gh pr create` (título convencional y, si hay ticket, su clave `FLOW-N` en la descripción).
3. **Después**: lanza el subagente `adversarial-reviewer` sobre ese pull request y resuelve o reporta lo que encuentre.
4. **En el chat, solo la URL del pull request**: nada de resúmenes de cambios ni del informe del revisor salvo que se pidan.
