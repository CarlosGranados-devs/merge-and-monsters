# T07 — Audio Synthesizer

**Branch**: `feature/0.1.0-audio-synth-C`
**Owner**: C
**Status**: Completed
**Version**: 0.1.0

---

## Objective

Implement `src/engine/SoundSynth.ts`: a zero-asset Web Audio API synthesizer producing all game SFX from oscillators. No audio files.

Corresponds to task 6 in `.kiro/specs/merge-and-monsters/tasks.md`.

---

## Scope

- `src/engine/SoundSynth.ts`
- Muted flag wired to `useGameStore`

---

## Checklist

- [x] `AudioContext` created lazily on the first `play()` call
- [x] `play(type: SfxType)` returns immediately if muted
- [x] `play()` resumes a suspended context before scheduling nodes
- [x] All 7 SFX types implemented: `attack`, `crit`, `monsterHit`, `levelUp`, `monsterSlain`, `gold`, `uiClick`
- [x] Every sound uses an attack-decay gain envelope (no clicks)
- [x] `setMuted(muted)` updates Zustand store; `isMuted()` reads it
- [x] Oscillator nodes are disconnected after stop (no memory leak)
- [x] `SfxType` is a union type exported from `src/types/index.ts`
- [x] `pnpm biome check --write .` and `pnpm typecheck` pass
- [x] Branch pushed and PR opened

---

## Acceptance Criteria

1. Clicking "Simulate Commit" triggers the `attack` SFX (audible in an unmuted browser).
2. Clicking "Simulate Issue Close" triggers `monsterSlain`.
3. Clicking the mute button silences all subsequent sounds.
4. No `.mp3`, `.wav`, `.ogg`, or `.mp4` files appear in `public/` or `src/`.
5. `pnpm build` produces no audio file in `dist/`.

---

## SFX Specification

| Type | Waveform | Freq pattern | Duration |
|------|----------|-------------|----------|
| `attack` | square | 220 -> 110 Hz | 0.12 s |
| `crit` | square | 440 -> 880 -> 220 Hz | 0.25 s |
| `monsterHit` | triangle | 180 -> 90 Hz | 0.10 s |
| `levelUp` | square | 220 -> 330 -> 440 -> 660 Hz | 0.50 s |
| `monsterSlain` | square | 440 -> 330 -> 220 -> 110 Hz | 0.40 s |
| `gold` | triangle | 880 -> 1100 Hz | 0.08 s |
| `uiClick` | square | 440 Hz (steady) | 0.05 s |

---

## References

- `docs/adr/v0.1.0/04-audio-web-audio-api.md`
- `docs/architecture/04-audio-synth.md`
- `src/store/useGameStore.ts` (muted flag)
