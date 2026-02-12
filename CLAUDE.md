# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A desktop app for performing Leroy Anderson's "The Typewriter" on a laptop. Built with React 19 + Vite 7 + Electron 39. Displays typed keys visually and plays typewriter sounds via Web Audio API.

## Commands

```bash
npm run dev            # Vite dev server at localhost:5173
npm run electron-dev   # Dev server + Electron with hot reload
npm run build          # Production build to dist/
npm run lint           # ESLint
npm run dist-mac       # Build macOS DMG installer
```

No test framework is configured.

## Architecture

- **Frontend:** Single React component (`src/App.jsx`) handles all UI and audio logic using hooks (useState, useEffect, useRef)
- **Electron:** `electron/main.cjs` creates the window; `electron/preload.cjs` is a placeholder for future contextBridge APIs
- **Audio:** MP3 files in `public/sounds/` are decoded into Web Audio API buffers at startup. Regular keys cycle through 3 type sounds; Enter plays bell; Space plays winding
- **Module system:** Frontend uses ESM; Electron files use CommonJS (`.cjs` extension)

## Key Details

- Sound file paths differ between web (`/sounds/`) and Electron (`./sounds/`) — detected at runtime
- Vite base is `./` (relative) for Electron compatibility
- Electron dev mode loads from localhost:5173; production loads from `file://dist/index.html`
- `webSecurity` is disabled in Electron for local file access; `contextIsolation` is enabled
- Comments in source code are in Korean
