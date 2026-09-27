# ADR: Agent vs user memory layers

**Status:** Accepted (Phase 2 — docs / seam honesty only)
**Date:** 2026-09-27
**Owners:** DH Spec (artifact) · DH Verifier (presence + non-goal check)
**Program refs:** `MzM-Docs/mzm-bot-plan.md` §4 P2 · `MzM-Docs/mzm-bot-initial-plan.md` §4 · `specs/002-identity-personas` FR-009, FR-010, SC-006 · clarify Session 2026-09-27 lock 2 · `specs/002-identity-personas/contracts/memory-layers-adr.md`

## Context

MzM Bot’s north star (C) includes durable memory productization. Phase 2 (identity / personas) explicitly ships **no** memory product UX. Without an early layer split, later memory work risks collapsing per-bot and account-wide facts into one store and forcing a rewrite.

Clarify lock 2 places this decision under the program ADR tree `MzM-Docs/adr/` with a filename that identifies agent vs user memory layers so Verifier can locate it for SC-006.

## Decision

Durable curated memory for MzM Bot has two product/data-model layers:

| Layer | Scope | Typical contents (illustrative, not shipped schema) |
|-------|-------|-----------------------------------------------------|
| **Agent memory** | One bot (agent) | Persona-local preferences, project facts for that bot, ongoing task state owned by that bot |
| **User memory** | Shared across bots (account / user) | Profile facts, durable preferences, cross-bot context |

**Transcript** (per conversation chat history) is **not** curated memory. Full chat logs remain conversation-scoped; they do not substitute for either memory layer.

Phase 2 delivery for this ADR:

- Land this file under `MzM-Docs/adr/` (filename identifies agent vs user memory layers).
- Ship **no** memory productization UX: no profile / log / note authoring, no recall product flow, no memory chrome required for P2 Pass (FR-010 / SC-006).

Product vocabulary kinds named in the initial plan (**profile**, **log**, **note**) and runtime recall/write behavior remain **deferred to Phase 5 (P5)**. This ADR does not define P5 UX, APIs, storage schemas, or Host/Client surfaces.

## Consequences

- Implementers and Architects treat agent-scoped vs user-scoped memory as separate durable layers when P5 designs stores and tools; P5 must not require a layer-model rewrite to introduce that split.
- P2 interactive work (persona fields, rename/avatar, sidebar sections, delete-confirm) does not grow memory UI, memory tools, or memory persistence beyond this document.
- DH Verifier Scenario 5 Pass = this ADR present under `MzM-Docs/adr/` with identifying filename + stated P2 non-delivery of memory UX; Pass does **not** require a recall demo.
- Skills library remains owned by P3; this ADR does not authorize skills or memory UX creep in P2.

## Alternatives considered

| Option | Why not |
|--------|---------|
| ADR under `docs/adr/` or `.agents/notes/` | Clarify lock 2 requires `MzM-Docs/adr/` |
| Ship memory UX in P2 “while here” | Violates P2 Out / FR-010; memory productization is P5 |
| Skip ADR until P5 | Violates FR-009 / SC-006; risks layer rewrite at C |
| Single undifferentiated “memory” store | Collapses agent-private and user-global facts; contradicts initial-plan §4 seam honesty |

## Traceability

| Capability | Requirement | Acceptance |
|------------|-------------|------------|
| US5 Memory layers ADR only | FR-009 (ADR under `MzM-Docs/adr/`; filename identifies layers) | SC-006 presence |
| US5 no memory product UX in P2 | FR-010 | SC-006 non-goal (no recall/write product flow for Pass) |

**Contract:** `specs/002-identity-personas/contracts/memory-layers-adr.md`
**Task:** T036 (land ADR) · T037 (Verifier Scenario 5 recipe) · T038 (non-goals assert)
**Linear:** MOH-135 (T036)
