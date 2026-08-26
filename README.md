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

## Use the prototype

1. Copy code or prose from any application and choose **Capture clipboard**.
2. Select one of the context-ranked actions.
3. Review the full prompt and proposed effect.
4. Approve the action when it can produce a write-oriented result, then choose **Run action**.
5. Inspect the generated result and local activity history.

Preview mode runs entirely in the browser. To call an OpenAI-compatible API, open the provider control, choose **OpenAI compatible**, and enter an endpoint, model, and API key. Provider configuration remains in memory for the current tab and is never persisted. Browser CORS policy must allow requests from the local app; production credential storage will be handled by the planned desktop shell.

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

No provider credentials are needed for preview mode. Generated write-oriented results are never applied automatically.