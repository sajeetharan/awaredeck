# AwareDeck conventions

- Use React, TypeScript, and Vite; keep TypeScript strict.
- Keep context ranking, risk, and approval rules in `src/domain`, independent of React.
- Put replaceable context and AI integrations behind interfaces in `src/services`.
- Require explicit approval for write, command, destructive, or external actions.
- Never add real credentials, provider calls, or OS effects to mock adapters.
- Prefer focused Vitest coverage for domain behavior and safety invariants.
- Preserve the dense, accessible operational UI and its existing design tokens.
- Run `npm test`, `npm run lint`, and `npm run build` before completing changes.