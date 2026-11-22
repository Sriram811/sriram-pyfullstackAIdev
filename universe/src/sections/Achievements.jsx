import { FileText } from 'lucide-react'
import { achievements } from '../data/portfolioData'
import TiltCard from '../components/TiltCard'

export default function Achievements() {
  return (
    <section id="achievements" className="section !min-h-0">
      <h2 className="text-4xl font-bold sm:text-5xl">Achievements &amp; Research</h2>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {achievements.map((a) => (
          <TiltCard key={a} className="glass h-full p-6">
            <FileText className="text-cyan" size={28} aria-hidden="true" />
            <p className="mt-4 leading-relaxed text-white">{a}</p>
          </TiltCard>
        ))}
      </div>
    </section>
  )
}
