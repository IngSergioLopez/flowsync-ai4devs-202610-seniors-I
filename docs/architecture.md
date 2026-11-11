# Arquitectura de FlowSync

Diagrama de contenedores (nivel 2 de C4) de FlowSync tal como está en el código. Una persona del equipo usa la SPA de React (`frontend/`), que es la única que habla con la API: todas las llamadas salen de `frontend/src/lib/api.ts` con `fetch` y token `Bearer`, y el token se guarda en el `localStorage` del navegador bajo `flowsync.token`. La API AdonisJS (`backend/`) expone las rutas de `start/routes.ts` bajo `/api/v1`. Dentro, los controladores validan con VineJS (`app/validators/`), acceden a los datos con los modelos Lucid `User` y `Task` (`app/models/`) y responden a través de transformers (`app/transformers/`). Todo se guarda en un único fichero SQLite (`backend/tmp/db.sqlite3`, driver `better-sqlite3`), con las tablas `users`, `auth_access_tokens` y `tasks` que crean las migraciones de `database/migrations/`.

```mermaid
C4Container
  title FlowSync: diagrama de contenedores

  Person(member, "Persona del equipo", "Apunta tareas, cambia su estado y su fecha y consulta en qué anda cada uno")

  System_Boundary(flowsync, "FlowSync") {
    Container(spa, "SPA web", "React 19, react-router 8, Vite 8, Tailwind v4, shadcn/ui", "Páginas /login, /register, /tasks, /tasks/:id y /profile. lib/api.ts es el único cliente HTTP; el token vive en localStorage (flowsync.token)")
    Container(api, "API REST", "AdonisJS 7, VineJS 4, Auth 10 (access tokens)", "Rutas bajo /api/v1. Controladores: NewAccount, AccessTokens, Profile, Tasks, TaskStatuses, TaskDueDates. Valida con VineJS y responde con transformers dentro de { data }")
    ContainerDb(db, "Base de datos", "SQLite (better-sqlite3), Lucid 22", "Fichero tmp/db.sqlite3. Tablas users, auth_access_tokens y tasks (tasks.assignee_id → users)")
  }

  Rel(member, spa, "Usa", "Navegador, http://localhost:5173")
  Rel(spa, api, "auth/signup, auth/login, account/profile, account/logout, GET/POST tasks, GET tasks/:id, PATCH tasks/:id/status, PUT tasks/:id/due-date", "JSON/HTTP, Authorization: Bearer")
  Rel(api, db, "Lee y escribe usuarios, tokens y tareas", "Lucid ORM")

  UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```
