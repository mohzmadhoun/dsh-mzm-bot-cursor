# Contract: Cron fire + last-run visibility

**Owners:** DH Runtime (Host cron wake → bot turn) · DH Client/Web (last-run UI)
**Acceptance:** Spec FR-005 · SC-003 · US4 · FR-010/011 visual evidence

## User-visible operations

| Operation | Input (minimum) | Observable result |
|-----------|-----------------|-------------------|
| Wait for schedule | Active routine; shortest product-supported recurring schedule | ≥1 Host fire within ≤6 minutes without manual trigger |
| Observe fire | After fire commit | Pane (or linked activity) shows last-run / fire indicator for that routine |
| Paused interval | Routine paused | No fire recorded for matches in that window |

## Host obligations

- On due match for an **active** `RoutineRecord`, perform **Host cron wake** that starts/continues a bot turn with intent (existing Agent / session inbox / turn path).
- Update `lastRunAt` (or equivalent) after fire commit for Client projection.
- Optional: surface in-flight fire via `ctx.jobs` (`dsh-jobs` / `dsh-jobs-local`) — **not** required as Pass SoT.
- Do **not** require LLM reply wording, Box/Shell, or MCP success for Pass.
- Do **not** require a special sub-5-minute test-only schedule; `@every 5m` (or product equivalent) is acceptable.
- Do **not** use `dsh-schedule` session reminder dispatch as the Routines Pass fire path / SoT.

## Verifier rules

| Check | Pass bar |
|-------|----------|
| Fire + visibility | SC-003 — ≥1 fire ≤6 min + last-run visible |
| LLM wording | Not scored |
| Visual evidence | FR-010/011 — committed under `verifier/evidence/` |

## Failures

| Condition | Required behavior |
|-----------|-------------------|
| List-only without fire indicator after due time | Fail SC-003 |
| Unit/jsdom-only evidence | GUI scenario Fail |

## Non-goals

External push/email delivery; cold-session away proofs beyond desktop-available Verifier path; job-id as sole Pass evidence; Schedule overlay as fire proof.
