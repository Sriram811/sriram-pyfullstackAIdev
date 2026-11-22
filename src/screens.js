// Canvas painters for the left (career) and right (projects) monitors. Type is deliberately large:
// at the home camera distance each side screen is only ~450 px wide on a 1080p display.
import * as THREE from 'three'
import { career, categoryCounts, githubProfile, projects } from './data/screenData.js'

const W = 1280, H = 720
const C = { bg: '#0a0d16', panel: '#121829', line: '#243049', text: '#eef1fa', dim: '#9aa3bd', cyan: '#22d3ee', blue: '#60a5fa', purple: '#a78bfa', mute: '#4b556f' }
const SANS = 'Sora, system-ui, sans-serif', MONO = '"JetBrains Mono", ui-monospace, monospace'
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h) }
const font = (g, wt, px, fam = SANS) => { g.font = `${wt} ${px}px ${fam}` }
const text = (g, s, x, y, color, align = 'left') => { g.fillStyle = color; g.textAlign = align; g.fillText(s, x, y) }
const chip = (g, s, x, y, color) => { // returns width
  font(g, 500, 22, MONO); const w = g.measureText(s).width + 22
  rr(g, x, y - 26, w, 36, 18); g.fillStyle = color + '22'; g.fill(); g.strokeStyle = color + '88'; g.lineWidth = 1.5; g.stroke()
  text(g, s, x + 11, y, color); return w
}
const wrap = (g, s, maxW) => { const out = []; let line = ''; for (const w of s.split(' ')) { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > maxW && line) { out.push(line); line = w } else line = t } out.push(line); return out }
const header = (g, title, right) => {
  g.fillStyle = C.panel; g.fillRect(0, 0, W, 64); g.fillStyle = C.line; g.fillRect(0, 63, W, 2)
  ;['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(30 + i * 28, 32, 8, 0, 7); g.fill() })
  font(g, 500, 26, MONO); text(g, title, 124, 41, C.dim); font(g, 500, 24, MONO); text(g, right, W - 28, 41, C.dim, 'right')
}

function paintCareer(g, t) {
  g.fillStyle = C.bg; g.fillRect(0, 0, W, H)
  header(g, 'career.dashboard', '● internship   ● training')
  // colour the legend dots
  font(g, 500, 24, MONO); const lw = g.measureText('● training').width, iw = g.measureText('● internship   ').width
  text(g, '●', W - 28 - lw, 41, C.purple); text(g, '●', W - 28 - lw - iw, 41, C.cyan)
  const top = 78, rowH = 112, active = Math.floor(t / 2.6) % career.length
  g.fillStyle = C.line; g.fillRect(52, top + 20, 3, rowH * career.length - 40)
  const travel = ((t * 70) % (rowH * career.length - 40)); g.fillStyle = C.cyan; g.globalAlpha = 0.9; g.beginPath(); g.arc(53.5, top + 20 + travel, 5, 0, 7); g.fill(); g.globalAlpha = 1
  career.forEach((e, i) => {
    const y = top + i * rowH, col = e.kind === 'internship' ? C.cyan : C.purple, on = i === active
    rr(g, 86, y + 4, W - 110, rowH - 10, 14); g.fillStyle = on ? '#16203a' : C.panel; g.fill(); g.strokeStyle = on ? col : C.line; g.lineWidth = on ? 2.5 : 1.5; g.stroke()
    const cy = y + rowH / 2 - 1
    if (on) { g.strokeStyle = col; g.globalAlpha = 0.5 * (1 - ((t * 0.8) % 1)); g.lineWidth = 3; g.beginPath(); g.arc(53.5, cy, 12 + ((t * 0.8) % 1) * 14, 0, 7); g.stroke(); g.globalAlpha = 1 }
    g.fillStyle = col; g.beginPath(); g.arc(53.5, cy, e.kind === 'internship' ? 11 : 8, 0, 7); g.fill()
    font(g, 700, 31); text(g, e.org, 110, y + 42, C.text)
    const tag = e.kind === 'internship' ? 'INTERNSHIP' : 'TRAINING'; font(g, 700, 21, MONO); const tw = g.measureText(tag).width + 28
    rr(g, W - 46 - tw, y + 16, tw, 36, 18); g.fillStyle = col + '26'; g.fill(); g.strokeStyle = col; g.lineWidth = 1.5; g.stroke(); text(g, tag, W - 46 - tw / 2, y + 41, col, 'center')
    font(g, 500, 24); text(g, e.role, 110, y + 74, C.dim)
    font(g, 500, 21, MONO); text(g, `${e.period} · ${e.place}`, 110, y + 100, col)
    let x = W - 46
    ;(e.tech.length ? e.tech : e.focus ? [e.focus] : []).slice().reverse().forEach((s) => { font(g, 500, 22, MONO); const w = g.measureText(s).width + 22; if (x - w > 700) { chip(g, s, x - w, y + 101, C.blue); x -= w + 8 } })
  })
  const n = career.filter((e) => e.kind === 'internship').length
  font(g, 500, 21, MONO); text(g, `${career.length} entries · ${n} internship · ${career.length - n} training`, 28, 710, C.mute)
}

function paintProjects(g, t) {
  g.fillStyle = C.bg; g.fillRect(0, 0, W, H)
  header(g, 'projects.workspace', `${projects.length} projects`)
  g.fillStyle = C.panel; g.fillRect(0, 65, 420, H - 65); g.fillStyle = C.line; g.fillRect(419, 65, 2, H - 65)
  const sel = Math.floor(t / 3.6) % projects.length
  font(g, 600, 24, MONO); text(g, '▾ projects/', 24, 108, C.dim)
  projects.forEach((p, i) => {
    const y = 128 + i * 66, on = i === sel
    if (on) { rr(g, 12, y, 396, 56, 10); g.fillStyle = '#1b2646'; g.fill(); g.fillStyle = C.cyan; g.fillRect(12, y + 8, 4, 40) }
    g.fillStyle = on ? C.cyan : C.mute; rr(g, 34, y + 14, 30, 26, 5); g.fill()
    font(g, 600, 28); text(g, p.name, 80, y + 38, on ? C.text : C.dim)
  })
  const p = projects[sel], X = 452
  rr(g, X, 90, 150, 110, 16); const gr = g.createLinearGradient(X, 90, X + 150, 200); gr.addColorStop(0, '#1e3a8a'); gr.addColorStop(1, '#6d28d9'); g.fillStyle = gr; g.fill()
  font(g, 700, 52); text(g, p.name.split(' ').map((w) => w[0]).join('').slice(0, 2), X + 75, 163, '#ffffffcc', 'center')
  font(g, 700, 42); text(g, p.name, X + 176, 134, C.text)
  chip(g, p.cat, X + 176, 182, C.purple)
  font(g, 500, 28); wrap(g, p.desc, 780).forEach((l, i) => text(g, l, X, 250 + i * 36, C.dim))
  let x = X, y = 330
  if (p.tech.length) p.tech.forEach((s) => { font(g, 500, 22, MONO); const w = g.measureText(s).width + 22; if (x + w > W - 24) { x = X; y += 46 } chip(g, s, x, y, C.blue); x += w + 10 })
  else { font(g, 500, 24, MONO); text(g, 'technologies: not listed yet', X, y, C.mute) }
  y = Math.max(y + 56, 420)
  ;[['repository', p.repo], ['live demo', p.demo]].forEach(([k, v], i) => {
    g.fillStyle = v ? C.cyan : 'transparent'; g.strokeStyle = v ? C.cyan : C.mute; g.lineWidth = 2; g.beginPath(); g.arc(X + 10, y + i * 40 - 8, 7, 0, 7); v && g.fill(); g.stroke()
    font(g, 500, 24, MONO); text(g, k, X + 30, y + i * 40, C.dim); text(g, v || 'not linked', X + 250, y + i * 40, v ? C.cyan : C.mute)
  })
  // projects by category (real counts); bars ease in on a loop
  const cats = categoryCounts(), max = Math.max(...cats.map(([, n]) => n)), k = 1 - Math.pow(1 - Math.min(((t % 7.2) / 1.4), 1), 3)
  font(g, 600, 22, MONO); text(g, 'projects by category', 736, 440, C.dim)
  cats.forEach(([name, n], i) => {
    const by = 462 + i * 38; font(g, 500, 22, MONO); text(g, name, 736, by + 22, C.text)
    rr(g, 900, by + 4, 300, 22, 11); g.fillStyle = C.line; g.fill()
    rr(g, 900, by + 4, Math.max(22, (300 * n / max) * k), 22, 11); g.fillStyle = i % 2 ? C.purple : C.cyan; g.fill(); text(g, String(n), 1236, by + 22, C.dim, 'right')
  })
  font(g, 500, 21, MONO); text(g, githubProfile, 452, 706, C.mute)
}

export function createScreen(kind, scale = 1) {
  const c = document.createElement('canvas'); c.width = W * scale; c.height = H * scale
  const g = c.getContext('2d'), paint = kind === 'career' ? paintCareer : paintProjects
  const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8
  const draw = (t) => { g.setTransform(scale, 0, 0, scale, 0, 0); g.textBaseline = 'alphabetic'; paint(g, t); texture.needsUpdate = true }
  draw(0)
  return { texture, draw, dispose: () => texture.dispose() }
}
