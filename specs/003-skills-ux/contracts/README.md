# Contracts: Phase 3 — Skills UX

**Feature**: `specs/003-skills-ux`
**Date**: 2026-09-27
**Audience**: DH Runtime, DH Electron, DH Client/Web, DH Verifier
**Non-goal**: Implementation code; these are interface/acceptance contracts for tasks.

Cross-refs: [spec.md](../spec.md) · [data-model.md](../data-model.md) · [research.md](../research.md) · predecessors [001 contracts](../../001-multi-model-bots/contracts/) · [002 contracts](../../002-identity-personas/contracts/)

| Contract file | Seam |
|---------------|------|
| [discover-load.md](./discover-load.md) | Discover + load/available-to-attach (FR-001…002) |
| [attach-run.md](./attach-run.md) | Per-bot attach/run + instruction apply (FR-003…005, FR-014) |
| [skill-authoring.md](./skill-authoring.md) | Author/edit + reject empty (FR-006…007, FR-013) |
| [thin-managed-pack.md](./thin-managed-pack.md) | Exactly one managed skill for Pass (FR-008) |

**Cross-cutting:** FR-012 desktop screenshots/recordings apply to every GUI scenario in these contracts. Unit/jsdom alone fails GUI Pass.
