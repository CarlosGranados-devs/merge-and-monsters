# 08 — feature/0.1.0-audio-synth-C

**Branch**: `feature/0.1.0-audio-synth-C`
**Status**: PR Open
**PR**: _pending_
**Owner**: C
**Version**: 0.1.0
**Date**: 2026-11-19

---

## What Was Done

Implemented the zero-asset Web Audio synthesizer that turns combat events into 8-bit SFX. No audio
files are loaded or bundled; every sound is generated from oscillators at runtime.

- `SoundSynth.ts` owns one lazily created `AudioContext`, shared by every call to `play()`.
- `play()` returns immediately while muted, so a muted game never pays for audio node creation.
- A suspended context is resumed before scheduling, which satisfies the browser autoplay policy.
- All seven SFX types (`attack`, `crit`, `monsterHit`, `levelUp`, `monsterSlain`, `gold`,
  `uiClick`) are declared in a single `SFX_LIBRARY` table matching the task specification.
- Each sound runs a short attack ramp into a linear decay, so no note starts or ends on a click.
- Oscillators and gains are disconnected in `onended`, preventing node leaks.
- The muted flag lives in `useGameStore`; `setMuted()` writes it and `isMuted()` reads it.

---

## Main Changes

- `src/engine/SoundSynth.ts` (new): `play`, `setMuted`, `isMuted`, frequency scheduling, gain
  envelope, lazy context resolution with `webkitAudioContext` fallback.
- `src/engine/SoundSynth.test.ts` (new): 7 tests using a fake `AudioContext` — lazy creation,
  context reuse, muted short-circuit, suspended-context resume, frequency/envelope automation,
  node disconnection, store-backed mute, and every SFX type.

---

## Verification

- [x] `npx vitest run` passed (79 tests, 8 files)
- [x] `npx tsc --noEmit` passed
- [x] `npx biome check src` passed clean
- [x] `npx vite build` passed; `dist/` contains no audio files
- [x] No `.mp3`, `.wav`, `.ogg`, or `.mp4` files in `public/` or `src/`

---

## Gotchas

- The mobile/Safari constructor is `webkitAudioContext`; the type lookup has to widen `window` to
  see it (described as `unknown` first) or TypeScript rejects the `AudioContext` property access.
- Tests must clear `localStorage` before importing the module: the store persists `muted`, so
  state leaks between cases and later tests silently start muted.

---

## Known Gaps

- `SoundSynth` is not yet called by the engine or the HUD. R09 (checkpoint 2) wires combat events
  to `play()`, and R10 adds the mute button that calls `setMuted()`.

---

## References

- Task: `docs/tasks/v0.1.0/08-audio-synth.md`
- Roadmap: `docs/roadmap/v0.1.0/README.md` (Phase 3 — State & Engine)
- ADR: `docs/adr/v0.1.0/04-audio-web-audio-api.md`
- Architecture: `docs/architecture/04-audio-synth.md`
