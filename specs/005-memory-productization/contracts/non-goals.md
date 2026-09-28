# Contract: Non-goals (P5)

**Owners:** DH Verifier (absence checks) · DH Spec (scope lock) · DH Architect (seam honesty)
**Acceptance:** Spec FR-008, FR-009, FR-013, FR-015, FR-017 · SC-006, SC-008, SC-009, SC-010 · Out of Scope · PO Option rejects Main bus

## Absence checks (Pass if absent / must not be SoT)

| Non-goal | Phase / rule |
|----------|----------------|
| Full Grok memory chrome parity beyond ADR | Out — absence OK |
| Connectors / MCP / event-triggered routines | P6 |
| Box / Shell / computer-use parity | P7 |
| Electron Main durable memory bus / write / recall / inject IPC payloads | Forbidden (clone P4 “no Electron routines bus” / P3 skills bus absence pattern) |
| Chat transcript as curated Memory catalog SoT | Forbidden |
| Client-only memory persistence as SoT | Forbidden |
| Bot-tool write as Pass requirement | Optional — SC-009 |
| Edit/delete memory UX as Pass requirement | Optional — SC-008 |
| Kind→layer locks as Pass requirement | Forbidden as Pass — SC-010 |
| Rewrite of `specs/001`–`004` | Forbidden |

## Verifier rules

| Check | Pass bar |
|-------|----------|
| Non-goals | SC-006 — documented absence checks; absence does **not** fail Pass |
| No Electron memory bus | Spot-check Host protocol exclusions / no Main store (tasks recipe; extend `host-protocol.ts` like routines) |
| Transcript ≠ curated | Spot-check: Pass path uses Host Memory catalog write/recall, not chat dump alone |
| GUI media | Optional for this docs/absence contract |

## Failures

| Condition | Required behavior |
|-----------|-------------------|
| Requiring Grok chrome / P6 / P7 for P5 Pass | Spec violation — Fail the gate that demanded them |
| Electron Main as memory SoT | Seam violation — Fail |
| Shipping Pass as transcript-only “memory” | Spec violation — Fail |
| Failing Pass solely because bot-tool or edit/delete absent | Spec violation — Fail the over-strict gate |

## Guard expectation (tasks)

Add a Verifier recipe analogous to P4 `verifier/evidence/non-goals/` routines-bus check: assert lifecycle IPC exclusion list documents memory-catalog / memory-write / memory-list / memory-recall / memory-injection as **not** Main↔Host members.
