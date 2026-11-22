# Sriram T. — 3D Developer Workstation + Universe Portfolio

The workstation (React + Vite + React Three Fiber + GSAP + Framer Motion + Tailwind) is the outer world.
Your original Universe Portfolio (`universe/`, unmodified) is the inner world, shown on the centre monitor.

## Layout
    universe/               original Universe source, untouched (its own package.json)
    backup/                 universe-original.zip, the ZIP you supplied
    src/Workstation.jsx     canvas, camera rig, monitors, lighting, hover/raycasting
    src/scene/              Pc.jsx (cabinet), Desk.jsx (desk, keyboard, mouse, headphones, cables), rgb.js (RGB + textures)
    src/screens.js          canvas painters for the left/right monitors
    src/data/screenData.js  verified content for those monitors
    src/UniverseFrame.jsx   iframe + scroll-boundary bridge into the Universe
    src/lib/director.js     scroll director: one damped, reversible GSAP timeline
    src/lib/homography.js   projects the iframe onto the monitor with true perspective (CSS matrix3d)
    scripts/build-universe.mjs   builds universe/ into public/universe (served at /universe/)
    tests/logic.test.mjs    offline unit tests (homography + scroll state machine)

## Install and run
    npm install
    npm run dev            # first run also installs and builds the Universe, then http://localhost:5173
    npm test               # unit tests (no browser needed)

## Production build and deploy
    npm run build          # builds the Universe, then the workstation, into dist/
    npm run preview
Vercel/Netlify: build command `npm run build`, output `dist` (`vercel.json` included). Deploy at the site root;
the Universe is built with base `/universe/`. After changing anything in `universe/`, run `npm run universe:build`.

## Your files
Put `profile.png`, `resume.pdf` and the sports images in `universe/public/assets/`. The build copies them to `/assets/`.

## How the entry works
- Wheel, touch drag, keys, the "Explore Universe" button or a click on the centre monitor move a target value (0..1).
  A damped progress value follows it and scrubs one GSAP timeline, so partial scrolling is partial movement and
  reversing mid-way retraces smoothly. Nothing uses a fixed duration, except the button/click glide.
- The iframe is laid out at full viewport size and mapped onto the projected monitor screen each frame with an exact
  homography, so there is no screenshot and no reload. In the last part of the timeline the quad grows to the full
  viewport and the Universe becomes a normal full-screen page; the 3D canvas then stops rendering.
- Inside: outer controls are off and the Universe scrolls natively. The only gesture that exits is one that *starts* at
  the Universe's very top and moves up (a wheel pause of 150 ms separates gestures, so momentum scrolling that arrives at the
  top will not exit). Touch: pull down from the top. Keyboard: ArrowUp/PageUp at the top.
- Reduced motion: no parallax or RGB animation, camera follows scroll without damping.
- No WebGL, or a scene error: the Universe opens full screen on its own.

## What is on the monitors
- **Left (career):** Bluestock Fintech is the only INTERNSHIP. QSpiders, Edu Tantr, Emglitz and CodeBind are labelled TRAINING.
- **Centre:** the untouched Universe (iframe), with a faint screen-glass reflection that fades as you enter.
- **Right (projects):** the six projects from your brief.
- All content lives in `src/data/screenData.js`. Names/roles/kinds follow your brief; periods and technologies are copied from
  `universe/src/data/portfolioData.js` and checked by `tests/data.test.mjs`. Unknown items stay empty: no repository/demo links,
  statuses or statistics are shown (they read "not linked" / "not listed yet"). Add real values to `screenData.js` when you have them.

## Scene upgrades
PC: shell with vents, tempered glass, motherboard, VRM/chipset heatsinks, CPU water block with glowing tubes, RAM, GPU with 3 fans,
PSU shroud, sleeved cables, 3 intake fans. Every fan has 9 real pitched blades that spin about their own centre (delta-time).
One shared RGB registry (cyan/blue/purple only) updates every RGB part and light in a single per-frame call.
Desk: rounded wood-grain top, fabric mat with stitched border, back raceway + under-desk tray, cables routed into the raceway.
Keyboard: tapered individual keycaps, plate, frame, RGB wave. Mouse: ergonomic body, buttons, wheel, side buttons, RGB.
Headphones: padded band, yokes, cushions, RGB rings, stand. Lighting: hemisphere + key spot + coloured fills + per-monitor spill
lights + cyan PC light, exposure 1.2. Ambient occlusion is approximated with contact shadows and soft AO decals (no SSAO pass,
to avoid adding a post-processing dependency).
Mouse parallax: damped, limited, fades out while entering and returns on exit; it eases back to rest ~1.2-3 s after the mouse stops.

## Latest visual upgrade (modified files: scene/Pc.jsx, scene/Desk.jsx, scene/rgb.js, Workstation.jsx, App.jsx)
- PC: front perforated-mesh intake, metal dividers, I/O strip (power button, USB-A, USB-C, audio jacks), brushed-metal glass frame,
  PCB-textured motherboard with capacitors, VRM fins, M.2/chipset shields, RAM slots, GPU shroud with fin stack and copper heat pipes,
  top radiator with fittings and coolant tubes, 24-pin cable bundle, soft RGB diffusion behind the glass. Fans = instanced-geometry blades.
- Desk: satin clear-coated wood, apron, steel legs/feet and cross brace. Monitors: V-shaped steel stands, glass sheen.
- Mouse: switches, glossy buttons, rubber side grips. Headphones: fabric cushions, headband padding, metal cup plates, boom mic.
- Environment: wall wash and floor RGB bounce, baseboard. Camera cannot dip below desk height. Weak hardware (<=4 cores/4 GB) uses the low tier.

## Status of testing
Written in a sandbox with no network, so `npm install`, `vite build` and a browser run were NOT possible there.
Executed: 13 unit tests (all pass: perspective mapping, scroll state machine, data integrity) and a syntax check of every source file.
NOT executed: the build, rendering, visual quality, fan spin, hover, real iframe scrolling, touch, console errors, mobile layout.
Run `npm install && npm test && npm run build && npm run preview` and walk through the checklist.

Checklist: three screens show the right content · fans spin · RGB cycles · mouse moves the camera and it settles when you stop ·
centre monitor glows on hover · scroll down enters · Universe scrolls/animates/links work · scroll up at its top exits · repeat ·
Resume (needs `universe/public/assets/resume.pdf`) and Contact work · phone layout and touch · reduced-motion · console clean.

## Known limits
- Models are built from primitives (no GLB), so it is detailed but not photoreal. Side-screen text is only headline-readable at the home view (they are physically small); there is no click-to-zoom on them yet.
- Reduced-motion stops fan spin and RGB animation.
- Side-screen preview panels are monogram tiles, since no project screenshots exist.
- The Universe loads in the background at start, so its intro animation may already have played when you enter.
