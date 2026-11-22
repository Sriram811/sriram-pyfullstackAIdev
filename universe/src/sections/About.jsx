import { useState } from 'react'
import { assets, profile, stats } from '../data/portfolioData'
import CountUp from '../components/CountUp'
import { revealBatch, useScrollAnimation } from '../hooks/useScrollAnimation'

function Avatar() {
  const [failed, setFailed] = useState(false)
  return (
    <div className="h-24 w-24 shrink-0 rounded-full bg-gradient-to-br from-cyan via-electric to-violet p-[2px]">
      {failed
        ? <div className="grid h-full w-full place-items-center rounded-full bg-void font-display text-2xl font-bold text-white" title="Add public/assets/profile.png">ST</div>
        : <img src={assets.profile} alt="Sriram T." onError={() => setFailed(true)} className="h-full w-full rounded-full object-cover" />}
    </div>
  )
}

export default function About() {
  const scope = useScrollAnimation((gsap, ST) => revealBatch(gsap, ST, '.stat-card', 24))
  return (
    <section id="about" ref={scope} className="section flex items-center">
      <div className="w-full md:max-w-xl">
        <h2 className="text-4xl font-bold sm:text-5xl">Developer Identity</h2>
        <div className="glass mt-8 p-6 sm:p-8">
          <div className="mb-5 flex items-center gap-5">
            <Avatar />
            <div><p className="font-display text-xl font-semibold text-white">{profile.name}</p><p className="text-sm text-silver">{profile.location}</p></div>
          </div>
          <div className="space-y-4 leading-relaxed">{profile.about.map((t) => <p key={t}>{t}</p>)}</div>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="stat-card glass p-4">
              <dt className="order-2 mt-1 text-xs leading-snug text-silver">{s.label}</dt>
              <dd className="font-display text-4xl font-bold gradient-text"><CountUp to={s.value} /></dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
