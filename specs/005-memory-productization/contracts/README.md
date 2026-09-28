# Contracts: Phase 5 — Memory productization

**Feature**: `specs/005-memory-productization`
**Date**: 2026-09-28
**Audience**: DH Runtime, DH Electron, DH Client/Web, DH Verifier, DH Architect
**Non-goal**: Implementation code; these are interface/acceptance contracts for tasks.

Cross-refs: [spec.md](../spec.md) · [data-model.md](../data-model.md) · [research.md](../research.md) · PO-locked Host Memory catalog Option on MOH-233 · ADR `MzM-Docs/adr/agent-vs-user-memory-layers.md` · Clarify PR #169 · predecessors [001](../../001-multi-model-bots/contracts/) · [002](../../002-identity-personas/contracts/) · [003](../../003-skills-ux/contracts/) · [004](../../004-routines-cron/contracts/)

| Contract file | Seam |
|---------------|------|
| [write-kinds.md](./write-kinds.md) | Host Memory write for profile/log/note (FR-001…003, FR-015) |
| [recall.md](./recall.md) | Surface recall after restart + model-visible Host inject (FR-005, FR-016) |
| [layers.md](./layers.md) | Agent vs user layers; kinds×layers orthogonal (FR-006/007, FR-017) |
| [non-goals.md](./non-goals.md) | Explicit Out / SC-006…010 / no Electron memory bus / transcript ≠ catalog |

**Cross-cutting:** FR-011 desktop screenshots/recordings + FR-012 committed `verifier/evidence/` + PR embeds apply to every GUI scenario. Unit/jsdom alone fails GUI Pass.

**Seam honesty (PO Option):** Host Memory catalog is SoT; prefer Agent Teams / Host journal; Client projects via HTTP/WS; Electron Main has no durable memory bus; transcript is not curated memory; Write Pass = UI; Recall Pass = surface + one Host injection path.
