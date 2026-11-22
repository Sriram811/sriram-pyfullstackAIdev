import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'
import { scrollState } from '../hooks/useScrollAnimation'

const PTS = [[-3, 3.4, 0], [2.2, 1.7, -1], [-2.6, 0, 1], [2.6, -1.7, -1], [-1.6, -3.4, 0]].map((p) => new THREE.Vector3(...p))
const tmp = new THREE.Vector3()
const COLORS = ['#22d3ee', '#3b82f6', '#8b5cf6', '#a5b4fc', '#67e8f9']

// Floating organisation nodes joined by a glowing path; pulses travel along it.
// The node matching the card currently in view (scrollState.step) grows.
export default function JourneyScene({ tier, reduced }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(PTS, false, 'catmullrom', 0.5), [])
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 120, 0.03, 6), [curve])
  useEffect(() => () => tube.dispose(), [tube])
  const pulses = useRef([]), nodes = useRef([]), light = useRef()
  useFrame(({ clock }, d) => {
    const t = clock.elapsedTime
    if (light.current) { tmp.copy(PTS[Math.min(scrollState.step, PTS.length - 1)]); tmp.z += 2.5; light.current.position.lerp(tmp, Math.min(d * 4, 1)) }
    if (!reduced) pulses.current.forEach((m, i) => m && m.position.copy(curve.getPointAt((t * 0.07 + i / 3) % 1)))
    nodes.current.forEach((g, i) => {
      if (!g) return
      const target = i === scrollState.step ? 1.5 : 1
      g.scale.x += (target - g.scale.x) * Math.min(d * 6, 1); g.scale.y = g.scale.z = g.scale.x
      if (!reduced) g.rotation.y += d * 0.5
    })
  })
  return (
    <group scale={tier === 'low' ? 0.6 : tier === 'medium' ? 0.9 : 1.15}>
      <mesh geometry={tube}><meshBasicMaterial color="#3b82f6" transparent opacity={0.55} /></mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(el) => { pulses.current[i] = el }}><sphereGeometry args={[0.12, 10, 10]} /><meshBasicMaterial color="#22d3ee" /></mesh>
      ))}
      {PTS.map((p, i) => (
        <Float key={i} speed={reduced ? 0 : 1.2} floatIntensity={reduced ? 0 : 0.5} rotationIntensity={0}>
          <group position={p}>
            <group ref={(el) => { nodes.current[i] = el }}>
              <mesh><icosahedronGeometry args={[0.55, 1]} /><meshBasicMaterial color={COLORS[i]} wireframe transparent opacity={0.9} /></mesh>
              <mesh><sphereGeometry args={[0.22, 16, 16]} /><meshStandardMaterial color={COLORS[i]} emissive={COLORS[i]} emissiveIntensity={1.2} /></mesh>
            </group>
          </group>
        </Float>
      ))}
      <pointLight ref={light} intensity={45} color="#22d3ee" distance={12} />
    </group>
  )
}
