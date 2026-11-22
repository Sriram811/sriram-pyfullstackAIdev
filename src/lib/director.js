// Scroll director: one reversible timeline driven by a damped progress value.
// Pure logic (GSAP is injected) so the state machine can be unit-tested without a browser.
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t) }
export const WHEEL_RANGE = 1600 // wheel pixels for the whole enter animation
export const TOUCH_RANGE = 650  // touch-drag pixels for the whole enter animation

// Scene units are metres.
export const SCREEN = { w: 0.8, h: 0.45 }
export const DESK_TOP = 0.76, STAND_H = 0.2, BASE_T = 0.012
export const monitorY = (h) => DESK_TOP + BASE_T + STAND_H + h / 2
export const CENTER = [0, monitorY(SCREEN.h), -0.12] // centre of the centre monitor's screen

// Camera keyframes for the current aspect ratio (so the screen exactly fits any viewport).
export function framing(aspect, fov) {
  const tf = Math.tan((fov * Math.PI) / 360)
  const fit = Math.max(SCREEN.h / 2 / tf, SCREEN.w / 2 / (tf * aspect))
  const home = Math.max(2.1, Math.min(1.45 / (tf * aspect), 6.5))
  const [cx, cy, cz] = CENTER
  const K = (px, py, pz, tx, ty, tz) => ({ px, py, pz, tx, ty, tz, fov })
  return {
    home: K(cx + 0.25, cy + 0.2, cz + home, cx, cy - 0.14, cz),
    near: K(cx, cy, cz + fit * 1.1, cx, cy, cz),
    end: K(cx, cy, cz + fit * 0.6, cx, cy, cz),
    fit
  }
}

export function createDirector({ gsap, reduced = false } = {}) {
  const cam = { px: 0, py: 0, pz: 0, tx: 0, ty: 0, tz: 0, fov: 38 }
  const d = { target: 0, p: 0, inside: false, reduced, cam, tl: null, onInside: null }
  const setInside = (v) => { if (d.inside !== v) { d.inside = v; d.onInside?.(v) } }
  const stop = () => gsap.killTweensOf(d)

  // Outside the monitor: scroll/swipe/keys move the target. Inside: ignored (the Universe owns scrolling).
  d.nudge = (delta) => { if (d.inside) return; stop(); d.target = clamp(d.target + delta) }
  // Move back out. Positive px = retreat; negative px = advance again (reverses smoothly mid-way).
  d.retreat = (px, range) => {
    if (d.inside) { if (px <= 0) return; stop(); setInside(false); d.target = Math.min(clamp(1 - px / range), 0.99); return }
    d.nudge(-px / range)
  }
  d.glide = (to, dur = 2.4) => {
    if (d.inside && to < 1) setInside(false)
    stop()
    if (reduced) { d.target = to; return }
    gsap.to(d, { target: to, duration: Math.abs(to - d.target) * dur + 0.01, ease: 'power2.inOut', overwrite: true })
  }
  d.settle = () => { if (!d.inside && d.target > 0.02 && d.target < 0.98) d.glide(d.target > 0.5 ? 1 : 0, 1.4) }

  d.build = (k) => {
    const prev = d.p
    d.tl?.kill()
    Object.assign(cam, k.home)
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
    tl.to(cam, { ...k.near, duration: 0.8, ease: 'power2.inOut' }, 0) // approach
    tl.to(cam, { ...k.end, duration: 0.2, ease: 'power2.in' }, 0.8)  // push through the screen
    d.tl = tl
    tl.progress(prev)
  }
  d.step = (dt) => {
    const k = d.reduced ? 1 : 1 - Math.exp(-dt * 5.5) // damping: partial scroll = partial movement
    d.p += (d.target - d.p) * k
    if (Math.abs(d.target - d.p) < 1e-4) d.p = d.target
    d.tl?.progress(d.p)
    if (!d.inside && d.target >= 1 && d.p >= 0.995) { d.p = 1; d.tl?.progress(1); setInside(true) }
  }
  return d
}
