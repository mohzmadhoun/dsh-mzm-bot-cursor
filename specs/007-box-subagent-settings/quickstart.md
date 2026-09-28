# Quickstart: Phase 7 — Computer / box + subagent parity + settings chrome

**Feature**: `specs/007-box-subagent-settings`
**Date**: 2026-09-28
**Purpose:** Runnable validation scenarios for Verifier / implementers. Not an implementation guide.

Prerequisites and expected outcomes reference [contracts/](./contracts/) and [data-model.md](./data-model.md).

**Standing orders 11+12 / FR-013/014:** Every GUI scenario below requires desktop screenshot(s) and/or a short screen recording of the real Desktop app, **committed** under the named evidence slice and embedded in the GUI PR body. Unit/jsdom alone fails.

**Clarify locks:** Settings → **Computer** with **Shell** + **Computer use**. computerUse Pass = screenshot-only + handoff. Readiness clear ≠ ready. Evidence dirs locked below.

**Seam reminder:** Host sandboxed Shell + `ctx.computerUse` + subagent + settings SoT (Architect Path A). Do **not** validate Pass via Main IPC bus or Client-only SoT. Host Pass fixture OK for computerUse if Cua unreachable; Shell settings row may be read-only readiness.

---

## Prerequisites

1. Desktop app buildable (`apps/desktop`, `apps/desktop-host`) with P1–P6 bots available.
2. Host sandboxed Shell mounted (`bash-sandbox`/`pwsh-sandbox` + sandbox-local + tools) with readiness projection.
3. computerUse-class path mounted (`dsh-computer-use` + one provider — Cua or Host fixture — + subagent spawn).
4. Global Settings → Computer UI projecting Host settings document.
5. Spec artifacts: [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md).
6. Topology: dual-process Host child; product traffic on Host HTTP/WS — not Main IPC.

---

## Scenario checklist (contracts + visual evidence)

| Scenario | Contract | Verifier recipe | Evidence dir | Success criteria | FR-013/014 |
|----------|----------|-----------------|--------------|------------------|------------|
| **1** Local Shell/box tool success | [shell-box.md](./contracts/shell-box.md) | [scenario-1-shell-box.md](./verifier/scenario-1-shell-box.md) | `verifier/evidence/shell-box/` | SC-001 | Required |
| **2** computerUse-class screenshot + handoff | [computer-use.md](./contracts/computer-use.md) | [scenario-2-computer-use.md](./verifier/scenario-2-computer-use.md) | `verifier/evidence/computer-use/` | SC-002 | Required |
| **3** Settings → Computer rows | [settings.md](./contracts/settings.md) | [scenario-3-settings-computer.md](./verifier/scenario-3-settings-computer.md) | `verifier/evidence/settings/` | SC-003, SC-004 | Required |
| **4** Non-goals absence | [non-goals.md](./contracts/non-goals.md) | [verifier/non-goals.md](./verifier/non-goals.md) | optional `verifier/evidence/non-goals/` | SC-005 | Docs/absence OK |
| **5** Full Phase 7 replay | All above | [scenario-5-full-replay.md](./verifier/scenario-5-full-replay.md) | all three GUI slices + `verifier/evidence/scenario-5/` | SC-006 | Required for GUI slices |

Owners map (Runtime / Client / Electron / Verifier): [verifier/README.md](./verifier/README.md). Filename expectations: `verifier/evidence/{shell-box,computer-use,settings}/README.md` (T029).

Mirror walkthrough copies under `/opt/cursor/artifacts/` when Cloud Agent Verifier runs (standing order 11). Commit under `verifier/evidence/` and embed in PR body (standing order 12).

---

## Scenario 1 — Local Shell / box tool success

**Contract:** [contracts/shell-box.md](./contracts/shell-box.md)

1. Launch Desktop; ensure ≥1 bot from prior phases.
2. Ensure box/computer backend reaches **ready** (if starting, observe clear not-ready/starting ≠ ready — do not score that attempt as Pass).
3. Invoke one Shell/box tool against the local backend; observe **user-visible success** (do not score LLM wording).
4. Capture desktop visual evidence → `verifier/evidence/shell-box/` (commit + PR embed).

**Expected:** SC-001.

---

## Scenario 2 — computerUse-class path (screenshot-only)

**Contract:** [contracts/computer-use.md](./contracts/computer-use.md)

1. With ready backend + parent bot, start one computerUse-class subagent path for GUI/desktop/browser **observation**.
2. Confirm ≥1 user-visible screenshot (or equivalent GUI observation artifact).
3. Confirm parent chat/session shows handoff/result indicator.
4. Do **not** require interactive browser click/type.
5. Capture desktop visual evidence → `verifier/evidence/computer-use/`.

**Expected:** SC-002.

---

## Scenario 3 — Settings → Computer rows

**Contract:** [contracts/settings.md](./contracts/settings.md)

1. Open Global Settings → **Computer**.
2. Confirm rows (or clearly labeled control groups) labeled **Shell** and **Computer use**.
3. Confirm this alone does **not** satisfy Scenarios 1–2 (SC-004).
4. Capture desktop visual evidence → `verifier/evidence/settings/`.

**Expected:** SC-003 · SC-004 (with Scenarios 1–2).

---

## Scenario 4 — Non-goals absence

**Contract:** [contracts/non-goals.md](./contracts/non-goals.md)
**Recipe:** [verifier/non-goals.md](./verifier/non-goals.md) (T028)

Confirm Pass does **not** require user machines, voice, draft-first, group channels, learn-from-demo, billing, full skill pack, pixel Grok, Verifier-as-feature, interactive-browser Pass gate, PTC/remote-as-Shell Pass, or rewrite of `specs/001`–`006`. Spot-check no Electron Main product bus for box/Shell/computerUse/settings.

**Expected:** SC-005.

---

## Scenario 5 — Full Phase 7 replay

**Recipe:** [verifier/scenario-5-full-replay.md](./verifier/scenario-5-full-replay.md) (T030)

Re-run Scenarios 1–4 on the real Desktop app; file evidence for all GUI slices (`shell-box/`, `computer-use/`, `settings/`); reconfirm foundational Pass (T015) + Electron bus; record pass/fail against this spec (SC-006). Composite stamp home: `verifier/evidence/scenario-5/`.

**Expected:** SC-006 (product Pass only after composite Desktop evidence — recipe alone is not Done).

---

## Exit mapping

| Exit (plan / epic) | Scenario | SC | Recipe |
|--------------------|----------|-----|--------|
| One local Shell/box tool path proven | 1 | SC-001 | [scenario-1-shell-box.md](./verifier/scenario-1-shell-box.md) |
| One computerUse-class subagent path proven | 2 | SC-002 | [scenario-2-computer-use.md](./verifier/scenario-2-computer-use.md) |
| Settings rows present (chrome ≠ substitute) | 3 (+1+2) | SC-003, SC-004 | [scenario-3-settings-computer.md](./verifier/scenario-3-settings-computer.md) |
| Non-goals absences acceptable | 4 | SC-005 | [non-goals.md](./verifier/non-goals.md) |
| Full Phase 7 Verifier replay | 5 | SC-006 | [scenario-5-full-replay.md](./verifier/scenario-5-full-replay.md) |

**T031 map re-validation:** 2026-09-28 — quickstart Scenario → recipe → evidence paths aligned with [verifier/README.md](./verifier/README.md); Scenario 4 = non-goals.
