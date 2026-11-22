import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, PerformanceMonitor, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { quadToMatrix3d } from './lib/homography'
import { BASE_T, CENTER, DESK_TOP, SCREEN, STAND_H, framing, monitorY, smooth } from './lib/director'
import { createScreen } from './screens'
import { makeRgb, makeTextures } from './scene/rgb'
import Pc from './scene/Pc'
import { AO, Cables, Desk, GamingMouse, Headphones, Keyboard, Room } from './scene/Desk'

const DARK = { color: '#101015', roughness: 0.35, metalness: 0.75 }
const vp = new THREE.Vector3(), look = new THREE.Vector3()

/* Camera rig: ONE controller. Timeline camera + damped mouse parallax (fades out while entering) + iframe projection. */
function Rig({ director, screenRef, wrapRef, reduced, coarse }) {
  const { camera, size } = useThree()
  const ptr = useRef({ x: 0, y: 0, lx: 0, ly: 0, idle: 0 })
  useEffect(() => { director.build(framing(size.width / size.height, camera.fov)) }, [director, size.width, size.height, camera])
  useFrame((state, dt) => {
    dt = Math.min(dt, 0.05)
    director.step(dt)
    const c = director.cam, p = director.p, s = ptr.current
    const w = reduced ? 0 : 1 - smooth(0, 0.45, p)
    let tx = 0, ty = 0
    if (coarse) tx = Math.sin(state.clock.elapsedTime * 0.25) * 0.5
    else {
      const mx = state.pointer.x, my = state.pointer.y
      s.idle = Math.abs(mx - s.lx) + Math.abs(my - s.ly) > 1e-4 ? 0 : s.idle + dt
      s.lx = mx; s.ly = my
      const live = 1 - smooth(1.2, 3, s.idle) // mouse stopped -> influence eases to 0 -> camera settles to rest
      tx = mx * live; ty = my * live
    }
    const k = 1 - Math.exp(-dt * 3)
    s.x += (tx - s.x) * k; s.y += (ty - s.y) * k
    camera.position.set(c.px + s.x * 0.45 * w, c.py + s.y * 0.18 * w, c.pz)
    look.set(c.tx + s.x * 0.1 * w, c.ty + s.y * 0.05 * w, c.tz)
    camera.position.y = Math.max(camera.position.y, DESK_TOP + 0.35) // never dips into the desk or monitors
    camera.lookAt(look)
    if (camera.fov !== c.fov) { camera.fov = c.fov; camera.updateProjectionMatrix() }
    camera.updateMatrixWorld()
    document.documentElement.style.setProperty('--p', p.toFixed(4))

    const el = wrapRef.current, scr = screenRef.current
    if (!el || !scr) return
    if (director.inside || p >= 0.985) { if (el.style.transform !== 'none') el.style.transform = 'none'; return }
    const W = size.width, H = size.height, a = W / H, sa = SCREEN.w / SCREEN.h
    const cw = a > sa ? SCREEN.w : SCREEN.h * a, ch = a > sa ? SCREEN.w / a : SCREEN.h
    const sb = smooth(0.78, 0.97, p)
    const corners = [[-cw / 2, ch / 2], [cw / 2, ch / 2], [cw / 2, -ch / 2], [-cw / 2, -ch / 2]]
    const full = [[0, 0], [W, 0], [W, H], [0, H]]
    scr.updateWorldMatrix(true, false)
    const q = corners.map(([x, y], i) => {
      vp.set(x, y, 0); scr.localToWorld(vp); vp.project(camera)
      const px = (vp.x * 0.5 + 0.5) * W, py = (-vp.y * 0.5 + 0.5) * H
      return [px + (full[i][0] - px) * sb, py + (full[i][1] - py) * sb]
    })
    el.style.transform = quadToMatrix3d(q, W, H)
  })
  return null
}

/* Single animation callback for RGB, fan spin (delta-time) and the throttled side-screen repaint. */
function Loop({ rgb, screens, reduced }) {
  const acc = useRef(0)
  useEffect(() => { document.fonts?.ready.then(() => screens.forEach((s) => s.draw(0))) }, [screens])
  useFrame(({ clock }, dt) => {
    dt = Math.min(dt, 0.05)
    rgb.update(clock.elapsedTime, dt, reduced)
    if (reduced) return
    acc.current += dt
    if (acc.current >= 1 / 12) { acc.current = 0; screens.forEach((s) => s.draw(clock.elapsedTime)) }
  })
  return null
}

function Monitor({ x, z, ry, w, h, children, screenRef, hoverRef, onActivate, interactive, tx, tint }) {
  const rim = useRef()
  useFrame((_, dt) => { if (rim.current) rim.current.opacity += ((hoverRef?.current ? 0.7 : 0) - rim.current.opacity) * (1 - Math.exp(-dt * 8)) })
  const ev = interactive ? {
    onPointerOver: (e) => { e.stopPropagation(); hoverRef.current = true; document.body.style.cursor = 'pointer' },
    onPointerOut: () => { hoverRef.current = false; document.body.style.cursor = '' },
    onClick: (e) => { e.stopPropagation(); onActivate() }
  } : {}
  const baseY = -(h / 2 + STAND_H + BASE_T)
  return (
    <>
      <AO x={x} z={z - 0.03} w={0.55} d={0.4} ry={-ry} tx={tx} />
      <group position={[x, monitorY(h), z]} rotation={[0, ry, 0]} {...ev}>
        <RoundedBox args={[w + 0.022, h + 0.022, 0.02]} radius={0.007} smoothness={3} castShadow><meshStandardMaterial {...DARK} /></RoundedBox>
        <RoundedBox args={[w * 0.62, h * 0.72, 0.05]} radius={0.012} smoothness={3} position={[0, 0, -0.034]} castShadow><meshStandardMaterial color="#14151b" roughness={0.45} metalness={0.5} /></RoundedBox>
        <mesh position={[0, -(h / 2 + STAND_H / 2), -0.058]} castShadow><boxGeometry args={[0.046, STAND_H + 0.03, 0.018]} /><meshStandardMaterial color="#1b1c24" roughness={0.3} metalness={0.9} /></mesh>
        <mesh position={[0, -(h / 2 + 0.02), -0.056]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.014, 0.014, 0.06, 16]} /><meshStandardMaterial color="#22232c" roughness={0.3} metalness={0.9} /></mesh>
        <mesh position={[0, baseY + BASE_T / 2, -0.03]} castShadow><cylinderGeometry args={[0.04, 0.045, BASE_T, 28]} /><meshStandardMaterial color="#1b1c24" roughness={0.3} metalness={0.9} /></mesh>
        {[-1, 1].map((sg) => <RoundedBox key={sg} args={[0.032, BASE_T, 0.25]} radius={0.005} smoothness={2} position={[sg * Math.sin(0.55) * 0.125, baseY + BASE_T / 2, -0.03 + Math.cos(0.55) * 0.125]} rotation={[0, sg * 0.55, 0]} castShadow><meshStandardMaterial color="#1b1c24" roughness={0.3} metalness={0.9} /></RoundedBox>)}
        <mesh position={[w / 2 - 0.02, -(h / 2 + 0.006), 0.0102]}><boxGeometry args={[0.006, 0.0025, 0.0006]} /><meshBasicMaterial color="#22d3ee" toneMapped={false} /></mesh>
        <group ref={screenRef} position={[0, 0, 0.0105]}>
          {children}
          <mesh position={[0, 0, 0.0007]}><planeGeometry args={[w, h]} /><meshPhysicalMaterial color="#ffffff" transparent opacity={0.07} roughness={0.04} metalness={0} clearcoat={1} clearcoatRoughness={0.03} envMapIntensity={1.6} depthWrite={false} /></mesh>
          <mesh position={[0, 0, 0.0004]}><planeGeometry args={[w, h]} /><meshBasicMaterial map={tx.streak} transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>
        </group>
        {interactive && <mesh position={[0, 0, -0.02]}><planeGeometry args={[w + 0.075, h + 0.075]} /><meshBasicMaterial ref={rim} color="#22d3ee" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>}
        <pointLight position={[0, -h * 0.25, 0.5]} intensity={0.9} color={tint} distance={1.8} />
      </group>
    </>
  )
}

export default function Workstation({ director, wrapRef, inside, onReady, tier, reduced, onCenterClick }) {
  const screenRef = useRef(), hover = useRef(false)
  const [dpr, setDpr] = useState(tier === 'low' ? 1 : [1, 1.75])
  const coarse = tier === 'low'
  const rgb = useMemo(makeRgb, [])
  const tx = useMemo(makeTextures, [])
  const screens = useMemo(() => [createScreen('career', tier === 'low' ? 0.75 : 1), createScreen('projects', tier === 'low' ? 0.75 : 1)], [tier])
  useEffect(() => () => { screens.forEach((s) => s.dispose()); Object.values(tx).forEach((t) => t.dispose()); document.body.style.cursor = '' }, [screens, tx])
  const [cx, , cz] = CENTER
  return (
    <Canvas shadows dpr={dpr} frameloop={inside ? 'never' : 'always'} camera={{ fov: 38, near: 0.05, far: 40, position: [0, 1.4, 2.4] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }} style={{ touchAction: 'none' }}
      onCreated={({ scene, gl }) => { gl.toneMappingExposure = 1.2; scene.background = new THREE.Color('#08080d'); scene.fog = new THREE.Fog('#08080d', 6, 15); requestAnimationFrame(() => requestAnimationFrame(onReady)) }}>
      <PerformanceMonitor onDecline={() => setDpr(1)} />
      <Rig director={director} screenRef={screenRef} wrapRef={wrapRef} reduced={reduced} coarse={coarse} />
      <Loop rgb={rgb} screens={screens} reduced={reduced} />
      <ambientLight intensity={0.22} />
      <hemisphereLight args={['#8fa6ff', '#14141c', 0.45]} />
      <spotLight position={[1.4, 2.8, 2.4]} angle={0.55} penumbra={1} intensity={55} color="#e4e9ff" castShadow shadow-mapSize={tier === 'low' ? [512, 512] : [1024, 1024]} shadow-bias={-0.0004} shadow-camera-near={0.8} shadow-camera-far={7} />
      <pointLight position={[-1.6, 1.3, 0.8]} intensity={6} color="#8b5cf6" distance={5.5} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={1.4} color="#8b5cf6" position={[-4, 2, -2]} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#22d3ee" position={[4, 2, -2]} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={1.0} color="#ffffff" position={[0, 5, 2]} scale={[6, 1, 1]} />
      </Environment>
      <Room tier={tier} tx={tx} />
      <Desk tx={tx} />
      <ContactShadows position={[0, DESK_TOP + 0.003, 0.05]} scale={[2.9, 1.1]} far={0.8} blur={2.4} opacity={0.6} />
      <Monitor x={cx} z={cz} ry={0} w={SCREEN.w} h={SCREEN.h} screenRef={screenRef} hoverRef={hover} interactive onActivate={onCenterClick} tx={tx} tint="#7fb2ff">
        <mesh><planeGeometry args={[SCREEN.w, SCREEN.h]} /><meshBasicMaterial color="#05060c" toneMapped={false} /></mesh>
      </Monitor>
      {[[-1, 0, '#6aa8ff'], [1, 1, '#a78bfa']].map(([s, i, tint]) => (
        <Monitor key={s} x={s * 0.8} z={0} ry={-s * 0.4} w={0.66} h={0.37} tx={tx} tint={tint}>
          <mesh><planeGeometry args={[0.66, 0.37]} /><meshBasicMaterial map={screens[i].texture} toneMapped={false} /></mesh>
        </Monitor>
      ))}
      <AO x={0} z={0.3} w={0.55} d={0.3} tx={tx} /><AO x={0.4} z={0.3} w={0.12} d={0.18} tx={tx} o={0.6} /><AO x={1.3} z={-0.05} w={0.6} d={0.7} ry={0.38} tx={tx} /><AO x={-1.0} z={0.1} w={0.24} d={0.24} tx={tx} />
      <Keyboard reduced={reduced} tx={tx} />
      <GamingMouse rgb={rgb} />
      <Headphones rgb={rgb} tx={tx} />
      <Pc rgb={rgb} tx={tx} low={tier === 'low'} />
      <Cables />
    </Canvas>
  )
}
