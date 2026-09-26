# Contracts: Phase 1 Wedge A

**Feature**: `specs/001-multi-model-bots`
**Date**: 2026-09-26
**Audience**: DH Runtime, DH Electron, DH Client/Web, DH Verifier
**Non-goal**: Implementation code; these are interface/acceptance contracts for tasks.

Cross-refs: [spec.md](../spec.md) · [architecture.md](../architecture.md) · [data-model.md](../data-model.md) · [research.md](../research.md)

| Contract file | Seam |
|---------------|------|
| [topology-handshake.md](./topology-handshake.md) | Shell↔Host entry gate (SC-007) |
| [bot-create-model.md](./bot-create-model.md) | Bot create + per-bot model (FR-001…003) |
| [host-mailbox-1to1.md](./host-mailbox-1to1.md) | Host mailbox async 1:1 (FR-004…005) |
| [chat-progress-final.md](./chat-progress-final.md) | Progress + final delivery (FR-006) |
| [in-app-credentials.md](./in-app-credentials.md) | In-app auth + dump hygiene (FR-008…009, SC-006) |
