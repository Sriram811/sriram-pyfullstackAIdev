import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true }) // mobile URL-bar show/hide must not retrigger layout

const RM = '(prefers-reduced-motion: reduce)'
export const usePrefersReducedMotion = () => {
  const [r, setR] = useState(() => window.matchMedia(RM).matches)
  useEffect(() => {
    const m = window.matchMedia(RM); const h = (e) => setR(e.matches)
    m.addEventListener('change', h); return () => m.removeEventListener('change', h)
  }, [])
  return r
}

// 'high' desktop, 'medium' tablet, 'low' mobile: scenes scale particle counts and dpr from this.
export const useDeviceTier = () => {
  // Low-memory / few-core devices drop one tier even on a large screen.
  const weak = (navigator.deviceMemory && navigator.deviceMemory <= 2) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2)
  const get = () => {
    const t = window.innerWidth >= 1024 ? 'high' : window.innerWidth >= 640 ? 'medium' : 'low'
    return weak ? (t === 'high' ? 'medium' : 'low') : t
  }
  const [t, setT] = useState(get)
  useEffect(() => { const h = () => setT(get()); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h) }, [])
  return t
}

// Page-wide scroll state in a plain object (read inside useFrame, no React re-renders).
//   u        = continuous waypoint index 0..7 (7 = last section); progress = u / 7 for the camera curve
//   step     = active journey card
export const scrollState = { progress: 0, u: 0, step: 0, project: -1, skillGroup: -1 } // project / skillGroup = card hovered in the DOM (-1 none)

const IDS = ['home', 'about', 'skills', 'projects', 'journey', 'education', 'sports', 'contact']
let anchors = []

// Scroll position at which each nav section is centred in the viewport. Camera waypoints are pinned to these,
// so scenes stay aligned with their sections whatever the section heights (including the extra sections).
const calcAnchors = () => {
  const max = Math.max(document.documentElement.scrollHeight - innerHeight, 1)
  anchors = IDS.map((id) => {
    const el = document.getElementById(id); if (!el) return null
    const r = el.getBoundingClientRect()
    return Math.min(Math.max(r.top + scrollY + r.height / 2 - innerHeight / 2, 0), max)
  })
  anchors[0] = 0; anchors[IDS.length - 1] = max
  for (let i = 1; i < anchors.length; i++) anchors[i] = Math.max(anchors[i] ?? 0, anchors[i - 1] + 1)
}

const update = () => {
  if (!anchors.length) return
  const y = scrollY
  let j = 0; while (j < anchors.length - 2 && y >= anchors[j + 1]) j++
  const f = Math.min(Math.max((y - anchors[j]) / (anchors[j + 1] - anchors[j]), 0), 1)
  const e = f * f * (3 - 2 * f) // ease: the camera lingers on each section, glides between them
  scrollState.u = j + e
  scrollState.progress = scrollState.u / (IDS.length - 1)
}

export const initScrollState = () => {
  const refresh = () => { calcAnchors(); update() }
  refresh()
  const st = ScrollTrigger.create({ trigger: document.body, start: 'top top', end: 'bottom bottom', onUpdate: update })
  const ro = new ResizeObserver(refresh); ro.observe(document.body)
  ScrollTrigger.addEventListener('refresh', refresh)
  return () => { st.kill(); ro.disconnect(); ScrollTrigger.removeEventListener('refresh', refresh) }
}

// One-shot staggered entrance for a group of cards (shared by every section).
export const revealBatch = (gsap, ST, selector, y = 36) => {
  const els = gsap.utils.toArray(selector); if (!els.length) return
  gsap.set(els, { opacity: 0, y })
  ST.batch(els, { start: 'top 90%', once: true, onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 0.7, stagger: 0.09, ease: 'power3.out', clearProps: 'transform' }) })
}

// Scoped GSAP helper with automatic cleanup. build(gsap, ScrollTrigger) runs inside a gsap.context.
export const useScrollAnimation = (build, deps = []) => {
  const scope = useRef(null)
  const reduced = usePrefersReducedMotion()
  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => build(gsap, ScrollTrigger), scope)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, ...deps])
  return scope
}
