# Trazabilidad: «Lo que cada tarea muestra de su responsable»

Spec: `openspec/specs/tasks/spec.md` · Requisito: **Lo que cada tarea muestra de su responsable**

- **Scenarios del requisito:** 3
- **Scenarios cubiertos:** 3 (el 1, en rojo y sin decidir sobre el `id`)

## Matriz

Tests en `backend/tests/functional/tasks/assignee.spec.ts`, grupo `Tasks | responsable`. Cada scenario se prueba con un test por lectura: `(al crearla)`, `(suelta)` y `(en la lista)`.

| # | Scenario (en una línea) | Prueba que lo cubre (nombre en la suite) | Estado | Si «No lo sé», qué faltó |
|---|---|---|---|---|
| 1 | La tarea no filtra datos de la cuenta: su `assignee`, tanto en la tarea suelta como en la lista, no trae el email ni ningún dato de acceso | «la tarea no expone el email ni datos de acceso de su responsable» `(al crearla)` ✖, `(suelta)` ✔, `(en la lista)` ✖ | Cubierto: **rojo**, el código incumple la spec. `id`: No lo sé | El requisito prohíbe todo dato extra y el scenario solo nombra email y acceso: ¿el `id` cuenta? |
| 2 | Responsable sin nombre: `assignee.fullName` llega nulo y sus iniciales siguen llegando | «un responsable sin nombre llega con nombre nulo y con iniciales» `(al crearla)` ✔, `(suelta)` ✔, `(en la lista)` ✔ | Cubierto | — |
| 3 | Responsable identificable: si se llama "Ada Lovelace", su `assignee` trae ese nombre y sus iniciales | «el responsable de una tarea trae su nombre y sus iniciales» `(al crearla)` ✔, `(suelta)` ✔, `(en la lista)` ✔ | Cubierto | — |

**Resultado de `npm test`:** 27 en verde y 2 en rojo, de 29. Los dos rojos son del scenario 1 al crear la tarea y en la lista: `AssertionError: expected { id: 6, …(5) } to not have nested property 'email'`. Esas dos lecturas sacan el responsable con `UserTransformer`, que incluye `email`. La tarea suelta usa `TaskAssigneeTransformer` y no lo incluye. Los rojos se entregan tal cual: no se ha tocado el código.

Orden por prioridad: el 1 es el único que trata de exponer datos de una cuenta. Los otros dos son de presentación.

**Decisiones para escribir los tests** (la spec no las fija; no se modifica, queda fuera del alcance):

- **`id` del responsable:** se tolera. Ninguna línea de la spec lo prohíbe explícitamente, así que el test no falla porque aparezca. Solo comprueba que no salgan el email ni datos de acceso. Si hiciera falta prohibirlo, habría que cambiar la spec.
- **«Obtener una tarea»:** incluye la tarea suelta (`GET /tasks/:id`), la lista (`GET /tasks`) y la creación (`POST /tasks`).
- **Quién lee:** la tarea suelta y la lista las lee otra cuenta, no el responsable. Hoy una tarea nace a nombre de quien la crea, así que si la lee su dueño no se revela nada a nadie. Pero eso podría cambiar, y la spec no limita el scenario al dueño.
- **Responsable sin nombre:** se comprueba que el nombre sea nulo y que las iniciales no estén vacías, sin fijar su valor.

## Tres líneas

1. **Cubiertos según mi estimación antes de mirar / cubiertos de verdad:** 3 / 0. Estimé después de leer la spec, porque con solo el README no se puede. Al terminar, 3 tienen test y 2 se cumplen.
2. **Hueco de test o de spec:** «La tarea no filtra datos de cuenta», por el `id` del responsable. El requisito dice «ningún otro dato de esa cuenta» y el scenario solo nombra «el email ni ningún otro dato de acceso». No sé si prohibir el `id` es una regla que nadie comprobó o una que estaba poniendo yo.
3. **Lo que el scenario no decidía y tuve que decidir yo:** quién lee la tarea y en qué lecturas. Decidí que «obtener» incluye la creación además de la suelta y la lista, y que la suelta y la lista las lea otra cuenta. Si la hubiera leído solo su dueño, que hoy es siempre quien la crea, la fuga en la lista no se habría visto como fuga hacia otra persona.
