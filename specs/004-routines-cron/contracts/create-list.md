# Contract: Create cron routine + pane list

**Owners:** DH Runtime (Desktop Host Routine catalog) · DH Client/Web under Electron (UI)
**Acceptance:** Spec FR-001, FR-002, FR-006, FR-007 · SC-001, SC-006, SC-007 · US1–US2 · FR-010/011 visual evidence

## User-visible operations

| Operation | Input (minimum) | Observable result |
|-----------|-----------------|-------------------|
| Open routines pane | Desktop app; bot selected | Pane lists that bot’s Host-projected routines (may be empty) |
| Create routine | Non-empty intent + product-supported `scheduleExpr` | `RoutineRecord` on **that** bot; pane shows active; identity = intent or intent-derived |
| Reject invalid create | Empty intent or bad schedule | Clear user-visible reason; no saved listed routine |
| Per-bot check | Routine on bot A | Bot B pane does not list it solely because of A |

## Host obligations

- Persist `RoutineRecord` in **Host Routine catalog** (Agent Teams / Host journal extension pattern).
- Project list + status to Client over **authenticated Host HTTP/WS**.
- Electron Main MUST NOT own the durable store; Node IPC MUST NOT carry routine-catalog payloads.
- Admit cron/schedule triggers only for P4 Pass; do not require event-listener types.
- Confirm step optional; separate display-name field optional.
- MUST NOT use `@deepseek-ai/dsh-schedule` session catalog as Routines SoT.

## Verifier rules

| Check | Pass bar |
|-------|----------|
| Create + list | SC-001 — ≥1 cron routine visible in bot pane |
| Per-bot | SC-006 |
| Confirm/edit absence | SC-007 — must not fail Pass |
| Visual evidence | FR-010/011 — desktop media committed under `verifier/evidence/` |

## Failures

| Condition | Required behavior |
|-----------|-------------------|
| Host catalog unavailable | Clear user-visible failure; no silent empty “success” |
| Unit/jsdom-only evidence | GUI scenario Fail |

## Non-goals

Event triggers; edit/delete as Pass gates; Electron Main routines bus; mounting Schedule overlay as Routines; using `dsh-jobs` as the list SoT.
