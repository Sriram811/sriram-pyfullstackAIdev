import { useEffect, useRef } from 'react'
import { ArrowUp } from 'lucide-react'

export default function ScrollProgress() {
  const bar = useRef(null)
  const top = useRef(null)
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - innerHeight
      const p = max > 0 ? scrollY / max : 0
      if (bar.current) bar.current.style.transform = `scaleX(${p})`
      if (top.current) top.current.style.opacity = scrollY > 600 ? 1 : 0
      if (top.current) top.current.style.pointerEvents = scrollY > 600 ? 'auto' : 'none'
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    addEventListener('scroll', onScroll, { passive: true }); update()
    return () => { removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [])
  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-[3px] z-[60]" aria-hidden="true">
        <div ref={bar} className="h-full origin-left bg-gradient-to-r from-cyan via-electric to-violet" style={{ transform: 'scaleX(0)' }} />
      </div>
      <button ref={top} onClick={() => scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top"
        className="glass fixed bottom-5 right-5 z-50 p-3 text-cyan transition-opacity" style={{ opacity: 0 }}>
        <ArrowUp size={18} />
      </button>
    </>
  )
}
