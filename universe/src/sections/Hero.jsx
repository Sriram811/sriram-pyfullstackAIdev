import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Compass, Download, Mail } from 'lucide-react'
import { assets, profile } from '../data/portfolioData'
import { useScrollAnimation, usePrefersReducedMotion } from '../hooks/useScrollAnimation'

function useTyping(words, reduced) {
  const [w, setW] = useState(0), [n, setN] = useState(0), [del, setDel] = useState(false)
  useEffect(() => {
    const full = words[w]
    if (reduced) { setN(full.length); const id = setTimeout(() => setW((w + 1) % words.length), 2500); return () => clearTimeout(id) }
    let delay = del ? 35 : 75
    if (!del && n === full.length) delay = 1400
    if (del && n === 0) delay = 300
    const id = setTimeout(() => {
      if (!del && n === full.length) setDel(true)
      else if (del && n === 0) { setDel(false); setW((w + 1) % words.length) }
      else setN(n + (del ? -1 : 1))
    }, delay)
    return () => clearTimeout(id)
  }, [n, del, w, reduced, words])
  return words[w].slice(0, n)
}

const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

export default function Hero({ ready = true }) {
  const reduced = usePrefersReducedMotion()
  const typed = useTyping(profile.titles, reduced)
  const scope = useScrollAnimation((gsap) => {
    gsap.to('.hero-copy', { yPercent: -14, opacity: 0, ease: 'none', scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom 30%', scrub: true } })
  })
  const rise = (i) => ({ initial: reduced ? false : { opacity: 0, y: 28 }, animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }, transition: { duration: 0.8, delay: i * 0.12, ease: [0.2, 0.8, 0.2, 1] } })
  return (
    <section id="home" ref={scope} className="section flex flex-col justify-center pb-24 pt-32">
      <div className="hero-copy max-w-xl">
        <motion.h1 {...rise(0)} className="gradient-text text-6xl font-extrabold leading-none sm:text-7xl lg:text-8xl">{profile.name}</motion.h1>
        <motion.p {...rise(1)} className="mt-4 font-display text-xl font-semibold text-white sm:text-2xl">FULL STACK DEVELOPER</motion.p>
        <motion.p {...rise(2)} className="mt-3 h-7 font-code text-base text-cyan" aria-live="off">
          {typed}<span className="ml-0.5 inline-block w-[2px] animate-pulse bg-cyan">&nbsp;</span>
        </motion.p>
        <motion.p {...rise(3)} className="mt-5 max-w-md text-base leading-relaxed text-silver sm:text-lg">{profile.tagline}</motion.p>
        <motion.div {...rise(4)} className="mt-8 flex flex-wrap gap-3">
          <button className="btn btn-primary" onClick={() => go('about')}><Compass size={18} />Explore My Universe</button>
          <a className="btn" href={assets.resume} download="Sriram_T_Resume.pdf"><Download size={18} />Download Resume</a>
          <button className="btn" onClick={() => go('contact')}><Mail size={18} />Contact Me</button>
        </motion.div>
      </div>
      <button onClick={() => go('about')} aria-label="Scroll to About" className="scroll-cue absolute bottom-8 left-1/2 -translate-x-1/2 text-silver">
        <span className="scroll-cue-dot" /><ChevronDown size={18} className="mt-6" />
      </button>
    </section>
  )
}
