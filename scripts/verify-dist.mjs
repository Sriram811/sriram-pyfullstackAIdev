// Fails the build if the deployable output is missing the Universe, its bundles, or any asset the Universe data references.
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dist = process.argv[2] || 'dist', errors = []
const need = (rel, why) => { const f = join(dist, decodeURIComponent(rel).replace(/^\//, '')); if (!existsSync(f) || !statSync(f).isFile() || statSync(f).size === 0) errors.push(`missing or empty: ${rel} (${why})`) }
need('index.html', 'workstation entry'); need('universe/index.html', 'Universe entry')
if (existsSync(join(dist, 'universe/index.html'))) {
  const html = readFileSync(join(dist, 'universe/index.html'), 'utf8')
  for (const m of html.matchAll(/(?:src|href)="(\/universe\/[^"]+)"/g)) need(m[1], 'referenced by universe/index.html')
  if (/localhost|127\.0\.0\.1/.test(html)) errors.push('universe/index.html references localhost')
}
const { assets } = await import(pathToFileURL(join(process.cwd(), 'universe/src/data/portfolioData.js')).href)
for (const p of [assets.profile, assets.resume, ...Object.values(assets.sports)]) need(p, 'asset referenced by portfolioData.js')
if (errors.length) { console.error('verify-dist FAILED:\n - ' + errors.join('\n - ')); process.exit(1) }
console.log(`verify-dist OK: workstation, Universe and ${2 + Object.keys(assets.sports).length + 0} referenced assets present in ${dist}/`)
