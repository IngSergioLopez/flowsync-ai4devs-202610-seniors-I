// Registro de prompts en prompt_track.md.
// - UserPromptSubmit: añade «## Prompt N» con el prompt tal cual y la salida pendiente.
// - Stop: al terminar el turno, rellena la salida pendiente con un resumen de la respuesta.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

// - Cabecera (antes del primer «## Prompt»): `sesion_actual:` (lo cambias a mano al empezar otra
//   sesión) y la lista `**Sesiones**:` con el rango de prompts de cada una; el hook amplía el rango
//   de la sesión actual o añade una nueva.
const FILE = 'prompt_track.md'
const PENDING = '**Qué salió:** _(pendiente)_'
const HEADER =
  '# Prompts\n\nRegistro semi-automático (hooks `UserPromptSubmit` y `Stop`): cada prompt lanzado, ' +
  'con su modelo, su herramienta y un resumen de la salida.\n' +
  'sesion_actual: Sin nombre\n**Sesiones**:\n---\n'

const MODEL_NAMES = {
  'claude-opus-5-5': 'Opus 5.5',
  'claude-sonnet-5-5': 'Sonnet 5.5',
  'claude-haiku-5-5': 'Haiku 5.5',
  'claude-fable-5-1': 'Fable 5.1',
}

function readTranscript(path) {
  try {
    return readFileSync(path, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line)
        } catch {
          return null
        }
      })
      .filter(Boolean)
  } catch {
    return []
  }
}

function lastModel(entries) {
  for (let i = entries.length - 1; i >= 0; i--) {
    const model = entries[i]?.message?.model
    if (model && model !== '<synthetic>') return model
  }
  return process.env.ANTHROPIC_MODEL || 'claude-opus-5-5'
}

// Un prompt real del usuario: no es meta ni un resultado de herramienta.
function isUserPrompt(entry) {
  if (entry.type !== 'user' || entry.isMeta) return false
  const content = entry.message?.content
  if (typeof content === 'string') return content.trim() !== ''
  return Array.isArray(content) && content.some((b) => b.type === 'text') && !content.some((b) => b.type === 'tool_result')
}

// Resumen de la salida del último turno: el recap de wrap_up si lo hay; si no, el último texto.
function summarize(entries) {
  let start = 0
  for (let i = entries.length - 1; i >= 0; i--) {
    if (isUserPrompt(entries[i])) {
      start = i + 1
      break
    }
  }
  let recap = ''
  let lastText = ''
  for (const entry of entries.slice(start)) {
    if (entry.type !== 'assistant' || !Array.isArray(entry.message?.content)) continue
    for (const block of entry.message.content) {
      if (block.type === 'tool_use' && block.name?.endsWith('wrap_up') && block.input?.recap) recap = block.input.recap
      if (block.type === 'text' && block.text.trim()) lastText = block.text
    }
  }
  const text = toThirdPerson((recap || lastText).replace(/\s+/g, ' ').trim())
  if (!text) return '_(sin respuesta de texto)_'
  return text.length > 600 ? `${text.slice(0, 597)}…` : text
}

// El resumen se lee como lo contaría quien lanzó el prompt: «Creé…» → «Creó…».
// Heurística: verbos en pretérito al empezar frase o tras «,», «y», «e» (opcionalmente tras «no»).
const IRREGULAR = { hice: 'hizo', puse: 'puso', pude: 'pudo', tuve: 'tuvo', dije: 'dijo', fui: 'fue', vi: 'vio', leí: 'leyó', releí: 'releyó', traje: 'trajo', quise: 'quiso', supe: 'supo' }
const NOT_VERBS = new Set(['así', 'aquí', 'allí', 'ahí', 'sí', 'qué', 'café', 'jamás', 'también', 'según', 'aún', 'más', 'ti', 'mí', 'casi'])

function thirdPerson(word) {
  const lower = word.toLowerCase()
  if (NOT_VERBS.has(lower)) return null
  let out = IRREGULAR[lower]
  if (!out && lower.length > 3 && lower.endsWith('qué')) out = lower.slice(0, -3) + 'có'
  else if (!out && lower.length > 3 && lower.endsWith('gué')) out = lower.slice(0, -3) + 'gó'
  else if (!out && lower.length > 3 && lower.endsWith('cé')) out = lower.slice(0, -2) + 'zó'
  else if (!out && lower.length > 3 && lower.endsWith('é')) out = lower.slice(0, -1) + 'ó'
  else if (!out && lower.length > 3 && lower.endsWith('í')) out = lower.slice(0, -1) + 'ió'
  if (!out) return null
  return word[0] === word[0].toUpperCase() ? out[0].toUpperCase() + out.slice(1) : out
}

function toThirdPerson(text) {
  return text.replace(/(^|[.!?:;,]\s+|\s+[ye]\s+)((?:(?:[ye]|[Nn]o)\s+)*)([A-Za-zÁÉÍÓÚÑáéíóúñ]+)(?![A-Za-zÁÉÍÓÚÑáéíóúñ])/g, (all, pre, no = '', word) => {
    const verb = thirdPerson(word)
    return verb ? pre + no + verb : all
  })
}

// Amplía el rango de la sesión actual hasta el prompt n, o abre una sesión nueva si cambió.
function updateSessions(text, n) {
  const cut = text.search(/^## Prompt \d+/m)
  const head = cut === -1 ? text : text.slice(0, cut)
  const rest = cut === -1 ? '' : text.slice(cut)
  const current = head.match(/^sesion_actual:\s*(.+)$/m)?.[1].trim().replace(/^["']|["']$/g, '')
  if (!current) return text
  const entry = (name, from) => `  - nombre: ${name}\n    prompts: ${from}-${n}`
  const sessions = [...head.matchAll(/^ {2}- nombre: (.+)\r?\n {4}prompts: (\d+)-(\d+)[ \t]*$/gm)]
  const last = sessions.at(-1)
  let updated
  if (last && last[1].trim() === current) {
    updated = head.slice(0, last.index) + entry(current, last[2]) + head.slice(last.index + last[0].length)
  } else if (last) {
    const end = last.index + last[0].length
    updated = head.slice(0, end) + '\n' + entry(current, n) + head.slice(end)
  } else {
    const list = head.match(/^\*\*Sesiones\*\*:.*$/m)
    if (!list) return text
    const end = list.index + list[0].length
    updated = head.slice(0, end) + '\n' + entry(current, n) + head.slice(end)
  }
  return updated + rest
}

try {
  const input = JSON.parse(readFileSync(0, 'utf8'))
  // Siempre en la raíz del proyecto, aunque el directorio de trabajo haya cambiado.
  const file = join(process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd(), FILE)

  if (input.hook_event_name === 'Stop') {
    if (!existsSync(file)) process.exit(0)
    const current = readFileSync(file, 'utf8')
    const at = current.lastIndexOf(PENDING)
    if (at === -1) process.exit(0)
    const summary = summarize(readTranscript(input.transcript_path))
    writeFileSync(file, current.slice(0, at) + `**Qué salió:** ${summary}` + current.slice(at + PENDING.length))
    process.exit(0)
  }

  // UserPromptSubmit
  const prompt = (input.prompt ?? '').trim()
  if (!prompt) process.exit(0)

  const current = existsSync(file) ? readFileSync(file, 'utf8') : HEADER
  const n = (current.match(/^## Prompt \d+/gm) ?? []).length + 1

  const model = lastModel(readTranscript(input.transcript_path))
  const ticks = '`'.repeat(Math.max(3, ...[...prompt.matchAll(/`+/g)].map((m) => m[0].length + 1)))

  // Separador `---` entre prompts (el primero ya lo trae la cabecera).
  const base = updateSessions(current, n).replace(/\s*$/, '\n')
  const separator = n > 1 && !/^---\s*$/m.test(base.split('\n').filter(Boolean).at(-1) ?? '') ? '\n---\n' : ''

  writeFileSync(
    file,
    base +
      separator +
      `\n## Prompt ${n}\n\n` +
      `**Modelo:** ${MODEL_NAMES[model] ?? model}\n` +
      `**Herramienta:** Claude Code\n\n` +
      `${ticks}\n${prompt}\n${ticks}\n\n` +
      `${PENDING}\n`
  )
} catch {
  // Nunca bloquear el prompt ni el cierre del turno por un fallo del registro.
}
process.exit(0)
