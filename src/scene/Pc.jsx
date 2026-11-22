import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { DESK_TOP } from '../lib/director'

const M = (p) => <meshStandardMaterial roughness={0.4} metalness={0.7} {...p} />
const METAL = { color: '#2b2e3a', metalness: 0.95, roughness: 0.28, envMapIntensity: 1.3 }

export function Tube({ pts, r = 0.003, children, ...rest }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), [pts])
  return <mesh castShadow {...rest}><tubeGeometry args={[curve, 40, r, 8, false]} />{children}</mesh>
}

// Nine pitched blades merged into ONE geometry shared by every fan. Axis = +Z, centred on the origin,
// so rotating the parent group spins the blades about the fan's real centre.
let blades
const bladeGeo = () => {
  if (!blades) {
    const gs = Array.from({ length: 9 }, (_, i) => { const g = new THREE.BoxGeometry(0.05, 0.018, 0.0025); g.translate(0.037, 0, 0); g.rotateX(0.5); g.rotateZ((i * Math.PI * 2) / 9); return g })
    blades = mergeGeometries(gs); gs.forEach((g) => g.dispose())
  }
  return blades
}
export function Fan({ r = 0.062, rgb }) {
  const k = r / 0.062
  return (
    <group>
      <mesh position={[0, 0, -0.006]}><boxGeometry args={[2 * r + 0.008, 2 * r + 0.008, 0.012]} /><M color="#0c0d12" roughness={0.5} metalness={0.5} /></mesh>
      <mesh position={[0, 0, 0.003]}><torusGeometry args={[r * 0.97, 0.004, 8, 40]} /><meshBasicMaterial ref={rgb.reg} toneMapped={false} /></mesh>
      <group ref={rgb.fan}>
        <mesh geometry={bladeGeo()} scale={k} dispose={null}><M color="#1a1c25" roughness={0.35} metalness={0.4} side={THREE.DoubleSide} /></mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.002]}><cylinderGeometry args={[0.014 * k, 0.014 * k, 0.008, 20]} /><M color="#0a0a0e" roughness={0.3} metalness={0.8} /></mesh>
        <mesh position={[0, 0, 0.0065]}><circleGeometry args={[0.007 * k, 20]} /><meshBasicMaterial ref={rgb.reg} toneMapped={false} /></mesh>
      </group>
    </group>
  )
}

// Many identical small parts as ONE draw call. items: [x, y, z, sx, sy, sz]
function Instanced({ items, geometry, material }) {
  const ref = useRef()
  useLayoutEffect(() => {
    const o = new THREE.Object3D()
    items.forEach(([x, y, z, sx, sy, sz], i) => { o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.updateMatrix(); ref.current.setMatrixAt(i, o.matrix) })
    ref.current.instanceMatrix.needsUpdate = true
  }, [items])
  return <instancedMesh ref={ref} args={[undefined, undefined, items.length]} castShadow>{geometry}{material}</instancedMesh>
}
const range = (n, f) => Array.from({ length: n }, (_, i) => f(i))
const FINS = range(34, (i) => [-0.125 + i * 0.0076, 0.0335, 0, 0.0016, 0.007, 0.034])      // GPU heatsink fin stack
const CAPS = range(26, (i) => [-0.205 + (i % 13) * 0.0058, 0.012 + Math.floor(i / 13) * 0.0075, 0.0105, 0.0042, 0.0042, 0.011]) // motherboard capacitors
const WIRES = range(14, (i) => [0.056 + (i % 7) * 0.0023, 0.0, 0.0125 + Math.floor(i / 7) * 0.0026, 0.0017, 0.11, 0.0017]) // 24-pin bundle
const SLOTS = [-0.03, -0.0185, -0.007, 0.0045].map((u) => [u + 0.0, 0.115, 0.0085, 0.0035, 0.108, 0.006])
const BOARD_GLOWS = [[-0.06, -0.085, 0.16], [0.14, 0.015, 0.34], [-0.12, 0.09, 0.12], [-0.0, 0.115, 0.14]]

// Face frame inside the glass: u = right (towards the case front), v = up, w = out towards the glass.
const CPU_TUBES = [[[-0.14, 0.114, 0.03], [-0.158, 0.16, 0.045], [-0.145, 0.197, 0.045]], [[-0.1, 0.114, 0.03], [-0.085, 0.16, 0.045], [-0.09, 0.197, 0.045]]]
const PSU_CABLES = [[[-0.14, -0.16, 0.012], [-0.17, -0.12, 0.02], [-0.15, -0.09, 0.03]], [[-0.1, -0.16, 0.012], [-0.07, -0.12, 0.022], [-0.04, -0.095, 0.03]], [[-0.02, -0.16, 0.012], [0.04, -0.1, 0.014], [0.062, -0.05, 0.014]], [[-0.19, -0.16, 0.012], [-0.215, -0.02, 0.014], [-0.212, 0.15, 0.014], [-0.19, 0.2, 0.014]]]

export default function Pc({ rgb, tx, low }) {
  const fins = useMemo(() => FINS, []), caps = useMemo(() => CAPS, [])
  return (
    <group position={[1.3, DESK_TOP + 0.245, -0.05]} rotation={[0, 0.38, 0]}>
      {/* shell */}
      <mesh position={[0.107, 0, 0]} castShadow><boxGeometry args={[0.006, 0.47, 0.44]} /><M color="#0d0d12" /></mesh>
      <mesh position={[0, 0.231, 0]} castShadow><boxGeometry args={[0.22, 0.008, 0.44]} /><M color="#0d0d12" /></mesh>
      <mesh position={[0, -0.231, 0]} castShadow><boxGeometry args={[0.22, 0.008, 0.44]} /><M color="#0d0d12" /></mesh>
      <mesh position={[0, 0, -0.217]} castShadow><boxGeometry args={[0.22, 0.47, 0.006]} /><M color="#0d0d12" /></mesh>
      <mesh position={[0, 0, 0.213]} castShadow><boxGeometry args={[0.22, 0.47, 0.014]} /><M color="#08080c" roughness={0.5} /></mesh>
      {Array.from({ length: 10 }, (_, i) => <mesh key={`t${i}`} position={[0, 0.2355, -0.17 + i * 0.038]}><boxGeometry args={[0.15, 0.002, 0.014]} /><meshBasicMaterial color="#000" /></mesh>)}
      {/* front: perforated mesh intake, metal dividers, RGB strip */}
      <mesh position={[0, -0.02, 0.2203]}><planeGeometry args={[0.2, 0.39]} /><meshStandardMaterial map={tx.grill} roughness={0.5} metalness={0.8} /></mesh>
      {[-0.1, 0.1].map((x) => <mesh key={x} position={[x, 0, 0.2215]}><boxGeometry args={[0.008, 0.47, 0.004]} /><M {...METAL} /></mesh>)}
      <mesh position={[-0.094, -0.02, 0.2222]}><boxGeometry args={[0.003, 0.39, 0.002]} /><meshBasicMaterial ref={rgb.reg} toneMapped={false} /></mesh>
      {/* front I/O: power button, USB-A/USB-C, headphone + mic jacks */}
      <mesh position={[0, 0.2, 0.2235]}><boxGeometry args={[0.2, 0.03, 0.005]} /><M {...METAL} color="#1a1c26" /></mesh>
      <mesh position={[0.07, 0.2, 0.2265]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.0085, 0.0085, 0.004, 24]} /><M color="#0a0a0e" metalness={0.9} roughness={0.25} /></mesh>
      <mesh position={[0.07, 0.2, 0.2287]}><torusGeometry args={[0.0075, 0.0009, 8, 24]} /><meshBasicMaterial ref={rgb.reg} toneMapped={false} /></mesh>
      {[-0.07, -0.05].map((x) => <group key={x} position={[x, 0.2, 0.2262]}><mesh><boxGeometry args={[0.0125, 0.0055, 0.003]} /><M color="#c9ccd6" metalness={1} roughness={0.3} /></mesh><mesh position={[0, 0, 0.0017]}><boxGeometry args={[0.0095, 0.0022, 0.0006]} /><meshBasicMaterial color="#1d4ed8" /></mesh></group>)}
      <mesh position={[-0.026, 0.2, 0.2262]}><boxGeometry args={[0.0085, 0.0035, 0.003]} /><M color="#c9ccd6" metalness={1} roughness={0.3} /></mesh>
      {[-0.002, 0.016].map((x) => <group key={x} position={[x, 0.2, 0.2262]}><mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.0042, 0.0042, 0.003, 16]} /><M color="#b9bcc8" metalness={1} roughness={0.3} /></mesh><mesh position={[0, 0, 0.0017]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.0022, 0.0022, 0.0006, 12]} /><meshBasicMaterial color="#000" /></mesh></group>)}
      {[[-0.09, -0.19], [0.09, -0.19], [-0.09, 0.19], [0.09, 0.19]].map(([x, z]) => <mesh key={`${x}${z}`} position={[x, -0.2455, z]}><cylinderGeometry args={[0.012, 0.014, 0.011, 12]} /><M color="#050507" roughness={0.8} metalness={0.1} /></mesh>)}
      {/* metallic glass frame */}
      {[0.225, -0.225].map((y) => <mesh key={`gy${y}`} position={[-0.111, y, 0]}><boxGeometry args={[0.012, 0.012, 0.44]} /><M {...METAL} /></mesh>)}
      {[-0.212, 0.2].map((z) => <mesh key={`gz${z}`} position={[-0.111, 0, z]}><boxGeometry args={[0.012, 0.46, 0.012]} /><M {...METAL} /></mesh>)}

      {/* internals on the motherboard tray */}
      <group position={[-0.04, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 0, 0.001]}><planeGeometry args={[0.43, 0.46]} /><meshStandardMaterial color="#05060a" roughness={0.9} side={THREE.DoubleSide} /></mesh>
        <mesh position={[-0.065, 0.03, 0.004]}><boxGeometry args={[0.27, 0.3, 0.004]} /><meshStandardMaterial map={tx.pcb} roughness={0.5} metalness={0.4} /></mesh>
        <mesh position={[0.0705, 0.03, 0.0065]}><boxGeometry args={[0.0022, 0.29, 0.0022]} /><meshBasicMaterial ref={rgb.reg} toneMapped={false} /></mesh>
        {/* VRM heatsinks with fins, I/O cover, M.2 shield, chipset */}
        <mesh position={[-0.165, 0.158, 0.016]}><boxGeometry args={[0.075, 0.03, 0.022]} /><M {...METAL} color="#1a1d27" /></mesh>
        <mesh position={[-0.19, 0.08, 0.016]}><boxGeometry args={[0.025, 0.13, 0.022]} /><M {...METAL} color="#1a1d27" /></mesh>
        {range(8, (i) => <mesh key={i} position={[-0.19 + 0.0, 0.025 + i * 0.016, 0.0275]}><boxGeometry args={[0.025, 0.0016, 0.006]} /><M color="#2b2e3a" metalness={0.9} roughness={0.3} /></mesh>)}
        <mesh position={[-0.1, -0.012, 0.011]}><boxGeometry args={[0.08, 0.016, 0.01]} /><M {...METAL} color="#1c1f2b" /></mesh>
        <mesh position={[-0.05, -0.04, 0.012]}><boxGeometry args={[0.07, 0.055, 0.012]} /><M {...METAL} color="#1c1f2b" /></mesh>
        <mesh position={[-0.05, -0.04, 0.0185]}><boxGeometry args={[0.05, 0.003, 0.002]} /><meshBasicMaterial ref={rgb.reg} toneMapped={false} /></mesh>
        {!low && <Instanced items={caps} geometry={<cylinderGeometry args={[0.5, 0.5, 1, 10]} />} material={<M color="#2a2d38" metalness={0.9} roughness={0.35} />} />}
        {/* CPU water block, top radiator, fittings, coolant tubes */}
        <group position={[-0.12, 0.09, 0.012]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.036, 0.036, 0.03, 32]} /><M color="#0c0d12" roughness={0.3} metalness={0.9} /></mesh>
          <mesh position={[0, 0, 0.0155]}><torusGeometry args={[0.027, 0.0025, 8, 32]} /><meshBasicMaterial ref={rgb.reg} toneMapped={false} /></mesh>
          <mesh position={[0, 0, 0.0152]}><circleGeometry args={[0.022, 32]} /><meshStandardMaterial color="#05060a" metalness={1} roughness={0.15} /></mesh>
          {[-0.02, 0.02].map((x) => <mesh key={x} position={[x, 0.034, 0.012]}><cylinderGeometry args={[0.0095, 0.0095, 0.012, 14]} /><M {...METAL} /></mesh>)}
        </group>
        <mesh position={[-0.07, 0.2175, 0.035]}><boxGeometry args={[0.26, 0.026, 0.05]} /><M color="#0f1017" roughness={0.45} metalness={0.8} /></mesh>
        {[-0.145, -0.09].map((u) => <mesh key={u} position={[u, 0.2, 0.045]}><cylinderGeometry args={[0.0095, 0.0095, 0.012, 14]} /><M {...METAL} /></mesh>)}
        {CPU_TUBES.map((pts, i) => <Tube key={i} pts={pts} r={0.0075}><meshStandardMaterial color="#0a1118" emissive="#22d3ee" emissiveIntensity={0.55} roughness={0.2} metalness={0.2} ref={rgb.reg} /></Tube>)}
        {/* RAM on slots */}
        <Instanced items={SLOTS} geometry={<boxGeometry args={[1, 1, 1]} />} material={<M color="#080a10" roughness={0.6} metalness={0.3} />} />
        {[0, 1, 2, 3].map((i) => (
          <group key={i} position={[-0.03 + i * 0.0115, 0.115, 0.012]}>
            <mesh><boxGeometry args={[0.009, 0.1, 0.012]} /><M {...METAL} color="#171a24" /></mesh>
            <mesh position={[0, 0.0455, 0.0066]}><boxGeometry args={[0.0075, 0.011, 0.002]} /><meshBasicMaterial ref={rgb.reg} toneMapped={false} /></mesh>
          </group>
        ))}
        {/* GPU: shroud, fin stack, heat pipes, fans */}
        <group position={[-0.06, -0.085, 0.03]}>
          <mesh castShadow><boxGeometry args={[0.27, 0.058, 0.04]} /><M color="#0f1017" roughness={0.35} metalness={0.8} /></mesh>
          <mesh position={[0.0, 0.0, 0.0203]} rotation={[0, 0, 0.35]}><boxGeometry args={[0.012, 0.075, 0.0012]} /><M {...METAL} /></mesh>
          <mesh position={[0.135, 0, 0.0203]}><boxGeometry args={[0.004, 0.058, 0.0012]} /><M {...METAL} /></mesh>
          {[-0.088, 0, 0.088].map((u) => <group key={u} position={[u, 0, 0.0204]}><Fan r={0.023} rgb={rgb} /></group>)}
          <mesh position={[0, 0.0295, 0.0]}><boxGeometry args={[0.27, 0.002, 0.04]} /><meshBasicMaterial ref={rgb.reg} toneMapped={false} /></mesh>
          <Instanced items={fins} geometry={<boxGeometry args={[1, 1, 1]} />} material={<M color="#3a3d4a" metalness={0.9} roughness={0.35} />} />
          {[-0.008, 0, 0.008].map((w) => <mesh key={w} position={[0, 0.0385, w]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.0026, 0.0026, 0.25, 10]} /><M color="#b87333" metalness={1} roughness={0.28} /></mesh>)}
        </group>
        {/* PSU compartment with vents */}
        <mesh position={[-0.06, -0.185, 0.016]}><boxGeometry args={[0.28, 0.05, 0.03]} /><M color="#0b0c11" roughness={0.5} /></mesh>
        {Array.from({ length: 9 }, (_, i) => <mesh key={i} position={[-0.17 + i * 0.026, -0.185, 0.0312]}><boxGeometry args={[0.005, 0.034, 0.001]} /><meshBasicMaterial color="#000" /></mesh>)}
        {PSU_CABLES.map((pts, i) => <Tube key={i} pts={pts} r={0.0042}><M color="#08080b" roughness={0.7} metalness={0.1} /></Tube>)}
        {!low && <><Instanced items={WIRES} geometry={<boxGeometry args={[1, 1, 1]} />} material={<M color="#0a0a0d" roughness={0.8} metalness={0.05} />} />
          {[-0.04, 0.04].map((v) => <mesh key={v} position={[0.0615, v, 0.0145]}><boxGeometry args={[0.02, 0.008, 0.006]} /><M color="#15161d" roughness={0.6} /></mesh>)}</>}
        {[0.15, 0.015, -0.12].map((v) => <group key={v} position={[0.14, v, 0.012]}><Fan rgb={rgb} /></group>)}
        {/* soft RGB diffusion behind GPU / fans / CPU / RAM (additive, low opacity) */}
        {!low && BOARD_GLOWS.map(([u, v, s], i) => <mesh key={i} position={[u, v, 0.008]}><planeGeometry args={[s, s * (i === 1 ? 2.4 : 1)]} /><meshBasicMaterial ref={rgb.reg} map={tx.glow} transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>)}
      </group>

      {/* tempered glass, reflection streak, cyan spill light */}
      <mesh position={[-0.113, 0, 0]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[0.43, 0.46]} /><meshPhysicalMaterial color="#b9c6ff" transparent opacity={0.09} roughness={0.03} metalness={0} clearcoat={1} clearcoatRoughness={0.02} envMapIntensity={1.6} depthWrite={false} /></mesh>
      <mesh position={[-0.1135, 0, 0]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[0.43, 0.46]} /><meshBasicMaterial map={tx.streak} transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>
      <pointLight ref={rgb.light} position={[-0.28, -0.05, 0.02]} intensity={2.6} distance={2.6} color="#22d3ee" />
    </group>
  )
}
