---
name: commit
description: Crea un commit convencional (`tipo(scope): descripción`) a partir de los cambios preparados (staged) del repo. Usar con /commit o cuando el usuario pida commitear lo preparado.
argument-hint: "[pista opcional sobre el tipo, scope o motivo]"
disable-model-invocation: true
---

# /commit

Commitea **solo lo que ya está preparado**. No hagas `git add`, no quites nada del stage y no toques el árbol de trabajo.

## 1. Leer lo preparado

```bash
git diff --cached --stat
git diff --cached
git branch --show-current
git log -5 --oneline
```

- Si no hay nada preparado: dilo, muestra `git status --short` y para.
- Si lo preparado mezcla cambios sin relación (p. ej. una feature y un arreglo de docs), dilo y propone separarlos; no commitees hasta que el usuario decida.
- Si ves secretos (`.env`, claves, tokens) en el diff, para y avisa.

## 2. Redactar el mensaje

Formato: `tipo(scope): descripción`

- **tipo**: `feat` (funcionalidad nueva), `fix` (corrige un fallo), `docs`, `refactor` (sin cambio de comportamiento), `test`, `style` (formato), `perf`, `build` (dependencias, build), `ci`, `chore` (mantenimiento, config del harness).
- **scope**: el área tocada, en minúsculas: `frontend`, `backend`, `auth`, `harness` (todo lo de `.claude/`, `.mcp.json`, `CLAUDE.md`), `docs`, `s1`… Uno solo; si el cambio abarca varias áreas, el más significativo.
- **descripción**: en español, en minúscula, en presente o imperativo, sin punto final, ≤ 72 caracteres en total la primera línea. Di qué cambia, no qué archivos.
- **Cuerpo** (opcional, tras una línea en blanco): el porqué, cuando no es obvio. Líneas ≤ 72.
- **Cambio incompatible**: `tipo(scope)!:` y un pie `BREAKING CHANGE: …`.
- **Ticket**: si la rama o `$ARGUMENTS` contienen una clave `FLOW-N`, añade el pie `Refs: FLOW-N`.

Mira `git log` para seguir el estilo del repo (p. ej. `docs(s1): el README es la lección de ejercicio, generada`).

## 3. Commitear

Muestra el mensaje y commitea con un heredoc para respetar los saltos de línea:

```bash
git commit -F - <<'EOF'
tipo(scope): descripción

Cuerpo opcional.
EOF
```

- No uses `--no-verify` ni `--amend`. Si un hook falla, muestra el error, arregla la causa y vuelve a preparar y commitear (commit nuevo).
- Termina mostrando `git log -1 --oneline`. No hagas push.
