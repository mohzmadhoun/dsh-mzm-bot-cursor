# Contracts: Phase 4 — Routines (cron only)

**Feature**: `specs/004-routines-cron`
**Date**: 2026-09-27
**Audience**: DH Runtime, DH Electron, DH Client/Web, DH Verifier, DH Architect (optional confirm)
**Non-goal**: Implementation code; these are interface/acceptance contracts for tasks.

Cross-refs: [spec.md](../spec.md) · [data-model.md](../data-model.md) · [research.md](../research.md) · predecessors [001](../../001-multi-model-bots/contracts/) · [002](../../002-identity-personas/contracts/) · [003](../../003-skills-ux/contracts/)

| Contract file | Seam |
|---------------|------|
| [create-list.md](./create-list.md) | Create cron routine + per-bot pane list (FR-001…002, FR-006…007) |
| [pause-resume.md](./pause-resume.md) | Pause / resume durable lifecycle (FR-003…004) |
| [cron-fire.md](./cron-fire.md) | Scheduled fire + last-run visibility (FR-005) |
| [non-goals.md](./non-goals.md) | Explicit Out / SC-004 |

**Cross-cutting:** FR-010 desktop screenshots/recordings + FR-011 committed `verifier/evidence/` + PR embeds apply to every GUI scenario. Unit/jsdom alone fails GUI Pass.

**Seam honesty:** Host `dsh-schedule` is routines SoT; pane projects Host; Electron Main has no durable routines bus; `dsh-jobs` is not the routines catalog.
