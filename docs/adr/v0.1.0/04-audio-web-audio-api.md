# 04 — Zero-Asset SFX via Web Audio API

**Date**: 2025-01-27
**Status**: Accepted

**Context**: The game needs retro 8-bit sound effects for combat events. The tech-stack rule prohibits external `.mp3`/`.wav` files to avoid copyright issues and to keep the bundle small.

## Decision

All SFX are synthesized at runtime using the Web Audio API. `SoundSynth.ts` uses `OscillatorNode` and `GainNode` to produce square and triangle wave sounds with simple frequency automation and gain envelopes. No audio files are loaded or bundled.

## Rationale

- Zero external dependencies for audio.
- Bundle size is unaffected by the number of sounds.
- Full control over waveform, pitch, and timing to match the retro aesthetic.
- The Web Audio API is available in all modern browsers and in the target environments.

## Alternatives Considered

- **Howler.js with pre-built 8-bit samples**: would require audio files in `public/`. Rejected due to tech-stack constraint and copyright risk.
- **Tone.js**: large library for music composition, overkill for game SFX. Rejected.
- **Raw PCM generation**: more complex than oscillators for no additional benefit at this scope. Rejected.

## Consequences

- An `AudioContext` can only be created after a user gesture (browser autoplay policy). `SoundSynth.ts` creates it lazily on the first `play()` call, which is always triggered by a user action.
- If the browser suspends the context (tab backgrounded), `play()` resumes it before scheduling nodes.
- The muted state is stored in Zustand so the HUD button and the synth stay in sync.

## References

- `.kiro/steering/tech-stack.md`
- `docs/architecture/04-audio-synth.md`
- `src/engine/SoundSynth.ts`
