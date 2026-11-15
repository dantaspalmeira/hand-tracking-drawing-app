# Hand Index Tracker

Draw in the air with your index finger. A browser-based drawing tool powered by real-time hand tracking: no install, no plugins, and the camera feed never leaves your device.

**[Try the live demo](https://dantaspalmeira.github.io/hand-tracking-drawing-app/)** · requires a webcam

<!-- Demo: record a 5–8s screen capture, save as docs/demo.gif and uncomment the line below -->
<!-- ![Drawing with the index finger](docs/demo.gif) -->

## The idea

What happens when the camera replaces the pointer? This project explores gesture as a primary input: the tip of your index finger becomes the brush, and the interface has to make an invisible input feel precise, predictable and safe.

## Design decisions

| Decision | Why |
| --- | --- |
| **Camera starts on intent, not on load** | The permission prompt only appears after the user clicks *Start Camera*. Asking on page load causes confusion and denied permissions. |
| **The product is the first screen** | No landing page. The first viewport is the drawing surface itself, so the value is understood in seconds. |
| **Draw and Move modes** | Separating "drawing" from "positioning" solves the classic mid-air problem of not being able to lift the pen. A persistent mode pill always shows the current state. |
| **Constant feedback** | A hand skeleton overlay, a pencil cursor that follows the fingertip and a *Live / Ready* status make tracking visible and trustworthy. |
| **Actionable error states** | Denied permission and busy/missing camera get different messages, each with a clear way to recover. |
| **Smooth, expressive strokes** | Strokes are drawn with quadratic curves between midpoints and a soft glow, on canvases scaled to the device pixel ratio for crisp lines. |
| **Accessible by default** | Labelled controls, `aria-pressed` toggles, `aria-live` status messages, visible focus states, responsive layout and `prefers-reduced-motion` support. |

## How it works

```
Webcam ──▶ MediaPipe Hands (WASM, runs locally)
             │  21 landmarks per frame
             ▼
        Landmark 8 (index fingertip) ── mirrored to screen coordinates
             │
     ┌───────┴────────┐
     ▼                ▼
 Overlay canvas    Drawing canvas
 (hand skeleton,   (persistent strokes,
  cleared/frame)    cleared on demand)
```

- One hand, model complexity 1, detection confidence 0.7 and tracking confidence 0.65: a balance between responsiveness and jitter.
- MediaPipe assets are self-hosted in `public/mediapipe`, so the app does not depend on a third-party CDN at runtime.

## Stack

`React 19` `TypeScript` `Vite` `MediaPipe Hands` `Canvas 2D` `GitHub Pages`

## Run locally

```bash
npm install
npm run dev
```

Open the local URL, click **Start Camera** and allow camera access.

## Project structure

```
src/
├── App.tsx                  # App state: camera, mode, color, stroke, clear
├── hooks/useHandTracking.ts # Camera lifecycle + MediaPipe loop
├── components/
│   ├── CameraCanvas.tsx     # Video, overlay and drawing canvases
│   ├── Toolbar.tsx          # Controls
│   └── PencilCursor.tsx     # Fingertip cursor
└── styles/global.css
docs/design-practices.md     # Design principles applied
```

---

Designed and built by **Rafael Palmeira** · [rafapalmeira.work](https://rafapalmeira.work) · [LinkedIn](https://www.linkedin.com/in/dantaspalmeira)
