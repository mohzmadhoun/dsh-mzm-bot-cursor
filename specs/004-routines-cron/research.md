# Research: Phase 4 — Routines (cron only)

**Feature**: `specs/004-routines-cron`
**Date**: 2026-09-27
**Inputs**: [spec.md](./spec.md) (Clarified) · `MzM-Docs/mzm-bot-plan.md` P4 · constitution v1.0.0 · predecessors `specs/001`–`003` · **DH Architect seam map on MOH-191** (Option 3)

All Technical Context unknowns from plan.md are resolved below. Format: Decision / Rationale / Alternatives.

**Supersedes** earlier draft that incorrectly treated `@deepseek-ai/dsh-schedule` as Routines SoT.

---

## R1 — Host-owned Routine catalog is the SoT (Architect Option 3)

**Decision:** Phase 4 **routines** are a **Host-owned Routine catalog** (prefer Agent Teams / Host journal extension, same pattern as P2 persona + P3 skills). Durable fields live on Host as `RoutineRecord` keyed by `botId`. The desktop **routines pane projects** that Host state. Electron Main and Client local stores MUST NOT be SoT.

**Rationale:** Architect Option 3; Spec FR-007; mirrors P2/P3 Host SoT + Client projection; supports per-bot pane, pause/resume, and product cron (including 5-field cron as Spec allows).

**Alternatives considered:**

| # | Option | Verdict |
|---|--------|---------|
| 1 | Mount `@deepseek-ai/dsh-schedule` as product Routines | **Reject** — session-local reminders; delay/absolute/interval ≥5m; **no** 5-field cron; **no** per-bot cross-session pane SoT; pause≠delete |
| 2 | Electron Main owns timers + stores routines; Host fires on IPC | **Reject** — parallel bus/storage; violates dual-process lock and FR-007 |
| 3 | **Host-owned Routine catalog + Host cron wake; Client pane projects; optional `ctx.jobs` for in-flight fire** | **Choose** |

---

## R2 — Do not ship P4 as “mount dsh-schedule”

**Decision:** `@deepseek-ai/dsh-schedule` remains **session-local durable reminders** (`schedule_create` / `schedule_list` / `schedule_delete` on the session log). Client `dsh-client-ui-schedule` is a read-only projection of that **session** catalog. P4 MAY borrow **time-math helpers** from schedule code if useful, but MUST NOT treat the Schedule catalog, Schedule overlay, or `ui-schedule` header as the Routines pane SoT or Pass surface.

**Rationale:** Architect package facts; schedule delivery needs live root agent and is conversation reminders, not bot routines.

**Alternatives considered:** Equate Routines pane with Schedule overlay (rejected); replace schedule package (out of scope / YAGNI).

---

## R3 — Host cron wake (product scheduler in Host process)

**Decision:** Cron match and wake run in the **Desktop Host** process while Host is live: product cron/shorthand → next fire → **Host agent/session path** starts/continues a bot turn with the routine intent. Not Electron `setInterval` / Main crontab. Not raw `dsh-schedule` dispatch as the product Routines fire path.

**Rationale:** Architect capability map; clarify fire = Host wake applying intent; FR-005.

**Alternatives considered:** Main-process timers (Option 2 reject); schedule follow-up as sole fire path (ties Routines to session reminders — Option 1 reject).

---

## R4 — Fire observability (last-run; LLM not scored)

**Decision:** A Pass **fire** is a Host **RoutineFire**: scheduled wake that starts/continues a bot turn with intent; pane **last-run** updates from Host after fire commit. Proving specific LLM reply wording or external side effects is **not** required.

**Rationale:** Clarify Q1; FR-005 / SC-003; Architect `RoutineFire` shape.

**Alternatives considered:** Require chat transcript text match (non-deterministic); cold-session external notify (not required for desktop-available Verifier).

---

## R5 — Schedule expressions for Pass

**Decision:** Product-supported schedules include Spec-allowed forms (5-field cron and/or shorthands such as `@every 5m`). Verifier observation window is **≤6 minutes**. Shortest product-supported recurring schedule for Pass may be `@every 5m`. **No** special sub-5-minute test-only schedule required. Host product scheduler owns evaluation — not limited to `dsh-schedule`’s interval-only model for the Routines SoT.

**Rationale:** Clarify Q2; Architect note that `dsh-schedule` lacks 5-field cron (another reason it is not SoT).

**Alternatives considered:** Force Routines to inherit schedule’s interval-only API (rejects Spec cron vocabulary).

---

## R6 — Optional `dsh-jobs` for in-flight fire visibility only

**Decision:** `@deepseek-ai/dsh-jobs` + `@deepseek-ai/dsh-jobs-local` MAY be used for **in-flight fire visibility** (`ctx.jobs`; process-local; jobs die with Host). They are **not** the durable Routine catalog, cron evaluator, pause/resume authority, or pane list SoT.

**Rationale:** Architect Option 3; jobs README = execution registry, not cron catalog.

**Alternatives considered:** Store routines as jobs records (wrong lifecycle); require jobs UI for Pass (unnecessary).

---

## R7 — Topology & data plane (unchanged dual-process)

**Decision:**
- **Electron shell** (`apps/desktop`): spawn Host child; lifecycle IPC only; load `dsh-app://`. Does **not** own routine records, timers, fire bus, or pane SoT.
- **Desktop Host** (`apps/desktop-host` + Host plugins): Routine CRUD, pause/resume, durable store, cron evaluation, fire→bot wake, Host projection API.
- **Client / Web**: Routines pane UI; mutate via Host RPC; render projected list/status/last-run.
- **Main ↔ Host IPC:** lifecycle-only (`ready` / `fatal` / `shutdown-complete` / `update-tasks` + Main `shutdown` / `update-tasks`). **Forbidden** on that channel: routine-catalog, routine-create/pause/resume, cron-fire, last-run payloads (extend `host-protocol.ts` exclusion list like identity + skills).
- **Data plane:** routine mutations + projections travel **shipped authenticated Host HTTP/WS** only.

**Rationale:** Architect boundaries; P1 R1 / room freeze topology.

**Alternatives considered:** Routine payloads on Node IPC (forbidden); Client-only persistence (fails restart/pause proofs).

---

## R8 — Confirm / edit / display-name (clarify restatement)

**Decision:** Confirm-on-create, edit-routine, and separate display-name fields are **optional**; not Pass gates. Identity MAY be intent text or intent-derived summary. Empty intent or invalid schedule MUST reject create with a clear user-visible reason.

**Rationale:** Clarify Q3–Q5; FR-001/012; SC-001/007.

---

## R9 — Non-goals unchanged (+ schedule ≠ Routines)

**Decision:** Event listeners, memory recall UX, Box/Shell, MCP/connectors remain Out. **`dsh-schedule` as Routines SoT** is an explicit non-goal / absence check. Absence of event/memory/box/MCP does not fail Pass (SC-004).

**Rationale:** Plan P4 Out; Architect Option 1 reject; FR-006/008.

---

## Seam map (summary)

```text
User (Desktop Client routines pane)
    │  create / pause / resume / list / last-run  (Host HTTP/WS only)
    ▼
Desktop Host  ──►  Host Routine catalog (SoT) + Host cron wake → bot turn
              ──►  optional dsh-jobs / jobs-local (in-flight fire visibility only)
              ──►  dsh-schedule (session reminders ONLY — not Routines SoT)
Electron Main ──►  lifecycle IPC only; NO routines durable store / timers / fire bus
```
