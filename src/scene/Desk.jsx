import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshReflectorMaterial, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { DESK_TOP } from '../lib/director'
import { Tube } from './Pc'

const M = (p) => <meshStandardMaterial roughness={0.4} metalness={0.7} {...p} />
export const AO = ({ x, z, w, d, ry = 0, tx, y = DESK_TOP + 0.0012, o = 0.7 }) => (
  <mesh position={[x, y, z]} rotation={[-Math.PI / 2, 0, ry]}><planeGeometry args={[w, d]} /><meshBasicMaterial map={tx.blob} transparent opacity={o} depthWrite={false} polygonOffset polygonOffsetFactor={-2} /></mesh>
)

export function Room({ tier, tx }) {
  const glow = (x, y, z, w, h, c, o, rot) => <mesh position={[x, y, z]} rotation={rot || [0, 0, 0]}><planeGeometry args={[w, h]} /><meshBasicMaterial map={tx.glow} color={c} transparent opacity={o} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[14, 14]} />
        {tier === 'high' ? <MeshReflectorMaterial blur={[300, 80]} resolution={512} mixBlur={1} mixStrength={12} roughness={1} depthScale={0.8} minDepthThreshold={0.4} maxDepthThreshold={1.3} color="#0d0d13" metalness={0.6} /> : <meshStandardMaterial color="#0d0d13" roughness={0.6} metalness={0.4} />}
      </mesh>
      <mesh position={[0, 2, -0.85]} receiveShadow><planeGeometry args={[14, 4]} /><meshStandardMaterial color="#0c0c12" roughness={0.9} /></mesh>
      <mesh position={[0, 0.04, -0.83]}><boxGeometry args={[14, 0.08, 0.02]} /><meshStandardMaterial color="#1a1b23" roughness={0.5} metalness={0.6} /></mesh>
      {Array.from({ length: 13 }, (_, i) => <mesh key={i} position={[(i - 6) * 0.16, 1.5, -0.82]}><boxGeometry args={[0.12, 1.2, 0.04]} /><meshStandardMaterial color="#14141c" roughness={0.95} /></mesh>)}
      {[[-1.95, '#8b5cf6'], [1.95, '#22d3ee']].map(([x, c]) => <mesh key={x} position={[x, 1.2, -0.8]}><boxGeometry args={[0.02, 1.8, 0.02]} /><meshBasicMaterial color={c} toneMapped={false} /></mesh>)}
      {/* soft coloured bounce: wall wash behind the monitors, glow on the floor under the desk */}
      {glow(-1.95, 1.2, -0.78, 1.3, 2.4, '#8b5cf6', 0.2)}{glow(1.95, 1.2, -0.78, 1.3, 2.4, '#22d3ee', 0.2)}
      {glow(0, 1.45, -0.78, 2.4, 1.2, '#3b4cc0', 0.1)}
      {glow(0, 0.003, 0.25, 3.4, 1.7, '#7c4dff', 0.16, [-Math.PI / 2, 0, 0])}
      <AO x={0} z={-0.1} w={3.6} d={1.8} y={0.002} tx={tx} o={0.8} />
    </>
  )
}

export function Desk({ tx }) {
  return (
    <group>
      <RoundedBox args={[2.9, 0.04, 0.95]} radius={0.012} smoothness={3} position={[0, DESK_TOP - 0.02, 0.02]} castShadow receiveShadow><meshPhysicalMaterial map={tx.wood} color="#d9d2cb" roughness={0.6} metalness={0.05} clearcoat={0.14} clearcoatRoughness={0.5} /></RoundedBox>
      <RoundedBox args={[2.86, 0.03, 0.91]} radius={0.008} position={[0, DESK_TOP - 0.055, 0.02]}><meshStandardMaterial color="#14120f" roughness={0.7} /></RoundedBox>
      {[-1.4, 1.4].map((x) => (
        <group key={x}>
          {[-0.32, 0.4].map((z) => <RoundedBox key={z} args={[0.05, DESK_TOP - 0.07, 0.07]} radius={0.01} smoothness={2} position={[x, (DESK_TOP - 0.07) / 2 + 0.03, z]} castShadow><meshStandardMaterial color="#2a2c35" metalness={0.95} roughness={0.33} envMapIntensity={1.2} /></RoundedBox>)}
          <RoundedBox args={[0.08, 0.03, 0.95]} radius={0.01} smoothness={2} position={[x, 0.015, 0.04]} castShadow><meshStandardMaterial color="#1b1d25" metalness={0.9} roughness={0.4} /></RoundedBox>
          <mesh position={[x, DESK_TOP - 0.075, 0.04]}><boxGeometry args={[0.07, 0.012, 0.88]} /><meshStandardMaterial color="#1b1d25" metalness={0.9} roughness={0.4} /></mesh>
        </group>
      ))}
      <mesh position={[0, 0.42, -0.32]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.014, 0.014, 2.8, 14]} /><meshStandardMaterial color="#2a2c35" metalness={0.95} roughness={0.33} /></mesh>
      <mesh position={[0, DESK_TOP - 0.06, -0.32]}><boxGeometry args={[2.8, 0.03, 0.04]} /><M color="#0e0e13" /></mesh>
      <mesh position={[0, DESK_TOP - 0.052, 0.495]}><boxGeometry args={[2.88, 0.005, 0.005]} /><meshBasicMaterial color="#8b5cf6" toneMapped={false} /></mesh>
      {/* cable management: raceway on the back edge, mesh tray underneath */}
      <RoundedBox args={[2.3, 0.028, 0.07]} radius={0.006} position={[0, DESK_TOP + 0.014, -0.43]} castShadow><M color="#17181f" /></RoundedBox>
      <mesh position={[0, DESK_TOP - 0.13, -0.28]}><boxGeometry args={[2.0, 0.012, 0.22]} /><M color="#101116" roughness={0.6} /></mesh>
      {[-0.6, 0, 0.6].map((x) => <mesh key={x} position={[x, DESK_TOP - 0.1, -0.28]}><boxGeometry args={[0.03, 0.06, 0.24]} /><M color="#2b2d38" roughness={0.9} metalness={0} /></mesh>)}
      {/* desk mat with stitched border */}
      <RoundedBox args={[1.0, 0.004, 0.42]} radius={0.004} smoothness={2} position={[0.05, DESK_TOP + 0.002, 0.28]} receiveShadow><meshStandardMaterial map={tx.fabric} roughness={1} metalness={0} /></RoundedBox>
      {[[0, 0.2, 0.97, 0.002], [0, -0.2, 0.97, 0.002]].map(([x, z, w, d]) => <mesh key={z} position={[0.05 + x, DESK_TOP + 0.0043, 0.28 + z]}><boxGeometry args={[w, 0.0006, d]} /><meshBasicMaterial color="#3a3f55" /></mesh>)}
      {[-0.48, 0.48].map((x) => <mesh key={x} position={[0.05 + x, DESK_TOP + 0.0043, 0.28]}><boxGeometry args={[0.002, 0.0006, 0.4]} /><meshBasicMaterial color="#3a3f55" /></mesh>)}
      <group position={[-1.2, DESK_TOP, 0.2]}>
        <mesh position={[0, 0.04, 0]} castShadow><cylinderGeometry args={[0.04, 0.035, 0.08, 28]} /><M color="#1b1b22" roughness={0.3} metalness={0.2} /></mesh>
        <mesh position={[0, 0.0805, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.034, 24]} /><meshStandardMaterial color="#1a0f0a" roughness={0.2} /></mesh>
        <Tube pts={[[0.04, 0.06, 0], [0.062, 0.058, 0], [0.062, 0.025, 0], [0.04, 0.02, 0]]} r={0.006}><M color="#1b1b22" roughness={0.3} metalness={0.2} /></Tube>
      </group>
    </group>
  )
}

const ROWS = [[...Array(13).fill(1), 2], [1.5, ...Array(12).fill(1), 1.5], [1.75, ...Array(11).fill(1), 2.25], [2.25, ...Array(10).fill(1), 2.75], [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25]]
const capGeometry = () => { // tapered keycap: top face pulled in like a real cherry/OEM profile
  const g = new THREE.BoxGeometry(1, 1, 1), p = g.attributes.position
  for (let i = 0; i < p.count; i++) if (p.getY(i) > 0) { p.setX(i, p.getX(i) * 0.8); p.setZ(i, p.getZ(i) * 0.78) }
  g.computeVertexNormals(); return g
}
export function Keyboard({ reduced, tx }) {
  const P = 0.019, caps = useRef(), glow = useRef()
  const geo = useMemo(capGeometry, [])
  const keys = useMemo(() => ROWS.flatMap((row, r) => { let u = 0; return row.map((w, c) => { const k = { x: (u + w / 2 - 7.5) * P, z: (r - 2) * P, w: w * P - 0.003, accent: (r === 0 && c === 0) || (r === 2 && c === row.length - 1) }; u += w; return k }) }), [])
  const col = useMemo(() => new THREE.Color(), [])
  useLayoutEffect(() => {
    const o = new THREE.Object3D()
    keys.forEach((k, i) => {
      o.position.set(k.x, 0.0295, k.z); o.scale.set(k.w, 0.009, P - 0.003); o.updateMatrix(); caps.current.setMatrixAt(i, o.matrix)
      caps.current.setColorAt(i, col.set(k.accent ? '#3b3475' : '#1d1e27'))
      o.position.y = 0.0246; o.scale.set(k.w + 0.003, 1, P); o.updateMatrix(); glow.current.setMatrixAt(i, o.matrix); glow.current.setColorAt(i, col.setHSL(0.66, 0.9, 0.5))
    })
    caps.current.instanceMatrix.needsUpdate = glow.current.instanceMatrix.needsUpdate = true; caps.current.instanceColor.needsUpdate = true
  }, [keys, col])
  const skip = useRef(0)
  useFrame(({ clock }) => {
    if (reduced || (skip.current++ & 1)) return // update the wave every other frame
    const t = clock.elapsedTime
    keys.forEach((k, i) => glow.current.setColorAt(i, col.setHSL(0.62 + 0.1 * Math.sin(t * 0.8 + k.x * 6 + k.z * 4), 0.9, 0.5)))
    glow.current.instanceColor.needsUpdate = true
  })
  return (
    <group position={[0, DESK_TOP + 0.004, 0.3]} rotation={[-0.05, 0, 0]}>
      <RoundedBox args={[0.355, 0.022, 0.145]} radius={0.006} smoothness={3} position={[0, 0.011, 0]} castShadow><M color="#0b0b10" roughness={0.35} metalness={0.85} /></RoundedBox>
      <mesh position={[0, 0.0235, 0]}><boxGeometry args={[0.338, 0.003, 0.128]} /><M color="#171923" roughness={0.45} metalness={0.8} /></mesh>
      <mesh position={[0, 0.011, -0.0735]}><boxGeometry args={[0.03, 0.01, 0.004]} /><M color="#000" /></mesh>
      <instancedMesh ref={caps} args={[geo, undefined, keys.length]} castShadow><meshPhysicalMaterial color="#ffffff" roughness={0.5} metalness={0.1} clearcoat={0.25} clearcoatRoughness={0.45} /></instancedMesh>
      <instancedMesh ref={glow} args={[undefined, undefined, keys.length]}><boxGeometry args={[1, 0.002, 1]} /><meshBasicMaterial toneMapped={false} /></instancedMesh>
    </group>
  )
}

export function GamingMouse({ rgb }) {
  const shell = <meshStandardMaterial color="#0e0f14" roughness={0.5} metalness={0.3} />
  const grip = <meshStandardMaterial color="#08080b" roughness={1} metalness={0} />
  const gloss = <meshStandardMaterial color="#16171e" roughness={0.22} metalness={0.5} envMapIntensity={1.2} />
  return (
    <group position={[0.4, DESK_TOP + 0.0045, 0.3]} rotation={[0, -0.12, 0]}>
      <mesh position={[0, 0.002, 0]}><boxGeometry args={[0.05, 0.002, 0.088]} /><meshBasicMaterial ref={rgb.reg} toneMapped={false} /></mesh>
      <mesh scale={[0.034, 0.016, 0.058]} position={[0, 0.014, 0]} castShadow><sphereGeometry args={[1, 28, 18]} />{shell}</mesh>
      <mesh scale={[0.031, 0.018, 0.034]} position={[0, 0.017, 0.02]} castShadow><sphereGeometry args={[1, 24, 14]} />{shell}</mesh>
      {[-1, 1].map((s) => <mesh key={`g${s}`} position={[s * 0.0335, 0.013, 0.012]} scale={[0.004, 0.008, 0.034]}><sphereGeometry args={[1, 12, 8]} />{grip}</mesh>)}
      {[-1, 1].map((s) => <RoundedBox key={s} args={[0.022, 0.004, 0.038]} radius={0.002} position={[s * 0.0125, 0.0285, -0.022]} rotation={[0.1, 0, s * 0.04]}>{gloss}</RoundedBox>)}
      {[-1, 1].map((s) => <mesh key={`sw${s}`} position={[s * 0.0125, 0.0245, -0.0415]}><boxGeometry args={[0.012, 0.005, 0.005]} /><meshStandardMaterial color="#1c1e29" roughness={0.4} metalness={0.5} /></mesh>)}
      <mesh position={[0, 0.0295, -0.022]}><boxGeometry args={[0.0016, 0.004, 0.04]} /><meshBasicMaterial color="#000" /></mesh>
      <mesh position={[0, 0.0305, -0.03]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.0062, 0.0062, 0.007, 16]} /><meshStandardMaterial color="#050507" roughness={0.9} /></mesh>
      <mesh position={[0, 0.0305, -0.03]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[0.0066, 0.0007, 6, 20]} /><meshBasicMaterial ref={rgb.reg} toneMapped={false} /></mesh>
      {[-0.005, 0.01].map((z) => <mesh key={z} position={[-0.0352, 0.018, z]}><boxGeometry args={[0.004, 0.006, 0.012]} />{gloss}</mesh>)}
      <mesh position={[0, 0.0357, 0.025]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.005, 20]} /><meshBasicMaterial ref={rgb.reg} toneMapped={false} /></mesh>
    </group>
  )
}

const MIC = [[0.0, 0, 0], [0.012, 0.01, 0.03], [0.012, 0.025, 0.07], [0.0, 0.03, 0.095]]
export function Headphones({ rgb, tx }) {
  const dark = <meshStandardMaterial color="#12121a" roughness={0.45} metalness={0.45} envMapIntensity={1.2} />
  const foam = <meshStandardMaterial map={tx.fabric} color="#2a2c36" roughness={0.95} />
  return (
    <group position={[-1.0, DESK_TOP, 0.1]} rotation={[0, 0.5, 0]}>
      <mesh castShadow position={[0, 0.006, 0]}><cylinderGeometry args={[0.065, 0.07, 0.012, 36]} /><M color="#0d0d12" /></mesh>
      <mesh castShadow position={[0, 0.14, 0]}><cylinderGeometry args={[0.008, 0.01, 0.27, 14]} /><M color="#0d0d12" /></mesh>
      <mesh position={[0, 0.275, 0]} rotation={[0, 0, Math.PI / 2]}><capsuleGeometry args={[0.017, 0.07, 4, 12]} /><M color="#0d0d12" /></mesh>
      <group position={[0, 0.2, 0]}>
        <mesh><torusGeometry args={[0.088, 0.0075, 12, 56, Math.PI]} />{dark}</mesh>
        <mesh rotation={[0, 0, Math.PI / 2 - 0.62]}><torusGeometry args={[0.083, 0.0125, 12, 28, 1.24]} />{foam}</mesh>
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.088, 0, 0]}>
            <mesh position={[0, -0.015, 0]}><boxGeometry args={[0.006, 0.04, 0.012]} />{dark}</mesh>
            <group position={[s * 0.012, -0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
              <mesh castShadow><cylinderGeometry args={[0.046, 0.044, 0.028, 40]} />{dark}</mesh>
              <mesh position={[0, s * 0.0145, 0]}><cylinderGeometry args={[0.036, 0.036, 0.002, 36]} /><meshStandardMaterial color="#2b2e3a" metalness={0.95} roughness={0.3} envMapIntensity={1.3} /></mesh>
              <mesh position={[0, -s * 0.022, 0]} scale={[1, 0.6, 1]}><torusGeometry args={[0.036, 0.0135, 14, 36]} />{foam}</mesh>
              <mesh position={[0, s * 0.0155, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.03, 0.0022, 8, 40]} /><meshBasicMaterial ref={rgb.reg} toneMapped={false} /></mesh>
            </group>
          </group>
        ))}
        <group position={[-0.1, -0.05, 0.01]} rotation={[0, 0, 0]}>
          <Tube pts={MIC} r={0.0022}><M color="#0d0d12" roughness={0.5} /></Tube>
          <mesh position={[0, 0.03, 0.098]} scale={[1, 1, 1.5]}><sphereGeometry args={[0.0075, 12, 10]} /><meshStandardMaterial color="#0a0a0d" roughness={1} /></mesh>
        </group>
      </group>
    </group>
  )
}

// Cables run flat along the desk into the back raceway.
const RACE_Z = -0.4, y0 = DESK_TOP + 0.003
const CABLES = [
  { r: 0.0032, pts: [[0, y0 + 0.012, 0.228], [0, y0 + 0.003, 0.12], [0.1, y0, -0.05], [0.2, y0, -0.25], [0.26, y0 + 0.01, RACE_Z]] },
  { r: 0.0026, pts: [[0.4, y0 + 0.016, 0.242], [0.43, y0 + 0.004, 0.14], [0.47, y0, -0.05], [0.47, y0, -0.22], [0.46, y0 + 0.01, RACE_Z]] },
  { r: 0.004, pts: [[0, y0 + 0.01, -0.16], [0.02, y0, -0.25], [-0.04, y0 + 0.006, RACE_Z]] },
  { r: 0.004, pts: [[-0.8, y0 + 0.01, -0.06], [-0.78, y0, -0.2], [-0.7, y0 + 0.006, RACE_Z]] },
  { r: 0.004, pts: [[0.8, y0 + 0.01, -0.06], [0.82, y0, -0.2], [0.9, y0 + 0.006, RACE_Z]] },
  { r: 0.006, pts: [[1.2, y0 + 0.02, -0.35], [1.08, y0 + 0.004, -0.4], [0.95, y0 + 0.012, RACE_Z]] },
  { r: 0.0048, pts: [[1.28, y0 + 0.03, -0.38], [1.1, y0 + 0.003, -0.42], [1.0, y0 + 0.016, RACE_Z]] }
]
export function Cables() {
  return <>{CABLES.map((c, i) => <Tube key={i} pts={c.pts} r={c.r}><meshStandardMaterial color={i === 5 ? '#08080b' : '#0d0e13'} roughness={0.75} metalness={0.05} /></Tube>)}</>
}
