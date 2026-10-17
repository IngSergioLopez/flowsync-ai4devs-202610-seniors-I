# Prompts — copia con harness

Prompts lanzados en la copia con harness, en orden, con el modelo, la herramienta y lo que salió de cada uno.

---

## Prompt 1

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
registra los comandos que se ejecuten de aquí en mas en el formato de ejemplo en prompts.md
```

**Qué salió:** Generó un hook para registro de prompts. (esto no estaba en la preparacion pero era requerido por el enunciado y me era util para comparativa)

## Prompt 2

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
/init
```

**Qué salió:** Ejecutó un agente con Haiku 5.5 de mapeo, buscó arnés anterior sin encontrarlo. Procesó el readme, creó claude.md.

## Prompt 3

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
/priority-ticket
```

**Qué salió:** Me consulta sobre el readme pese a tener el conector ya configurado. Pide montar los pasos 2 y 3 y me recuerda la tarea de Jira que ya hice.

## Prompt 4

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
monta el mcp con Jira para el proyecto FLOW
```

**Qué salió:** Conectó el mcp mediante .mcp.json nuevo e inspeccionó los tickets y sus estados, me pide reiniciar la sesión y volver a hacer signing in con OAuth. (omito) Me pregunta cuál ticket debo tomar.

## Prompt 5

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Quédate con FLOW-5: asígnamelo y marca FLOW-6 como duplicado
```

**Qué salió:** Usé la interfaz de usuario y agregó una marca de duplicado que no quería al comando ofrecido. Lo movió a listo (lo devolveré a por hacer manualmente más tarde). Me advierte sobre el contenido del ticket que difiere del encargo del readme (Hay un limite de 255 carateres de ticket, la info se puso en comentarios y se creó un campo para el resultado esperado).

## Prompt 6

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
crea la skill /priority-ticket
```

**Qué salió:** Lo crea y describe el ticket creado y su uso permitiendo usar una clave. El skill lo resume, propone un plan y mueve el ticket de forma automática. Vuelve a insistir con reinicio de sesión (omito).

## Prompt 7

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
/priority-ticket
```

**Qué salió:** Trae el ticket e indica varios detalles sin especificar, entra en plan mode automático y revisa el código. Propone el plan. Reevalúa en función del código del backend. Propone instalar y poner setup nuevo de shadcn/ui con instalación de Tailwind v4. Consulta si pedir nombre en registro. (Noto que me apresuré, vuelvo a setear el arnés.) Detengo modo plan.

## Prompt 8

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
crea la skill commit para un commit convencional (`tipo(scope): descripción`) a partir de los cambios preparados.
```

**Qué salió:** Lo crea (con el plan en mente).

## Prompt 9

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
/context
```

**Qué salió:** 150kb (15%) comando corre local

## Prompt 10

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
crea un subagente `adversarial-reviewer` que revisa un pull request intentando romperlo, no aprobarlo, y sin editar nada que use el modelo asignado de revision por defecto
```

**Qué salió:** Creó el subagente, omitió chequear si existía un modelo asignado a la revision.

## Prompt 11

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
revisa que el subagente configurado para revisión validación usa Sonet como modelo{
```

**Qué salió:** No tiene nada. Propone cambio de reviewer. Omito.

## Prompt 12

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
crea hook que formatea el frontend cada vez que el agente edita un archivo. Si el frontend no trae formateador: instala Prettier en `frontend/` y dispáralo sobre `frontend/src/`
```

**Qué salió:** Propone el plan que acepto e instala Prettier. Pide permisos y crea el hook PostToolUse. Incluye cambio de modelo a Sonnet que incluyo. Verifica el hook.

## Prompt 13

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
haz que el hook funcione tanto para windows como para ubuntu
```

**Qué salió:** Adaptó el hook, le indico que omita el testeo y me tira los pasos a seguir.

## Prompt 14

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
agrega a las reglas de proceso al final del `CLAUDE.md`: rama nueva antes de tocar código; al cerrar, `/commit` y el pull request con `gh pr create`; después, el subagente revisor sobre el pull request; y en el chat, solo la URL del pull request.
```

**Qué salió:** Añadió cosas que no le pedí, ejemplo de la rama, descripción, un extra sobre el hook.

## Prompt 15

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
pon en agents.md el contenido de claude.md y en este ultimo un referencia @Agents.md como es usual
```

**Qué salió:** Hizo lo que le pedí (el enlace simbólico no es tan funcional en Windows).

## Prompt 16

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
cambia el registro de comandos a prompt_track.md. Debe poner además del cambio el resumen de cada salida, mueve el hook a posttooluse de ser necesario
```

**Qué salió:** Cambió el hook como se solicitó.
