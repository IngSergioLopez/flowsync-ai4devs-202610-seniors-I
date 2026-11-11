# 2. Los tests de integración como única fuente de verdad ejecutable

## Contexto

El [ADR 0001](0001-openspec-como-fuente-de-verdad.md) estableció que la referencia del comportamiento era la spec viva de OpenSpec, cambiada siempre mediante delta-specs. En sus consecuencias ya avisaba del riesgo principal: una spec que nada ejecuta es una afirmación, no una garantía.

Cuando se aceptó, ese riesgo ya se había materializado:

- `openspec/specs/tasks/spec.md` exigía que `GET /api/v1/tasks?status=archivado` respondiera `422`. El proposal de `add-task-status-filter` lo daba por implementado, pero el código respondía `200` con una lista vacía. Nadie lo notó hasta que se contrastó el documento OpenAPI con la spec.
- Solo 3 de los 124 scenarios de `tasks` tenían un test. Las deltas se archivaban con verificación manual: `add-task-status-filter` se archivó «sin tests» por decisión explícita.
- La única vez que la spec destapó un defecto real fue a través de un test: los de `tasks/assignee.spec.ts` encontraron que la lista exponía el email del responsable. Lo que detectó el fallo fue el test, no el documento.
- Cada cambio de comportamiento exigía mantener a mano dos descripciones del mismo hecho, la delta-spec y el código, y una tercera si había test. Un `MODIFIED` obligaba a reescribir el requisito entero con todos sus scenarios.

El supuesto de partida es que, un año después, el equipo deja de mantener las specs de OpenSpec. Hay que decidir qué pasa a ser la referencia del comportamiento y qué se hace con lo que ya existe en `openspec/`.

## Decisión

**La única fuente de verdad del comportamiento de FlowSync son los tests de integración del backend** (`backend/tests/functional/`, Japa). Lo que no está fijado por un test que pasa no es un compromiso del sistema.

- Cada comportamiento comprometido se expresa como un test functional que llama a la API, organizado por capability (`tests/functional/<capability>/`). El nombre del test y el comentario de cabecera dicen qué regla fija, en el lenguaje del dominio.
- Para cambiar un comportamiento, se cambia el test en el mismo commit que el código. Un PR que altera el comportamiento sin tocar un test está incompleto.
- Si el código y un test discrepan, el test manda. Si lo que está mal es el test, se corrige el test, explicando el porqué en el commit o el PR, nunca el código para que pase.
- **`openspec/` se congela, no se borra.** Las specs y los changes archivados quedan como registro histórico del porqué de cada requisito, pero no son normativos y no se actualizan. No se abren changes nuevos.
- Antes de congelarlas, cada scenario de las specs vivas se clasifica en uno de tres grupos:
  - se convierte en test;
  - se descarta de forma explícita;
  - queda como comportamiento de pantalla, sin cobertura, porque el frontend no tiene runner de tests.

  El resultado se registra junto a este ADR. Ningún scenario desaparece sin que conste por qué.
- Los documentos derivados (`docs/architecture.md`, el OpenAPI anotado en los controladores) se contrastan con los tests y con el código, no con la spec congelada.

## Estado

Aceptada (2027-11-11). Reemplaza al [ADR 0001](0001-openspec-como-fuente-de-verdad.md).

## Consecuencias

**Lo que ganamos**

- **Lo que manda se ejecuta.** Una divergencia entre lo comprometido y lo que hace el código deja de ser silenciosa: rompe la suite. El caso de `status=archivado` habría fallado el mismo día que se escribió.
- **Una sola descripción por comportamiento.** El test, el código y su revisión viven en el mismo PR. Ya no hay delta que fundir, ni spec viva que copiar entera para cambiar una frase.
- **Menos proceso por cambio.** Desaparecen el `proposal`/`design`/`tasks` obligatorios y el paso de archivar. La skill `capability-tests` sirve sin cambios en su forma de trabajar: solo cambia de dónde lee la regla.

**Lo que nos cuesta**

- **Se pierde el porqué.** Un test dice qué ocurre, no por qué se quiso así ni qué alternativas se descartaron. Los `proposal.md` y `design.md` (CA-9 frente a CA-17, PA-3, lo que quedó fuera a propósito) no tienen equivalente en una suite. Desde aquí, esa razón solo vive en comentarios, mensajes de commit y PRs, que nadie mantiene juntos.
- **Las pantallas se quedan sin fuente de verdad.** Unos 60 scenarios de `tasks` describen pantallas, controles y la URL del filtro. El frontend no tiene runner de tests, así que esos comportamientos pasan de estar escritos a no estar en ninguna parte normativa, salvo que se instale un runner de componentes o de extremo a extremo, lo que es otro coste.
- **Las ausencias son difíciles de probar.** Varios requisitos dicen lo que el sistema **no** debe tener: no hay forma de crear un estado, no hay filtro por responsable, no hay señales de presencia, no hay lista personal. Un test de integración prueba endpoints que existen. Que algo no exista se fija mal con tests, y es fácil que esas reglas se pierdan en la migración.
- **Un test fija lo que hace el código, no lo que se quería.** Si un test se escribe mirando el código y no una regla, congela el defecto como si fuera el comportamiento correcto. Antes, la spec permitía decir «el código está mal». Ahora hace falta disciplina para escribir los tests desde la intención, sin un documento externo que la recoja.
- **Más dificultad para quien no lee código.** Producto, diseño o quien prepare un ticket ya no tiene un documento en prosa, con formato WHEN/THEN, que leer y discutir. Tiene que leer TypeScript o fiarse de un resumen.
- **Migración cara y de una sola vez.** Partimos de 3 scenarios con test sobre 124 en `tasks`, más los 45 de `auth`. Clasificar cada scenario y escribir los tests correspondientes es un trabajo grande que no añade funcionalidad, y hasta que se termine, hay reglas que no están en ningún sitio normativo.
- **Más tiempo de ejecución y de mantenimiento.** Las suites functional usan la misma base de datos SQLite que el servidor de desarrollo y tienen un timeout de 30 s. Con cientos de tests, la suite tardará más y cada test con estado compartido es un fallo intermitente en potencia. Aislar con transacciones deja de ser una buena práctica y pasa a ser obligatorio.
- **Dos lugares que pueden contradecirse durante un tiempo.** Mientras la spec congelada siga en el repositorio, quien la lea puede tomarla por vigente. Hay que marcar `openspec/` como histórico de forma visible, o la confusión que este ADR quiere eliminar vuelve por otra puerta.
