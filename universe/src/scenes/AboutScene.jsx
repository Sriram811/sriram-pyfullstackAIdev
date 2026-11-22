import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { pointerState } from './cameraPath'

const RINGS = [
  { r: 2.6, tilt: [0.5, 0, 0], speed: 0.35, color: '#22d3ee' },
  { r: 3.5, tilt: [1.1, 0.4, 0], speed: -0.25, color: '#3b82f6' },
  { r: 4.4, tilt: [-0.6, 0.2, 0.5], speed: 0.16, color: '#8b5cf6' }
]

function Ring({ r, tilt, speed, color, reduced }) {
  const spin = useRef()
  useFrame((_, d) => { if (!reduced && spin.current) spin.current.rotation.z += d * speed })
  return (
    <group rotation={tilt}>
      <group ref={spin}>
        <mesh><torusGeometry args={[r, 0.012, 8, 96]} /><meshBasicMaterial color={color} transparent opacity={0.7} /></mesh>
        <mesh position={[r, 0, 0]}><sphereGeometry args={[0.13, 12, 12]} /><meshBasicMaterial color={color} /></mesh>
      </group>
    </group>
  )
}

// Holographic "identity core": wireframe shell, glowing nucleus, orbiting rings.
export default function AboutScene({ tier, reduced }) {
  const shell = useRef(), root = useRef(), scan = useRef()
  useFrame(({ clock }, d) => {
    if (reduced) return
    if (shell.current) { shell.current.rotation.y += d * 0.25; shell.current.rotation.x += d * 0.1 }
    if (root.current) { // mouse-responsive tilt
      root.current.rotation.y += (pointerState.x * 0.35 - root.current.rotation.y) * Math.min(d * 3, 1)
      root.current.rotation.x += (-pointerState.y * 0.2 - root.current.rotation.x) * Math.min(d * 3, 1)
    }
    if (scan.current) { // holographic scan ring sweeping through the shell
      const y = Math.sin(clock.elapsedTime * 0.9) * 1.9
      scan.current.position.y = y; scan.current.scale.setScalar(Math.max(0.2, Math.sqrt(Math.max(0.05, 1 - (y / 2.2) ** 2)) * 1.3))
    }
  })
  return (
    <group ref={root} scale={tier === 'low' ? 0.7 : 1}>
      <mesh ref={scan} rotation={[Math.PI / 2, 0, 0]}><ringGeometry args={[1.5, 1.62, 64]} /><meshBasicMaterial color="#22d3ee" transparent opacity={0.7} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      <mesh ref={shell}><icosahedronGeometry args={[1.5, 1]} /><meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.55} /></mesh>
      <mesh><sphereGeometry args={[0.8, 24, 24]} /><meshStandardMaterial color="#3b82f6" emissive="#1d4ed8" emissiveIntensity={1.4} /></mesh>
      {RINGS.slice(0, tier === 'low' ? 2 : 3).map((x) => <Ring key={x.r} {...x} reduced={reduced} />)}
      <pointLight intensity={40} color="#22d3ee" distance={20} />
    </group>
  )
}
