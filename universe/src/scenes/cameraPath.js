import * as THREE from 'three'

// Shared mutable state read inside useFrame (no React re-renders).
export const pointerState = { x: 0, y: 0 }

// One waypoint per section, in nav order: home, about, skills, projects, journey, education, sports, contact.
// Each later scene group will be placed near its waypoint's look target.
const cam = [[0, 1.2, 9], [-6, 2, -14], [8, 3, -38], [0, 2, -62], [-8, 1, -86], [6, 2, -110], [0, 3, -134], [0, 1.5, -158]]
export const camCurve = new THREE.CatmullRomCurve3(cam.map((p) => new THREE.Vector3(...p)), false, 'catmullrom', 0.4)
// Where each section's 3D scene group sits (the camera look-target for that section).
export const SCENE_POS = cam.map((p, i) => [i === 0 ? 0 : p[0] * 0.5, i === 0 ? 0.6 : p[1] - 0.5, p[2] - 20])
export const lookCurve = new THREE.CatmullRomCurve3(SCENE_POS.map((p) => new THREE.Vector3(...p)), false, 'catmullrom', 0.4)
