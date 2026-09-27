# Research: Phase 4 — Routines (cron only)

**Feature**: `specs/004-routines-cron`
**Date**: 2026-09-27
**Inputs**: [spec.md](./spec.md) (Clarified) · `MzM-Docs/mzm-bot-plan.md` P4 · `MzM-Docs/mzm-bot-initial-plan.md` §5 (cron only) · constitution v1.0.0 · predecessors `specs/001`–`003` · packages `dsh-schedule`, `dsh-jobs`, `dsh-client-ui-schedule`

All Technical Context unknowns from plan.md are resolved below. Format: Decision / Rationale / Alternatives.

---

## R1 — Host schedule is the routines source of truth (seam lock)

**Decision:** Phase 4 **routines** are Host-owned durable **schedule records** via `@deepseek-ai/dsh-schedule` (session `schedule/change` fold / equivalent Host durable path). The desktop **routines pane projects** that Host state for the selected bot. Electron Main MUST NOT own a parallel routines store or IPC bus that mutates routine state without Host.

**Rationale:** Spec FR-007; living-gate seam hint; constitution V (seam honesty); existing schedule package already owns create/list/dispatch, durable replay, and Client projection vocabulary (`ScheduleRecord` / `dsh-client-ui-schedule` patterns).

**Alternatives considered:**

| Option | Why not |
|--------|---------|
| Electron Main SQLite/JSON routines store | Parallel bus; fails FR-007 |
| Renderer-only localStorage list | Not Host-durable; fails restart/pause proofs |
| New top-level “routines” package ignoring schedule | Duplicates timers + durability already in `dsh-schedule` |

---

## R2 — Pause / resume on Host schedule (Architect optional confirm)

**Decision:** Pause and resume are **Host schedule lifecycle operations** that persist across restart and suppress dispatch while paused. Product UI exposes pause/resume on the routines pane. Implement may extend `dsh-schedule` durable ops and/or a thin Host RPC facade over schedule — **exact API shape is tasks-time**, but ownership stays Host schedule, not Electron Main.

**Architect flag (optional):** Confirm whether pause/resume should land as first-class `schedule/change` operations vs a Host-only control plane wrapping create/delete+flags. Spec Pass only requires durable paused/active behavior (FR-003/004).

**Rationale:** Clarify + FR-003/004 / SC-002; current public schedule tools are create/list/delete — pause/resume is a known P4 gap relative to today’s tool surface; domain currently rejects unknown ops such as bare `pause` payloads.

**Alternatives considered:** Soft “pause” = delete (loses identity; fails resume); Client-only pause flag (not Host-durable; fails SC-002).

---

## R3 — Per-bot isolation via bot↔session binding (Architect optional confirm)

**Decision:** Routines are **per-bot**. Plan default: each bot’s routines are the schedule records belonging to **that bot’s Host session** (or the Host-equivalent association already used for Agent Teams bots). Creating a routine on bot A MUST NOT list it on bot B’s pane (SC-006). Pane always scopes to the selected bot.

**Architect flag (optional):** Confirm bot↔session binding used in Desktop Host for P1–P3 is sufficient as the schedule ownership key; if Runtime prefers an explicit botId field on schedule records, lock that in tasks without inventing an Electron store.

**Rationale:** Spec US1/SC-006; schedule today is session-local — binding routines to the bot’s session is the simplest reuse path.

**Alternatives considered:** Global account-wide routines list (violates per-bot Pass); new cross-session routines registry (YAGNI for P4 if session binding works).

---

## R4 — Fire = schedule dispatch / Host wake (not LLM proof; not Box/MCP)

**Decision:** A Pass **fire** is a Host schedule **dispatch** that queues applying the routine’s **intent** as a bot wake/turn (schedule follow-up / equivalent), with a **last-run / fire indicator** visible in the pane or clearly linked activity. Proving specific LLM reply wording or external side effects is **not** required. Prefer schedule’s existing idle follow-up delivery path over inventing a second fire pipeline.

**Rationale:** Clarify Q1; FR-005 / SC-003; matches `dsh-schedule` “due reminders appear as ordinary follow-up messages” model.

**Alternatives considered:** Require chat transcript text match (non-deterministic); fire only as `dsh-jobs` background job without pane last-run (misses visibility); cold-session external notify (out of schedule’s session-local model; not required for Pass with desktop available).

---

## R5 — Schedule expressions for Pass (`@every` / product-supported)

**Decision:** For Verifier Pass, product-supported schedules include at least a **recurring interval** at inventory minimum (**`@every 5m` / 300s**). Verifier observation window is **≤6 minutes**. Full 5-field cron and inventory shorthands (`@hourly`, `@daily`, …) MAY ship if mapped onto Host schedule selectors, but are **not** required beyond what Pass needs. **No** special sub-5-minute test-only schedule.

**Rationale:** Clarify Q2; `dsh-schedule` already enforces repeating interval ≥5 minutes; aligns with FR-005 / SC-003.

**Alternatives considered:** Mandate 5-field cron parser in P4 (unnecessary for Pass); force sub-5m test hooks (clarify rejected).

---

## R6 — `dsh-jobs` role (explicit non-SoT)

**Decision:** `@deepseek-ai/dsh-jobs` / `dsh-jobs-local` remain the **background tool-job** registry. They are **not** the routines catalog, pane list source, or pause/resume authority. A fire path MAY incidentally create a job if a future tool run needs one, but Pass does **not** require jobs UI or job ids for routine fire proof.

**Rationale:** Living-gate “Host jobs/schedule” means Host owns work+timing; schedule owns cron routines; jobs package README is tool background work — conflating them creates a second bus.

**Alternatives considered:** Store routines as jobs records (wrong lifecycle; no schedule fold); Electron jobs mirror (forbidden).

---

## R7 — Client pane vs existing `ui-schedule` header catalog

**Decision:** P4 Pass surface is a **bot info-pane routines list** with create + pause/resume + last-run visibility (spec US1–US4). Existing `@deepseek-ai/dsh-client-ui-schedule` session-header **read-only** catalog may be reused for projection patterns / ordering inspiration, but **alone is insufficient** for Pass (no create/pause/resume on that catalog today). Implement may extend Client schedule UI or add a bot-scoped routines pane that still **only reads/writes Host**.

**Rationale:** Spec pane list + lifecycle controls; current ui-schedule README: read-only, no mutation RPC.

**Alternatives considered:** Declare header catalog as Pass surface (fails create/pause/resume); build Electron-native pane store (forbidden).

---

## R8 — Confirm / edit / display-name (clarify restatement)

**Decision:** Confirm-on-create, edit-routine, and separate display-name fields are **optional**; not Pass gates. Identity MAY be intent text or intent-derived summary. Empty intent or invalid schedule MUST reject create with a clear user-visible reason.

**Rationale:** Clarify Q3–Q5; FR-001/012; SC-001/007.

**Alternatives considered:** Require confirm card (inventory guidance only; clarify optional).

---

## R9 — Non-goals unchanged

**Decision:** Event listeners, memory recall UX, Box/Shell, MCP/connectors remain Out. Absence does not fail Pass (SC-004).

**Rationale:** Plan P4 Out; FR-006/008.

---

## Seam map (summary)

```text
User (Desktop Client pane)
    │  create / pause / resume / list / last-run (UI only)
    ▼
Desktop Host  ──►  dsh-schedule (durable SoT + timers + dispatch wake)
              ──►  dsh-jobs (background tools only; NOT routines SoT)
Electron Main ──►  lifecycle/IPC only; NO routines durable store
```

**Architect optional spawn topics:** R2 pause/resume Host API shape; R3 bot↔session ownership key.
