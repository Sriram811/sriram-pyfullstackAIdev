import test from 'node:test'
import assert from 'node:assert/strict'
import { applyQuad, quadToMatrix3d } from '../src/lib/homography.js'
import { CENTER, SCREEN, clamp, createDirector, framing, smooth } from '../src/lib/director.js'

// Minimal GSAP stand-in: only the surface the director uses. It tests the state machine, not GSAP itself.
const mockGsap = () => ({
  killTweensOf() {},
  to(o, v) { Object.assign(o, v.target !== undefined ? { target: v.target } : {}) },
  timeline() { const t = { _p: 0, to() { return t }, kill() {}, progress(v) { if (v === undefined) return t._p; t._p = v; return t } }; return t }
})
const run = (d, secs, dt = 1 / 60) => { for (let i = 0; i < secs / dt; i++) d.step(dt) }
const close = (a, b, e = 1e-6) => assert.ok(Math.abs(a - b) < e, `${a} !~ ${b}`)

test('homography: viewport rect maps to identity', () => {
  const q = [[0, 0], [1920, 0], [1920, 1080], [0, 1080]]
  assert.match(quadToMatrix3d(q, 1920, 1080), /^matrix3d\(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1\)$/)
})
test('homography: arbitrary perspective quad hits all four corners', () => {
  const q = [[310, 140], [1310, 190], [1260, 760], [350, 700]], W = 1280, H = 720
  const dst = [applyQuad(q, W, H, 0, 0), applyQuad(q, W, H, W, 0), applyQuad(q, W, H, W, H), applyQuad(q, W, H, 0, H)]
  dst.forEach((p, i) => { close(p[0], q[i][0], 1e-6); close(p[1], q[i][1], 1e-6) })
})
test('math helpers', () => { assert.equal(clamp(2), 1); assert.equal(smooth(0, 1, 0), 0); assert.equal(smooth(0, 1, 1), 1); close(smooth(0, 1, 0.5), 0.5) })
test('framing: camera ends nearer the screen than it starts, for several aspects', () => {
  for (const a of [0.5, 1, 1.6, 2.4]) { const f = framing(a, 38); assert.ok(f.home.pz > f.near.pz && f.near.pz > f.end.pz && f.end.pz > CENTER[2]); assert.ok(f.fit > 0) }
})
test('scroll down enters, inside ignores outer scroll, scroll-up at top exits, can repeat', () => {
  const d = createDirector({ gsap: mockGsap() }); d.build(framing(1.6, 38)); const log = []; d.onInside = (v) => log.push(v)
  d.nudge(0.4); run(d, 3); close(d.p, 0.4, 1e-3); assert.equal(d.inside, false) // partial scroll = partial progress
  d.nudge(0.7); run(d, 3); assert.equal(d.inside, true); assert.equal(d.p, 1)
  d.nudge(-0.5); assert.equal(d.target, 1) // outer wheel ignored once inside
  d.retreat(-50, 1600); assert.equal(d.inside, true) // downward gesture does not exit
  d.retreat(120, 1600); assert.equal(d.inside, false); assert.ok(d.target < 1)
  run(d, 0.2); assert.ok(d.p < 1)
  d.nudge(1); run(d, 3); assert.equal(d.inside, true); assert.deepEqual(log, [true, false, true])
})
test('changing direction midway reverses without jumps', () => {
  const d = createDirector({ gsap: mockGsap() }); d.build(framing(1.6, 38)); d.nudge(0.6)
  let prev = 0, maxStep = 0; for (let i = 0; i < 30; i++) { d.step(1 / 60); maxStep = Math.max(maxStep, Math.abs(d.p - prev)); prev = d.p }
  d.nudge(-0.4); const peak = d.p; for (let i = 0; i < 30; i++) { d.step(1 / 60); maxStep = Math.max(maxStep, Math.abs(d.p - prev)); prev = d.p }
  assert.ok(d.p < peak); assert.ok(maxStep < 0.06)
})
test('reduced motion: progress follows target immediately', () => {
  const d = createDirector({ gsap: mockGsap(), reduced: true }); d.build(framing(1.6, 38)); d.nudge(0.3); d.step(1 / 60); close(d.p, 0.3)
})
test('screen constants are sane', () => assert.ok(SCREEN.w / SCREEN.h > 1.7))
