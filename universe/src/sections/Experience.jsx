import { useEffect } from 'react'
import { Calendar, MapPin } from 'lucide-react'
import { experience } from '../data/portfolioData'
import { scrollState, useScrollAnimation } from '../hooks/useScrollAnimation'

export default function Experience() {
  const scope = useScrollAnimation((gsap) => {
    gsap.fromTo('.tl-line', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.tl-wrap', start: 'top 60%', end: 'bottom 70%', scrub: true } })
  })
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (scrollState.step = Number(e.target.dataset.i))), { rootMargin: '-40% 0px -40% 0px' })
    document.querySelectorAll('[data-i]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return (
    <section id="journey" ref={scope} className="section">
      <h2 className="text-4xl font-bold sm:text-5xl">Professional Journey</h2>
      <div className="tl-wrap relative mt-10 md:max-w-2xl">
        <div className="absolute bottom-0 left-[7px] top-2 w-px bg-white/10" aria-hidden="true" />
        <div className="tl-line absolute bottom-0 left-[7px] top-2 w-px origin-top bg-gradient-to-b from-cyan via-electric to-violet" aria-hidden="true" />
        <ol className="space-y-6">
          {experience.map((e, i) => (
            <li key={e.org} data-i={i} className="relative pl-9">
              <span className="absolute left-0 top-6 h-[15px] w-[15px] rounded-full border-2 border-cyan bg-void" aria-hidden="true" />
              <article className="glass p-5 sm:p-6">
                <h3 className="text-lg font-semibold sm:text-xl">{e.org}</h3>
                <p className="mt-1 font-medium text-cyan">{e.role}</p>
                <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span className="inline-flex items-center gap-1.5"><Calendar size={14} />{e.period}</span>
                  {e.location && <span className="inline-flex items-center gap-1.5"><MapPin size={14} />{e.location}</span>}
                </p>
                <ul className="mt-4 list-disc space-y-1 pl-5 text-sm marker:text-electric">{e.points.map((p) => <li key={p}>{p}</li>)}</ul>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
