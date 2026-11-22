import { useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks/useScrollAnimation'

// Perspective tilt that follows the pointer. Disabled for touch and reduced motion.
export default function TiltCard({ children, className = '' }) {
  const ref = useRef(null)
  const reduced = usePrefersReducedMotion()
  const move = (e) => {
    if (reduced || e.pointerType === 'touch') return
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5
    ref.current.style.transform = `perspective(900px) rotateX(${-y * 10}deg) rotateY(${x * 12}deg)`
  }
  return <div ref={ref} data-hover onPointerMove={move} onPointerLeave={() => { ref.current.style.transform = '' }} className={`transition-transform duration-200 will-change-transform ${className}`}>{children}</div>
}
