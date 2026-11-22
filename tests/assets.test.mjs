import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, statSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { assets } from '../universe/src/data/portfolioData.js'

const paths = [assets.profile, assets.resume, ...Object.values(assets.sports)]
test('every asset path used by the Universe exists (exact name/case) in public/', () => {
  for (const p of paths) { const f = 'public' + decodeURIComponent(p); assert.ok(existsSync(f) && statSync(f).size > 1000, `missing or empty: ${f}`) }
})
test('asset paths have no spaces, and resume is a PDF', () => {
  paths.forEach((p) => assert.ok(!/\s/.test(p), `space in ${p}`)); assert.match(assets.resume, /\.pdf$/i)
})
test('assets are not git-ignored (otherwise Vercel never receives them)', () => {
  let git = true; try { execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' }) } catch { git = false }
  if (!git) return
  for (const p of paths) { let ignored = true; try { execSync(`git check-ignore -q "public${p}"`, { stdio: 'ignore' }) } catch { ignored = false } assert.ok(!ignored, `public${p} is git-ignored`) }
})
