import { forwardRef, useEffect, useRef } from 'react'
import { TOUCH_RANGE, WHEEL_RANGE } from './lib/director'

const wheelPx = (e) => (e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY)
const GESTURE_GAP = 150 // ms of silence that separates one wheel gesture from the next

// The original Universe runs untouched in this iframe (same origin). We only *listen* to it:
// normal scrolling is never prevented, except for the one gesture that starts at its very top
// and moves up, which hands control back to the 3D workstation.
// `wrapRef` is the element the camera rig transforms (iframe + screen-glass reflection); the ref is the iframe.
const UniverseFrame = forwardRef(function UniverseFrame({ director, src, inside, loaded, onLoaded, fullscreen, wrapRef }, ref) {
  const off = useRef(null)
  useEffect(() => () => off.current?.(), [])
  const live = inside || fullscreen

  const attach = (ev) => {
    off.current?.()
    const win = ev.currentTarget.contentWindow
    if (!win) return
    let lastWheel = 0, gestureAtTop = false, lastY = 0, touchAtTop = false, pulling = false
    const onWheel = (e) => {
      const now = performance.now()
      if (now - lastWheel > GESTURE_GAP) gestureAtTop = win.scrollY <= 0
      lastWheel = now
      if (!director.inside || !gestureAtTop || e.deltaY >= 0) return
      e.preventDefault()
      director.retreat(Math.min(-wheelPx(e), 120), WHEEL_RANGE)
    }
    const onKey = (e) => { if (director.inside && win.scrollY <= 0 && !e.repeat && (e.key === 'ArrowUp' || e.key === 'PageUp')) director.retreat(160, WHEEL_RANGE) }
    const onTouchStart = (e) => { lastY = e.touches[0].clientY; touchAtTop = win.scrollY <= 0; pulling = false }
    const onTouchMove = (e) => {
      const y = e.touches[0].clientY, dy = y - lastY; lastY = y
      if (director.inside && touchAtTop && dy > 0) pulling = true
      if (!pulling) return
      if (e.cancelable) e.preventDefault()
      director.retreat(dy, TOUCH_RANGE)
    }
    const onTouchEnd = () => { if (pulling) { pulling = false; director.settle() } }
    const o = { passive: false }
    win.addEventListener('wheel', onWheel, o); win.addEventListener('keydown', onKey)
    win.addEventListener('touchstart', onTouchStart, { passive: true }); win.addEventListener('touchmove', onTouchMove, o)
    win.addEventListener('touchend', onTouchEnd); win.addEventListener('touchcancel', onTouchEnd)
    off.current = () => {
      try {
        win.removeEventListener('wheel', onWheel, o); win.removeEventListener('keydown', onKey)
        win.removeEventListener('touchstart', onTouchStart); win.removeEventListener('touchmove', onTouchMove, o)
        win.removeEventListener('touchend', onTouchEnd); win.removeEventListener('touchcancel', onTouchEnd)
      } catch { /* frame already gone */ }
    }
    onLoaded()
  }

  return (
    <div ref={wrapRef} className="fixed left-0 top-0" style={{ width: '100vw', height: '100dvh', zIndex: 20, transformOrigin: '0 0', willChange: 'transform', opacity: loaded ? 1 : 0, pointerEvents: live ? 'auto' : 'none', visibility: src ? 'visible' : 'hidden' }}>
      <iframe ref={ref} src={src} title="Sriram T. — Universe Portfolio" onLoad={attach} inert={live ? undefined : ''} tabIndex={live ? 0 : -1}
        className="h-full w-full border-0 bg-black" style={{ pointerEvents: live ? 'auto' : 'none' }} />
      {!fullscreen && <div className="screen-reflect pointer-events-none absolute inset-0" />}
    </div>
  )
})
export default UniverseFrame
