# AwareDeck

AwareDeck is a context-aware AI action deck that suggests useful operations for the active application and selection. Its defining constraint is review before execution: prompts and effects are visible, and any action that writes or sends data requires explicit approval.

This repository contains a browser-based product prototype. Desktop context capture is mocked behind an interface so it can later be implemented by a Tauri shell without changing domain logic.

## Run locally

Requirements: Node.js 22 or later and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Quality checks

```bash
npm test
npm run lint
npm run build
```

## Architecture

- `src/domain`: provider-independent context, action ranking, risk, and execution rules.
- `src/services`: replaceable context and AI-provider boundaries with mock implementations.
- `src/App.tsx`: the React workbench and local interaction state.
- `docs/PRD.md`: MVP definition, requirements, safety model, and milestones.

No provider credentials are needed. Execution is simulated locally in this prototype.