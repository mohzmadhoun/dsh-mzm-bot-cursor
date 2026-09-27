# T004 / T012 — `dsh-schedule` is session reminders, not Routines SoT

**Status:** Guard documented (Foundational T012; Setup inventory T004 content included)
**Owners:** DH Runtime (author) · DH Verifier (rerun) · PO (scope)
**Linear:** [MOH-197](https://linear.app/momadhoun/issue/MOH-197) (T004) · [MOH-205](https://linear.app/momadhoun/issue/MOH-205) (T012) · Epic [MOH-188](https://linear.app/momadhoun/issue/MOH-188)
**Acceptance:** research R2 · [contracts/non-goals.md](../contracts/non-goals.md) · Architect Option 3
**Branch:** `cursor/p4-foundation-host-fe1d`

## Measurable Done

| Check | Pass bar |
|-------|----------|
| Package role | `@deepseek-ai/dsh-schedule` + `dsh-client-ui-schedule` described as **session-local reminders only** |
| Pass path | P4 Routines Pass is **Host Routine catalog** (`team/routine` / Agent Teams) + Host cron wake — **not** “mount Schedule overlay” |
| Spot-check | Focused Host/Client note: header `ui-schedule` catalog alone fails Verifier for Routines |
| Non-goal | No product code path documents Routines as “enable Schedule overlay” |

---

## What `dsh-schedule` is (today)

| Surface | Role |
|---------|------|
| `packages/schedule/schedule/` | Session-local durable reminders (`after` / `at` / `every` ≥5m); tools `schedule_create` / `schedule_list` / `schedule_delete` on the **session log** |
| `packages/client/ui-schedule/` | Read-only Client projection of that **session** reminder catalog (header overlay) |
| Expression model | Interval / absolute / delay — **no** 5-field cron; **no** per-bot cross-session Routines SoT |

Delivery needs a live root agent and is conversation reminders — not bot routines pane SoT ([research.md](../research.md) R2).

## What P4 Routines Pass requires

| Capability | Owner | Not |
|------------|-------|-----|
| Durable `RoutineRecord` | Host Agent Teams journal `team/routine` | Electron Main; Client local; `dsh-schedule` catalog |
| Create / list by `botId` | Host HTTP/WS Remote (`agentTeams/createRoutine`, `agentTeams/listRoutinesByBot`, `agentTeams/view.routines`) | Schedule overlay CRUD |
| Cron / `@every` eval | Host `routine-cron` stub (product scheduler) | `dsh-schedule` interval-only model as SoT |
| Pane list | Client projection of Host routines | Header-only `ui-schedule` without Host Routine CRUD |

## Spot-check recipe note (Host / Client)

1. **Fail if** Verifier or product copy treats opening the Schedule overlay / listing session reminders as Routines Pass.
2. **Pass only if** create/list/pause/resume/fire evidence uses Host Routine catalog APIs and the bot routines pane projecting those rows.
3. Optional time-math reuse from schedule helpers is allowed; mounting Schedule as Routines SoT is **forbidden**.

## Regression guard wording

> P4 Routines Pass path is **not** “mount `dsh-schedule` overlay alone.” Session reminders remain distinct. Host-owned Routine catalog + Host cron wake is the SoT (Architect Option 3).
