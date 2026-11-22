import * as THREE from 'three'
// One registry for every RGB material, spinning fan and RGB light, driven by a single update() call per frame.
export function makeRgb() {
  const mats = [], fans = [], lights = []
  const hue = (t, i) => 0.64 + 0.14 * Math.sin(t * 0.6 + i * 0.7) // cyan <-> blue <-> purple only
  return {
    reg(m) { if (m && !mats.includes(m)) mats.push(m) },
    fan(g) { if (g && !fans.includes(g)) fans.push(g) },
    light(l) { if (l && !lights.includes(l)) lights.push(l) },
    update(t, dt, reduced) {
      mats.forEach((m, i) => (m.isMeshBasicMaterial ? m.color : m.emissive).setHSL(hue(t, i), 0.85, 0.55))
      lights.forEach((l, i) => l.color.setHSL(hue(t, i + 3), 0.9, 0.55))
      if (!reduced) fans.forEach((g, i) => { g.rotation.z -= dt * (7 + (i % 3)) }) // rad/s, frame-rate independent
    }
  }
}
const T = (c, rep) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep) } return t }
const cv = (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h })
export function makeTextures() {
  let s = 99; const r = () => (s = (s * 16807) % 2147483647) / 2147483647
  const a = cv(256, 256), ga = a.getContext('2d'), gr = ga.createLinearGradient(0, 0, 256, 256)
  ;[[0, 0], [0.35, 0.55], [0.5, 0], [0.62, 0.25], [0.75, 0]].forEach(([p, o]) => gr.addColorStop(p, `rgba(255,255,255,${o})`)); ga.fillStyle = gr; ga.fillRect(0, 0, 256, 256)
  const b = cv(128, 128), gb = b.getContext('2d'), rg = gb.createRadialGradient(64, 64, 4, 64, 64, 64); rg.addColorStop(0, 'rgba(0,0,0,.85)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); gb.fillStyle = rg; gb.fillRect(0, 0, 128, 128)
  const w = cv(512, 512), gw = w.getContext('2d'); gw.fillStyle = '#2a241f'; gw.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 420; i++) { gw.fillStyle = r() > 0.5 ? `rgba(255,235,210,${0.015 + r() * 0.04})` : `rgba(0,0,0,${0.04 + r() * 0.08})`; gw.fillRect(r() * 512, r() * 512, 60 + r() * 380, 1 + r() * 2.5) }
  const f = cv(256, 256), gf = f.getContext('2d'); gf.fillStyle = '#20222c'; gf.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 9000; i++) { gf.fillStyle = `rgba(${r() > 0.5 ? '255,255,255' : '0,0,0'},${0.03 + r() * 0.05})`; gf.fillRect(r() * 256, r() * 256, 1.5, 1.5) }
  const gl = cv(128, 128), gg = gl.getContext('2d'), rg2 = gg.createRadialGradient(64, 64, 2, 64, 64, 64); rg2.addColorStop(0, 'rgba(255,255,255,1)'); rg2.addColorStop(1, 'rgba(255,255,255,0)'); gg.fillStyle = rg2; gg.fillRect(0, 0, 128, 128)
  const m = cv(256, 256), gm = m.getContext('2d'); gm.fillStyle = '#16171d'; gm.fillRect(0, 0, 256, 256)
  for (let y = 0; y < 256; y += 16) for (let x = 0; x < 256; x += 16) { gm.fillStyle = '#020204'; gm.beginPath(); gm.arc(x + 8, y + 8, 5.2, 0, 7); gm.fill(); gm.strokeStyle = 'rgba(255,255,255,.09)'; gm.lineWidth = 1; gm.stroke() }
  const pc = cv(256, 256), gp = pc.getContext('2d'); gp.fillStyle = '#0d111a'; gp.fillRect(0, 0, 256, 256); gp.strokeStyle = 'rgba(70,110,170,.28)'; gp.lineWidth = 1
  for (let i = 0; i < 70; i++) { let x = r() * 256, y = r() * 256; gp.beginPath(); gp.moveTo(x, y); for (let k = 0; k < 4; k++) { if (k % 2) y += (r() - 0.5) * 80; else x += (r() - 0.5) * 80; gp.lineTo(x, y) } gp.stroke() }
  for (let i = 0; i < 60; i++) { gp.fillStyle = 'rgba(190,200,230,.25)'; gp.fillRect(r() * 256, r() * 256, 3, 3) }
  return { streak: T(a), blob: T(b), wood: T(w, [2.5, 1]), fabric: T(f, [6, 3]), grill: T(m, [3, 6]), pcb: T(pc), glow: T(gl) }
}
