# T003 — Event-Routine + webhook B1 wake candidates (Setup inventory)

**Status:** Inventory complete (Setup; no product behavior change)
**Owners:** DH Runtime (author) · DH Verifier (SC-002 harness later) · PO (scope)
**Linear:** **Blocked** — track via PR only (project `DeepSeek Harness - Cursor` / `P-MOH-2`; no invented issue ids)
**Acceptance slice:** Setup T003 — inventory event-Routine + webhook B1 wake candidates for [contracts/event-routine.md](../contracts/event-routine.md) (research R3 / Architect Path A B1)
**Branch:** `cursor/p6-setup-t001-t006-fe1d`
**Surfaces inventoried:** `packages/experimental/agent-team/src/routine-cron.ts` (+ related types/service), `packages/webhook/webhook/src/`, `apps/desktop-host/`

## Measurable Done (this doc)

| Check | Pass bar |
|-------|----------|
| Additive fields named | `triggerKind` / `eventTrigger` gaps vs present cron `RoutineRecord` called out |
| Wake candidates named | ≥2 concrete Host paths that can start/continue a bot turn with routine intent |
| B1 path named | Adapt `dsh-webhook` **ingress** → match event routines → wake **existing** bot (not new-Session Pass) |
| Verifier bar | SC-002 = harness delivery + last-run + pause suppress; **not** LLM wording; manual “Run now” alone insufficient |
| Non-goals | No rewrite of `specs/004`; no live Slack/GitHub Pass; no Electron Main webhook SoT; no T008+ implement in this PR |

---

## Requirement (FR-004/005/018 / SC-002 / SC-008)

From [contracts/event-routine.md](../contracts/event-routine.md), [data-model.md](../data-model.md), research R3:

- Extend Host `RoutineRecord` **additively** with `triggerKind: cron|event` and `eventTrigger` (Pass: `webhook_harness`).
- Cron rows remain valid without migration rewrite of P4 acceptance (SC-008).
- Pass event family = webhook harness / Verifier fixture only (FR-018) — not named live adapters.
- On matching delivery for an **active** event routine: Host wake applying intent on the **existing bot**; update `lastRunAt`.
- While paused, matching deliveries MUST NOT fire.
- Manual “Run now” without harness delivery is **insufficient** for Story 2 Pass.

---

## Current RoutineRecord (cron-only — measured)

From `packages/experimental/agent-team/src/types.ts` on tip `ff149f38d1`:

| Field | Status | P6 gap |
|-------|--------|--------|
| `routineId`, `botId`, `intent`, `status`, `lastRunAt`, `createdAt`, `updatedAt` | **Present** (P4) | Keep |
| `scheduleExpr` | **Present** (required today) | Remain required when `triggerKind=cron`; absent/ignored for event |
| `triggerKind` | **Absent** | T008 adds `cron \| event` |
| `eventTrigger` | **Absent** | T008 adds Pass `webhook_harness` |
| `CreateRoutineInput` | Requires `scheduleExpr` | Extend for event create (non-empty intent + eventTrigger; no schedule required) |
| Remotes | `createRoutine` / `listRoutinesByBot` / `pauseRoutine` / `resumeRoutine` | Event create/list reuse; pane labels distinguish trigger types (US2 Client) |
| Cron evaluator | `routine-cron.ts` + `TeamService` due-fire path | Cron path stays; event fire is separate match path (B1) |

---

## Wake / turn-start candidates (reuse P4)

### Preferred — Agent inbox `followup` (same as P4 cron fire)

**Source:** `packages/experimental/agent-team/src/index.ts` (Host cron fire already uses live Agent `followup` with intent)

| Fact | Detail |
|------|--------|
| Fit | Direct Host wake into the bot’s live Agent session with intent text — Architect Path A “existing bot + intent” |
| Constraint | Needs live Agent / session (desktop-available path is enough for Pass) |
| Verifier | Observe turn start / last-run update — not model prose |

**Fit for P6 B1:** Strongest match — webhook harness match should enqueue the **same** wake/commit shape as cron fire, with a different due-match source.

### Candidate B — Host mailbox `TeamService.sendMessage`

| Fact | Detail |
|------|--------|
| Role | Durable peer Host mailbox queue + delivery into target Session inbox |
| Fit | Can deliver intent-bearing Host message |
| Verdict | Viable if product UX requires mailbox rows; prefer Candidate A unless UX demands otherwise |

### Rejected as Pass fire — default `WebhookRuntime` “create new Workspace Session”

**Source:** `packages/webhook/webhook/src/index.ts` + `session.ts`

| Fact | Detail |
|------|--------|
| Role today | `WebhookRuntime.dispatch` → matching `WebhookRule.run` → optional `WebhookSessionRequest` → **`createWebhookSession`** (new root Session) |
| Architect Path A | Pass fire MUST wake the **existing bot** with routine intent — **not** new-Session Pass |
| Verdict | **Reuse ingress shape** (`VerifiedWebhookDelivery`, `register`/`dispatch`); **wrap/adapt** rule outcome to Routine catalog wake — do **not** treat default new-Session as Story 2 Pass |

### Rejected — Electron Main webhook listener / timer as SoT

Violates research R6. Guarded by T013/T014.

### Rejected — live Slack/GitHub/Linear/email as Pass requirement

Clarify / FR-018. Optional beyond Pass (`packages/webhook/webhook-github` exists but is not Pass).

---

## Webhook package inventory (B1 adapt surface)

### `packages/webhook/webhook/src/`

| Symbol | Role | B1 note |
|--------|------|---------|
| `VerifiedWebhookDelivery` | Authenticated provider delivery (`kind`, `source`, `deliveryId`, `event`, `receivedAt`) | Harness fixture can mint this shape with `kind`/`family` = webhook harness |
| `WebhookRuntime.register` / `dispatch` | Effect-owned rules; fire-and-forget dispatch by `kind` | Candidate ingress: Host harness endpoint / Verifier script → `dispatch` → rule that **matches event routines** |
| `WebhookRule.run` → `WebhookSessionRequest \| null` | Default action = new Session | P6 rule returns `null` for Session create and instead calls Agent Teams wake **or** Host adapter returns a wake request type (T015 / T023 decide) |
| `createWebhookSession` | Built-in new Session | **Out of Pass path** as success criterion |
| Brands | `WebhookDeliveryId`, `WebhookRuleId`, `WebhookSourceId` | Useful for evidence correlation (`WebhookHarnessDelivery.deliveryId`) |

### `packages/webhook/webhook-github/`

| Fact | Detail |
|------|--------|
| Role | Named live GitHub adapter family |
| P6 | **Optional beyond Pass** — do not require for SC-002 |

### Desktop Host

| Path | Today | P6 gap |
|------|-------|--------|
| `apps/desktop-host/` | No webhookRuntime mount / harness endpoint documented for Agent Teams | T015 documents Host webhook-harness Pass path; T023 wires match → wake |
| Composition | Desktop profile does not expose a Verifier harness URL today | Foundational / US2 deliver documented endpoint or scripted Host-side dispatch |

---

## Recommended B1 approach (inventory opinion → T015 / T023)

| Prefer | Why |
|--------|-----|
| **Host harness accepts one Verifier delivery** → match `triggerKind=event` + `eventTrigger=webhook_harness` + `status=active` → reuse P4 wake (`followup` + `lastRunAt` commit) | Honors Architect Path A B1; maximizes cron reuse; Verifier can script delivery without live providers |
| Additive model | T008 adds `triggerKind` / `eventTrigger`; cron evaluator ignores event rows; event matcher ignores cron rows |
| Pause | Existing `pauseRoutine` / `resumeRoutine` already gate status — event matcher MUST honor `status` like cron |
| Do not | Rewrite `specs/004`; replace `scheduleExpr` with a breaking union; use Main IPC for webhook-delivery; score LLM wording |

Document the chosen harness path in T015 (`verifier/webhook-harness-b1.md`); implement match→wake in T023.

---

## Observability map (SC-002 later)

| Observation | How |
|-------------|-----|
| Event routine create | Host create + Client pane distinguishable from cron |
| Harness fire | Delivery id correlated; `lastRunAt` advances without manual Run now |
| Pause suppress | Matching delivery while paused → no fire / no last-run advance |
| Cron still usable | SC-008 — existing cron create/fire path still works |
| Non-observation | LLM assistant reply paraphrase |

---

## Explicit non-touch (Setup)

- No `RoutineRecord` field edits in this PR
- No webhookRuntime product wiring in Desktop Host
- No live-provider Pass requirement
- Connector catalog inventory is [host-connector-inventory.md](./host-connector-inventory.md) (T002)
- Foundational doc T015 + implement T008/T022/T023 own the final pick and code

---

## Evidence for Verifier / PO

Inventory is source-derived from Agent Teams routine types/cron/fire path and `dsh-webhook` runtime on branch tip vs [contracts/event-routine.md](../contracts/event-routine.md). Setup T003 delivers this note only; SC-002 recipes land with T015/T025.
