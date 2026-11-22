import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../hooks/useScrollAnimation'

export default function CountUp({ to }) {
  const ref = useRef(null)
  const reduced = usePrefersReducedMotion()
  const [v, setV] = useState(reduced ? to : 0)
  useEffect(() => {
    if (reduced) { setV(to); return }
    let raf
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect(); const t0 = performance.now()
      const tick = (t) => { const p = Math.min((t - t0) / 1400, 1); setV(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick) }
      raf = requestAnimationFrame(tick)
    }, { threshold: 0.6 })
    io.observe(ref.current); return () => { io.disconnect(); cancelAnimationFrame(raf) }
  }, [to, reduced])
  return <span ref={ref}>{v}</span>
}
