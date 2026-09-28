# Quickstart: Phase 5 — Memory productization validation guide

**Feature**: `specs/005-memory-productization`
**Date**: 2026-09-28
**Purpose:** Runnable validation scenarios for Verifier / implementers. Not an implementation guide.

Prerequisites and expected outcomes reference [contracts/](./contracts/) and [data-model.md](./data-model.md).
Verifier recipes home: [verifier/](./verifier/) — owners + evidence map in [verifier/README.md](./verifier/README.md).

**Standing orders 11+12 / FR-011/012:** Every GUI scenario below requires desktop screenshot(s) and/or a short screen recording of the real Desktop app, **committed** under `specs/005-memory-productization/verifier/evidence/` and embedded in the GUI PR body. Unit/jsdom alone fails.

**Seam reminder:** Host Memory catalog SoT + Host instruction/context inject. Do **not** validate Pass by dumping chat transcript alone, treating Electron Main as the memory store, or treating Client-only persistence as SoT. Prefer Agent Teams / Host journal persistence (research R1).

---

## Prerequisites

1. Desktop app buildable (`apps/desktop`, `apps/desktop-host`) with P1–P4 bots available (≥2 bots for layer checks).
2. Host Memory catalog mounted on Desktop Host (tasks specify package paths; prefer `packages/experimental/agent-team/`).
3. Spec artifacts: [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md).
4. Topology: dual-process Host child; memory traffic on Host HTTP/WS — not Main IPC.
5. ADR present: `MzM-Docs/adr/agent-vs-user-memory-layers.md`.

---

## Scenario checklist (contracts + visual evidence)

| Scenario | Contract | Recipe | Evidence | Success criteria | FR-011/012 |
|----------|----------|--------|----------|------------------|------------|
| **1** Write profile / log / note | [write-kinds.md](./contracts/write-kinds.md) | [scenario-1-write-kinds.md](./verifier/scenario-1-write-kinds.md) | [evidence/scenario-1/](./verifier/evidence/scenario-1/) | SC-001, SC-002, SC-003, SC-009 | Required |
| **2** Recall after restart (surface + inject) | [recall.md](./contracts/recall.md) | [scenario-2-recall.md](./verifier/scenario-2-recall.md) | [evidence/scenario-2/](./verifier/evidence/scenario-2/) | SC-004 | Required |
| **3** Agent vs user layers | [layers.md](./contracts/layers.md) | [scenario-3-layers.md](./verifier/scenario-3-layers.md) | [evidence/scenario-3/](./verifier/evidence/scenario-3/) | SC-005, SC-010 | Required |
| **4** Non-goals absence | [non-goals.md](./contracts/non-goals.md) | [non-goals.md](./verifier/non-goals.md) | [evidence/non-goals/](./verifier/evidence/non-goals/) (alias [scenario-4/](./verifier/evidence/scenario-4/)) | SC-006, SC-008…010 | Docs/absence ok |
| **5** Full Phase 5 replay | All above | `scenario-5-full-replay.md` (T033 — Verifier) | [evidence/scenario-5/](./verifier/evidence/scenario-5/) | SC-007 | Required |

---

## Scenario 1 — Write profile / log / note

**Contract:** [contracts/write-kinds.md](./contracts/write-kinds.md)
**Recipe:** [verifier/scenario-1-write-kinds.md](./verifier/scenario-1-write-kinds.md) (T016/T019/T022; evidence under `verifier/evidence/scenario-1/`)

1. Launch Desktop; select a bot (or account memory context as product UI defines).
2. Open **memory write / surface** (not chat-only).
3. Write non-empty **profile**, **log**, and **note**; confirm each appears as saved curated memory.
4. Attempt empty write for any kind → rejected with clear reason; nothing listed.
5. Leave surface and return (no restart) → same three facts remain.
6. Capture desktop visual evidence → `verifier/evidence/scenario-1/` (commit + PR embed).

**Expected:** SC-001, SC-002, SC-003 · SC-009 (bot-tool not required).

---

## Scenario 2 — Recall after restart

**Contract:** [contracts/recall.md](./contracts/recall.md)
**Recipe:** [verifier/scenario-2-recall.md](./verifier/scenario-2-recall.md) (T026; evidence under `verifier/evidence/scenario-2/`)

1. With Scenario 1 facts saved, **restart** the Desktop app (or Verifier durable reload).
2. Open memory surface / recall path → profile, log, and note return with kinds distinguishable.
3. Start a subsequent bot turn; confirm **Host model-visible inject** makes ≥1 curated fact available (observe assembly/inject indicator or session-log reconstructable inject — do **not** score LLM wording).
4. Capture desktop visual evidence → `verifier/evidence/scenario-2/`.

**Expected:** SC-004.

---

## Scenario 3 — Agent vs user layers

**Contract:** [contracts/layers.md](./contracts/layers.md)
**Recipe:** [verifier/scenario-3-layers.md](./verifier/scenario-3-layers.md) (T030 SC-005/SC-010 stamped; evidence under `verifier/evidence/scenario-3/`)

1. With bots A and B available, save an **agent-scoped** fact on bot A.
2. Open bot B agent memory → A’s agent fact is **not** listed as B’s.
3. Save a **user-scoped** fact; confirm it is available in both bot A and bot B contexts.
4. Restart/reload → layer isolation and user sharing still hold.
5. Optionally write different kinds on either layer to show orthogonality (SC-010).
6. Capture desktop visual evidence → `verifier/evidence/scenario-3/`.

**Expected:** SC-005, SC-010.

---

## Scenario 4 — Non-goals / seam absence

**Contract:** [contracts/non-goals.md](./contracts/non-goals.md)
**Recipe:** [verifier/non-goals.md](./verifier/non-goals.md) (T031) · [verifier/transcript-not-memory.md](./verifier/transcript-not-memory.md) · evidence under `verifier/evidence/non-goals/` (alias `verifier/evidence/scenario-4/`)

1. Confirm Pass path does not require Grok chrome parity, connectors/MCP/event routines, or Box/Shell.
2. Confirm Electron Main is not the durable memory SoT (no memory bus on lifecycle IPC — extend `host-protocol.ts` exclusion list like P4 routines).
3. Confirm Pass is **not** “transcript dump as memory” and **not** Client-only persistence as SoT.
4. Confirm absence of bot-tool write or edit/delete does **not** fail Pass; kind→layer locks are not Pass gates.
5. Confirm P5 implement PRs do not rewrite `specs/001`–`004`.
6. Document absence checks under `verifier/evidence/non-goals/`.

**Expected:** SC-006, SC-008, SC-009, SC-010.

---

## Scenario 5 — Full Phase 5 replay

**Recipe:** [verifier/scenario-5-full-replay.md](./verifier/scenario-5-full-replay.md) (T033 — Verifier owns; evidence under `verifier/evidence/scenario-5/`)

1. Re-run Scenarios 1–4 in order on the real Desktop app (or cite stamped Scenario 1–3 Pass media + fresh smoke per recipe time-box).
2. File Pass/Fail evidence under `verifier/evidence/` with SO 11+12 embeds for GUI slices.
3. Record overall verdict against [spec.md](./spec.md).

**Expected:** SC-007.

---

## Evidence path convention

```text
specs/005-memory-productization/verifier/evidence/
├── scenario-1/   # QS Scenario 1 write kinds (T016/T019/T022)
├── scenario-2/   # QS Scenario 2 recall (T026)
├── scenario-3/   # QS Scenario 3 layers (T030)
├── scenario-4/   # alias → non-goals (QS Scenario 4 / SC-006)
├── non-goals/    # canonical SC-006 measured absence checks (T031)
└── scenario-5/   # QS Scenario 5 full replay (T033)
```

---

## Out of scope for this quickstart

- Creating `tasks.md` or implementation code
- Capturing desktop media in the plan PR (media lands on implement/Verifier GUI PRs)
- P6 connectors / P7 Box/Shell validation
- Rewriting `specs/001`–`004`
