# Contract: Non-goals (P7)

**Owners:** DH Verifier (absence checks) · DH Spec (scope lock) · DH Architect (seam honesty)
**Acceptance:** Spec FR-006…FR-010 · SC-005 · Out of Scope · clarify locks

## Absence checks (Pass if absent / must not be required)

| Non-goal | Phase / rule |
|----------|----------------|
| User machines (ListMachines, CopyToBox/CopyFromBox, local-exec on user PC) | Out — FR-006 |
| Voice / draft-first send-on-behalf / group channels | Out — FR-007 |
| Learn-from-demo / billing chrome / full skill pack / pixel Grok | Out — FR-007 |
| Verifier-as-a-feature | Out — FR-008 (Verifier already gates every phase) |
| Rewrite of `specs/001`–`006` | Forbidden — FR-009 |
| Full Grok Computer catalog (Update/Reset/box-doctor/…) as Pass | Out — FR-010 |
| Interactive browser click/type as Pass gate | Out — clarify lock / FR-003 |
| Every box backend topology beyond one local Pass path | Out — FR-011 |
| PTC as Shell Pass / brokered remote as Pass requirement | Out — Architect Path A |
| Full inventory subagent set (executor / video / CloudAgent) | Out |
| Electron Main box / Shell / computerUse / Computer-settings bus | Forbidden — research R1 / R6 |
| Editing `MzM-Docs/` living docs in plan PR | Forbidden — Lead parallel |

## Verifier rules

| Check | Pass bar |
|-------|----------|
| Non-goals | SC-005 — documented absence checks; absence does **not** fail Pass |
| No Electron box/shell/computerUse bus | Spot-check host-protocol exclusions (`shell-exec`, `box-ready`, `computer-use-control`, `computer-screenshot`, `computer-settings-mutate`) |
| Chrome ≠ substitute | SC-004 — settings-only fails Phase |
| GUI media | Optional for this docs/absence contract |

## Failures

| Condition | Required behavior |
|-----------|-------------------|
| Requiring user machines / interactive-browser / full catalog for Pass | Spec violation — Fail the over-strict gate |
| Electron Main as SoT | Seam violation — Fail |
| Rewriting `specs/001`–`006` FRs in this feature | Spec violation — Fail |
| Treating Verifier build as P7 product scope | Spec violation — Fail |
