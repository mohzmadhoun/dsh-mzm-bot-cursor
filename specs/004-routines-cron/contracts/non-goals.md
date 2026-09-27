# Contract: Non-goals (P4)

**Owners:** DH Verifier (absence checks) · DH Spec (scope lock)
**Acceptance:** Spec FR-006, FR-008 · SC-004 · Out of Scope

## Absence checks (Pass if absent)

| Non-goal | Phase owner |
|----------|-------------|
| Event-triggered routines (Slack/GitHub/email/webhook/…) | P6 |
| Memory recall UX | P5 |
| Box / Shell / computer-use parity | P7 |
| MCP / connectors / 1Password-class vault UX | P6 |
| Electron Main durable routines bus | Forbidden always for this feature |
| `dsh-jobs` as routines catalog SoT | Forbidden (jobs = background tools) |

## Verifier rules

| Check | Pass bar |
|-------|----------|
| Non-goals | SC-004 — documented absence checks; absence does **not** fail Pass |
| GUI media | Optional for this docs/absence contract |

## Failures

| Condition | Required behavior |
|-----------|-------------------|
| Requiring event/memory/box/MCP for P4 Pass | Spec violation — Fail the gate that demanded them |
