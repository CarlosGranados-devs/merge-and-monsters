---
inclusion: always
---

# Project Steering Rules — Merge & Monsters

- **Package Manager:** Always use `pnpm` (`pnpm install`, `pnpm dev`, `pnpm build`). Never generate `package-lock.json` or `yarn.lock`.
- **Code Quality:** Use **Biome** (`biome.json`) for linting, formatting, and import sorting. Keep strict TypeScript (`"strict": true`, zero `any` types).
- **Architecture:** 100% client-side SPA (React 19 + TypeScript + Vite + Tailwind CSS). Never introduce a custom backend server or database.
- **Game Engine Separation:** Keep the 60 FPS HTML5 `<canvas>` render loop (`src/engine/`) completely decoupled from React state re-renders.
- **Visual & Audio Palette:** UI wrapper uses minimalist off-black (`#0D0D0F`) and satin gold (`#D4AF37`). All retro SFX must be synthesized natively via the Web Audio API with zero external copyrighted `.mp3`/`.wav` dependencies.