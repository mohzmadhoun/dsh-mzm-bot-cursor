# Quickstart: Phase 3 — Skills UX validation guide

**Feature**: `specs/003-skills-ux`
**Date**: 2026-09-27
**Purpose:** Runnable validation scenarios for Verifier / implementers. Not an implementation guide.

Prerequisites and expected outcomes reference [contracts/](./contracts/) and [data-model.md](./data-model.md).
Verifier recipes home: [verifier/README.md](./verifier/README.md).

**Standing order 11 / FR-012:** Every GUI scenario below requires desktop screenshot(s) and/or a short screen recording of the real Desktop app. Unit/jsdom alone fails.

---

## Prerequisites

1. Desktop app buildable (`apps/desktop`, `apps/desktop-host`) with P1 create-bot and P2 identity available.
2. Ability to create or select at least one bot (two bots for SC-006).
3. Spec artifacts: [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md).
4. Thin pack: exactly one managed skill shipped (see [thin-managed-pack.md](./contracts/thin-managed-pack.md)).
5. Foundational Pass (T014) stamped in [verifier/README.md](./verifier/README.md) before Scenarios 1–5 count toward phase Done.

---

## Scenario → Verifier recipe checklist (T037)

Each quickstart scenario MUST cite a Verifier recipe. Spec validates links and step coverage only; implementers / Verifier execute the recipes.

| Scenario | Recipe | Quickstart cites recipe | Recipe cites quickstart | Notes |
|----------|--------|-------------------------|-------------------------|-------|
| **1** Discover / load managed skill | [verifier/scenario-1-discover-load.md](./verifier/scenario-1-discover-load.md) | Yes | Yes | SC-001 · T019 · FR-012 |
| **2** Attach / run on a bot | [verifier/scenario-2-attach-run.md](./verifier/scenario-2-attach-run.md) | Yes | Yes | SC-002/006/007 · T026 · FR-012 |
| **3** Author skill (+ reject empty) | [verifier/scenario-3-skill-authoring.md](./verifier/scenario-3-skill-authoring.md) | Yes | Yes | SC-003 · T031 · FR-012 |
| **4** Thin pack / non-goals | [verifier/scenario-4-thin-pack.md](./verifier/scenario-4-thin-pack.md) · [verifier/non-goals.md](./verifier/non-goals.md) | Yes | Yes | SC-004 · T033/T034/T038 · GUI optional |
| **5** Full Phase 3 replay | [verifier/scenario-5-full-replay.md](./verifier/scenario-5-full-replay.md) | Yes | Yes | SC-005 · T036; foundational Pass required first |

Owners map: [verifier/README.md](./verifier/README.md#scenario-15-owners-map).
Evidence filename expectations: [verifier/evidence/](./verifier/evidence/) (T035).
Non-goals absence checks: [verifier/non-goals.md](./verifier/non-goals.md) (T033 + T038 asserted).

**T037 validation (2026-09-27):** Scenarios 1–5 quickstart steps cite landed Verifier recipes (no Spec-owned recipe content gaps). Scenario 5 lands via T036; non-goals re-validated via T038.

---

## Scenario checklist (contracts + FR-012)

| Scenario | Contract | Success criteria | FR-012 visual evidence |
|----------|----------|------------------|------------------------|
| **1** Discover / load managed skill | [discover-load.md](./contracts/discover-load.md) | SC-001 | Required |
| **2** Attach / run on a bot | [attach-run.md](./contracts/attach-run.md) | SC-002, SC-006, SC-007 | Required |
| **3** Author skill (+ reject empty) | [skill-authoring.md](./contracts/skill-authoring.md) | SC-003 | Required |
| **4** Thin pack / non-goals | [thin-managed-pack.md](./contracts/thin-managed-pack.md) | SC-004 | Docs/absence ok; GUI not required |
| **5** Full Phase 3 replay | All above | SC-005 | Required |

---

## Scenario 1 — Discover / load

**Contract:** [contracts/discover-load.md](./contracts/discover-load.md)
**Recipe:** [verifier/scenario-1-discover-load.md](./verifier/scenario-1-discover-load.md)

1. Launch Desktop app; open skills discovery/library.
2. Confirm exactly one managed skill from the thin pack is listed with a human-readable name.
3. Make that skill available to attach (load; no separate ritual required).
4. Leave and return to discovery — skill still available.
5. Restart app or reload Host state — managed skill still listed/available.
6. Capture desktop screenshot(s) and/or short screen recording → `verifier/evidence/scenario-1/`.

**Expected:** SC-001 Pass evidence.

---

## Scenario 2 — Attach / run

**Contract:** [contracts/attach-run.md](./contracts/attach-run.md)
**Recipe:** [verifier/scenario-2-attach-run.md](./verifier/scenario-2-attach-run.md)

1. Select bot A; attach the loaded managed skill; confirm it appears on **bot A’s** skills/overview surface (not only global catalog).
2. Open bot B — skill is **not** attached solely because of A (SC-006).
3. On bot A, run via dedicated control **or** session turn that applies the skill; confirm run/active UI.
4. Optionally observe instruction assembly includes attached skill text (SC-007); do **not** require LLM reply match.
5. Restart/reload — attachment on A remains.
6. Capture desktop visual evidence → `verifier/evidence/scenario-2/`.

**Expected:** SC-002, SC-006, SC-007 Pass evidence.

---

## Scenario 3 — Author skill

**Contract:** [contracts/skill-authoring.md](./contracts/skill-authoring.md)
**Recipe:** [verifier/scenario-3-skill-authoring.md](./verifier/scenario-3-skill-authoring.md)

1. Open authoring; attempt save with empty name or empty body → reject with clear reason.
2. Create skill with non-empty name + instructional body; save → appears in discovery as user-authored.
3. Edit and re-save → values replace prior.
4. Load/attach to a bot; confirm attach/run behave like managed for Pass.
5. Capture desktop visual evidence → `verifier/evidence/scenario-3/`.

**Expected:** SC-003 Pass evidence.

---

## Scenario 4 — Thin pack / non-goals

**Contract:** [contracts/thin-managed-pack.md](./contracts/thin-managed-pack.md)
**Recipe:** [verifier/scenario-4-thin-pack.md](./verifier/scenario-4-thin-pack.md) · [verifier/non-goals.md](./verifier/non-goals.md)

1. Confirm discovery shows the single thin-pack managed skill (not a full inventory dump).
2. Confirm Pass does not require learn-from-demonstration, plugin skills, or full catalog.

**Expected:** SC-004 Pass (absence checks).

---

## Scenario 5 — Full replay

**Recipe:** [verifier/scenario-5-full-replay.md](./verifier/scenario-5-full-replay.md) (requires foundational Pass + Scenarios 1–3 observations)

Re-run Scenarios 1–3 on real Desktop with FR-012 evidence filed; record overall Pass/Fail (SC-005).

---

## Evidence layout (implement / Verifier)

```text
specs/003-skills-ux/verifier/evidence/
├── scenario-1/   # screenshots / recording + VERDICT.txt · README (T035)
├── scenario-2/
├── scenario-3/
├── non-goals/    # SC-004 measured checks
└── scenario-5/   # full replay
```

Filename expectations live in each directory’s `README.md` (T035). Recipes under `verifier/*.md` own Pass/Fail steps.
