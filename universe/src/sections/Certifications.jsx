import { Award } from 'lucide-react'
import { certifications } from '../data/portfolioData'
import TiltCard from '../components/TiltCard'

export default function Certifications() {
  return (
    <section id="certifications" className="section !min-h-0">
      <h2 className="text-4xl font-bold sm:text-5xl">Certifications</h2>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {certifications.map((c) => (
          <TiltCard key={c.title} className="glass flex h-full flex-col p-6">
            <Award className="text-violet" size={30} aria-hidden="true" />
            <h3 className="mt-4 text-lg font-semibold leading-snug">{c.title}</h3>
            <p className="mt-1 text-sm">{c.issuer}</p>
            <p className="mt-auto pt-5 font-display text-3xl font-bold gradient-text">{c.score}</p>
          </TiltCard>
        ))}
      </div>
    </section>
  )
}
