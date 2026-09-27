# Contract: Cron fire + last-run visibility

**Owners:** DH Runtime (Host `dsh-schedule` timer + dispatch wake) · DH Client/Web (last-run UI)
**Acceptance:** Spec FR-005 · SC-003 · US4 · FR-010/011 visual evidence

## User-visible operations

| Operation | Input (minimum) | Observable result |
|-----------|-----------------|-------------------|
| Wait for schedule | Active routine; shortest product-supported recurring schedule | ≥1 fire within ≤6 minutes without manual trigger |
| Observe fire | After fire | Pane (or linked activity) shows last-run / fire indicator for that routine |
| Paused interval | Routine paused | No fire recorded for matches in that window |

## Host obligations

- On due match for an **active** routine, perform Host wake applying intent as bot turn/session start (schedule follow-up / equivalent).
- Expose last-run / fire observability for Client projection.
- Do **not** require LLM reply wording, Box/Shell, or MCP success for Pass.
- Do **not** require a special sub-5-minute test-only schedule; `@every 5m` (or product equivalent) is acceptable.

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

External push/email delivery; cold-session away proofs beyond desktop-available Verifier path; `dsh-jobs` job-id as Pass evidence.
