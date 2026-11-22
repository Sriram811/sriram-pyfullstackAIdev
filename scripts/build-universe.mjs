// Builds the untouched Universe app (./universe) into ./public/universe so it is served at /universe/.
import { execSync } from 'node:child_process'
import { cpSync, existsSync } from 'node:fs'
const run = (cmd, cwd) => execSync(cmd, { stdio: 'inherit', cwd })
if (process.argv.includes('--if-missing') && existsSync('public/universe/index.html')) process.exit(0)
// --include=dev: the Universe needs vite/tailwind (devDependencies) even when the host sets NODE_ENV=production.
if (!existsSync('universe/node_modules/vite/bin/vite.js')) run('npm install --include=dev --no-audit --no-fund', 'universe')
run('node node_modules/vite/bin/vite.js build --base=/universe/ --outDir ../public/universe --emptyOutDir', 'universe')
if (!existsSync('public/universe/index.html')) { console.error('Universe build produced no public/universe/index.html'); process.exit(1) }
// Optional extra assets kept inside the Universe project are served from the site root too (README files excluded).
if (existsSync('universe/public/assets')) cpSync('universe/public/assets', 'public/assets', { recursive: true, filter: (s) => !s.endsWith('README.md') })
