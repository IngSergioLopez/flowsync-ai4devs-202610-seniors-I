# 1. Las delta-specs de OpenSpec como fuente de verdad viva

## Contexto

FlowSync describe su comportamiento con OpenSpec (`openspec/config.yaml`, `schema: spec-driven`). Esto es lo que hay en el repositorio:

- **Dos specs vivas**, una por capability:
  - `openspec/specs/auth/spec.md`, con 19 requisitos y 45 scenarios.
  - `openspec/specs/tasks/spec.md`, con 32 requisitos y 124 scenarios.

  Cada requisito se escribe con `SHALL` y sus scenarios en formato WHEN/THEN. Los scenarios cubren la API (códigos, campos, parámetros) y también las pantallas.
- **Tres changes archivados** en `openspec/changes/archive/`, los tres de 2026-08-13. Cada uno trae `proposal.md`, `design.md`, `tasks.md` y una delta-spec por capability afectada, organizada en `ADDED`/`MODIFIED`:
  - `add-task-list` añade los 14 requisitos de partida de `tasks`. Además modifica 3 requisitos de `auth` y le añade 1 (el acceso al perfil).
  - `add-task-due-date` añade 11 requisitos de vencimiento y modifica «Una sola vista de tareas, sin señales de presencia».
  - `add-task-status-filter` añade 7 requisitos de filtrado. Modifica 4 que el filtro dejaba falsos, como «Una sola lista compartida del espacio», que decía «todas las tareas».
- **Cómo se relacionan.** La spec viva es el resultado de aplicar, en orden, las deltas de los changes archivados. Hoy los 32 requisitos de `tasks` coinciden con los que esos tres changes añaden. Una delta `MODIFIED` reescribe el requisito completo, no un parche, y al archivar el change sustituye al anterior en la spec viva. La historia del fichero lo refleja: `04940fc` crea `tasks/spec.md` y `209df12` («el filtro por estado entra en la spec viva») lo actualiza.
- **Las specs ya funcionan como referencia.** La skill `capability-tests` declara que «la spec es la fuente de verdad, no el código». Los tests de `tasks/assignee.spec.ts` se escribieron desde un requisito de la spec, y gracias a ellos se encontró que la lista exponía el email del responsable.
- **Las specs no siempre nacieron antes que el código.** El proposal de `add-task-status-filter` dice expresamente que documenta «comportamiento que ya está implementado y funcionando» y que se archivó «sin tests».

Hace falta fijar qué documento manda cuando el código, los tickets, el PRD de `docs/prd/` y la spec dicen cosas distintas, y por qué vía se cambia lo que manda.

## Decisión

La fuente de verdad del comportamiento de FlowSync es la **spec viva de cada capability**, en `openspec/specs/<capability>/spec.md`. **La única forma de cambiarla es una delta-spec** dentro de un change de OpenSpec.

- Todo cambio de comportamiento pasa por un change en `openspec/changes/<nombre>/`. El change declara una delta-spec con `ADDED`, `MODIFIED`, `REMOVED` o `RENAMED` sobre los requisitos afectados, y se archiva al terminar. Al archivarlo, la delta se funde en la spec viva.
- La spec viva no se edita a mano. Si un requisito vivo ya no es cierto, se corrige con un `MODIFIED` que lo reescribe entero, como hizo `add-task-status-filter`.
- Cuando el código y la spec viva no coinciden, el defecto está en el código, salvo que un change diga lo contrario. Los tests y la documentación derivada (`docs/architecture.md`, el documento OpenAPI) se contrastan con la spec, no con el código.
- El PRD, el backlog y los tickets son el origen de los changes, pero no son normativos. Lo que no esté en la spec viva no es un compromiso del sistema.

## Estado

Aceptada (2026-11-11). Registra una práctica que el repositorio ya seguía desde los changes archivados el 2026-08-13.

## Consecuencias

**Lo que ganamos**

- Hay un único sitio donde mirar qué debe hacer el sistema, con un lenguaje verificable: cada scenario puede convertirse en un test. La trazabilidad de `tasks` (scenario → test) y el contraste entre el OpenAPI y la spec solo fueron posibles por esto.
- Cada requisito tiene historia: se sabe qué change lo introdujo o lo reescribió, con su `proposal.md` (el porqué) y su `design.md` (las decisiones y desviaciones, como CA-9 frente a CA-17).
- Los cambios que vuelven falso un requisito anterior quedan explícitos (`MODIFIED`) en vez de dejar contradicciones silenciosas en la spec.

**Lo que nos cuesta**

- **Que la spec diga algo no significa que se cumpla.** OpenSpec no ejecuta nada, y hoy la spec manda sobre un código que no la cumple entera:
  - El requisito «Un estado que no existe se rechaza, no se responde vacío» está en la spec viva, y el proposal lo describe como ya implementado. Aun así, `GET /api/v1/tasks?status=archivado` responde `200` con una lista vacía.
  - Solo 3 de los 124 scenarios de `tasks` tienen un test que los compruebe.

  Sin tests, la fuente de verdad es una afirmación, no una garantía.
- **Las specs que se escriben después del código pueden recoger lo que se cree que hace el código, no lo que hace.** `add-task-status-filter` se archivó con verificación manual y sin tests, y ese es justo el requisito que hoy falla.
- **Más trabajo en cada cambio.** Incluso un ajuste pequeño requiere un change con `proposal`, `design`, `tasks` y una delta. Un `MODIFIED` obliga a copiar el requisito entero con todos sus scenarios. Basta tocar una frase para reescribir bloques largos, y es fácil perder un scenario sin darse cuenta.
- **La spec viva crece sin límite y mezcla capas.** `tasks` tiene 124 scenarios en un único fichero, y unos 60 son de pantalla, sin runner de tests en el frontend que los compruebe. Cuesta más leerla, revisarla y mantenerla coherente.
- **Las fusiones no se revisan solas.** Que la spec viva refleje bien la suma de las deltas depende de que el archivado se haga y se revise. Los tres changes se archivaron el mismo día, y nada comprueba automáticamente que la spec viva y las deltas sigan coincidiendo.
- **Dependemos de una herramienta y de una forma de trabajar.** El formato de delta, el `schema: spec-driven` y el flujo proponer → aplicar → archivar son de OpenSpec. Quien se incorpore tiene que aprenderlos, y salirse del flujo (editar la spec a mano, cambiar código sin change) rompe la garantía sin que nada avise.
- **Hay que decidir cuando código y spec divergen.** Toda divergencia exige elegir explícitamente: o se arregla el código, o se abre un change que corrija la spec. No vale dejarlo como está, lo que obliga a parar trabajo que, de otro modo, se habría seguido haciendo.
