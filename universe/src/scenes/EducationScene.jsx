import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Edges, Float, MeshReflectorMaterial } from '@react-three/drei'
import Beam from './Beam'

const MILESTONES = [{ h: 1.6, x: -3.2, c: '#22d3ee' }, { h: 2.6, x: 0, c: '#3b82f6' }, { h: 3.6, x: 3.2, c: '#8b5cf6' }]

function Milestone({ h, x, c, reduced }) {
  const ring = useRef()
  useFrame((_, d) => { if (!reduced && ring.current) ring.current.rotation.z += d * 0.8 })
  return (
    <group position={[x, -2.5 + h / 2, 0]}>
      <mesh scale={[1, h, 1]}><boxGeometry args={[1.3, 1, 1.3]} /><meshStandardMaterial color={c} transparent opacity={0.22} metalness={0.8} roughness={0.3} /><Edges color={c} /></mesh>
      <mesh position={[0, h / 2 + 0.15, 0]}><boxGeometry args={[1.3, 0.1, 1.3]} /><meshBasicMaterial color={c} /></mesh>
      <mesh ref={ring} position={[0, h / 2 + 0.9, 0]} rotation={[Math.PI / 2.4, 0, 0]}><torusGeometry args={[0.6, 0.025, 8, 48]} /><meshBasicMaterial color={c} /></mesh>
      <mesh position={[0, h / 2 + 0.9, 0]}><octahedronGeometry args={[0.28]} /><meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.1} /></mesh>
    </group>
  )
}

// Three ascending milestone pillars (SSLC, HSC, B.E.) with floating certificate panels above.
export default function EducationScene({ tier, reduced }) {
  return (
    <group scale={tier === 'low' ? 0.55 : tier === 'medium' ? 0.8 : 1}>
      {MILESTONES.map((m) => <Milestone key={m.x} {...m} reduced={reduced} />)}
      {tier !== 'low' && [-3.4, 0, 3.4].map((x, i) => (
        <Float key={x} speed={reduced ? 0 : 1 + i * 0.2} floatIntensity={reduced ? 0 : 0.8} rotationIntensity={reduced ? 0 : 0.15}>
          <mesh position={[x, 5.6 + (i % 2) * 0.5, -3]} rotation={[0, (i - 1) * -0.3, 0]}>
            <planeGeometry args={[2.6, 1.8]} /><meshBasicMaterial color="#c9d3e6" transparent opacity={0.07} /><Edges color="#c9d3e6" />
          </mesh>
        </Float>
      ))}
      {tier !== 'low' && <Beam position={[0, 8, 0]} color="#3b82f6" length={10.5} radius={4.2} opacity={0.16} />}
      {tier === 'high' && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.52, 0]}><circleGeometry args={[8, 48]} /><MeshReflectorMaterial blur={[200, 80]} resolution={384} mixBlur={1} mixStrength={28} roughness={1} color="#050a1c" metalness={0.6} /></mesh>}
      <pointLight position={[0, 3, 4]} intensity={30} color="#3b82f6" distance={20} />
    </group>
  )
}
