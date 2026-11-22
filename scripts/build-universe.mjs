// Builds the untouched Universe app (./universe) into ./public/universe so it is served at /universe/.
import { execSync } from 'node:child_process'
import { cpSync, existsSync } from 'node:fs'
const run = (cmd, cwd) => execSync(cmd, { stdio: 'inherit', cwd })
if (process.argv.includes('--if-missing') && existsSync('public/universe/index.html')) process.exit(0)
if (!existsSync('universe/node_modules')) run('npm install --no-audit --no-fund', 'universe')
run('npx vite build --base=/universe/ --outDir ../public/universe --emptyOutDir', 'universe')
// The Universe's data file references /assets/... with absolute URLs, so also serve them from the site root.
if (existsSync('universe/public/assets')) cpSync('universe/public/assets', 'public/assets', { recursive: true })
