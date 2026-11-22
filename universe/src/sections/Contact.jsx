import { useState } from 'react'
import { Download, Github, Linkedin, Mail, Phone } from 'lucide-react'
import { assets, profile } from '../data/portfolioData'
import { revealBatch, useScrollAnimation } from '../hooks/useScrollAnimation'

// Frontend only: the form opens the visitor's email app via mailto:.
export default function Contact() {
  const scope = useScrollAnimation((gsap, ST) => { revealBatch(gsap, ST, '.term-row', 18); revealBatch(gsap, ST, '.term-btn', 18) })
  const [f, setF] = useState({ name: '', email: '', message: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const send = (e) => {
    e.preventDefault()
    const body = `${f.message}\n\n— ${f.name} (${f.email})`
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(`Portfolio message from ${f.name}`)}&body=${encodeURIComponent(body)}`
  }
  const field = 'w-full rounded-lg border border-white/10 bg-void/60 px-3 py-2.5 text-sm text-white placeholder:text-silver/50 transition-colors focus:border-cyan/60'
  const links = [
    { href: profile.linkedin, label: 'LinkedIn', Icon: Linkedin, ext: true }, { href: profile.github, label: 'GitHub', Icon: Github, ext: true },
    { href: `mailto:${profile.email}`, label: 'Email', Icon: Mail }, { href: profile.phoneHref, label: 'Phone', Icon: Phone }
  ]
  return (
    <section id="contact" ref={scope} className="section flex items-center">
      <div className="glass w-full overflow-hidden md:max-w-xl">
        <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
          <i className="h-2.5 w-2.5 rounded-full bg-cyan/80" /><i className="h-2.5 w-2.5 rounded-full bg-electric/80" /><i className="h-2.5 w-2.5 rounded-full bg-violet/80" />
          <span className="ml-2 font-code text-xs text-silver/70">connect@sriram:~</span>
        </div>
        <div className="p-5 sm:p-7">
          <h2 className="gradient-text text-4xl font-extrabold sm:text-5xl">{profile.name}</h2>
          <p className="mt-2 text-lg text-white">Let's build something meaningful together.</p>
          <dl className="mt-5 space-y-1.5 font-code text-sm">
            {[['email', profile.email, `mailto:${profile.email}`], ['phone', profile.phone, profile.phoneHref], ['linkedin', profile.linkedin, profile.linkedin], ['github', profile.github, profile.github]].map(([k, v, h]) => (
              <div key={k} className="term-row flex flex-wrap gap-x-3"><dt className="w-20 text-cyan">{k}:</dt><dd className="min-w-0 break-all"><a href={h} className="hover:text-white" {...(h.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{v}</a></dd></div>
            ))}
          </dl>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {links.map(({ href, label, Icon, ext }) => <a key={label} href={href} className="term-btn btn !px-4 !py-2.5" {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}><Icon size={16} />{label}</a>)}
            <a href={assets.resume} download="Sriram_T_Resume.pdf" className="term-btn btn btn-primary !px-4 !py-2.5"><Download size={16} />Download Resume</a>
          </div>
          <form onSubmit={send} className="mt-7 space-y-3">
            <label className="block"><span className="sr-only">Your name</span><input required value={f.name} onChange={set('name')} placeholder="Your name" className={field} /></label>
            <label className="block"><span className="sr-only">Your email</span><input required type="email" value={f.email} onChange={set('email')} placeholder="Your email" className={field} /></label>
            <label className="block"><span className="sr-only">Message</span><textarea required rows={4} value={f.message} onChange={set('message')} placeholder="Your message" className={field} /></label>
            <button type="submit" className="btn btn-primary"><Mail size={16} />Open in email app</button>
          </form>
        </div>
      </div>
    </section>
  )
}
