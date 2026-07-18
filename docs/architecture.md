# Initial architecture

## Current scope

The first increment is a client-only Chrome extension. Chrome injects ordered,
modular content scripts only into `https://leetcode.com/problems/*`. A DOM
parser extracts the title, difficulty, and page URL, while a panel module
renders the floating launcher and local interview-context panel. Nothing is
persisted or transmitted.

## Deliberately deferred

- AI prompts, model calls, and answer generation
- Backend endpoints, authentication, persistence, and analytics
- Audio recording or speech-to-text
- Evaluation reports

## Future boundary

When these features are introduced, the extension should remain responsible
for page-local interaction and call a backend through a narrow client module.
That keeps site injection, interview orchestration, and persistence separate.
