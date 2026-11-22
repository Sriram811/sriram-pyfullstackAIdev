import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Beam from './Beam'

const GOLD = { color: '#f5c542', metalness: 0.95, roughness: 0.18, emissive: '#6b4a00', emissiveIntensity: 0.25 }
const PROFILE = [[0, 0], [1, 0], [1, 0.2], [0.5, 0.3], [0.22, 0.5], [0.22, 1.2], [0.5, 1.35], [0.9, 1.9], [1.15, 2.8], [1.1, 3.1], [1, 3.05], [0.85, 2.6], [0, 2.3]].map(([x, y]) => new THREE.Vector2(x, y))
const LANES = [[7, 4.2], [7.8, 4.9], [8.6, 5.6], [9.4, 6.3]]

const ellipse = (a, b, n = 96) => {
  const p = []; for (let i = 0; i < n; i++) { const t = (i / n) * Math.PI * 2; p.push(Math.cos(t) * a, 0, Math.sin(t) * b) }
  return new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(p, 3))
}

function Medal({ angle, reduced }) {
  return (
    <group position={[Math.cos(angle) * 3.8, 0.4 + Math.sin(angle * 2) * 0.4, Math.sin(angle) * 3.8]}>
      <mesh position={[0, 0.75, 0]}><boxGeometry args={[0.22, 0.9, 0.02]} /><meshBasicMaterial color="#3b82f6" /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.5, 0.5, 0.07, 28]} /><meshStandardMaterial {...GOLD} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.36, 0.025, 8, 28]} /><meshStandardMaterial color="#fff2b0" /></mesh>
    </group>
  )
}

// Stadium at night: rotating gold trophy, orbiting medals, running track with a moving runner.
export default function SportsScene({ tier, reduced }) {
  const trophy = useRef(), medals = useRef(), runner = useRef()
  const lanes = useMemo(() => LANES.map(([a, b]) => ellipse(a, b)), [])
  const cup = useMemo(() => new THREE.LatheGeometry(PROFILE, tier === 'low' ? 16 : 36), [tier])
  useEffect(() => () => { lanes.forEach((l) => l.dispose()); cup.dispose() }, [lanes, cup])
  useFrame(({ clock }, d) => {
    if (reduced) return
    if (trophy.current) trophy.current.rotation.y += d * 0.7
    if (medals.current) medals.current.rotation.y -= d * 0.3
    if (runner.current) { const t = clock.elapsedTime * 0.35; runner.current.position.set(Math.cos(t) * LANES[1][0], 0.1, Math.sin(t) * LANES[1][1]) }
  })
  return (
    <group scale={tier === 'low' ? 0.55 : tier === 'medium' ? 0.75 : 0.95}>
      <group position={[0, -2.2, 0]}>
        {lanes.map((g, i) => <lineLoop key={i} geometry={g}><lineBasicMaterial color={i === 1 ? '#f5c542' : '#3b82f6'} transparent opacity={i === 1 ? 0.8 : 0.45} /></lineLoop>)}
        <mesh ref={runner}><sphereGeometry args={[0.18, 12, 12]} /><meshBasicMaterial color="#22d3ee" /></mesh>
      </group>
      <group position={[0, -1.6, 0]}>
        <group ref={trophy}>
          <mesh geometry={cup}><meshStandardMaterial {...GOLD} side={THREE.DoubleSide} /></mesh>
          {[-1, 1].map((s) => <mesh key={s} position={[s * 1.2, 2.3, 0]}><torusGeometry args={[0.45, 0.06, 8, 24]} /><meshStandardMaterial {...GOLD} /></mesh>)}
        </group>
        <group ref={medals}>{(tier === 'low' ? [0, 2.1] : [0, 2.1, 4.2]).map((a) => <Medal key={a} angle={a} reduced={reduced} />)}</group>
      </group>
      <pointLight position={[-6, 6, -2]} intensity={60} color="#ffd37a" distance={30} />
      <pointLight position={[6, 6, -2]} intensity={60} color="#ffd37a" distance={30} />
      <pointLight position={[0, 1, 3]} intensity={25} color="#f5c542" distance={14} />
      {tier !== 'low' && <><Beam position={[-6, 6, -2]} rotation={[0, 0, 0.6]} color="#ffd37a" length={10} radius={2.8} opacity={0.2} /><Beam position={[6, 6, -2]} rotation={[0, 0, -0.6]} color="#ffd37a" length={10} radius={2.8} opacity={0.2} /></>}
    </group>
  )
}
