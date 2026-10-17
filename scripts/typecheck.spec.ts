// Tests for typecheck.sh, driven through its command line. Each run installs
// TypeScript from the npm registry, so this file needs the network.
//   node --test scripts/typecheck.spec.ts
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { test } from 'node:test'

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'typecheck.sh')

function typecheck(...args: string[]) {
  const result = spawnSync('bash', [SCRIPT, ...args], { encoding: 'utf8' })
  return { code: result.status, output: result.stdout + result.stderr }
}

test('the helper scripts type-check clean and the script exits 0', () => {
  const { code, output } = typecheck()
  assert.equal(code, 0, output)
})

test('a run writes nothing inside the repo, ignored files included', () => {
  const repo = join(dirname(SCRIPT), '..')
  const status = () =>
    spawnSync('git', ['status', '--porcelain', '--ignored', '--untracked-files=all'], { cwd: repo, encoding: 'utf8' })
      .stdout
  const before = status()

  const { code, output } = typecheck()
  assert.equal(code, 0, output)
  assert.equal(status(), before)
})

test('a type error exits non-zero and prints the tsc error', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'typecheck-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  writeFileSync(
    join(dir, 'tsconfig.json'),
    JSON.stringify({ compilerOptions: { strict: true, types: ['node'] }, include: ['*.ts'] }),
  )
  writeFileSync(join(dir, 'bad.ts'), "export const count: number = 'one'\n")

  const { code, output } = typecheck(dir)
  assert.notEqual(code, 0, output)
  assert.match(output, /bad\.ts\(1,14\): error TS2322/)
})
