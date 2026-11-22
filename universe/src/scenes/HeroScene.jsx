import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { pointerState } from './cameraPath'
import Beam from './Beam'

const SNIPPETS = ['def build(idea):', '  return app.ship()', 'class Agent(AI):', 'await vec.query(q)', 'SELECT * FROM ideas;', 'model.fit(X, y)', '@app.get("/api")', 'export default App', 'docs = retriever(q)', 'git push origin main']

// Procedural "code on a screen" texture: no image assets required.
function makeCodeTexture(color, seed) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 320
  const g = c.getContext('2d')
  g.fillStyle = '#050a1c'; g.fillRect(0, 0, 512, 320)
  g.fillStyle = '#0e1838'; g.fillRect(0, 0, 512, 28)
  g.font = '20px monospace'
  for (let i = 0; i < 10; i++) {
    g.fillStyle = i % 3 === 0 ? color : '#6f84b5'
    g.fillText(SNIPPETS[(i + seed) % SNIPPETS.length], 22 + ((i * seed) % 3) * 20, 58 + i * 26)
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace
  return t
}

function Monitor({ position, rotation = [0, 0, 0], scale = 1, color, seed, reduced }) {
  const tex = useMemo(() => makeCodeTexture(color, seed), [color, seed])
  useEffect(() => () => tex.dispose(), [tex])
  return (
    <Float speed={reduced ? 0 : 1.3} floatIntensity={reduced ? 0 : 0.7} rotationIntensity={reduced ? 0 : 0.2}>
      <group position={position} rotation={rotation} scale={scale}>
        <mesh><boxGeometry args={[3.2, 2, 0.12]} /><meshStandardMaterial color="#0b1330" metalness={0.8} roughness={0.35} /></mesh>
        <mesh position={[0, 0, 0.07]}><planeGeometry args={[3, 1.8]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh>
        <mesh position={[0, 0, -0.08]}><planeGeometry args={[3.3, 2.1]} /><meshBasicMaterial color={color} transparent opacity={0.14} /></mesh>
      </group>
    </Float>
  )
}

function CodeParticles({ count, reduced }) {
  const ref = useRef()
  const geo = useMemo(() => {
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) { p[i * 3] = (Math.random() - 0.5) * 24; p[i * 3 + 1] = (Math.random() - 0.5) * 12; p[i * 3 + 2] = (Math.random() - 0.5) * 14 }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); return g
  }, [count])
  useEffect(() => () => geo.dispose(), [geo])
  useFrame((_, d) => { if (!reduced && ref.current) ref.current.rotation.y += d * 0.03 })
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.06} color="#22d3ee" transparent opacity={0.75} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
    </points>
  )
}

function Floaters({ reduced, full }) {
  const a = useRef(), b = useRef(), c = useRef()
  useFrame((_, d) => {
    if (reduced) return
    if (a.current) { a.current.rotation.x += d * 0.25; a.current.rotation.y += d * 0.35 }
    if (b.current) { b.current.rotation.y -= d * 0.4; b.current.rotation.z += d * 0.2 }
    if (c.current) c.current.rotation.x += d * 0.3
  })
  return (
    <>
      <mesh ref={a} position={[-4.6, 2.4, -1.5]}><icosahedronGeometry args={[0.9, 1]} /><meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.8} /></mesh>
      <mesh ref={b} position={[4.8, -1.2, -1]}><octahedronGeometry args={[0.7]} /><meshStandardMaterial color="#8b5cf6" metalness={0.9} roughness={0.2} emissive="#3b1a8f" /></mesh>
      {full && <mesh ref={c} position={[0.6, 3.3, -3]}><torusKnotGeometry args={[0.5, 0.14, 96, 12]} /><meshStandardMaterial color="#c9d3e6" metalness={1} roughness={0.25} /></mesh>}
    </>
  )
}

export default function HeroScene({ tier, reduced }) {
  const root = useRef()
  const full = tier !== 'low'
  const count = tier === 'high' ? 1100 : tier === 'medium' ? 600 : 220
  useFrame(({ camera }, d) => {
    if (!root.current) return
    root.current.visible = camera.position.z > -30 // nothing to draw (or reflect) once we've flown past
    if (reduced) return
    root.current.rotation.y += (pointerState.x * 0.25 - root.current.rotation.y) * Math.min(d * 3, 1)
    root.current.rotation.x += (-pointerState.y * 0.1 - root.current.rotation.x) * Math.min(d * 3, 1)
  })
  return (
    <group ref={root} position={[tier === 'high' ? 2.4 : 0, tier === 'low' ? -1.4 : 0, 0]} scale={tier === 'low' ? 0.8 : 1}>
      <Monitor position={[0, 0.7, 0]} scale={1.15} color="#22d3ee" seed={1} reduced={reduced} />
      <Monitor position={[-3.6, 0.3, -1.3]} rotation={[0, 0.5, 0]} color="#3b82f6" seed={4} reduced={reduced} />
      <Monitor position={[3.6, 0.5, -1.1]} rotation={[0, -0.5, 0]} color="#8b5cf6" seed={7} reduced={reduced} />
      {full && <Monitor position={[-1.8, 2.9, -3.2]} rotation={[0.1, 0.25, 0]} scale={0.7} color="#22d3ee" seed={9} reduced={reduced} />}
      {/* workstation desk + light strip */}
      <mesh position={[0, -1.55, 0.2]}><boxGeometry args={[8, 0.12, 3]} /><meshStandardMaterial color="#0b1330" metalness={0.7} roughness={0.4} /></mesh>
      <mesh position={[0, -1.47, 1.72]}><boxGeometry args={[8, 0.03, 0.03]} /><meshBasicMaterial color="#22d3ee" /></mesh>
      {tier === 'high' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.72, 0]}>
          <planeGeometry args={[60, 60]} />
          <MeshReflectorMaterial blur={[300, 100]} resolution={512} mixBlur={1} mixStrength={35} roughness={1} depthScale={1.1}
            minDepthThreshold={0.4} maxDepthThreshold={1.4} color="#050a1c" metalness={0.6} />
        </mesh>
      )}
      <gridHelper args={[40, 40, '#22d3ee', '#1b2a5c']} position={[0, -1.7, 0]} />
      <Floaters reduced={reduced} full={full} />
      <CodeParticles count={count} reduced={reduced} />
      <pointLight position={[0, 2, 4]} intensity={30} color="#22d3ee" />
      <pointLight position={[-5, 3, 2]} intensity={25} color="#8b5cf6" />
      {full && <><Beam position={[-2, 6, -1]} rotation={[0, 0, 0.18]} color="#22d3ee" length={8} radius={2.4} opacity={0.2} /><Beam position={[3.5, 6, -1.5]} rotation={[0, 0, -0.2]} color="#8b5cf6" length={8} radius={2.2} opacity={0.18} /></>}
    </group>
  )
}
