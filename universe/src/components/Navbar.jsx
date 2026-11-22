import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { navLinks, profile } from '../data/portfolioData'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('home')

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    )
    navLinks.forEach(({ id }) => { const el = document.getElementById(id); el && io.observe(el) })
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return
    const k = (e) => e.key === 'Escape' && setOpen(false)
    addEventListener('keydown', k); return () => removeEventListener('keydown', k)
  }, [open])

  const go = (id) => { setOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <nav aria-label="Primary" className="glass mx-3 mt-3 flex items-center justify-between px-5 py-3 md:mx-auto md:max-w-5xl">
        <button onClick={() => go('home')} className="font-display font-bold text-white tracking-tight">{profile.name}</button>
        <ul className="hidden md:flex gap-1">
          {navLinks.map(({ id, label }) => (
            <li key={id}>
              <button onClick={() => go(id)} aria-current={active === id ? 'page' : undefined}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors ${active === id ? 'bg-electric/20 text-cyan' : 'text-silver hover:text-white'}`}>
                {label}
              </button>
            </li>
          ))}
        </ul>
        <button className="md:hidden text-white p-1" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>
      {open && (
        <div className="glass mx-3 mt-2 p-3 md:hidden">
          {navLinks.map(({ id, label }) => (
            <button key={id} onClick={() => go(id)} className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-semibold ${active === id ? 'text-cyan bg-electric/15' : 'text-silver'}`}>{label}</button>
          ))}
        </div>
      )}
    </header>
  )
}
