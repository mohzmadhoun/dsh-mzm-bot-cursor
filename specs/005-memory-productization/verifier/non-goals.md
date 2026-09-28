# Phase 5 Verifier — explicit non-goals (SC-006 / SC-008…010)

**Owners:** DH Verifier (absence checks) · DH Runtime (Host catalog SoT) · DH Electron (no Main bus) · DH Spec (scope) · PO (scope)
**Status:** Recipe complete (T031) — measured spot-checks land with Verifier stamp under [evidence/non-goals/](./evidence/non-goals/)
**Linear:** T031 [MOH-269](https://linear.app/momadhoun/issue/MOH-269) · Epic [MOH-228](https://linear.app/momadhoun/issue/MOH-228)
**Acceptance:** Spec FR-008 · FR-009 · FR-013 · FR-015 · FR-017 · SC-006 · SC-008 · SC-009 · SC-010 · Out of Scope · [quickstart.md](../quickstart.md) Scenario 4
**Contract:** [contracts/non-goals.md](../contracts/non-goals.md)
**Transcript ≠ catalog:** [transcript-not-memory.md](./transcript-not-memory.md)
**Seam locks:** [memory-seam-locks.md](./memory-seam-locks.md)
**Evidence home:** [evidence/non-goals/](./evidence/non-goals/) (T032) · alias [evidence/scenario-4/](./evidence/scenario-4/)

## Global Pass / Fail (T031)

**Pass** when every checklist row below holds and no Scenario 1–5 (SC-001…SC-007) recipe **requires** an Out of Scope surface to Pass.

**Fail** T031 (and reopen the owning FR / Scenario) if any of:

- A Phase 5 product Scenario Pass begins requiring full Grok memory chrome parity beyond the ADR
- A Phase 5 product Scenario Pass begins requiring connectors / MCP / event-triggered routines (P6)
- A Phase 5 product Scenario Pass begins requiring Box / Shell / computer-use parity (P7)
- Electron Main is treated as durable Memory SoT (parallel bus / write / recall / inject IPC)
- Memory Pass is claimed via “transcript dump as curated memory” or Client-only persistence as SoT
- Scenario Pass begins requiring bot-tool write (SC-009 optional) or edit/delete UX (SC-008 optional)
- Scenario Pass begins requiring kind→layer locks (SC-010)
- Implement PRs rewrite product scope in `specs/001`–`004`
- Scenario 4 / SC-006 treats absence of those surfaces as Fail

GUI screenshot optional for this docs/absence recipe (FR-011/012 mandatory only for GUI Scenarios 1–3 and 5).

## Absence checklist

| Non-goal | Pass bar (must **not** be required / must not be SoT) | Status |
|----------|--------------------------------------------------------|--------|
| Grok chrome parity beyond ADR | No full Grok memory chrome required for Pass | Recipe ready — stamp under evidence/non-goals |
| Connectors / MCP / event routines | No P6 connector/MCP/event path required for Pass | Recipe ready |
| Box / Shell / computer-use | No Box/local Shell/computer-use parity required for Pass (P7) | Recipe ready |
| Electron Main memory bus | No Main store/bus/write/recall/inject IPC as SoT (`no-electron-memory-bus`) | Recipe ready — T035 Verifier owns rerun |
| Transcript ≠ catalog | Pass path is Host catalog write/list/recall + Host inject — not chat dump | Recipe ready — see [transcript-not-memory.md](./transcript-not-memory.md) |
| Client-only persistence as SoT | Client projects Host rows; Client-local store alone fails Pass | Recipe ready |
| Bot-tool write optional | Absence of bot-tool write must **not** Fail Pass (SC-009) | Recipe ready |
| Edit/delete optional | Absence of edit/delete UX must **not** Fail Pass (SC-008) | Recipe ready |
| Kind→layer locks forbidden as Pass | No kind→layer lock table required for Pass (SC-010) | Recipe ready |
| No rewrite of `specs/001`–`004` | P5 implement PRs do not product-edit prior feature trees | Recipe ready — T036 |

---

## Grok chrome parity (Out of Scope)

**Acceptance:** Spec Out of Scope · FR-008 · SC-006

Phase 5 Pass MUST NOT require full Grok memory chrome parity beyond the agent-vs-user ADR.

| Observation | Pass | Fail |
|-------------|------|------|
| Scenario Pass criteria | Host write / browse / recall / layers alone | Requiring Grok-parity chrome for Done |
| Product surfaces | May omit Grok-only chrome | Scenario Pass blocked on missing Grok chrome |

**Spot-check:**

```sh
! rg -n -i 'grok.*(chrome|parity).*(required|must).*Pass|Pass.*(requires|require).*grok.*(chrome|parity)' \
  specs/005-memory-productization/verifier/scenario-*.md \
  specs/005-memory-productization/verifier/README.md \
  specs/005-memory-productization/verifier/non-goals.md
```

**Claim:** Recipe documents absence — Verifier stamps when spot-check is measured.

---

## Connectors / MCP / event routines (P6)

**Acceptance:** Spec Out of Scope · FR-009 · SC-006 · research R9 deferral

Phase 5 Pass MUST NOT require connectors / MCP skill catalog / event-triggered routines.

**Spot-check:**

```sh
! rg -n -i 'mcp skill catalog|connector.*(required|must).*Pass|event.?trigger.*(required|must).*Pass|Pass.*(requires|require).*(mcp|connector|event.?trigger)' \
  specs/005-memory-productization/verifier/scenario-*.md \
  specs/005-memory-productization/verifier/README.md
```

**Claim:** Recipe documents absence — Verifier stamps when spot-check is measured.

---

## Box / Shell / computer-use (P7)

**Acceptance:** Spec Out of Scope · P7 deferral · FR-009

Phase 5 Pass MUST NOT require Box / local Shell / computer-use parity.

**Spot-check:**

```sh
! rg -n -i 'box.*(required|must).*Pass|computer.?use.*(required|must).*Pass|local shell.*(required|must).*Pass' \
  specs/005-memory-productization/verifier/scenario-*.md \
  specs/005-memory-productization/verifier/README.md
```

**Claim:** Recipe documents absence — Verifier stamps when spot-check is measured.

---

## No Electron memory bus

**Acceptance:** FR-004 · research R7 · T010/T011 · [contracts/non-goals.md](../contracts/non-goals.md)

Electron Main MUST NOT be the durable Memory SoT.

| Observation | Pass | Fail |
|-------------|------|------|
| IPC surface | Lifecycle-only `DESKTOP_HOST_*` + `DESKTOP_IPC` | `dsh-desktop:` memory-catalog / write / list / recall / injection channels |
| Store / write | Absent in Main / preload | Main `writeMemory` / memory store as SoT |
| Guard | `apps/desktop/tests/no-electron-memory-bus.spec.ts` green | Spec Fail or missing exclusion docs |

**Rerun (T035 — Verifier owns):**

```sh
pnpm exec vitest run apps/desktop/tests/no-electron-memory-bus.spec.ts
rg -n 'memory-catalog|memory-write|memory-list|memory-recall|memory-injection' \
  apps/desktop/src/host-protocol.ts apps/desktop/src/ipc.ts | head -20
```

**Claim:** Recipe documents bar — T035 re-validates after story work.

---

## Transcript ≠ curated catalog

**Acceptance:** research R6 · T012 · [transcript-not-memory.md](./transcript-not-memory.md)

P5 Memory Pass MUST NOT be “dump chat transcript as curated memory.”

| Observation | Pass | Fail |
|-------------|------|------|
| Pass surface | Host Memory catalog write/list/recall + Host inject | Transcript scrape alone |
| Product copy | Distinguishes conversation history from curated catalog | Documents Memory Pass as transcript dump |

**Spot-check:**

```sh
test -f specs/005-memory-productization/verifier/transcript-not-memory.md
! rg -n -i 'documents Memory Pass as|Pass as (transcript dump|Electron Main store|Client-only SoT)|Pass via (transcript dump|Electron Main store|Client-only SoT)|Memory Pass (is|=) (transcript dump|Electron Main store|Client-only SoT)' \
  apps/desktop-host/src \
  packages/experimental/client-ui-agent-team/src/client \
  --glob '!**/node_modules/**' --glob '!**/lib/**'
rg -n 'Seam honesty \(T037\)' specs/005-memory-productization/verifier/README.md
```

**Claim:** Recipe documents absence — Verifier stamps when spot-check is measured (T037 polish).

---

## Client-only persistence ≠ SoT

**Acceptance:** research R1/R6 · FR-004 · [transcript-not-memory.md](./transcript-not-memory.md)

Client projects Host rows via HTTP/WS. Client-local persistence alone MUST NOT be Memory SoT.

**Spot-check:**

```sh
! rg -n -i 'Client-only (SoT|persistence as SoT)|Memory Pass.*(Client-only|localStorage)' \
  apps/desktop-host/src \
  packages/experimental/client-ui-agent-team/src/client \
  specs/005-memory-productization/verifier/README.md \
  --glob '!**/node_modules/**' --glob '!**/lib/**'
# Affirmative SoT wording should name Host catalog
rg -n 'Host Memory catalog SoT|never Electron Main|never transcript' \
  apps/desktop-host/src/index.ts \
  specs/005-memory-productization/verifier/README.md
```

**Claim:** Recipe documents absence — Verifier stamps when spot-check is measured (T037 polish).

---

## Bot-tool write optional (SC-009)

**Acceptance:** FR-015 · SC-009

Absence of bot-tool memory write MUST NOT Fail Pass. Write Pass = user-visible UI.

**Spot-check:**

```sh
! rg -n -i 'bot.?tool.*(required|must).*Pass|Pass.*(requires|require).*bot.?tool' \
  specs/005-memory-productization/verifier/scenario-*.md \
  specs/005-memory-productization/verifier/README.md
```

**Claim:** Scenario 1 recipe already notes SC-009 — spot-check confirms no over-strict gate.

---

## Edit/delete optional (SC-008)

**Acceptance:** FR-013 · SC-008

Absence of edit/delete memory UX MUST NOT Fail Pass.

**Spot-check:**

```sh
! rg -n -i 'edit.?delete.*(required|must).*Pass|Pass.*(requires|require).*(edit|delete).*memory' \
  specs/005-memory-productization/verifier/scenario-*.md \
  specs/005-memory-productization/verifier/README.md
```

**Claim:** Recipe documents absence — Verifier stamps when spot-check is measured.

---

## Kind→layer locks forbidden as Pass (SC-010)

**Acceptance:** FR-017 · SC-010 · [scenario-3-layers.md](./scenario-3-layers.md)

Pass MUST NOT require a kind→layer lock table (for example “profile only on user”).

**Spot-check:**

```sh
! rg -n -i 'kind.?layer lock.*(required|must)|Pass.*(requires|require).*kind.?layer' \
  specs/005-memory-productization/verifier/scenario-*.md \
  specs/005-memory-productization/verifier/README.md
```

**Claim:** Scenario 3 orthogonality check documents the bar — spot-check confirms no over-strict gate.

---

## No rewrite of `specs/001`–`004` (T036)

**Acceptance:** FR-009 · Out of Scope · T036

P5 implement PRs MUST NOT product-edit `specs/001-multi-model-bots/**`, `specs/002-identity-personas/**`, `specs/003-skills-ux/**`, or `specs/004-routines-cron/**`.

**Spot-check:** Documented in [README.md](./README.md) T036 section. Example:

```sh
# Against the polish PR tip vs merge-base (expect empty product diff under 001–004)
git diff --name-only origin/master...HEAD -- \
  specs/001-multi-model-bots specs/002-identity-personas \
  specs/003-skills-ux specs/004-routines-cron
```

**Claim:** Recipe + README T036 note — Verifier / Spec confirm on implement PRs.

---

## Traceability

| Artifact | Role |
|----------|------|
| [../contracts/non-goals.md](../contracts/non-goals.md) | Contract absence table |
| [transcript-not-memory.md](./transcript-not-memory.md) | Transcript ≠ curated; Client ≠ SoT |
| [memory-seam-locks.md](./memory-seam-locks.md) | Full seam lock set |
| [scenario-5-full-replay.md](./scenario-5-full-replay.md) | SC-007 composite (T033 — Verifier owns; must keep non-goals green) |
| [evidence/non-goals/](./evidence/non-goals/) | Measured-check home (T032) |
| [../spec.md](../spec.md) Out of Scope · FR-008/009/013/015/017 · SC-006/008/009/010 | Normative non-goals |
| T031 / T035 / T036 / T037 | Absences + bus guard + no-rewrite + Pass-path language |
