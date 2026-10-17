// Registro de prompts en prompt_track.md.
// - UserPromptSubmit: añade «## Prompt N» con el prompt tal cual y la salida pendiente.
// - Stop: al terminar el turno, rellena la salida pendiente con un resumen de la respuesta.
import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const FILE = 'prompt_track.md'
const PENDING = '**Qué salió:** _(pendiente)_'
const HEADER =
  '# Prompts\n\nRegistro automático (hooks `UserPromptSubmit` y `Stop`): cada prompt lanzado, ' +
  'con su modelo, su herramienta y un resumen de la salida.\n'

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
  const text = (recap || lastText).replace(/\s+/g, ' ').trim()
  if (!text) return '_(sin respuesta de texto)_'
  return text.length > 600 ? `${text.slice(0, 597)}…` : text
}

try {
  const input = JSON.parse(readFileSync(0, 'utf8'))
  const file = join(input.cwd || process.cwd(), FILE)

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
  if (!existsSync(file)) writeFileSync(file, HEADER)
  const n = (current.match(/^## Prompt \d+/gm) ?? []).length + 1

  const model = lastModel(readTranscript(input.transcript_path))
  const ticks = '`'.repeat(Math.max(3, ...[...prompt.matchAll(/`+/g)].map((m) => m[0].length + 1)))

  appendFileSync(
    file,
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
