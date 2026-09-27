# T004 — `dsh-schedule` / `ui-schedule` are session reminders only (not Routines SoT)

**Status:** Doc complete (Setup; research R2 lock)
**Owners:** DH Runtime · DH Client/Web · DH Verifier · PO
**Linear:** [MOH-197](https://linear.app/momadhoun/issue/MOH-197) · Epic [MOH-188](https://linear.app/momadhoun/issue/MOH-188)
**Acceptance slice:** Setup T004 — document that `@deepseek-ai/dsh-schedule` and `packages/client/ui-schedule/` are **session reminders only**, not the Routines source of truth
**Branch:** `cursor/p4-setup-verifier-fe1d`
**Cross-refs:** [research.md](../research.md) R2/R9 · [contracts/non-goals.md](../contracts/non-goals.md) · [data-model.md](../data-model.md) Non-entities · T012 regression note (later)

## Measurable Done (this doc)

| Check | Pass bar |
|-------|----------|
| Package facts | Schedule + ui-schedule roles stated with measured package paths |
| SoT lock | Explicit: Routines Pass **fails** if path is “mount schedule overlay alone” |
| Allowed borrow | Time-math helpers MAY be borrowed; Schedule catalog / overlay / header MUST NOT be Routines pane SoT |
| Foundation hook | T012 will add focused absence/spot-check against this doc |

---

## What those packages are (measured)

### `@deepseek-ai/dsh-schedule` — `packages/schedule/schedule/`

| Fact | Detail |
|------|--------|
| Durability | Session-local `schedule/change` stream; fold derives active `ScheduleRecord`s |
| Tools | `schedule_create` / `schedule_list` / `schedule_delete` (model-facing reminders) |
| Record kinds | `after` / `at` / `every` — **not** product `RoutineRecord` |
| Interval floor | `MIN_EVERY_INTERVAL_SECONDS = 300` (5 minutes) for `every` |
| Cron vocabulary | **No** 5-field cron expression language as Routines SoT |
| Delivery | Live root Agent follow-up in the **same conversation**; no email/push; cold sessions keep reminders overdue until resumed |
| README | Package documents conversation reminders, not per-bot cross-session Routines pane |

### `packages/client/ui-schedule/` — `@deepseek-ai/dsh-client-ui-schedule`

| Fact | Detail |
|------|--------|
| Role | Read-only **session** Schedule catalog UI (`ScheduleCatalogAction` in session header) |
| Copy | Locales speak “reminders” / “Scheduled” — session reminder catalog |
| Data | Projects `ScheduleRecord` from `@deepseek-ai/dsh-schedule/client` |
| Not | Bot routines pane; Host Routine CRUD; pause/resume of `RoutineRecord` |

---

## What Routines SoT is instead (Architect Option 3)

| Concern | Routines (P4) | Schedule (existing) |
|---------|---------------|---------------------|
| SoT | Host Routine catalog (`RoutineRecord`) | Session reminder log |
| Scope | Per-bot; cross-session pane | Current session conversation |
| Schedule language | Product cron + shorthands (Host evaluator) | after / at / every-seconds |
| Pause | `status: paused` on Routine | Delete / no-op reminder |
| Fire | Host cron wake → bot turn + `lastRunAt` | Reminder follow-up in-session |
| Client surface | Bot routines pane via Host HTTP/WS | Session-header catalog action |

---

## Pass / Fail rules for Verifier

| Observation | Verdict |
|-------------|---------|
| Pass path = mount Schedule overlay + use header catalog only | **Fail** SC-001… / seam honesty |
| Routines pane lists Host-projected `RoutineRecord`s; Schedule header may still exist for session reminders | **OK** (orthogonal) |
| Borrow schedule time-math helpers inside Host evaluator without using Schedule catalog as SoT | **OK** |
| Electron Main invents routine timers/rows | **Fail** (T010/T011) |
| `dsh-jobs` used as catalog SoT | **Fail** (optional visibility only) |

---

## T012 hook (foundation — not stamped here)

When T012 lands, extend this file (or a linked recipe note) with a focused Host/Client spot-check:

1. Grep/composition check that P4 Pass docs and recipes do not instruct “enable schedule overlay alone.”
2. Confirm Desktop Host Routine path does not depend on `ui-schedule` header as the only list surface.
3. Keep [contracts/non-goals.md](../contracts/non-goals.md) aligned.

---

## Rerun (idempotent)

```sh
rg -n 'MIN_EVERY_INTERVAL_SECONDS|ScheduleRecord|schedule_create' packages/schedule/schedule/src | head
rg -n 'ScheduleCatalogAction|reminder' packages/client/ui-schedule/src/client | head
test -f specs/004-routines-cron/verifier/schedule-not-routines.md
```

**PO / DH Lead:** R2 locked in Verifier tree. Do not accept “ship Routines by enabling Schedule” as implement Pass.
