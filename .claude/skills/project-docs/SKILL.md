---
name: project-docs
description: Genera la documentación técnica del proyecto a partir del código real — el diagrama de contenedores C4 en Mermaid (docs/architecture.md) y/o el documento OpenAPI de una capability, anotando sus controladores con @foadonis/openapi y contrastándolo con su spec viva. Usar cuando se pida documentar la arquitectura, un diagrama C4, el OpenAPI/Swagger/Scalar o el contrato de la API. Argumentos: c4 | openapi <capability> | all <capability>.
---

# Documentación del proyecto desde el código

Argumentos: `c4`, `openapi <capability>` o `all <capability>`. Si falta la capability para `openapi`, lista las carpetas de `openspec/specs/` y pregunta.

**Regla de oro: solo se documenta lo que se puede verificar leyendo archivos o ejecutando el código.** Si algo no se puede comprobar, no se dibuja ni se anota. La documentación describe lo que el código *hace hoy*; si eso contradice la spec, se reporta como bug y **no se arregla ni se documenta lo que debería hacer**.

## A. Diagrama C4 de contenedores (`c4`)

1. **Leer, no suponer.** Fuentes mínimas:
   - `backend/start/routes.ts` (rutas reales, prefijos, middleware `auth`).
   - `ls backend/app/*/` y los `import` de cada controlador (qué validadores, modelos y transformers usa).
   - `backend/database/migrations/*` (`tableName`, claves foráneas) y `backend/config/database.ts` (cliente y fichero de la conexión **activa**; las comentadas no cuentan).
   - `backend/package.json` y `frontend/package.json` (versiones reales).
   - `frontend/src/lib/api.ts` (cliente HTTP, `VITE_API_URL`), `frontend/src/auth/auth-provider.tsx` (dónde vive el token) y `frontend/src/routes/app-routes.tsx` (páginas).
2. **Escribir `docs/architecture.md`**: un párrafo corto que explique qué muestra el diagrama, seguido de un bloque ```` ```mermaid ```` con `C4Container`:
   - `Person` → `System_Boundary` con `Container` (SPA), `Container` (API) y `ContainerDb` (BD).
   - En cada contenedor: tecnología con versión mayor real y una descripción con lo verificado (páginas, controladores, tablas).
   - `Rel` con las rutas reales y el protocolo (`JSON/HTTP, Authorization: Bearer`).
   - `UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")`.
3. **Fuera del diagrama**: conexiones comentadas, guards configurados pero sin uso, rutas de prueba (`GET /`), CORS y sistemas externos que el código no llama. Dilo en el resumen final.
4. Nivel contenedor: no dibujes componentes sueltos; los controladores, modelos y transformers van en la descripción del contenedor.

## B. Documento OpenAPI de una capability (`openapi <capability>`)

### B.1 Comprobar el montaje

- `backend/config/openapi.ts` existe, el provider `@foadonis/openapi/openapi_provider` está en `adonisrc.ts` y `start/routes.ts` llama a `openapi.registerRoutes()` (import de `@foadonis/openapi/services/main`). Si falta, añádelo.
- El `info.title`/`info.version` deben nombrar al proyecto (no `My API`/`1.0.0` del configure). Versión: la de `backend/package.json` salvo que el usuario diga otra.
- **Las URLs se leen, no se suponen**: el path sale del argumento de `registerRoutes(path = '/api')` (`node_modules/@foadonis/openapi/build/src/openapi.js`), no de la config; host y puerto de `backend/.env`. Documento en `<path>.json` / `<path>.yaml`, interfaz en `<path>`.

### B.2 Contrastar documento ↔ spec (antes de anotar)

1. Sirve el documento (`timeout 25 node ace serve` en segundo plano, espera a que responda `/`) y guarda `/api.json` en el scratchpad.
2. Lee los `#### Scenario:` de `openspec/specs/<capability>/spec.md` que tocan la API.
3. Entrega dos listas separadas, citando el scenario en cada punto:
   - Lo que la spec exige y el documento **no** recoge: parámetros, cuerpos, códigos de respuesta, forma de los objetos, seguridad.
   - Scenarios **sin ningún endpoint** que los sirva (distingue «no existe a propósito», p. ej. un catálogo que no se toca, de un hueco real).

### B.3 Sondear el comportamiento real

Antes de anotar, comprueba qué devuelve de verdad cada operación (códigos y cuerpos de 200/201/401/404/422). **No escribas en la BD de desarrollo**: crea un test desechable y bórralo al acabar.

```bash
mkdir -p backend/tests/functional/zz_probe   # spec con group.each.setup(() => testUtils.db().withGlobalTransaction())
node ace test functional --files=zz_probe/probe   # imprime status() y body() de cada caso con .loginAs(user)
rm -rf backend/tests/functional/zz_probe
```

Cruza el resultado con la spec. Cada divergencia (p. ej. un valor inválido que devuelve `200 []` en vez de `422`) es un **bug a reportar**, no algo que anotar como si funcionara.

### B.4 Anotar

- **Esquemas en `backend/app/openapi/schemas.ts`**, importados vía `#openapi/*` (si no existe la entrada en `package.json` `imports`, añádela junto a `#validators/*`). Cada esquema es una **clase** con `@ApiProperty` / `@ApiPropertyOptional` de `@foadonis/openapi/decorators`: el loader de clases la publica una sola vez en `components.schemas` con el nombre de la clase y la referencia por `$ref`.
  - Tipos siempre explícitos (`type: 'integer'`, `type: 'string', format: 'date' | 'date-time'`, `enum: [...CONSTANTE_DEL_MODELO]`, `type: () => OtraClase`, `type: () => [OtraClase]` para arrays). No dependas de `design:type`.
  - Nulables con `nullable: true` (OpenAPI 3.0). Campos con `!` (`id!: number`), no `declare`.
  - Un esquema por forma real: uno por transformer (p. ej. lista vs. detalle si difieren), los envoltorios `{ data }` del serializer (`XResponse`, `XListResponse`), el error (`ApiErrorResponse { errors: ApiErrorItem[] }` con `message`, y `field`/`rule`/`meta` opcionales) y un `XBody` por validador.
  - Los enums se toman de las constantes del modelo, no se repiten a mano.
- **En cada método de controlador** (no a nivel de clase): `@ApiOperation({ summary, description })`, `@ApiQuery` por query param, `@ApiBody({ type: XBody })`, un `@ApiResponse({ status, description, type })` por código **que el código devuelva de verdad**, y `@ApiBearerAuth()` si la ruta lleva `middleware.auth()`.
  - `@ApiBearerAuth()` usa el nombre `bearer`: declara `components.securitySchemes.bearer = { type: 'http', scheme: 'bearer' }` en `document` de `config/openapi.ts`.
  - `404` sin `type` cuando el cuerpo es el volcado de depuración de `E_ROW_NOT_FOUND` (no es un contrato estable).
  - **No añadas `@ApiParam` para parámetros de ruta**: el loader de Adonis ya los inyecta como `string` y se duplicarían.
  - Reglas que el esquema no puede expresar sin mentir (recorte de espacios, campos extra ignorados) van en `description`, no en `additionalProperties`.
- **Prohibido**: cambiar rutas, validadores o comportamiento. Solo se anota.

### B.5 Verificar

```bash
cd backend && npx prettier --write <ficheros tocados> && npx eslint app/openapi app/controllers config/openapi.ts
npm run typecheck && node ace test
```

Vuelve a servir `/api.json` y comprueba por operación: parámetros (con su schema), `requestBody` con `$ref`, códigos de respuesta con su `$ref`, `security: [{"bearer":[]}]`, y la lista de `components.schemas`.

## C. Cierre

- Commit por petición con la skill `/commit` (rama de trabajo actual si no es `main` ni `sN/*`). Incluye los `.adonisjs/` regenerados si cambian. No metas en el commit cambios ajenos que ya estuvieran en el árbol; si un fichero los mezcla (p. ej. un lockfile), dilo.
- Respuesta final:
  - `c4`: qué contenedores y relaciones se dibujaron y qué se dejó fuera y por qué.
  - `openapi`: tabla «punto de la lista → ✅ / ❌» frente a la lista de B.2, lo que queda sin cubrir con su motivo, los bugs encontrados en B.3 (con el scenario que incumplen) y cualquier fichero tocado fuera de los controladores.
