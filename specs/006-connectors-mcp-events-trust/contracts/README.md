# Contracts: Phase 6 — Connectors / MCP + event routines + trust

**Feature**: `specs/006-connectors-mcp-events-trust`
**Date**: 2026-09-28
**Audience**: DH Runtime, DH Electron, DH Client/Web, DH Verifier, DH Architect
**Non-goal**: Implementation code; these are interface/acceptance contracts for tasks.

## Implementer start here (after Architect answers)

1. Read this contracts index, then the five contract files below.
2. Honor **clarify locks** — do not reopen:
   - Webhook harness / Verifier fixture for event Pass
   - Vault UX optional (not mandatory Pass gate when in-app works)
   - Any one thin-catalog / fixture connector (not fixed name)
3. Read Spec-recommended Options + **Architect answers** in [research.md](../research.md) before coding SoT homes.
4. Predecessors: [001](../../001-multi-model-bots/contracts/) · [002](../../002-identity-personas/contracts/) · [003](../../003-skills-ux/contracts/) · [004](../../004-routines-cron/contracts/) · [005](../../005-memory-productization/contracts/) — do not rewrite.

Cross-refs: [spec.md](../spec.md) · [plan.md](../plan.md) · [data-model.md](../data-model.md) · [research.md](../research.md) · Clarify PR #200

| Contract file | Seam |
|---------------|------|
| [connector.md](./connector.md) | Install → auth → ready → successful tool call (FR-001…003, FR-017) |
| [event-routine.md](./event-routine.md) | Event-triggered routine create + harness fire + pause (FR-004/005/018) |
| [trust-deny.md](./trust-deny.md) | Denied-permission path (FR-006) |
| [secrets.md](./secrets.md) | Secrets absent + credential UX; vault optional (FR-007…009) |
| [non-goals.md](./non-goals.md) | Explicit Out / SC-005 / no Main bus / no 001–005 rewrite |

**Cross-cutting:** FR-014 desktop screenshots/recordings + FR-015 committed `verifier/evidence/` + PR embeds apply to every GUI scenario. Unit/jsdom alone fails GUI Pass.

**Seam honesty (Spec recommendation):** Host Connector + Routine catalogs SoT; mcp-client / webhook harness / credentials / user-approval composition; Client projects via HTTP/WS; Electron Main has no connector/event/trust bus; cron additive.
