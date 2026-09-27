# T003 — Cron-wake / bot-turn candidates (Setup inventory)

**Status:** Inventory complete (Setup; no product behavior change in this doc alone)
**Owners:** DH Runtime (author) · DH Verifier (SC-003 wiring later) · PO (scope)
**Linear:** [MOH-196](https://linear.app/momadhoun/issue/MOH-196) · Epic [MOH-188](https://linear.app/momadhoun/issue/MOH-188)
**Acceptance slice:** Setup T003 — inventory Host cron-wake → bot-turn candidates and optional `ctx.jobs` visibility for [contracts/cron-fire.md](../contracts/cron-fire.md)
**Branch:** `cursor/p4-setup-verifier-fe1d`
**Surfaces inventoried:** `packages/core/agent/` (inbox / followup) · `packages/experimental/agent-team/src/` (mailbox) · `packages/jobs/jobs/` · `packages/jobs/jobs-local/` · Desktop Host jobs consumer

## Measurable Done (this doc)

| Check | Pass bar |
|-------|----------|
| Wake candidates named | ≥2 concrete Host paths that can start/continue a bot turn with routine intent |
| Jobs visibility | `ctx.jobs` role stated as **optional in-flight only**, never Routine catalog / fire SoT |
| Verifier bar | SC-003 = Host fire + last-run visibility ≤6 min; **not** LLM reply wording |
| Non-goals | No Main-process timers; no `dsh-schedule` dispatch as Routines fire path |

---

## Requirement (FR-005 / SC-003)

From [contracts/cron-fire.md](../contracts/cron-fire.md) and research R3/R4:

- On due match for an **active** `RoutineRecord`, Host performs a cron wake that starts/continues a bot turn with the routine intent.
- After fire commit, update `lastRunAt` (or equivalent) for Client projection / pane last-run.
- Optional `ctx.jobs` entry for in-flight visibility only.
- Do **not** score LLM reply wording; do **not** use session Schedule reminder dispatch as Pass fire path.

---

## Wake / turn-start candidates

### Preferred — Agent inbox `followup` / `send(..., 'next-turn', wakeup)`

**Source:** `packages/core/agent/src/runtime-types.ts` — `Agent` inbox seam

| Fact | Detail |
|------|--------|
| APIs | `followup(message)` queues an ordinary follow-up turn and wakes the driver; `send(message, target, wakeup)` routes to `next-turn` / `next-step` |
| Fit | Direct Host wake into the bot’s live Agent session with intent text as user/follow-up content |
| Constraint | Needs live Agent / session (desktop-available path is enough for Pass; cold-session away proofs out of scope) |
| Verifier | Observe turn start / last-run update — not model prose |

**Fit for P4:** Closest match to “Host cron wake → bot turn with intent.”

### Candidate B — Host mailbox `TeamService.sendMessage`

**Source:** `packages/experimental/agent-team/src/index.ts` + `mailbox.ts` / `host-mailbox-message.ts`

| Fact | Detail |
|------|--------|
| Role | Durable peer Host mailbox queue + delivery into target Session inbox |
| Fit | Can deliver intent-bearing Host message to a bot and observe deliveryState |
| Cost | Mailbox semantics are peer/product messaging; may over-constrain fire vs ordinary user chat |
| Verdict | Viable if Runtime wants fire to appear as Host mailbox activity; prefer Candidate A unless product UX requires mailbox rows |

### Rejected — Electron Main `setInterval` / crontab

Violates research R3/R7 (Host process owns scheduler; Main has no durable routines bus). Guarded by T010/T011.

### Rejected — `dsh-schedule` reminder dispatch as Routines fire

Session-local reminders; live-root-only; interval≥5m / no 5-field cron as SoT language. See [schedule-not-routines.md](./schedule-not-routines.md).

---

## Optional `ctx.jobs` visibility

### `packages/jobs/jobs/src/` — Service Definition

| Fact | Detail |
|------|--------|
| Role | Abstract `JobRegistry` on `ctx.jobs` — ids, ownership, lifecycle, completion listeners |
| Not | Cron catalog, schedule evaluator, or durable `RoutineRecord` store |
| P4 use | Optional in-flight fire registration so UI/tools can see a running wake (T013) |

### `packages/jobs/jobs-local/src/` — process-local provider

| Fact | Detail |
|------|--------|
| Role | In-memory registry implementation loaded as the concrete `ctx.jobs` |
| P4 use | Mount on Desktop Host **only** if product wants fire visibility; must not become SoT |

### `apps/desktop-host/src/update-tasks.ts`

| Fact | Detail |
|------|--------|
| Today | Already calls `ctx.get('jobs')` for desktop update-task inspect/lock |
| Implication | Desktop Host compositions that include jobs-local already expose `ctx.jobs`; Routine fire may reuse the same capability without making jobs the catalog |

---

## Host scheduler placement (for T008)

| Concern | Inventory note |
|---------|----------------|
| Evaluator | New Host-process module (Agent Teams or `apps/desktop-host/` scheduler) accepts product `scheduleExpr`, rejects unsupported, computes next-fire |
| Timer ownership | Host process only while Host is live — not Main IPC |
| Fire commit | Update catalog `lastRunAt` after wake enqueue/commit succeeds |

---

## Gap matrix

| Need | Agent inbox | Team mailbox | dsh-jobs | dsh-schedule |
|------|-------------|--------------|----------|--------------|
| Start/continue bot turn with intent | **Preferred** | Candidate | No (execution registry) | Rejected as fire SoT |
| lastRunAt durable update | Via Routine catalog (T007) | N/A | No | No |
| In-flight visibility | N/A | Optional | **Optional** | N/A |
| 5-field cron / `@every 5m` | N/A | N/A | N/A | Interval-only reminders — not Routines expr SoT |

---

## Non-goals (this inventory)

- No Host cron evaluator implementation claimed (T008)
- No Scenario 3 Pass stamp
- No requirement that every fire create a job id

## Rerun (idempotent)

```sh
rg -n 'followup\(|InboxTarget|sendMessage' packages/core/agent/src/runtime-types.ts packages/experimental/agent-team/src/index.ts | head
rg -n 'class JobRegistry|ctx\.jobs' packages/jobs/jobs/src/index.ts packages/jobs/jobs-local/src/index.ts | head
test -f specs/004-routines-cron/verifier/cron-wake-inventory.md
```

**PO / DH Lead:** Wake path preference recorded for Runtime. Implement fire in foundation/US4 after catalog exists — Verifier will stamp SC-003 only with Host fire + FR-010/011 evidence.
