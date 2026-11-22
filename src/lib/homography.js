// Unit square (TL, TR, BR, BL) -> arbitrary screen quad, as a CSS matrix3d().
// This is an exact perspective mapping, so a flat iframe can sit on a projected 3D monitor screen.
export function quadCoeffs(q) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q
  const dx1 = x1 - x2, dx2 = x3 - x2, dy1 = y1 - y2, dy2 = y3 - y2
  const sx = x0 - x1 + x2 - x3, sy = y0 - y1 + y2 - y3
  const den = dx1 * dy2 - dx2 * dy1
  const g = Math.abs(den) < 1e-9 ? 0 : (sx * dy2 - dx2 * sy) / den
  const h = Math.abs(den) < 1e-9 ? 0 : (dx1 * sy - sx * dy1) / den
  return { a: x1 - x0 + g * x1, b: x3 - x0 + h * x3, c: x0, d: y1 - y0 + g * y1, e: y3 - y0 + h * y3, f: y0, g, h }
}
export function quadToMatrix3d(q, w, h) {
  const k = quadCoeffs(q)
  const m = [k.a / w, k.d / w, 0, k.g / w, k.b / h, k.e / h, 0, k.h / h, 0, 0, 1, 0, k.c, k.f, 0, 1]
  return `matrix3d(${m.map((v) => +v.toFixed(7)).join(',')})`
}
// Apply the mapping to a point of the element (px) — used by tests.
export function applyQuad(q, w, h, px, py) {
  const k = quadCoeffs(q), u = px / w, v = py / h, s = k.g * u + k.h * v + 1
  return [(k.a * u + k.b * v + k.c) / s, (k.d * u + k.e * v + k.f) / s]
}
