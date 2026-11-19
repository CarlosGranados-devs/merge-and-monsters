# Audio Synthesizer

**Last updated**: 2025-01-27
**Version**: 0.1.0

---

## Responsibility

`src/engine/SoundSynth.ts` produces all in-game sound effects using the Web Audio API. No audio files are loaded or bundled. All sounds are generated from oscillators at runtime.

---

## Design

A single `AudioContext` is created lazily on the first user interaction (required by browser autoplay policy). All subsequent sounds reuse the same context.

```text
SoundSynth.play(type: SfxType): void
SoundSynth.setMuted(muted: boolean): void
SoundSynth.isMuted(): boolean
```

If the context is in `suspended` state, `play()` calls `context.resume()` before scheduling nodes.

---

## SFX Types

| Type | Waveform | Frequency | Duration | Notes |
|------|----------|-----------|----------|-------|
| `attack` | square | 220 Hz -> 110 Hz | 0.12 s | Hero basic attack |
| `crit` | square | 440 Hz -> 880 Hz -> 220 Hz | 0.25 s | Critical hit sweep up then down |
| `monsterHit` | triangle | 180 Hz -> 90 Hz | 0.10 s | Monster taking damage |
| `levelUp` | square | 220 -> 330 -> 440 -> 660 Hz | 0.50 s | Ascending arpeggio on level up |
| `monsterSlain` | square | 440 -> 330 -> 220 -> 110 Hz | 0.40 s | Descending fanfare on monster death |
| `gold` | triangle | 880 Hz -> 1100 Hz | 0.08 s | Short chime on gold award |
| `uiClick` | square | 440 Hz | 0.05 s | Generic UI button press |

---

## Node Graph per Sound

```text
OscillatorNode -> GainNode -> AudioContext.destination
```

Each call to `play()` creates a fresh `OscillatorNode` and `GainNode`, connects them, starts the oscillator, applies frequency automation and gain envelope, and schedules `oscillator.stop()` at the end of the duration. Nodes are garbage-collected automatically after they stop.

---

## Gain Envelope

All sounds use a simple attack-decay envelope:

```
gain ramps from 0 to 0.3 over 0.01 s  (attack)
gain ramps from 0.3 to 0 over duration (decay)
```

This prevents clicks at the start and end of each sound.

---

## Mute Toggle

When muted, `play()` returns immediately without creating any nodes. The muted state is stored in the Zustand store (`useGameStore`) and read by the `HeroHud` mute button.

---

## References

- `docs/adr/v0.1.0/04-audio-web-audio-api.md`
- `src/engine/SoundSynth.ts`
- `src/store/useGameStore.ts` (muted flag)
