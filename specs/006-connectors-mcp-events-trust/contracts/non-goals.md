# Contract: Non-goals (P6)

**Owners:** DH Verifier (absence checks) · DH Spec (scope lock) · DH Architect (seam honesty)
**Acceptance:** Spec FR-010, FR-011, FR-012 · SC-005 · Out of Scope · clarify locks

## Absence checks (Pass if absent / must not be required)

| Non-goal | Phase / rule |
|----------|----------------|
| Box / Shell / computer-use parity | P7 — absence OK |
| Full Grok multi-family connector catalog | Out — thin catalog / one fixture enough |
| Named live event families (Slack/GitHub/Linear/email) as Pass | Out — webhook harness Pass lock |
| Fixed named Pass connector | Out — any thin/fixture entry |
| Mandatory 1Password/vault Pass gate when in-app works | Out — FR-009 |
| Send-on-behalf / group channels / voice / draft-first chrome | Out |
| Rewrite of `specs/001`–`005` | Forbidden |
| Electron Main connector / event / trust / credential-value bus | Forbidden |
| Env/key-file as product Pass auth | Forbidden |
| Invented Linear epic/issue ids | Forbidden while free-issue limit blocks |

## Verifier rules

| Check | Pass bar |
|-------|----------|
| Non-goals | SC-005 — documented absence checks; absence does **not** fail Pass |
| No Electron connector/event/trust bus | Spot-check Host protocol exclusions / no Main store (tasks recipe; extend `host-protocol.ts`) |
| Cron additive | SC-008 — do not fail solely because events are additive |
| GUI media | Optional for this docs/absence contract |

## Failures

| Condition | Required behavior |
|-----------|-------------------|
| Requiring P7 / full catalog / live family / fixed connector / mandatory vault for Pass | Spec violation — Fail the over-strict gate |
| Electron Main as SoT | Seam violation — Fail |
| Rewriting `specs/001`–`005` FRs in this feature | Spec violation — Fail |
| Inventing Linear ticket numbers | Process violation — Fail / reject |
