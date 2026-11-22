import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import HeroScene from '../scenes/HeroScene'
import { SCENE_POS, camCurve, lookCurve, pointerState } from '../scenes/cameraPath'
import { scrollState, useDeviceTier, usePrefersReducedMotion } from '../hooks/useScrollAnimation'

const pos = new THREE.Vector3(), tgt = new THREE.Vector3(), look = new THREE.Vector3(0, 0.6, 0)

// Camera travels along the curve as the page scrolls; pointer adds slight parallax.
function CameraRig({ reduced }) {
  const baseFov = useRef(0), prevU = useRef(0)
  useFrame((state, d) => {
    const t = THREE.MathUtils.clamp(scrollState.progress, 0, 1)
    camCurve.getPoint(t, pos); lookCurve.getPoint(t, tgt)
    if (!reduced) { pos.x += pointerState.x * 0.6; pos.y += pointerState.y * 0.3 }
    const k = reduced ? 1 : 1 - Math.exp(-d * 4)
    state.camera.position.lerp(pos, k); look.lerp(tgt, k)
    state.camera.lookAt(look)
    // Scroll-speed "warp": the field of view stretches slightly while travelling fast, then settles.
    if (!reduced) {
      if (!baseFov.current) baseFov.current = state.camera.fov
      const v = Math.abs(scrollState.u - prevU.current) / Math.max(d, 0.001)
      const target = baseFov.current + Math.min(v * 4, 7)
      state.camera.fov += (target - state.camera.fov) * (1 - Math.exp(-d * 6)); state.camera.updateProjectionMatrix()
    }
    prevU.current = scrollState.u
  })
  return null
}

// Background, fog and ambient light blend between per-section moods as the camera travels.
const col = (a) => a.map((c) => new THREE.Color(c))
const BG = col(['#04060f', '#050a1e', '#0a0720', '#04101f', '#050b1e', '#07091f', '#140c04', '#060818'])
const AMB = col(['#8fb0ff', '#8fb0ff', '#b79cff', '#8fd8ff', '#8fb0ff', '#9fb0ff', '#ffd9a0', '#8fb0ff'])
const mix = new THREE.Color()
function SceneMood() {
  const amb = useRef()
  useFrame(({ scene }) => {
    const u = THREE.MathUtils.clamp(scrollState.u, 0, 7), i = Math.min(Math.floor(u), 6), f = u - i
    mix.lerpColors(BG[i], BG[i + 1], f)
    if (scene.background?.isColor) scene.background.copy(mix)
    if (scene.fog) scene.fog.color.copy(mix)
    if (amb.current) amb.current.color.lerpColors(AMB[i], AMB[i + 1], f)
  })
  return <ambientLight ref={amb} intensity={0.5} />
}

// With reduced motion the canvas only renders on demand, so redraw when the page scrolls or resizes.
function Invalidate({ active }) {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    if (!active) return
    const f = () => invalidate()
    f(); addEventListener('scroll', f, { passive: true }); addEventListener('resize', f)
    return () => { removeEventListener('scroll', f); removeEventListener('resize', f) }
  }, [active, invalidate])
  return null
}

// Dust that trails the camera with a lag, so flying through it reads as depth.
function Dust({ tier }) {
  const g = useRef()
  useFrame(({ camera }, d) => { g.current?.position.lerp(camera.position, 1 - Math.exp(-d * 1.2)) })
  return <group ref={g}><Sparkles count={tier === 'high' ? 140 : tier === 'medium' ? 80 : 40} scale={[28, 14, 28]} size={2.2} speed={0.25} opacity={0.55} color="#7dd3fc" /></group>
}

// Procedural studio lighting for reflections (light panels, no HDR download).
function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" intensity={2} color="#22d3ee" position={[-5, 3, -4]} scale={[8, 3, 1]} />
      <Lightformer form="rect" intensity={1.6} color="#8b5cf6" position={[5, 2, -3]} scale={[6, 3, 1]} />
      <Lightformer form="ring" intensity={1.2} color="#ffffff" position={[0, 6, 0]} scale={4} rotation-x={Math.PI / 2} />
      <Lightformer form="rect" intensity={1.5} color="#ffd9a0" position={[0, 1, 6]} scale={[10, 2, 1]} />
    </Environment>
  )
}

function Starfield({ count }) {
  const geo = useMemo(() => {
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) { p[i * 3] = (Math.random() - 0.5) * 90; p[i * 3 + 1] = (Math.random() - 0.5) * 50; p[i * 3 + 2] = 20 - Math.random() * 210 }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); return g
  }, [count])
  useEffect(() => () => geo.dispose(), [geo])
  return <points geometry={geo}><pointsMaterial size={0.12} color="#c9d3e6" transparent opacity={0.55} depthWrite={false} sizeAttenuation /></points>
}

const AboutScene = lazy(() => import('../scenes/AboutScene'))
const SkillsScene = lazy(() => import('../scenes/SkillsScene'))
const ProjectsScene = lazy(() => import('../scenes/ProjectsScene'))
const JourneyScene = lazy(() => import('../scenes/JourneyScene'))
const EducationScene = lazy(() => import('../scenes/EducationScene'))
const SportsScene = lazy(() => import('../scenes/SportsScene'))
const ContactScene = lazy(() => import('../scenes/ContactScene'))

// Places a scene at its section and hides it when the camera is far away (skips rendering).
function Zone({ at, dx = 0, children }) {
  const g = useRef()
  useFrame(({ camera }) => { if (g.current) g.current.visible = Math.abs(camera.position.z - at[2]) < 45 })
  return <group ref={g} position={[at[0] + dx, at[1], at[2]]}>{children}</group>
}

export default function Universe() {
  const tier = useDeviceTier()
  const reduced = usePrefersReducedMotion()
  const maxDpr = tier === 'high' ? 2 : tier === 'medium' ? 1.5 : 1.25
  const [quality, setQuality] = useState(2) // adaptive: PerformanceMonitor lowers it when frames drop
  useEffect(() => {
    const m = (e) => { pointerState.x = (e.clientX / innerWidth) * 2 - 1; pointerState.y = -((e.clientY / innerHeight) * 2 - 1) }
    addEventListener('pointermove', m, { passive: true }); return () => removeEventListener('pointermove', m)
  }, [])
  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none">
      <Canvas dpr={Math.min(quality, maxDpr)} frameloop={reduced ? 'demand' : 'always'}
        camera={{ fov: tier === 'low' ? 70 : 55, position: [0, 1.2, 9], near: 0.1, far: 260 }}
        gl={{ antialias: tier === 'high', powerPreference: 'high-performance' }}>
        <color attach="background" args={['#04060f']} />
        <fog attach="fog" args={['#04060f', 18, 70]} />
        <PerformanceMonitor onChange={({ factor }) => setQuality(0.75 + 1.25 * factor)} />
        <Invalidate active={reduced} />
        <SceneMood />
        <CameraRig reduced={reduced} />
        <Starfield count={tier === 'high' ? 1400 : tier === 'medium' ? 800 : 350} />
        <Suspense fallback={null}>
          {tier !== 'low' && <Studio />}
          {!reduced && <Dust tier={tier} />}
          <HeroScene tier={tier} reduced={reduced} />
          <Zone at={SCENE_POS[1]} dx={tier === 'high' ? 5 : 0}><AboutScene tier={tier} reduced={reduced} /></Zone>
          <Zone at={SCENE_POS[2]} dx={tier === 'high' ? 4 : 0}><SkillsScene tier={tier} reduced={reduced} /></Zone>
          <Zone at={SCENE_POS[3]}><ProjectsScene tier={tier} reduced={reduced} /></Zone>
          <Zone at={SCENE_POS[4]} dx={tier === 'high' ? 5 : 0}><JourneyScene tier={tier} reduced={reduced} /></Zone>
          <Zone at={SCENE_POS[5]} dx={tier === 'high' ? 5 : 0}><EducationScene tier={tier} reduced={reduced} /></Zone>
          <Zone at={SCENE_POS[6]} dx={tier === 'high' ? 5 : 0}><SportsScene tier={tier} reduced={reduced} /></Zone>
          <Zone at={SCENE_POS[7]} dx={tier === 'high' ? 5 : 0}><ContactScene tier={tier} reduced={reduced} /></Zone>
        </Suspense>
      </Canvas>
      {/* keeps text readable over the scenes on small screens */}
      <div className="absolute inset-0 bg-void/50 md:bg-void/0" />
    </div>
  )
}
