import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import gsap from 'gsap'
import { TOUCH_RANGE, WHEEL_RANGE, createDirector } from './lib/director'
import UniverseFrame from './UniverseFrame'
import { assets } from '../universe/src/data/portfolioData.js'

const Workstation = lazy(() => import('./Workstation'))
const SRC = `${import.meta.env.BASE_URL}universe/index.html`
const hasWebGL = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false } })()
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const coarse = window.matchMedia('(pointer: coarse)').matches
const weak = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4
const tier = coarse || weak || window.innerWidth < 768 ? 'low' : 'high'

class Boundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

export default function App() {
  const director = useRef(null)
  if (!director.current) director.current = createDirector({ gsap, reduced: reducedMotion })
  const d = director.current
  const frameRef = useRef(null), wrapRef = useRef(null), pending = useRef(null)
  const [inside, setInside] = useState(false)
  const [ready, setReady] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(!hasWebGL)

  useEffect(() => { d.onInside = setInside; return () => { d.onInside = null } }, [d])

  // Outer controls: wheel, touch drag and keys drive the same timeline. Disabled while inside.
  useEffect(() => {
    if (failed) return
    const wheel = (e) => {
      if (d.inside) return
      e.preventDefault()
      d.lastOuterWheel = performance.now()
      const px = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY
      d.nudge(Math.max(-120, Math.min(120, px)) / WHEEL_RANGE)
    }
    let y = 0
    const ts = (e) => { y = e.touches[0].clientY }
    const tm = (e) => { if (d.inside) return; e.preventDefault(); const ny = e.touches[0].clientY; d.nudge((y - ny) / TOUCH_RANGE); y = ny }
    const te = () => d.settle()
    const key = (e) => {
      if (d.inside) return
      const k = { ArrowDown: 0.12, PageDown: 0.25, ' ': 0.25, ArrowUp: -0.12, PageUp: -0.25 }[e.key]
      if (k !== undefined) { e.preventDefault(); d.nudge(k) } else if (e.key === 'End') d.glide(1); else if (e.key === 'Home') d.glide(0)
    }
    const o = { passive: false }
    addEventListener('wheel', wheel, o); addEventListener('touchstart', ts, { passive: true }); addEventListener('touchmove', tm, o)
    addEventListener('touchend', te); addEventListener('keydown', key)
    return () => { removeEventListener('wheel', wheel, o); removeEventListener('touchstart', ts); removeEventListener('touchmove', tm, o); removeEventListener('touchend', te); removeEventListener('keydown', key) }
  }, [d, failed])

  // Hand keyboard focus to whichever side is active; run a pending "Contact" jump once inside.
  useEffect(() => {
    const win = frameRef.current?.contentWindow
    if (!win) return
    if (inside) {
      win.focus()
      if (pending.current) { win.document.getElementById(pending.current)?.scrollIntoView({ behavior: 'auto' }); pending.current = null }
    } else window.focus()
  }, [inside])

  const enter = useCallback(() => d.glide(1), [d])
  const contact = useCallback(() => { pending.current = 'contact'; d.glide(1) }, [d])
  const fallback = (
    <>
      <UniverseFrame ref={frameRef} director={d} src={SRC} inside fullscreen loaded onLoaded={() => {}} />
      <p className="fixed bottom-3 left-3 z-30 rounded bg-black/60 px-3 py-1 text-xs text-white/70">WebGL is unavailable, so the 3D workstation is skipped.</p>
    </>
  )
  if (failed) return fallback

  return (
    <Boundary fallback={fallback}>
      <div className="fixed inset-0" style={{ visibility: inside ? 'hidden' : 'visible' }}>
        <Suspense fallback={null}>
          <Workstation director={d} wrapRef={wrapRef} inside={inside} tier={tier} reduced={reducedMotion}
            onReady={() => setReady(true)} onCenterClick={enter} />
        </Suspense>
      </div>
      <div className="pointer-events-none fixed inset-0 z-10 fade-with-p" style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,0,0,.65) 100%)' }} />
      {/* The Universe is only requested once the workstation is on screen. */}
      <UniverseFrame ref={frameRef} wrapRef={wrapRef} director={d} src={ready ? SRC : undefined} inside={inside} loaded={loaded && ready} onLoaded={() => setLoaded(true)} />

      <motion.div className="pointer-events-none fixed inset-0 z-30 fade-with-p" initial={{ opacity: 0 }} animate={{ opacity: ready ? 1 : 0 }} transition={{ duration: 1.2, delay: 0.3 }}
        style={{ visibility: inside ? 'hidden' : 'visible' }}>
        <div className="pointer-events-auto absolute left-5 top-4 flex items-center gap-3 sm:left-8 sm:top-6">
          <span className="grid h-9 w-9 place-items-center rounded-md border border-white/15 bg-white/5 font-code text-sm text-cyan-300">ST</span>
          <span className="text-sm font-semibold tracking-wide text-white">Sriram T</span>
        </div>
        <nav className="pointer-events-auto absolute right-5 top-4 flex gap-2 text-xs sm:right-8 sm:top-6">
          <a href={assets.resume} download="Sriram_T_Resume.pdf" className="rounded-full border border-white/15 px-4 py-2 text-white/80 backdrop-blur transition hover:border-cyan-300/60 hover:text-white">Resume</a>
          <button onClick={contact} className="rounded-full border border-white/15 px-4 py-2 text-white/80 backdrop-blur transition hover:border-cyan-300/60 hover:text-white">Contact</button>
        </nav>
        <div className="scrim absolute inset-x-0 bottom-0 h-72" />
        <div className="absolute bottom-24 left-5 max-w-xs sm:bottom-12 sm:left-8 sm:max-w-sm [text-shadow:0_1px_12px_rgba(0,0,0,.8)]">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Sriram T.</h1>
          <p className="mt-1 font-code text-xs text-cyan-300 sm:text-sm">Software Developer | Python Full Stack Developer</p>
          <p className="mt-3 text-sm leading-relaxed text-white/75">I build full-stack products with Python and React, and I like where AI is heading. Step into the screen to see my work.</p>
        </div>
        <button onClick={enter} className="pointer-events-auto absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-white/70 hover:text-white sm:bottom-8" aria-label="Explore Universe">
          Explore Universe
          <span className="relative block h-9 w-5 rounded-full border border-white/30"><span className="cue-dot absolute left-1/2 top-1.5 h-2 w-[3px] -translate-x-1/2 rounded bg-cyan-300" /></span>
        </button>
      </motion.div>

      <AnimatePresence>
        {!ready && (
          <motion.div key="loader" className="fixed inset-0 z-50 grid place-items-center bg-[#07070b]" exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
            <p className="font-code text-xs uppercase tracking-[0.3em] text-white/50">Booting workstation…</p>
          </motion.div>
        )}
      </AnimatePresence>
    </Boundary>
  )
}
