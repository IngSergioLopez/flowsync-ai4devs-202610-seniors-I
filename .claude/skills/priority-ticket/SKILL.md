---
name: priority-ticket
description: Trae de Jira el ticket de mayor prioridad asignado al usuario en «Por hacer» del proyecto FLOW, resume sus criterios de aceptación, entra en plan mode para proponer la implementación y, al aprobarse el plan, mueve el ticket a «En curso». Usar con /priority-ticket o cuando el usuario pida «el siguiente ticket» o «el ticket prioritario».
argument-hint: "[CLAVE-TICKET opcional, p. ej. FLOW-5]"
---

# /priority-ticket

Usa las herramientas del servidor MCP `atlassian` (`.mcp.json`). Sitio y proyecto en la sección «Jira» de `CLAUDE.md`.

## 1. Traer el ticket

- Si `$ARGUMENTS` trae una clave (`FLOW-123`), usa ese ticket.
- Si no, busca con JQL:

  ```
  project = FLOW AND assignee = currentUser() AND status = "Por hacer" ORDER BY priority DESC, rank ASC
  ```

  Toma el primero. Si hay empate de prioridad, el orden del tablero (`rank`) decide; menciónalo.
- Sin resultados: dilo y para. No elijas otro ticket por tu cuenta ni cambies de proyecto.
- Lee el ticket completo (descripción y comentarios).

## 2. Resumir

Muestra en pocas líneas:

- **Clave, título, prioridad** y enlace.
- **Criterios de aceptación**, tal cual o como lista verificable. Si el ticket no los separa, extráelos de la descripción y márcalos como inferidos.
- **Huecos**: lo que el ticket no especifica y la implementación necesita (campos, validaciones, errores, rutas, estados de UI).

## 3. Plan mode

Entra en plan mode (`EnterPlanMode`) y, **antes de proponer nada**, contrasta el ticket con el código real:

- Para cada endpoint que nombre el ticket, lee su ruta en `backend/start/routes.ts`, su controller, su validador en `backend/app/validators/` y el transformer de la respuesta. El backend es la fuente de verdad de los campos obligatorios (p. ej. `passwordConfirmation`, longitudes de password), el formato `{ data: ... }` y el token `Bearer`.
- Revisa el estado actual del frontend (`frontend/src/`, `package.json`) para no asumir dependencias que no están.
- Cubre cada hueco del paso 2 con lo que dice el código, citando `archivo:línea`. Lo que el código tampoco resuelva va como pregunta abierta, no como suposición.

El plan debe incluir: archivos a crear o tocar, dependencias nuevas, cómo se conecta con la API (base URL, CORS o proxy de Vite), cómo se verifica cada criterio de aceptación y las preguntas abiertas.

Presenta el plan con `ExitPlanMode`. No edites código antes de la aprobación.

## 4. Al aprobar el plan

- Mueve el ticket a «En curso» (`transitionJiraIssue`; si el nombre de la transición no coincide, lista las transiciones disponibles y elige la que lleva a «En curso»). Confirma el estado resultante.
- Si el usuario rechaza el plan, el ticket **no** se mueve.
- Después sigue las reglas de proceso de `CLAUDE.md` (rama nueva antes de tocar código, etc.).
