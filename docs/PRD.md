# AwareDeck Product Requirements

## Summary

AwareDeck is a programmable AI control surface that observes the active application and selected content, ranks relevant actions, previews the exact prompt and effect, and asks for confirmation before changing or sending data.

## Problem

AI workflows are fragmented across chat windows, copied prompts, and app-specific assistants. Users repeatedly explain context and cannot easily tell what an agent will modify. Generic macro decks are fast but unaware; autonomous agents are capable but often opaque.

AwareDeck combines contextual speed with guarded execution.

## Goals

- Turn active application context into four to eight relevant actions.
- Keep providers and desktop capture replaceable behind typed interfaces.
- Make prompt, scope, effect, and risk visible before execution.
- Require explicit approval for writes, commands, deletes, and external sends.
- Keep a local, understandable action history.

## Non-goals

- Fully autonomous background agents.
- A workflow marketplace or team administration in the MVP.
- Real OS context capture, account sync, billing, or provider credentials in the web prototype.
- Supporting every application or content type at launch.

## Users and jobs

### Software developer

When code is selected, quickly review, explain, refactor, or draft tests without rebuilding context in a separate chat.

### Knowledge worker

When prose or tabular data is selected, summarize, rewrite, extract tasks, or prepare a message while retaining control over replacements and sends.

## Core journey

1. A context source reports the active app, document, selection, and content type.
2. AwareDeck ranks compatible actions and shows the best matches.
3. The user selects an action and reviews its prompt and proposed effect.
4. Read-only actions may run immediately; consequential actions require approval.
5. The result is recorded locally with status and an undo path where supported.

## MVP requirements

### Context and suggestions

- Represent application, document title, selected content, content type, and optional language.
- Refresh context on demand and hide inapplicable actions.
- Return four to eight deterministic actions with labels, descriptions, prompts, and risk.
- Rank application-specific actions ahead of generic content actions.

### Review and execution

- Display the full prompt and a plain-language proposed effect.
- Classify actions as read-only, write, or external.
- Reject write and external actions until approval is explicit.
- Clear approval when the selected action or context changes.
- Never execute a real provider or workspace change in the prototype.

### History

- Record action, completion status, and time locally.
- Distinguish completed and cancelled actions.
- Define undo metadata before real write execution is introduced.

### Accessibility and responsiveness

- Support keyboard navigation, visible focus, and 44 px interactive targets.
- Meet WCAG AA text contrast and respect reduced motion.
- Remain usable at 375, 768, 1024, and 1440 px widths.

## Architecture

The domain layer owns context types, action compatibility, ranking, risk, and approval rules. Service interfaces own context capture and provider execution. React owns presentation and ephemeral interaction state. A future Tauri adapter will implement native context capture and guarded OS effects.

## Safety model

- Read-only actions generate output without modifying source data.
- Write actions require explicit approval and a reversible preview.
- External actions require explicit approval and destination disclosure.
- Destructive actions require a second confirmation and recovery strategy; they are outside this prototype.
- Provider credentials must use OS-backed secure storage when introduced.

## Success metrics

- At least 70% of sessions use one of the top three suggestions.
- Median time from context capture to reviewed action is under 10 seconds.
- At least 90% of consequential actions are previewed without cancellation caused by unclear scope.
- Zero modifications occur without a recorded approval event.

## Risks

- OS context capture varies by platform and application.
- Selection data may contain secrets or regulated information.
- Ranking can feel unpredictable without transparent signals.
- Provider latency can undermine the macro-deck interaction model.
- Undo semantics differ across applications.

## Milestones

1. Validate the browser workbench, deterministic ranking, and approval model.
2. Add a Tauri shell and read-only context adapters for one operating system.
3. Add one provider adapter, encrypted credential storage, streaming, and redaction controls.
4. Add reversible writes for one editor and persist local history.
5. Test extensible action packs and hardware shortcut integrations.

## Acceptance criteria

- A code context produces a relevant ordered action set.
- Selecting an action updates prompt, effect, and risk previews.
- A write action cannot execute without explicit approval.
- A completed simulated action appears in local history.
- Unit tests, lint, and production build pass.