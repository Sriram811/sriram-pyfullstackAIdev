import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { scrollState } from '../hooks/useScrollAnimation'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

// Drifting wireframe "app windows": the product exhibition backdrop for the project cards.
export default function ProjectsScene({ tier, reduced }) {
  const n = tier === 'high' ? 10 : tier === 'medium' ? 7 : 4
  const refs = useRef([])
  useFrame((_, d) => {
    refs.current.forEach((g, i) => {
      if (!g) return
      const on = scrollState.project >= 0 && i === scrollState.project % n
      const k = Math.min(d * 6, 1)
      g.scale.x += ((on ? 1.3 : 1) - g.scale.x) * k; g.scale.y = g.scale.z = g.scale.x
      const m = g.children[2].material; m.opacity += ((on ? 0.24 : 0.07) - m.opacity) * k
    })
  })
  const { edges, bar, panels } = useMemo(() => {
    const plane = new THREE.PlaneGeometry(3, 2)
    const edges = new THREE.EdgesGeometry(plane)
    const bar = new THREE.EdgesGeometry(new THREE.PlaneGeometry(3, 0.3))
    plane.dispose()
    const panels = Array.from({ length: n }, (_, i) => ({
      pos: [Math.cos(i * 2.4) * (6 + (i % 3) * 2.2), Math.sin(i * 1.7) * 4, -Math.abs(Math.sin(i * 3.1)) * 9 - 2],
      rot: [Math.sin(i) * 0.25, Math.cos(i * 1.3) * 0.5, 0], color: ['#22d3ee', '#3b82f6', '#8b5cf6'][i % 3]
    }))
    return { edges, bar, panels }
  }, [n])
  useEffect(() => () => { edges.dispose(); bar.dispose() }, [edges, bar])
  return (
    <group>
      {panels.map((p, i) => (
        <Float key={i} speed={reduced ? 0 : 1 + (i % 3) * 0.3} floatIntensity={reduced ? 0 : 1.2} rotationIntensity={reduced ? 0 : 0.3}>
          <group position={p.pos} rotation={p.rot} ref={(el) => { refs.current[i] = el }}>
            <lineSegments geometry={edges}><lineBasicMaterial color={p.color} transparent opacity={0.8} /></lineSegments>
            <lineSegments geometry={bar} position={[0, 0.85, 0]}><lineBasicMaterial color={p.color} transparent opacity={0.8} /></lineSegments>
            <mesh><planeGeometry args={[3, 2]} /><meshBasicMaterial color={p.color} transparent opacity={0.07} side={THREE.DoubleSide} /></mesh>
          </group>
        </Float>
      ))}
    </group>
  )
}
