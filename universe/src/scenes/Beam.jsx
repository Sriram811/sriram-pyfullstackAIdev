import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

const vert = `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`
// Bright at the source (cone apex), fading along the length and softly toward the silhouette.
const frag = `uniform vec3 uColor; uniform float uOpacity; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){ float along = pow(vUv.y, 1.5); float soft = pow(abs(dot(vN, vV)), 2.0); gl_FragColor = vec4(uColor, along * soft * uOpacity); }`

// Volumetric-looking light shaft: a single additive cone, apex at `position`, pointing down (tilt with rotation z).
export default function Beam({ position = [0, 6, 0], rotation = [0, 0, 0], color = '#22d3ee', length = 8, radius = 2.4, opacity = 0.22 }) {
  const geo = useMemo(() => new THREE.ConeGeometry(radius, length, 32, 1, true), [radius, length])
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: vert, fragmentShader: frag, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity } }
  }), [color, opacity])
  useEffect(() => () => { geo.dispose(); mat.dispose() }, [geo, mat])
  return <group position={position} rotation={rotation}><mesh geometry={geo} material={mat} position={[0, -length / 2, 0]} /></group>
}
