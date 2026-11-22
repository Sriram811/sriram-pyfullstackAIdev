import { profile } from '../data/portfolioData'

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-void/70 px-5 py-6 text-center text-sm text-silver backdrop-blur">
      © {new Date().getFullYear()} {profile.name} · {profile.location}
    </footer>
  )
}
