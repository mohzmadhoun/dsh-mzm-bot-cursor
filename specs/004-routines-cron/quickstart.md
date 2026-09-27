# Quickstart: Phase 4 — Routines (cron only) validation guide

**Feature**: `specs/004-routines-cron`
**Date**: 2026-09-27
**Purpose:** Runnable validation scenarios for Verifier / implementers. Not an implementation guide.

Prerequisites and expected outcomes reference [contracts/](./contracts/) and [data-model.md](./data-model.md).
Verifier recipes home: `verifier/` (created in tasks — not required for plan Pass).

**Standing orders 11+12 / FR-010/011:** Every GUI scenario below requires desktop screenshot(s) and/or a short screen recording of the real Desktop app, **committed** under `specs/004-routines-cron/verifier/evidence/` and embedded in the GUI PR body. Unit/jsdom alone fails.

**Seam reminder:** Host Routine catalog SoT + Host cron wake. Do **not** validate Pass by mounting `dsh-schedule` overlay alone.

---

## Prerequisites

1. Desktop app buildable (`apps/desktop`, `apps/desktop-host`) with P1 create-bot and P2/P3 identity/skills available.
2. Ability to create or select at least two bots (SC-006).
3. Host Routine catalog + Host cron evaluator mounted on Desktop Host (tasks specify package paths).
4. Spec artifacts: [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md).
5. Shortest product-supported recurring schedule available (e.g. `@every 5m`); Verifier may wait ≤6 minutes.
6. Topology: dual-process Host child; routine traffic on Host HTTP/WS — not Main IPC.

---

## Scenario checklist (contracts + visual evidence)

| Scenario | Contract | Success criteria | FR-010/011 visual evidence |
|----------|----------|------------------|------------------------------|
| **1** Create + pane list | [create-list.md](./contracts/create-list.md) | SC-001, SC-006, SC-007 | Required |
| **2** Pause / resume | [pause-resume.md](./contracts/pause-resume.md) | SC-002 | Required |
| **3** Cron fire + last-run | [cron-fire.md](./contracts/cron-fire.md) | SC-003 | Required |
| **4** Non-goals absence | [non-goals.md](./contracts/non-goals.md) | SC-004 | Docs/absence ok |
| **5** Full Phase 4 replay | All above | SC-005 | Required |

---

## Scenario 1 — Create + pane list

**Contract:** [contracts/create-list.md](./contracts/create-list.md)
**Recipes:** [verifier/scenario-1-create-list.md](./verifier/scenario-1-create-list.md) (T018 create/reject/isolation) · [verifier/scenario-2-pane-list.md](./verifier/scenario-2-pane-list.md) (T021 list fields + leave/return; evidence still under `scenario-1/`)

1. Launch Desktop; select bot A.
2. Open **bot routines pane** (not session Schedule header alone); create routine with non-empty intent + product-supported schedule (confirm optional).
3. Confirm routine listed on bot A with active status (intent-derived identity OK).
4. Attempt empty intent or invalid schedule → rejected with clear reason.
5. Open bot B → routine from A not listed.
6. Leave/return (or reload) → same Host list remains (T021); confirm identity + schedule + status fields.
7. Capture desktop visual evidence → `verifier/evidence/scenario-1/` (commit + PR embed; include `04-`/`05-` for durability).

**Expected:** SC-001, SC-006, SC-007 · FR-002.

---

## Scenario 2 — Pause / resume

**Contract:** [contracts/pause-resume.md](./contracts/pause-resume.md)

1. With an active routine on bot A, pause it; pane shows paused.
2. Optionally wait one schedule interval while paused → no fire indicator update.
3. Resume; pane shows active.
4. Restart/reload → status preserved (Host durable).
5. Capture desktop visual evidence for paused and active → `verifier/evidence/scenario-2/`.

**Expected:** SC-002.

---

## Scenario 3 — Cron fire + last-run

**Contract:** [contracts/cron-fire.md](./contracts/cron-fire.md)

1. Ensure an **active** routine uses shortest product-supported recurring schedule.
2. Wait up to **6 minutes** for ≥1 automatic **Host** fire (no manual trigger).
3. Confirm pane (or linked activity) shows last-run / fire indicator for that routine.
4. Do **not** score LLM reply wording.
5. Capture desktop visual evidence → `verifier/evidence/scenario-3/`.

**Expected:** SC-003.

---

## Scenario 4 — Non-goals / seam absence

**Contract:** [contracts/non-goals.md](./contracts/non-goals.md)

1. Confirm Pass path does not require event listeners, memory UX, Box/Shell, or MCP.
2. Confirm Electron Main is not the durable routines SoT (no routines bus on lifecycle IPC).
3. Confirm Routines path is **not** “mount `dsh-schedule` overlay alone”; `dsh-jobs` is not the catalog SoT.
4. Document absence checks (recipe in tasks; clone P3 no-Electron-skills-bus pattern).

**Expected:** SC-004.

---

## Scenario 5 — Full Phase 4 replay

1. Replay Scenarios 1–3 (and 4 absence) on real Desktop.
2. File FR-010/011 evidence for all GUI steps.
3. Stamp SC-005 when Verifier Pass criteria met.

**Expected:** SC-005.

---

## Evidence path convention

```text
specs/004-routines-cron/verifier/evidence/
├── scenario-1/
├── scenario-2/
├── scenario-3/
├── non-goals/
└── scenario-5/
```

Mirror walkthrough copies under `/opt/cursor/artifacts/` when Cloud Agent Verifier runs (standing order 11). Commit under `verifier/evidence/` and embed in PR body (standing order 12).
