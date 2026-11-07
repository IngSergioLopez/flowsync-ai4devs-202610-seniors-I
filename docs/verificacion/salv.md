# Trazabilidad: «Lo que cada tarea muestra de su responsable»

Spec: `openspec/specs/tasks/spec.md` · Requisito: **Lo que cada tarea muestra de su responsable**

- **Scenarios del requisito:** 3
- **Scenarios cubiertos:** _(pendiente: se escribe al final)_

## Matriz

| # | Scenario (en una línea) | Prueba que lo cubre (nombre en la suite) | Estado | Si «No lo sé», qué faltó |
|---|---|---|---|---|
| 1 | La tarea no filtra datos de la cuenta: su `assignee`, tanto en la tarea suelta como en la lista, no trae el email ni ningún dato de acceso | Ninguna. No hay tests de `tasks`; `Auth \| registro` › «la contraseña nunca sale en la respuesta» mira el usuario del registro, no el `assignee` | No lo sé | No sé si el `id` de la cuenta cuenta como «otro dato». El requisito prohíbe cualquier dato aparte de nombre e iniciales, pero el scenario solo nombra el email y los datos de acceso. El `id` no da acceso, pero identifica al usuario con más precisión que las iniciales. Sin decidir eso, no sé qué tiene que afirmar el test |
| 2 | Responsable sin nombre: `assignee.fullName` llega nulo y sus iniciales siguen llegando | Ninguna. `Auth \| iniciales` › «sin nombre, las iniciales salen del email» lo comprueba en la respuesta del login, no en una tarea | No cubierto | — |
| 3 | Responsable identificable: si se llama "Ada Lovelace", su `assignee` trae ese nombre y sus iniciales | Ninguna. `Auth \| iniciales` › «un nombre de dos palabras da la inicial de cada una» lo comprueba en la respuesta del login, no en una tarea | No cubierto | — |

Orden por prioridad: el 1 es el único que trata de exponer datos de una cuenta. Los otros dos son de presentación.

**Decisiones para escribir los tests** (la spec no las fija; no se modifica, queda fuera del alcance):

- **`id` del responsable:** se tolera. Ninguna línea de la spec lo prohíbe explícitamente, así que el test no falla porque aparezca. Solo comprueba que no salgan el email ni datos de acceso. Si hiciera falta prohibirlo, habría que cambiar la spec.
- **«Obtener una tarea»:** incluye la tarea suelta (`GET /tasks/:id`), la lista (`GET /tasks`) y la creación (`POST /tasks`).
- **Responsable sin nombre:** se comprueba que el nombre sea nulo y que las iniciales no estén vacías, sin fijar su valor.

## Tres líneas

1. **Cubiertos según mi estimación antes de mirar / cubiertos de verdad:** 0 / _(pendiente)_
2. **Hueco de test o de spec:** _(pendiente)_
3. **Lo que el scenario no decidía y tuve que decidir yo:** _(pendiente)_
