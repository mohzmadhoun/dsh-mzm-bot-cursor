# Quickstart: Phase 1 Wedge A — validation guide

**Feature**: `specs/001-multi-model-bots`
**Date**: 2026-09-26
**Purpose:** Runnable validation scenarios for Verifier / implementers. Not an implementation guide.

Prerequisites and expected outcomes reference [contracts/](./contracts/) and [data-model.md](./data-model.md).
Verifier recipes home: [verifier/README.md](./verifier/README.md).

---

## Prerequisites

1. Repo checkout with Desktop app buildable (`apps/desktop`, `apps/desktop-host`).
2. At least **two distinct configured model/provider assignments** available (any providers; no fixed catalog).
3. Ability to enter provider credentials **in-app** (env/key files only for CI shortcuts — not primary evidence for SC-006 Pass).
4. Spec artifacts: [spec.md](./spec.md), [plan.md](./plan.md), [architecture.md](./architecture.md).

---

## Scenario → Verifier recipe checklist (T042)

Each quickstart scenario MUST cite a Verifier recipe. Spec validates links only; implementers / Verifier execute the recipes.

| Scenario | Recipe | Quickstart cites recipe | Recipe cites quickstart | Notes |
|----------|--------|-------------------------|-------------------------|-------|
| **0** Topology handshake | [verifier/scenario-0-topology.md](./verifier/scenario-0-topology.md) | Yes | Yes | SC-007 gate; Pass recorded |
| **1** In-app auth + clean dump | [verifier/scenario-1-credentials.md](./verifier/scenario-1-credentials.md) | Yes | Yes | SC-006 / T037 |
| **2** Multi-model team session | [verifier/scenario-2-multi-model.md](./verifier/scenario-2-multi-model.md) | Yes | Yes | SC-001/002 / T018–T019 |
| **3** Host mailbox 1:1 | [verifier/scenario-3-mailbox.md](./verifier/scenario-3-mailbox.md) | Yes | Yes | SC-003 / T025 |
| **4** Progress + final | [verifier/scenario-4-progress-final.md](./verifier/scenario-4-progress-final.md) | Yes | Yes | SC-004 / T032; composite Pass may remain Deferred until Verifier re-runs after T030 on checkout |
| **5** Full Phase 1 replay | [verifier/scenario-5-full-replay.md](./verifier/scenario-5-full-replay.md) | Yes | Yes | SC-005 outline (T042); Verifier evidence expansion remains T038 |

Owners map: [verifier/README.md](./verifier/README.md#scenario-05-owners-map).

---

## Scenario 0 — Topology handshake (gate)

**Contract:** [contracts/topology-handshake.md](./contracts/topology-handshake.md)
**Recipe:** [verifier/scenario-0-topology.md](./verifier/scenario-0-topology.md)
**Owners:** DH Electron + DH Verifier scripts
**Must Pass before** Scenarios 1–4 count toward phase Done.

**Steps (outline):**

1. Launch desktop app under test.
2. Assert single Desktop Host child spawn (`ELECTRON_RUN_AS_NODE` / documented equivalent).
3. Capture Node IPC `ready` with `url`; assert no chat/mailbox on IPC.
4. Assert main frame `dsh-app://`; perform authenticated HTTP + ≥1 WS/stream to Host URL.
5. Ordered shutdown → `shutdown-complete` / clean exit.
6. Negative: attempt fake mailbox over Electron IPC → rejected/impossible.

**Expected:** SC-007 Pass evidence recorded (log + screenshot/trace).

---

## Scenario 1 — In-app auth + clean dump

**Contract:** [contracts/in-app-credentials.md](./contracts/in-app-credentials.md)
**Recipe:** [verifier/scenario-1-credentials.md](./verifier/scenario-1-credentials.md)

1. Fresh profile (or cleared credentials for providers under test).
2. Enter credentials via in-app UI for providers needed.
3. Create a bot that uses one provider; confirm a call authenticates.
4. Export / dump session transcript; review for raw secrets.

**Expected:** US4 scenarios; SC-006 — no raw secrets in dump.

---

## Scenario 2 — Multi-model team session (< 30 min TTFT)

**Contract:** [contracts/bot-create-model.md](./contracts/bot-create-model.md)
**Recipe:** [verifier/scenario-2-multi-model.md](./verifier/scenario-2-multi-model.md)

1. From clean-machine documented path: install/launch → credentials → create Bot A (model X) → Bot B (model Y), X ≠ Y among configured assignments.
2. Run one real work session using both bots without opening another product for model access.
3. Record wall time from first launch to completed multi-model session.

**Expected:** SC-001 (< 30 min documented), SC-002; FR-001…003, FR-007.

---

## Scenario 3 — Host mailbox 1:1 handoff

**Contract:** [contracts/host-mailbox-1to1.md](./contracts/host-mailbox-1to1.md)
**Recipe:** [verifier/scenario-3-mailbox.md](./verifier/scenario-3-mailbox.md)

1. With ≥2 bots present, trigger async 1:1 from A → B via Host mailbox path.
2. Observe delivery in UI.
3. Confirm B acts **or** handoff remains visible without copy-paste.

**Expected:** SC-003; FR-004…005. Fail if delivery required Electron IPC bus.

---

## Scenario 4 — Progress + final

**Contract:** [contracts/chat-progress-final.md](./contracts/chat-progress-final.md)
**Recipe:** [verifier/scenario-4-progress-final.md](./verifier/scenario-4-progress-final.md)

1. Scripted chat (may be same session as Scenario 2 or 3).
2. Observe ≥1 progress update before completion.
3. Observe final result after completion.

**Expected:** SC-004; FR-006.

---

## Scenario 5 — Full Verifier replay

**Acceptance:** SC-005
**Recipe:** [verifier/scenario-5-full-replay.md](./verifier/scenario-5-full-replay.md) (requires Scenario 0 Pass first)

DH Verifier re-runs documented Phase 1 path on real desktop app and records pass/fail against [spec.md](./spec.md) after Scenario 0 Pass.

---

## Out of scope checks (must remain absent)

Box/Shell backends, MCP/1Password connector product flow, personas/skills/routines/memory product UX, pixel Grok chrome — not required; do not fail Pass for absence.
See [verifier/non-goals.md](./verifier/non-goals.md).
