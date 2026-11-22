import { Fragment, Suspense, lazy, useCallback, useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import LoadingScreen from './components/LoadingScreen'
import CustomCursor from './components/CustomCursor'
import ScrollProgress from './components/ScrollProgress'
import { navLinks } from './data/portfolioData'
import Hero from './sections/Hero'
import About from './sections/About'
import Skills from './sections/Skills'
import Projects from './sections/Projects'
import Experience from './sections/Experience'
import Education from './sections/Education'
import Certifications from './sections/Certifications'
import Sports from './sections/Sports'
import Achievements from './sections/Achievements'
import Contact from './sections/Contact'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initScrollState, usePrefersReducedMotion } from './hooks/useScrollAnimation'

// The 3D canvas is lazy-loaded so the page shell paints first.
const Universe = lazy(() => import('./components/Universe'))
// Remaining placeholders are replaced section by section in Step 5.
const Placeholder = ({ id, label }) => (
  <section id={id} className="section grid place-items-center"><h2 className="text-3xl font-bold">{label} (coming in next step)</h2></section>
)

const hasWebGL = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false } })()

const BUILT = { home: Hero, about: About, skills: Skills, projects: Projects, journey: Experience, education: Education, sports: Sports, contact: Contact }
// Sections that follow a nav section but have no nav entry of their own.
const EXTRA = { education: Certifications, sports: Achievements }

export default function App() {
  const [ready, setReady] = useState(false)
  const done = useCallback(() => setReady(true), [])
  const reduced = usePrefersReducedMotion()
  useEffect(() => initScrollState(), [])
  // Premium micro-interaction: glass cards get a specular sheen that follows the cursor.
  useEffect(() => {
    const f = (e) => {
      const g = e.target.closest?.('.glass'); if (!g) return
      const r = g.getBoundingClientRect(); g.style.setProperty('--mx', `${e.clientX - r.left}px`); g.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
    addEventListener('pointermove', f, { passive: true }); return () => removeEventListener('pointermove', f)
  }, [])
  // Section transition: each heading wipes in once as its section arrives.
  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray('section.section > h2, #contact h2').forEach((h) =>
        gsap.fromTo(h, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: h, start: 'top 85%', once: true }, onComplete: () => gsap.set(h, { clearProps: 'clipPath' }) }))
    })
    return () => ctx.revert()
  }, [reduced])
  return (
    <>
      {!ready && <LoadingScreen onDone={done} />}
      <CustomCursor />
      <ScrollProgress />
      <Navbar />
      {hasWebGL && <ErrorBoundary><Suspense fallback={null}><Universe /></Suspense></ErrorBoundary>}
      <main className="relative z-10">
        {navLinks.map(({ id, label }) => { const C = BUILT[id]; return <Fragment key={id}>{C ? <C ready={ready} /> : <Placeholder id={id} label={label} />}{EXTRA[id] ? (() => { const X = EXTRA[id]; return <X /> })() : null}</Fragment> })}
      </main>
      <Footer />
    </>
  )
}
