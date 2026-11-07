# Prompts

Registro semi-automático (hooks `UserPromptSubmit` y `Stop`): cada prompt lanzado, con su modelo, su herramienta y un resumen de la salida.
sesion_actual: Sin nombre
**Sesiones**:
  - nombre: Sin nombre
    prompts: 1-21
---

## Prompt 1

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Quiero que leas el readme.md del proyecto para hacer la tarea S4. El entorno está listo y chequeado, la suite instalada y funciona. los test se corrieron con npm como se solicita y salieron en verde
```

**Qué salió:** _(pendiente)_

---

## Prompt 2

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
leí los escenarios de task incluido el de "Lo que cada tarea muestra de su responsable ". veo que hay tres escenario pero los tests indican validar la parte de auth. creo que no hay test de ninguna spec de task
```

**Qué salió:** _(pendiente)_

---

## Prompt 3

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
lee los escenarios de la spec referente al requerimiento de task "Lo que cada tarea muestra de su responsable" y los test existentes. Antes de escribir los test necesito que hagas la matriz de trazabilidad inicial para cada escenario de ese requerimiento. para cada una indica el criterio de aceptacion, que prueba lo cubre y si está o no cubierto por orden de prioridad. No implementes nada aún
```

**Qué salió:** # Matriz inicial: «Lo que cada tarea muestra de su responsable» **Scenarios: 3 · Cubiertos: 0** (los tests de `tasks` todavía no existen) | Prioridad | Scenario | Criterio de aceptación | Test que lo cubre | Estado | Qué faltó para decidir | |---|---|---|---|---|---| | 1 | **La tarea no filtra datos de cuenta** | Al obtener una tarea, sola (`GET /tasks/:id`) o en la lista (`GET /tasks`), su `assignee` no trae el `email` ni ningún otro dato de acceso | — | No cubierto | Ningún test pide tareas. `auth/signup.spec.ts` › «la contraseña nunca sale en la respuesta» se parece, pero mira el usuario del registro, no el `assignee` | | 2 | **Responsable sin nombre** | Si el responsable es una cuenta sin nombre, `assignee.fullName` llega `null` y `assignee.initials` sigue llegando, sin recurrir al …

---

## Prompt 4

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
el id no se permite. la spec dice que no se dan datos extra del usuario y eso incluye  el id de acceso. Obtener una tarea aplica a la lista y a la creacion. Es un punto de duda sobre la spec ya que es no es precisa al respecto.  Respecto al responsable sin nombre el escenario refiere a no recurrir a su email para mostrarlo. Has de comprobar nombre nulo e iniciales no vacías, sin fijar el valor
```

**Qué salió:** _(pendiente)_

---

## Prompt 5

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
no modifiquemos las spec. Sigamos con la tarea del readme paso a paso. Haz un plan de ejecucion y check list. Quiero que generes una primera versión de la matriz tal como la pide el readme
```

**Qué salió:** Escribió la primera versión de la matriz en [docs/verificacion/salv.md](../docs/verificacion/salv.md). Los tres scenarios salen **No cubierto**: no hay ningún test de `tasks`, y los de `auth` que se parecen comprueban la respuesta del login, no una tarea. El número de cubiertos y las tres líneas se quedan pendientes hasta el final. En la línea 1 apunté tu estimación de 0, que me diste después del primer prompt y no antes. Las specs no las he tocado. ## Plan de ejecución 1. **Matriz inicial** (hecho): una fila por scenario con las cuatro casillas y los dos números arriba. 2. **Revisar contigo las filas**: el README espera al menos un «No lo sé». Si alguna fila te deja dudas, cámbiala antes de seguir. 3. **Tests que faltan**: un fichero en `backend/tests/functional/tasks/` con un test por…

---

## Prompt 6

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
la que más dudas me genera es la del id. de alguna manera en menos expuesta a nivel de datos pero es más especifica a nivel de usuario que el dato de las iniciales. actualiza la matriz
```

**Qué salió:** La fila 1 de [docs/verificacion/salv.md](../docs/verificacion/salv.md) queda en **No lo sé**. El motivo que anoté es que no está claro si el `id` cuenta como «otro dato». El requisito prohíbe todo lo que no sea nombre e iniciales, pero el scenario solo nombra el email y los datos de acceso. El `id` no da acceso, pero identifica al usuario con más precisión que las iniciales. Esta duda también sirve para la línea 2 de la parte B: es un hueco de spec, porque la regla no deja claro si el `id` entra. Para el test, antes me dijiste que el `id` no se permite. Si sigue en pie, el test solo aceptará `fullName` e `initials` y saldrá rojo en las tres lecturas, porque hoy se envía el `id` en todas. Si lo prefieres, puedo limitarlo a que no salgan el email ni los datos de acceso. ¿Cuál dejo?

---

## Prompt 7

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
entiendo que no hay razon para exponer el id aunque puede ser util a posteriori. Dado que no hay indiicaciones explicitas déjalo. Se ha de modificar la spec si eso es lo que se necesita, pero está fuera del scope de la tarea.
```

**Qué salió:** Actualizó la matriz en [docs/verificacion/salv.md](../docs/verificacion/salv.md) con el `id` tolerado. El test del scenario 1 no fallará porque aparezca el `id`; solo comprobará que no salgan el email ni datos de acceso, como `password` o tokens. La fila 1 sigue en **No lo sé**: la duda es real y es el dato que interesa para la parte B. Debajo de la matriz anoté las tres decisiones: `id` tolerado, «obtener» que incluye la tarea suelta, la lista y la creación, y responsable sin nombre con nombre nulo e iniciales no vacías. La spec no se toca. ¿Paso al punto 3 y escribo los tres tests?

---

## Prompt 8

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
bien deja la primera versión
```

**Qué salió:** Dejo la matriz así como primera versión en [docs/verificacion/salv.md](../docs/verificacion/salv.md), sin commit. - [x] Matriz inicial: 3 scenarios, la fila 1 en «No lo sé» y las dos filas de iniciales en «No cubierto» - [x] Decisiones anotadas debajo de la matriz - [ ] Tests (punto 3), que no empiezo hasta que me lo digas

---

## Prompt 9

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
bien inicia los test manteniendo la metodología de los test existentes. muestrame luego las specs vs cada test cubierto
```

**Qué salió:** _(pendiente)_

---

## Prompt 10

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
me rectifico, inicia la creación de los tests para cada escenario del requerimiento trabajado
```

**Qué salió:** Escribió los tres tests en [backend/tests/functional/tasks/assignee.spec.ts](tests/functional/tasks/assignee.spec.ts), uno por scenario, con el mismo estilo que los de `auth/`. No los he ejecutado todavía. Los tres siguen el mismo recorrido: 1. Crean una cuenta y hacen login. 2. Crean una tarea con `POST /tasks`. 3. Leen el `assignee` en las tres lecturas: al crearla, suelta (`GET /tasks/:id`) y en la lista (`GET /tasks`). Cada aserción lleva un mensaje que dice en qué lectura falla. ## Spec frente a test | Scenario de la spec | Test | Qué afirma | |---|---|---| | **Responsable identificable**: el `assignee` trae el nombre "Ada Lovelace" y sus iniciales | `Tasks \| responsable` › «el responsable de una tarea trae su nombre y sus iniciales» | En las 3 lecturas: `fullName === 'Ada Lovelac…

---

## Prompt 11

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
muestrame los tres test
```

**Qué salió:** Este es el código de [backend/tests/functional/tasks/assignee.spec.ts](tests/functional/tasks/assignee.spec.ts). Los tres tests comparten estos dos ayudantes del grupo: ```ts async function sesion(client: any, fullName: string | null, email = 'ada@example.com') { await User.create({ fullName, email, password: 'secreto123' }) const response = await client.post('/api/v1/auth/login').json({ email, password: 'secreto123' }) return response.body().data.token as string } /** Crea una tarea y devuelve su `assignee` en cada una de las tres lecturas. */ async function assigneeEnCadaLectura(client: any, token: string) { const creada = await client .post('/api/v1/tasks') .header('Authorization', `Bearer ${token}`) .json({ title: 'Revisar el informe' }) creada.assertStatus(201) const id = creada.bo…

---

## Prompt 12

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
donde usas Fecha today=2026-11-06: la pide GET /tasks/:id
```

**Qué salió:** La fecha solo se usa en la lectura de la tarea suelta, dentro del ayudante `assigneeEnCadaLectura` de [assignee.spec.ts](tests/functional/tasks/assignee.spec.ts), como `.qs({ today: HOY })`: ```ts // `GET /tasks/:id` exige el día de quien mira; su valor no afecta al responsable. const HOY = '2026-11-06' ... const suelta = await client .get(`/api/v1/tasks/${id}`) .header('Authorization', `Bearer ${token}`) .qs({ today: HOY }) // ← aquí ``` **Por qué hace falta:** `TasksController.show` valida la petición con `taskReferenceDayValidator`, en [validators/task.ts](app/validators/task.ts). Ese validador exige `today` con formato `YYYY-MM-DD` y no tiene valor por defecto. Sin él, `GET /tasks/:id` responde `422` antes de llegar a la tarea. El día sirve para calcular `isOverdue`, que no tiene na…

---

## Prompt 13

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
pon la fecha del sistema  en su lugar
```

**Qué salió:** Cambió la fecha fija por la del sistema: `const HOY = DateTime.now().toFormat('yyyy-MM-dd')`, con el import de `luxon` que ya usa el backend. Toma el día en la zona horaria local de la máquina que ejecuta los tests. Para el responsable da igual, porque esa fecha solo afecta a `isOverdue`. ¿Los ejecuto ya?

---

## Prompt 14

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
repiteme las tareas pendientes del readme antes
```

**Qué salió:** Esto es lo que queda del README: **Parte A** - [ ] **Ejecutar los tests** con `npm test` y anotar el resultado tal cual. Si algo sale rojo, se queda rojo: no se arregla el código ni se aflojan los tests. - [ ] **Cerrar la matriz:** pasar a «Cubierto» las filas con test verde y escribir el número de cubiertos arriba. Decidir si la fila 1 sigue en «No lo sé» o cambia de estado. **Parte B: tres líneas en [docs/verificacion/salv.md](../docs/verificacion/salv.md)** - [ ] **Línea 1:** tu estimación de 0 frente a los cubiertos de verdad, sin redondear. - [ ] **Línea 2:** el hueco que no supiste si era de test o de spec. El candidato es el `id` del responsable: el requisito dice «ningún otro dato» y el scenario solo nombra el email y los datos de acceso. - [ ] **Línea 3:** lo que tuviste que de…

---

## Prompt 15

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
bien sube primero la versión actual de la matriz
```

**Qué salió:** La matriz ya está en tu fork: commit `3ae1b1f` en la rama `trazabilidad-salv`, que ahora sigue a `origin`. El commit lleva solo `docs/verificacion/salv.md`; los tests y el resto de cambios locales se quedan fuera. El PR contra el repo del curso todavía no está abierto, como pide el README. Siguiente paso: ejecutar los tests.

---

## Prompt 16

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
ejecuta los test
```

**Qué salió:** _(pendiente)_

---

## Prompt 17

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
ejecuté los test y me devolvió ok en dos de los tres casos de tarea fallando para "la tarea no expone el email ni datos de acceso de su responsable (213ms)"
```

**Qué salió:** A mí me sale lo mismo: 22 de 23 en verde. Falla solo «la tarea no expone el email ni datos de acceso de su responsable», y por lo que espera el scenario es un rojo legítimo. ``` AssertionError: email al crearla: expected { id: 6, …(5) } to not have nested property 'email' at tests/functional/tasks/assignee.spec.ts:81 ``` **Qué significa:** al crear la tarea (`POST /tasks`), el `assignee` sale con 6 campos y entre ellos está `email`. La causa es que `TaskTransformer` usa `UserTransformer`, que devuelve `id`, `fullName`, `email`, `createdAt`, `updatedAt` e `initials`. **Lo que este run no dice:** el test se para en la primera aserción que falla, y la creación es la primera de las tres lecturas que comprueba. El fallo en la lista y el pase de la tarea suelta salen de leer el código (la lis…

---

## Prompt 18

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
aumenta  los test para poder probar los escenarios de lista y tarea suelta. La tarea hoy la hace el dueño y queda asignado (por ende no se revela nada a otro usuario) pero eso podría no mantenerse y no se condice con la spec.  Luego marcala como cubierta aunque falle el código. El id es un punto de duda. queda en no lo sé con las salvedades antedichas
```

**Qué salió:** Con los tests ampliados, la suite da **27 en verde y 2 en rojo, de 29**. Los dos rojos son del scenario 1: | Lectura | Quién lee | ¿Expone el email? | |---|---|---| | Al crearla (`POST /tasks`) | El responsable | **Sí** ✖ | | Suelta (`GET /tasks/:id`) | Otra cuenta | No ✔ | | En la lista (`GET /tasks`) | Otra cuenta | **Sí** ✖ | En la lista el problema es mayor que en la creación: otra cuenta, Alan, ve el email de Ada. **Cómo quedan los tests** en [assignee.spec.ts](tests/functional/tasks/assignee.spec.ts): - **Un test por lectura:** cada scenario genera ahora tres, en bucle como `initials.spec.ts`. Un fallo en una lectura ya no oculta las demás; antes el test se paraba en la creación y no llegaba a la lista ni a la tarea suelta. - **Otro usuario lee:** la tarea suelta y la lista las le…

---

## Prompt 19

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
si, muestrame la matriz y dame recomendaciones en base a lo discutido
```

**Qué salió:** Las tres líneas de la parte B ya están en [docs/verificacion/salv.md](../docs/verificacion/salv.md). Así queda la matriz: **Scenarios: 3 · Cubiertos: 3** (el 1, en rojo y sin decidir sobre el `id`) | # | Scenario | Test (`Tasks \| responsable`) | Estado | |---|---|---|---| | 1 | No filtra el email ni datos de acceso | «la tarea no expone el email ni datos de acceso de su responsable»: al crearla ✖, suelta ✔, en la lista ✖ | Cubierto, **rojo**. `id`: No lo sé | | 2 | Sin nombre: nombre nulo, iniciales presentes | «un responsable sin nombre llega con nombre nulo y con iniciales»: ✔✔✔ | Cubierto | | 3 | Identificable: «Ada Lovelace» + iniciales | «el responsable de una tarea trae su nombre y sus iniciales»: ✔✔✔ | Cubierto | **Las tres líneas:** 1. **Estimado frente a real:** 0 / 0. Al term…

---

## Prompt 20

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Mi estimacion, en todo caso después de leer las specs era 3. de todas formas leí el código, ejecuté los test y leí los outputs. del solo readme no se puede estimar.
```

**Qué salió:** Cambió la línea 1 a **3 / 0**, con la nota de que estimaste tras leer la spec porque con solo el README no se puede. En un mensaje anterior escribiste «creo que no hay test de ninguna spec de task», que se lee como una estimación de 0. Si ese mensaje fue después de leer el código y los tests, entonces el 3 es tu estimación previa y está bien así. ¿Resumo la casilla de la fila 1 para que la matriz quepa en una pantalla, y paso a `prompts.md`?

---

## Prompt 21

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
si hazlo. Valida la entrega y lanza en paralelo la revisión  adversarial
```

**Qué salió:** _(pendiente)_
