# T015 — Host webhook-harness Pass path (B1)

**Status:** Implemented (Host US2 T022–T023 — wake path live; Scenario 2 Verifier recipe still T025)
**Owners:** DH Runtime (Host wake) · DH Verifier (SC-002 harness) · PO (scope)
**Linear:** **Blocked** — track via PR only (project `DeepSeek Harness - Cursor` / `P-MOH-2`; no invented issue ids)
**Acceptance slice:** Foundational T015 — B1 adapt path for [contracts/event-routine.md](../contracts/event-routine.md) (research R3 / FR-018)
**Surfaces:** `packages/webhook/webhook/src/` · `packages/experimental/agent-team/src/{types,routine-cron,routine-event,index}.ts` · Desktop Host composition

## Measurable Done (this doc)

| Check | Pass bar |
|-------|----------|
| B1 named | Adapt `dsh-webhook` **ingress** → match active `triggerKind=event` routines → wake **existing** bot with intent |
| Not new-Session | Default `WebhookRuntime` create-new-Session path is **rejected** as Pass fire |
| Additive catalog | Event rows use `triggerKind=event` + `eventTrigger=webhook_harness`; cron rows unchanged (SC-008) |
| Pause | Matching deliveries MUST NOT fire while `status=paused` |
| Cron separation | Host cron ticker (`isRoutineDue`) skips non-cron rows; event fire is a separate match path |
| Host wake (T023) | `TeamService.deliverWebhookHarness` + optional `ctx.webhookRuntime` rule kind `webhook_harness` (returns `null`) |

---

## Architect Path A — B1 (research R3 / FR-018)

Pass event family is **webhook harness / Verifier fixture only** — not named live Slack/GitHub/Linear/email adapters.

1. **Ingress:** Keep `packages/webhook/webhook` HTTP ingress / rule matching as the delivery front door.
2. **Match:** On harness delivery, Host looks up Agent Teams journal routines with `triggerKind=event`, `eventTrigger=webhook_harness`, and `status=active` for the target bot / team.
3. **Wake:** Enqueue the **same** existing-bot intent wake shape P4 cron fire already uses (`followup` / Host wake with routine intent) — **not** `createWebhookSession` new root Session.
4. **Observe:** Update `lastRunAt` on the matched row; Verifier scores delivery + last-run + pause suppress — not LLM wording.
5. **Manual “Run now”** without harness delivery is **insufficient** for SC-002.

Inventory detail: [event-harness-inventory.md](./event-harness-inventory.md).

---

## Host foundations already on Path A (T007–T012)

| Piece | Where | Role for B1 |
|-------|-------|-------------|
| Additive `RoutineRecord` | `types.ts` / `projection.ts` / `createRoutine` | Event create without rewriting cron |
| Cron gate | `routine-cron.ts` `isRoutineDue` | Returns false when `triggerKind !== 'cron'` |
| Remotes | `listRoutinesByBot` / `createRoutine` / pause / resume | Client creates/lists event rows over Host HTTP/WS |
| Journal SoT | `team/routine` | Durable event rows beside cron; no Electron Main bus |

US2 product tasks (T022–T025) wire the ingress→match→wake glue and Scenario 2 recipe. This T015 doc locks the Pass path so implementers do not invent a competing SoT or new-Session Pass.

---

## Verifier / non-goals

| Check | Bar |
|-------|-----|
| SC-002 | Harness delivery + fire + last-run; pause suppress |
| SC-008 | Cron still works after event add |
| FR-018 | Pass path = harness fixture — not gated on live families |
| Non-goals | No rewrite of `specs/004`; no Electron Main webhook SoT; no live connector families required for Pass |

**PO / DH Lead:** Host T022–T023 implement the wake path. Do not mark SC-002 Done until Scenario 2 + desktop evidence (T025) land.
