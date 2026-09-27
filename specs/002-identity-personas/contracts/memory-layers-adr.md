# Contract: Memory layers ADR (docs only)

**Owners:** DH Spec / implement docs task · DH Verifier (presence check)
**Acceptance:** Spec FR-009, FR-010 · SC-006 · US5

## Deliverable

| Artifact | Requirement |
|----------|-------------|
| ADR file | Under `MzM-Docs/adr/` |
| Filename | MUST identify agent vs user memory layers (recommended: `agent-vs-user-memory-layers.md`) |
| Content (minimum) | Distinguishes **agent memory** (per bot) from **user memory** (shared across bots); states P2 ships **no** memory product UX |

Create `MzM-Docs/adr/` on implement if the directory does not yet exist.

## Verifier rules

| Check | Pass bar |
|-------|----------|
| Presence | SC-006 — ADR file located under `MzM-Docs/adr/` with identifying filename |
| Non-goal | No memory productization UX (profile/log/note authoring or recall flow) required for P2 Pass |

## Non-goals

- Implementing memory stores, recall tools, or write UX in P2
- Profile / log / note product kinds beyond naming them as deferred to P5 in the ADR
- Skills library (P3)

## Relationship to later phases

P5 owns memory productization. This ADR exists so P5 does not require a layer-model rewrite.
