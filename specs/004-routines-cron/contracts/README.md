# Contracts: Phase 4 — Routines (cron only)

**Feature**: `specs/004-routines-cron`
**Date**: 2026-09-27
**Audience**: DH Runtime, DH Electron, DH Client/Web, DH Verifier, DH Architect
**Non-goal**: Implementation code; these are interface/acceptance contracts for tasks.

Cross-refs: [spec.md](../spec.md) · [data-model.md](../data-model.md) · [research.md](../research.md) · Architect Option 3 on MOH-191 · predecessors [001](../../001-multi-model-bots/contracts/) · [002](../../002-identity-personas/contracts/) · [003](../../003-skills-ux/contracts/)

| Contract file | Seam |
|---------------|------|
| [create-list.md](./create-list.md) | Host Routine CRUD + per-bot pane projection (FR-001…002, FR-006…007) |
| [pause-resume.md](./pause-resume.md) | Host pause / resume (FR-003…004) |
| [cron-fire.md](./cron-fire.md) | Host cron wake + last-run (FR-005) |
| [non-goals.md](./non-goals.md) | Explicit Out / SC-004 / no Electron bus / schedule ≠ Routines SoT |

**Cross-cutting:** FR-010 desktop screenshots/recordings + FR-011 committed `verifier/evidence/` + PR embeds apply to every GUI scenario. Unit/jsdom alone fails GUI Pass.

**Seam honesty (Architect):** Host Routine catalog is SoT; Host cron wake; pane projects Host via HTTP/WS; Electron Main has no durable routines bus; `dsh-schedule` is **not** Routines SoT; `dsh-jobs` optional in-flight visibility only.
