import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import * as si from 'simple-icons'
import { techGroups } from '../data/portfolioData'
import { pointerState } from './cameraPath'
import { scrollState } from '../hooks/useScrollAnimation'

// Brand marks come from simple-icons; concepts without a logo (LLM, RAG...) get a monogram.
const ICONS = {
  Python: si.siPython, JavaScript: si.siJavascript, Django: si.siDjango, 'React.js': si.siReact, 'Node.js': si.siNodedotjs,
  Bootstrap: si.siBootstrap, HTML5: si.siHtml5, CSS3: si.siCss3, 'Oracle SQL': si.siOracle, SQLite: si.siSqlite, MySQL: si.siMysql,
  MongoDB: si.siMongodb, FastAPI: si.siFastapi, Git: si.siGit, GitHub: si.siGithub, 'Visual Studio Code': si.siVisualstudiocode
}
const MONO = { LLM: 'LLM', SLM: 'SLM', RAG: 'RAG', 'Artificial Intelligence': 'AI', 'Machine Learning': 'ML', 'Vector Databases': 'VDB', 'REST API': 'API' }
const COLORS = ['#22d3ee', '#3b82f6', '#8b5cf6', '#a5b4fc', '#67e8f9', '#c9d3e6']
const RELATED = [['Django', 'Python'], ['FastAPI', 'Python'], ['Machine Learning', 'Python'], ['React.js', 'JavaScript'], ['Node.js', 'JavaScript'], ['MongoDB', 'Node.js'],
  ['Django', 'SQLite'], ['Vector Databases', 'RAG'], ['RAG', 'LLM'], ['LLM', 'SLM'], ['Machine Learning', 'Artificial Intelligence'], ['Git', 'GitHub'], ['FastAPI', 'REST API']]

const fib = (i, n, r) => { const y = n === 1 ? 0 : 1 - (i / (n - 1)) * 2, rad = Math.sqrt(1 - y * y), t = i * 2.39996; return new THREE.Vector3(Math.cos(t) * rad * r, y * r, Math.sin(t) * rad * r) }
const bright = (hex) => { const n = parseInt(hex, 16); return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 90 }

function makeTexture(name, color, icon, px = 256) {
  const c = document.createElement('canvas'); c.width = c.height = px
  const g = c.getContext('2d'); g.scale(px / 256, px / 256) // smaller textures on phones
  g.fillStyle = 'rgba(10,17,40,0.88)'; g.strokeStyle = color + '99'; g.lineWidth = 3
  g.beginPath(); g.roundRect ? g.roundRect(16, 16, 224, 224, 36) : g.rect(16, 16, 224, 224); g.fill(); g.stroke()
  g.fillStyle = icon && bright(icon.hex) ? '#' + icon.hex : color
  if (icon) { g.save(); g.translate(80, 42); g.scale(4, 4); g.fill(new Path2D(icon.path)); g.restore() }
  else { g.font = '700 56px sans-serif'; g.textAlign = 'center'; g.fillText(MONO[name] || name.slice(0, 3), 128, 118) }
  g.fillStyle = '#e6ecff'; g.textAlign = 'center'
  let f = 26; g.font = `600 ${f}px sans-serif`
  while (g.measureText(name).width > 200 && f > 12) g.font = `600 ${--f}px sans-serif`
  g.fillText(name, 128, 210)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
}

export default function SkillsScene({ tier, reduced }) {
  const root = useRef(), sprites = useRef({})
  const { nodes, lines, textures, hubs } = useMemo(() => {
    const nodes = [], pos = {}, seg = [], hubs = []
    techGroups.forEach((g, gi) => {
      const hub = fib(gi, techGroups.length, 6.5)
      hubs.push({ pos: hub, color: COLORS[gi] })
      g.items.forEach((name, k) => {
        const p = hub.clone().add(fib(k, g.items.length, 1.9 + g.items.length * 0.12)); pos[name] = p
        nodes.push({ name, color: COLORS[gi], pos: p, g: gi }); seg.push(hub.x, hub.y, hub.z, p.x, p.y, p.z)
      })
    })
    const rel = []; RELATED.forEach(([a, b]) => rel.push(...pos[a].toArray(), ...pos[b].toArray()))
    const mk = (arr) => new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(arr, 3))
    return { nodes, hubs, lines: [mk(seg), mk(rel)], textures: nodes.map((n) => makeTexture(n.name, n.color, ICONS[n.name], tier === 'low' ? 128 : 256)) }
  }, [tier])
  useEffect(() => () => { textures.forEach((t) => t.dispose()); lines.forEach((l) => l.dispose()) }, [textures, lines])

  const ray = useMemo(() => new THREE.Raycaster(), []), ndc = useMemo(() => new THREE.Vector2(), [])
  useFrame(({ camera }, d) => {
    if (!root.current) return
    if (!reduced) root.current.rotation.y += d * 0.06
    let hit = null
    if (tier !== 'low' && !reduced && root.current.parent?.visible) {
      ndc.set(pointerState.x, pointerState.y); ray.setFromCamera(ndc, camera)
      const h = ray.intersectObjects(Object.values(sprites.current).filter(Boolean))[0]; hit = h?.object.userData.name
    }
    const rel = new Set(hit ? [hit, ...RELATED.filter((r) => r.includes(hit)).flat()] : [])
    for (const n of nodes) {
      const s = sprites.current[n.name]; if (!s) continue
      const gh = scrollState.skillGroup
      const target = (hit === n.name ? 1.35 : rel.has(n.name) ? 1.2 : gh >= 0 && n.g === gh ? 1.3 : 1) * 1.5
      s.scale.x += (target - s.scale.x) * Math.min(d * 8, 1); s.scale.y = s.scale.x
    }
  })
  return (
    <group ref={root} scale={tier === 'low' ? 0.55 : tier === 'medium' ? 0.8 : 1}>
      <lineSegments geometry={lines[0]}><lineBasicMaterial color="#3b82f6" transparent opacity={0.3} /></lineSegments>
      <lineSegments geometry={lines[1]}><lineBasicMaterial color="#8b5cf6" transparent opacity={0.45} /></lineSegments>
      {hubs.map((h, i) => <mesh key={i} position={h.pos}><sphereGeometry args={[0.2, 12, 12]} /><meshBasicMaterial color={h.color} transparent opacity={0.9} /></mesh>)}
      {nodes.map((n, i) => (
        <sprite key={n.name} position={n.pos} scale={[1.5, 1.5, 1]} userData={{ name: n.name }} ref={(el) => { sprites.current[n.name] = el }}>
          <spriteMaterial map={textures[i]} transparent depthWrite={false} />
        </sprite>
      ))}
    </group>
  )
}
