import { techGroups } from '../data/portfolioData'
import { revealBatch, scrollState, useScrollAnimation } from '../hooks/useScrollAnimation'

export default function Skills() {
  const scope = useScrollAnimation((gsap, ST) => revealBatch(gsap, ST, '.skill-card', 28))
  return (
    <section id="skills" ref={scope} className="section">
      <h2 className="text-4xl font-bold sm:text-5xl">Developer Technology Universe</h2>
      <p className="mt-3 max-w-md text-silver">Related technologies are linked. Hover a node in the ecosystem to see what it connects to.</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 md:max-w-lg md:grid-cols-1 lg:max-w-md">
        {techGroups.map((g, gi) => (
          <div key={g.group} className="skill-card glass p-4" onPointerEnter={() => { scrollState.skillGroup = gi }} onPointerLeave={() => { scrollState.skillGroup = -1 }}>
            <h3 className="text-sm font-semibold text-white">{g.group}</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">{g.items.map((i) => <span key={i} className="tag">{i}</span>)}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
