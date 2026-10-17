// PostToolUse hook: formatea con Prettier cada archivo de frontend/src/ que edite el agente.
import { readFileSync, existsSync } from 'node:fs'
import { join, resolve, relative, isAbsolute } from 'node:path'
import { spawnSync } from 'node:child_process'

// En Windows, Git Bash/MSYS puede entregar rutas como /c/Users/...: pásalas a C:/Users/...
// En Linux/macOS las rutas se usan tal cual.
const toNative = (p) =>
  process.platform === 'win32' ? p.replace(/^\/([a-zA-Z])(?=\/|$)/, '$1:') : p

try {
  const input = JSON.parse(readFileSync(0, 'utf8'))
  const filePath = input.tool_input?.file_path
  if (!filePath) process.exit(0)

  const root = resolve(toNative(process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd()))
  const frontend = join(root, 'frontend')
  const target = resolve(root, toNative(filePath))
  // path.relative ya ignora mayúsculas/minúsculas en win32 (C: vs c:).
  const rel = relative(join(frontend, 'src'), target)
  if (!rel || rel.startsWith('..') || isAbsolute(rel)) process.exit(0)

  const bin = join(frontend, 'node_modules', 'prettier', 'bin', 'prettier.cjs')
  if (!existsSync(bin)) {
    console.error('format-frontend: Prettier no instalado en frontend/ (npm install)')
    process.exit(0)
  }

  const result = spawnSync(process.execPath, [bin, '--write', '--ignore-unknown', target], {
    cwd: frontend,
    encoding: 'utf8',
  })
  if (result.status !== 0) console.error(`format-frontend: ${result.stderr || result.stdout}`)
} catch (error) {
  console.error(`format-frontend: ${error.message}`)
}
process.exit(0)
