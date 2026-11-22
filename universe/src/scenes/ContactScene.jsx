import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { pointerState } from './cameraPath'

// Connection globe: wireframe sphere, orbit rings and a halo of particles.
export default function ContactScene({ tier, reduced }) {
  const globe = useRef(), halo = useRef(), root = useRef(), pings = useRef([])
  const n = tier === 'low' ? 150 : 400
  const geo = useMemo(() => {
    const p = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, r = 3.6 + Math.random() * 1.4; p[i * 3] = Math.cos(a) * r; p[i * 3 + 1] = (Math.random() - 0.5) * 1.6; p[i * 3 + 2] = Math.sin(a) * r }
    return new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(p, 3))
  }, [n])
  useEffect(() => () => geo.dispose(), [geo])
  useFrame(({ clock }, d) => {
    if (reduced) return
    if (globe.current) globe.current.rotation.y += d * 0.2
    if (halo.current) halo.current.rotation.y -= d * 0.1
    if (root.current) { // mouse-responsive tilt around the resting pose
      const k = Math.min(d * 3, 1)
      root.current.rotation.y += (pointerState.x * 0.4 - root.current.rotation.y) * k
      root.current.rotation.x += (0.35 - pointerState.y * 0.2 - root.current.rotation.x) * k
    }
    pings.current.forEach((m, i) => { // signal pulses radiating outward
      if (!m) return
      const t = (clock.elapsedTime * 0.35 + i / 3) % 1
      m.scale.setScalar(1 + t * 1.6); m.material.opacity = (1 - t) * 0.5
    })
  })
  return (
    <group ref={root} scale={tier === 'low' ? 0.65 : 1} rotation={[0.35, 0, 0.15]}>
      {[0, 1, 2].map((i) => <mesh key={i} ref={(el) => { pings.current[i] = el }} rotation={[Math.PI / 2, 0, 0]}><ringGeometry args={[1.5, 1.56, 64]} /><meshBasicMaterial color="#22d3ee" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>)}
      <mesh ref={globe}><icosahedronGeometry args={[2.4, tier === 'low' ? 1 : 2]} /><meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.4} /></mesh>
      <mesh><sphereGeometry args={[1.5, 24, 24]} /><meshStandardMaterial color="#3b82f6" emissive="#1d4ed8" emissiveIntensity={1.1} transparent opacity={0.8} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[3.3, 0.012, 8, 96]} /><meshBasicMaterial color="#8b5cf6" /></mesh>
      <points ref={halo} geometry={geo}><pointsMaterial size={0.06} color="#c9d3e6" transparent opacity={0.8} depthWrite={false} sizeAttenuation /></points>
      <pointLight intensity={35} color="#8b5cf6" distance={20} />
    </group>
  )
}
