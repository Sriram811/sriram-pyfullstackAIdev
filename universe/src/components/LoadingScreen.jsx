import { useEffect, useState } from 'react'

const LINES = ['> booting developer universe...', '> loading python, django, react...', '> calibrating 3D scenes...', '> ready.']

export default function LoadingScreen({ onDone }) {
  const [n, setN] = useState(0)
  const [out, setOut] = useState(false)
  useEffect(() => {
    // clamped so n stops changing once complete (otherwise the exit timers below would keep resetting)
    const t = setInterval(() => setN((v) => Math.min(v + 1, LINES.length)), 380)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    if (n < LINES.length) return
    const a = setTimeout(() => setOut(true), 350)
    const b = setTimeout(onDone, 950)
    return () => { clearTimeout(a); clearTimeout(b) }
  }, [n, onDone])
  return (
    <div role="status" aria-live="polite" className={`fixed inset-0 z-[200] grid place-items-center bg-void transition-opacity duration-500 ${out ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
      <div className="w-[min(90vw,420px)] font-code text-sm text-cyan">
        {LINES.slice(0, n).map((l) => <p key={l} className="mb-1">{l}</p>)}
        <div className="mt-5 h-[2px] w-full bg-deep"><div className="h-full bg-gradient-to-r from-cyan to-violet transition-[width] duration-300" style={{ width: `${(n / LINES.length) * 100}%` }} /></div>
      </div>
    </div>
  )
}
