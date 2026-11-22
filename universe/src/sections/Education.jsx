import { GraduationCap } from 'lucide-react'
import { education } from '../data/portfolioData'
import { revealBatch, useScrollAnimation } from '../hooks/useScrollAnimation'

export default function Education() {
  const scope = useScrollAnimation((gsap, ST) => revealBatch(gsap, ST, '.edu-card', 32))
  return (
    <section id="education" ref={scope} className="section">
      <h2 className="text-4xl font-bold sm:text-5xl">Academic Journey</h2>
      <div className="mt-10 grid gap-4 md:max-w-xl">
        {education.map((e) => (
          <article key={e.level} className="edu-card glass flex gap-4 p-5 sm:p-6">
            <GraduationCap className="mt-1 shrink-0 text-cyan" size={26} aria-hidden="true" />
            <div>
              <h3 className="text-lg font-semibold">{e.level}</h3>
              <p className="mt-1 text-sm">{e.school}</p>
              <div className="mt-3 flex flex-wrap gap-2"><span className="tag">{e.period}</span><span className="tag">{e.score}</span></div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
