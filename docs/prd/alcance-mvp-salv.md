# Alcance del MVP de FlowSync

## 1. Problema y contexto

En un equipo remoto pequeño nadie sabe en qué está cada compañero sin interrumpirle o esperar a la daily. El resultado son preguntas constantes por chat, media daily dedicada a repasar el estado de cada uno y, a veces, dos personas haciendo lo mismo sin saberlo. Episodio real: dos personas tocaron el mismo módulo la misma semana porque una empezó sin que la otra lo supiera, y se perdieron dos días.

## 2. Usuarios y roles: qué problema se les resuelve y cómo lo resuelven hoy

- **Quiénes son:** los miembros de un equipo remoto de 3 a 10 personas, repartidos en varios husos horarios. El primer caso de estudio es un equipo de producto SaaS de 6 personas en 3 husos horarios.
- **Roles:** planos. Todos ven y editan lo mismo, sin jerarquía de permisos. No es un producto para managers ni para reportar hacia arriba.
- **Qué problema se les resuelve:** saber qué está pendiente y quién lleva qué sin preguntar, y no empezar algo que otra persona ya está haciendo.
- **Cómo lo resuelven hoy:** con un gestor de tareas pesado que nadie consulta para esto, una daily de 15 minutos por videollamada cuya mitad se va en la ronda de "¿en qué estás?", y preguntas sueltas por Slack o chat.

## 3. Valor que aporta

- Ver de un vistazo el trabajo abierto del equipo (qué está pendiente, qué está en curso, quién lo lleva y para cuándo) sin interrumpir a nadie.
- Tomar una tarea con la garantía de que nadie más la tiene, lo que evita el trabajo duplicado.
- Eliminar la ronda de "¿en qué estás?" de la daily. La parte de bloqueos se mantiene.
- **Criterio de éxito:** tras una semana de uso real, el equipo cancela esa ronda y nadie pide que vuelva.

## 4. Alcance

El criterio de corte es **necesidad frente a beneficio**. Solo entra lo imprescindible para ver el trabajo abierto, tomarlo sin pisarse y cerrarlo. Hay un único espacio compartido, y todo el que se registra pertenece a él. Los estados son fijos: pendiente, en curso, terminada y anulada.

**MUST**
1. **Ver las tareas por estado.** *Dado* que abro FlowSync, *cuando* miro la lista, *entonces* veo por defecto las tareas pendientes y en curso del equipo, con su título, responsable, estado y fecha de vencimiento, al día en el momento de abrirla. *Cuando* elijo otro estado, *entonces* veo las tareas que están en ese estado.
2. **Crear una tarea con solo el título.** *Dado* que hay trabajo nuevo, *cuando* creo una tarea, *entonces* aparece en la lista como pendiente. La fecha de vencimiento es opcional.
3. **Tomar una tarea en exclusiva.** *Dada* una tarea libre, *cuando* la tomo, *entonces* queda asignada a mí y pasa a en curso. *Dada* una tarea que ya tiene responsable, *cuando* otra persona intenta tomarla, *entonces* no puede, y ve quién la tiene.
4. **Cambiar el estado de una tarea.** *Dada* una tarea en cualquier estado, *cuando* la paso a otro estado, *entonces* el cambio queda guardado. *Dada* una tarea asignada, *cuando* la devuelvo a pendiente, *entonces* pierde su responsable y queda libre para que otra persona la tome. *Dada* una tarea, *cuando* la marco como terminada o anulada, *entonces* deja de aparecer en la vista por defecto.

## 5. No-alcance

Para cada exclusión se indica la hipótesis del MVP que no ayuda a validar, o la decisión de producto con la que choca.

- **Actualización instantánea en vivo, por notificaciones o refresco automático.** El caso de uso es "llego y miro", y basta con que la lista esté al día al abrirla. La inmediatez es un beneficio, no una necesidad.
- **Mecanismos para obligar a actualizar** (recordatorios, actualizaciones obligatorias, avisos por inactividad). Hacen la lista más fiable, pero no hacen falta para ver tareas y tomarlas sin pisarse. Por eso el riesgo principal, que la información se quede vieja, queda sin mitigar en el MVP y se observa durante la semana de uso.
- **Notificaciones push** (regla pre-establecida en Readme). Interrumpen, y el producto apuesta por un resumen que espera a que lo mires.
- **Integración con Slack** (regla pre-establecida en Readme). Hace que FlowSync conviva con otra herramienta, cuando la apuesta es que sea donde se hace el trabajo.
- **Importar o sincronizar con otro gestor de tareas.** Obliga a actualizar dos sitios, que es como muere esta categoría de producto.
- **Deducir el estado de Git, CI o el calendario.** Es otro producto, con integraciones de terceros. El estado lo escribe quien hace la tarea.
- **Presencia** ("quién está conectado", indicadores de actividad). El estado es de la tarea, no de la persona; la presencia sería vigilancia.
- **Comentarios en las tareas** (regla pre-establecida en Readme). Llevan al chat y a hablar de bloqueos, que este MVP no resuelve.
- **Gestionar bloqueos.** La parte de la daily dedicada a bloqueos sigue existiendo; el MVP solo elimina la ronda de estado.
- **Chat, videollamada o edición simultánea.** No forman parte de lo que este producto entiende por "tiempo real".
- **Roles y permisos avanzados** (regla pre-establecida en Readme). Los equipos son planos; no aporta nada a saber quién está en qué.
- **Varios equipos, o personas en más de uno.** Para validar la hipótesis basta con un único espacio.
- **Analítica y reporting** (regla pre-establecida en Readme). El valor es para los compañeros, no para un manager; nadie lo consumiría.
- **Sprints, estimaciones, épicas y backlog priorizado.** Es justo el "rollo" del que huye el usuario; un equipo que los necesite no es nuestro usuario.
- **Estados o flujos configurables.** Con cuatro estados fijos se valida igual, y configurarlos es fricción.
- **Destacar lo que se ha movido desde la última visita.** Al actualizar la página ya se ven los cambios, así que no hace falta destacarlos para saber quién está en qué ni qué está libre.
- **Corregir una tarea** (título, responsable, fecha). Mantiene la lista limpia, pero no hace falta para ver tareas y tomarlas sin pisarse.
- **Borrar una tarea.** Mantiene la lista sin tareas sobrantes, pero marcarla como anulada sirve de alternativa: sale de la vista por defecto y queda constancia de que existió.

## Parte B

1. **Los dos números.** La herramienta propuso 10; quedaron 4.

2. **Lo que quedó fuera y por qué.** Estos tres puntos quedaron fuera por estar orientados más a usabilidad que al propio planteamiento y que no tienen un aporte real para el MVP:
   - **Cambiar el estado en dos clics como máximo.** Reduce la fricción, pero el MVP se valida pudiendo cambiar el estado, sin un límite de clics.
   - **Crear una tarea en segundos.** Es la sensación de "menos rollo que Jira", pero crear una tarea con solo el título ya está dentro del alcance.
   - **Ver marcadas las tareas vencidas.** La fecha de vencimiento ya se ve en la lista; marcarlas no cambia ninguna decisión del equipo.

3. **La exclusión de la que menos seguro estoy: corregir una tarea.** Equivocarse al escribir el título o tener que cambiar la fecha es muy natural, así que en el uso real aparecerá pronto. Chocan dos cosas: lo mínimo para validar el MVP frente a lo habitual que es equivocarse. Si el equipo no se adapta a usar la anulación (anular la tarea errónea y crear una nueva), se debería agregar.
