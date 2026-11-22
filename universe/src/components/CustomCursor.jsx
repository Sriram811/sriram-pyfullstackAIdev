import { useEffect, useRef } from 'react'

// Desktop-only cursor: a dot plus a trailing ring that grows over interactive elements.
export default function CustomCursor() {
  const wrap = useRef(null), dot = useRef(null), ring = useRef(null), ringInner = useRef(null)
  useEffect(() => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    document.body.classList.add('has-cursor')
    let x = 0, y = 0, rx = 0, ry = 0, raf, shown = false
    const move = (e) => {
      x = e.clientX; y = e.clientY
      if (!shown) { shown = true; rx = x; ry = y; wrap.current.style.opacity = 1 }
      dot.current.style.transform = `translate(${x}px,${y}px)`
    }
    const over = (e) => ringInner.current?.classList.toggle('scale-150', !!e.target.closest?.('a,button,[data-hover],input,textarea'))
    const loop = () => { rx += (x - rx) * 0.16; ry += (y - ry) * 0.16; if (ring.current) ring.current.style.transform = `translate(${rx}px,${ry}px)`; raf = requestAnimationFrame(loop) }
    addEventListener('mousemove', move); addEventListener('mouseover', over); loop()
    return () => { document.body.classList.remove('has-cursor'); removeEventListener('mousemove', move); removeEventListener('mouseover', over); cancelAnimationFrame(raf) }
  }, [])
  return (
    <div ref={wrap} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[100] hidden opacity-0 [@media(hover:hover)_and_(pointer:fine)]:block">
      <div ref={dot} className="absolute left-0 top-0"><div className="-ml-1 -mt-1 h-2 w-2 rounded-full bg-cyan" /></div>
      <div ref={ring} className="absolute left-0 top-0"><div ref={ringInner} className="-ml-4 -mt-4 h-8 w-8 rounded-full border border-cyan/60 transition-transform duration-200" /></div>
    </div>
  )
}
