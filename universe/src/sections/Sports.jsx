import { useEffect, useRef, useState } from 'react'
import { ImageIcon, MapPin, Medal, Trophy } from 'lucide-react'
import { sports } from '../data/portfolioData'
import { revealBatch, useScrollAnimation } from '../hooks/useScrollAnimation'

function useInView() {
  const ref = useRef(null), [on, setOn] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setOn(true), io.disconnect()), { threshold: 0.4 })
    io.observe(ref.current); return () => io.disconnect()
  }, [])
  return [ref, on]
}

// Shows the photo if it exists in public/assets, otherwise a clearly replaceable placeholder.
function SportImage({ src, label }) {
  const [bad, setBad] = useState(false)
  return (
    <figure className="sport-fig glass overflow-hidden">
      <div className="aspect-[4/3]">
        {bad
          ? <div className="grid h-full place-items-center bg-gradient-to-br from-deep to-navy p-4 text-center text-xs text-silver"><div><ImageIcon className="mx-auto mb-2 text-cyan" />Add <code className="font-code text-cyan">public/assets/{src.split('/').pop()}</code></div></div>
          : <img src={src} alt={label} loading="lazy" onError={() => setBad(true)} className="h-full w-full object-cover" />}
      </div>
      <figcaption className="px-4 py-3 text-sm">{label}</figcaption>
    </figure>
  )
}

function RunStat({ label, value }) {
  const [ref, on] = useInView()
  return (
    <div ref={ref} className="run-stat glass p-5">
      <p className="text-sm text-silver">{label}</p>
      <p className="mt-1 font-display text-xl font-bold text-white">{value}</p>
      <div className="relative mt-4 h-1 rounded bg-white/10" aria-hidden="true">
        <div className="h-full rounded bg-gradient-to-r from-cyan to-violet transition-[width] duration-[1600ms] ease-out" style={{ width: on ? '100%' : '0%' }} />
        <span className="absolute -top-1 h-3 w-3 -translate-x-1/2 rounded-full bg-cyan transition-[left] duration-[1600ms] ease-out" style={{ left: on ? '100%' : '0%' }} />
      </div>
    </div>
  )
}

export default function Sports() {
  const [c1, c2] = sports.championships
  const scope = useScrollAnimation((gsap, ST) => ['.sport-card', '.run-stat', '.sport-fig'].forEach((s) => revealBatch(gsap, ST, s, 32)))
  return (
    <section id="sports" ref={scope} className="section">
      <h2 className="gradient-text text-4xl font-extrabold sm:text-6xl">{sports.title}</h2>
      <p className="mt-3 text-silver">Technology, discipline and sports.</p>
      <div className="mt-10 grid gap-5 md:max-w-3xl md:grid-cols-2">
        {[[c1, Trophy], [c2, Medal]].map(([c, Icon]) => (
          <article key={c.name} className="sport-card glass p-6">
            <Icon className="text-[#f5c542]" size={30} aria-hidden="true" />
            <h3 className="mt-3 text-lg font-semibold leading-snug">{c.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white">{c.result}</p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-sm"><MapPin size={14} />{c.location}</p>
          </article>
        ))}
      </div>
      <h3 className="mt-14 text-2xl font-semibold">Running</h3>
      <div className="mt-5 grid gap-4 md:max-w-3xl md:grid-cols-3">{sports.running.map((r) => <RunStat key={r.label} {...r} />)}</div>
      <h3 className="mt-14 text-2xl font-semibold">Gallery</h3>
      <div className="mt-5 grid gap-4 sm:grid-cols-3 md:max-w-3xl">
        <SportImage src={c1.image} label="National Handball Championship 2025" />
        <SportImage src={c2.image} label="International Handball Championship 2025" />
        <SportImage src={sports.runningImage} label="Running" />
      </div>
    </section>
  )
}
