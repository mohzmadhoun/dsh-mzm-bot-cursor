# Contract: Non-goals (P4)

**Owners:** DH Verifier (absence checks) · DH Spec (scope lock) · DH Architect (seam honesty)
**Acceptance:** Spec FR-006, FR-008 · SC-004 · Out of Scope · Architect Option 1/2 rejects

## Absence checks (Pass if absent / must not be SoT)

| Non-goal | Phase / rule |
|----------|----------------|
| Event-triggered routines (Slack/GitHub/email/webhook/…) | P6 |
| Memory recall UX | P5 |
| Box / Shell / computer-use parity | P7 |
| MCP / connectors / 1Password-class vault UX | P6 |
| Electron Main durable routines bus / timers / fire IPC payloads | Forbidden (clone P3 “no Electron skills bus” absence pattern) |
| **`dsh-schedule` / Schedule overlay as Routines pane SoT** | Forbidden — session reminders only |
| `dsh-jobs` as durable Routine catalog / cron SoT | Forbidden (optional in-flight visibility only) |

## Verifier rules

| Check | Pass bar |
|-------|----------|
| Non-goals | SC-004 — documented absence checks; absence does **not** fail Pass |
| No Electron routines bus | Spot-check Host protocol exclusions / no Main store (tasks recipe) |
| Schedule ≠ Routines SoT | Spot-check: Routines path not “mount schedule overlay alone” |
| GUI media | Optional for this docs/absence contract |

## Failures

| Condition | Required behavior |
|-----------|-------------------|
| Requiring event/memory/box/MCP for P4 Pass | Spec violation — Fail the gate that demanded them |
| Shipping P4 as mount-`dsh-schedule`-only | Architect/Spec violation — Fail |
| Electron Main as routines SoT | Seam violation — Fail |
