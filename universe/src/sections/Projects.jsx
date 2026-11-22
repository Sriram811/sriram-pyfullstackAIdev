import { projects } from '../data/portfolioData'
import TiltCard from '../components/TiltCard'
import { revealBatch, scrollState, useScrollAnimation } from '../hooks/useScrollAnimation'

export default function Projects() {
  const scope = useScrollAnimation((gsap, ST) => revealBatch(gsap, ST, '.proj-card', 40))
  return (
    <section id="projects" ref={scope} className="section">
      <h2 className="text-4xl font-bold sm:text-5xl">My Digital Creations</h2>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {projects.map((p, pi) => (
          <div key={p.name} className="proj-card" onPointerEnter={() => { scrollState.project = pi }} onPointerLeave={() => { scrollState.project = -1 }}>
            <TiltCard className="glass h-full overflow-hidden">
              <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
                <i className="h-2.5 w-2.5 rounded-full bg-cyan/80" /><i className="h-2.5 w-2.5 rounded-full bg-electric/80" /><i className="h-2.5 w-2.5 rounded-full bg-violet/80" />
                <span className="ml-2 truncate font-code text-xs text-silver/70">{p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}</span>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold">{p.name}</h3>
                {p.desc && <p className="mt-2 text-sm leading-relaxed">{p.desc}</p>}
                {p.tech.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{p.tech.map((t) => <span key={t} className="tag">{t}</span>)}</div>}
              </div>
            </TiltCard>
          </div>
        ))}
      </div>
    </section>
  )
}
