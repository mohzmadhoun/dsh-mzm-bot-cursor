# Phase 6 Verifier — explicit non-goals (SC-005 / SC-008)

**Owners:** DH Verifier (absence checks) · DH Runtime (Host catalog SoT) · DH Electron (no Main bus) · DH Spec (scope) · PO (scope)
**Status:** Recipe complete (T033) — measured spot-checks land with Verifier stamp under [evidence/non-goals/](./evidence/non-goals/)
**Linear:** **Blocked** — PR-only tracking (project `P-MOH-2` / Epic MOH-281; no invented issue ids)
**Acceptance:** Spec FR-009 · FR-010 · FR-011 · FR-012 · FR-017 · FR-018 · SC-005 · SC-008 · Out of Scope · [quickstart.md](../quickstart.md) Scenario 5
**Contract:** [contracts/non-goals.md](../contracts/non-goals.md)
**Seam locks:** [connector-event-trust-seam-locks.md](./connector-event-trust-seam-locks.md)
**Evidence home:** [evidence/non-goals/](./evidence/non-goals/) (T034)

## Global Pass / Fail (T033)

**Pass** when every checklist row below holds and no Scenario 1–6 (SC-001…SC-008) recipe **requires** an Out of Scope surface to Pass.

**Fail** T033 (and reopen the owning FR / Scenario) if any of:

- A Phase 6 product Scenario Pass begins requiring Box / Shell / computer-use parity (P7)
- A Phase 6 product Scenario Pass begins requiring full Grok multi-family connector catalog
- A Phase 6 product Scenario Pass begins requiring named live event families (Slack/GitHub/Linear/email) as the only Pass path
- A Phase 6 product Scenario Pass begins requiring a fixed named Pass connector
- Vault / 1Password-class UX is treated as a mandatory Pass gate when in-app auth works
- Electron Main is treated as durable connector / event / trust / credential-value SoT
- Implement PRs rewrite product scope in `specs/001`–`005`
- Scenario Pass fails solely because event triggers are additive to cron (SC-008)
- Scenario 5 / SC-005 treats absence of those surfaces as Fail

GUI screenshot optional for this docs/absence recipe (FR-014/015 mandatory only for GUI Scenarios 1–3, US5 auth when shown, and Scenario 6 GUI slices).

## Absence checklist

| Non-goal | Pass bar (must **not** be required / must not be SoT) | Status |
|----------|--------------------------------------------------------|--------|
| Box / Shell / computer-use | No P7 Box/local Shell/computer-use parity required for Pass | Recipe ready — stamp under evidence/non-goals |
| Full connector catalog | No full Grok multi-family catalog required; thin catalog / one fixture enough | Recipe ready |
| Live event families | No Slack/GitHub/Linear/email live family required; webhook harness Pass lock | Recipe ready |
| Fixed named Pass connector | Any one thin-catalog / Verifier fixture OK (FR-017) | Recipe ready |
| Mandatory vault | Vault not required when in-app auth works (FR-009 / SC-007) | Recipe ready |
| Electron Main connector/event/trust bus | No Main store/bus as SoT (`no-electron-connectors-events-trust-bus`) | Recipe ready — T037 Verifier owns rerun |
| No rewrite of `specs/001`–`005` | P6 implement PRs do not product-edit prior feature trees | Recipe ready — T038 |
| Cron additive (SC-008) | Absence of events replacing cron must **not** Fail Pass; cron remains usable | Recipe ready |

---

## Box / Shell / computer-use (P7)

**Acceptance:** Spec Out of Scope · FR-010 · SC-005

Phase 6 Pass MUST NOT require Box / local Shell / computer-use parity.

| Observation | Pass | Fail |
|-------------|------|------|
| Scenario Pass criteria | Connector / event / trust / secrets / credential UX alone | Requiring Box/Shell/computer-use for Done |
| Product surfaces | May omit P7 surfaces | Scenario Pass blocked on missing P7 chrome |

**Spot-check:**

```sh
! rg -n -i 'box.*(required|must).*Pass|computer.?use.*(required|must).*Pass|local shell.*(required|must).*Pass' \
  specs/006-connectors-mcp-events-trust/verifier/scenario-*.md \
  specs/006-connectors-mcp-events-trust/verifier/README.md \
  specs/006-connectors-mcp-events-trust/verifier/non-goals.md
```

**Claim:** Recipe documents absence — Verifier stamps when spot-check is measured.

---

## Full connector catalog / live event families / fixed connector

**Acceptance:** Spec Out of Scope · FR-012 · FR-017 · FR-018 · SC-005

Phase 6 Pass MUST NOT require full Grok multi-family connector catalog, named live event families, or a fixed named Pass connector.

**Spot-check:**

```sh
! rg -n -i 'full (grok )?catalog.*(required|must).*Pass|Pass.*(requires|require).*(slack|github|linear|email).*(live|family)|fixed named connector.*(required|must)' \
  specs/006-connectors-mcp-events-trust/verifier/scenario-*.md \
  specs/006-connectors-mcp-events-trust/verifier/README.md
```

**Claim:** Recipe documents absence — Verifier stamps when spot-check is measured.

---

## Vault not mandatory when in-app works (FR-009)

**Acceptance:** FR-009 · SC-007 · SC-005 · research R5

1Password-class vault MUST NOT be a mandatory Pass gate when in-app credential UX completes the Pass connector.

**Spot-check:**

```sh
! rg -n -i 'vault.*(required|mandatory|must).*Pass|Pass.*(requires|require).*vault|1password.*(required|must).*Pass' \
  specs/006-connectors-mcp-events-trust/verifier/scenario-*.md \
  specs/006-connectors-mcp-events-trust/verifier/README.md \
  specs/006-connectors-mcp-events-trust/verifier/non-goals.md
# Affirmative optional language should remain
rg -n 'vault optional|not mandatory|when in-app' \
  specs/006-connectors-mcp-events-trust/verifier/scenario-5-credential-ux.md \
  specs/006-connectors-mcp-events-trust/verifier/credential-ux-in-app.md \
  specs/006-connectors-mcp-events-trust/verifier/non-goals.md
```

**Claim:** Recipe documents absence — Verifier stamps when spot-check is measured.

---

## No Electron connector / event / trust bus

**Acceptance:** FR-011 seam · research R6 / R9 · T013/T014 · [contracts/non-goals.md](../contracts/non-goals.md)

Electron Main MUST NOT be the durable connector / event / trust / credential-value SoT.

| Observation | Pass | Fail |
|-------------|------|------|
| IPC surface | Lifecycle-only `DESKTOP_HOST_*` + `DESKTOP_IPC` | `dsh-desktop:` connector-catalog / event-routine / trust / credential-value channels |
| Store / write | Absent in Main / preload | Main connector/event/trust store as SoT |
| Guard | `apps/desktop/tests/no-electron-connectors-events-trust-bus.spec.ts` green | Spec Fail or missing exclusion docs |

**Rerun (T037 — Verifier owns):**

```sh
pnpm exec vitest run apps/desktop/tests/no-electron-connectors-events-trust-bus.spec.ts
rg -n 'connector-catalog|connector-install|event-routine|credential-value|permission-deny' \
  apps/desktop/src/host-protocol.ts apps/desktop/src/ipc.ts | head -20
```

**Claim:** Recipe documents bar — T037 re-validates after story work.

---

## No rewrite of `specs/001`–`005` (T038)

**Acceptance:** FR-011 · Out of Scope · T038

P6 implement PRs MUST NOT product-edit `specs/001-multi-model-bots/**`, `specs/002-identity-personas/**`, `specs/003-skills-ux/**`, `specs/004-routines-cron/**`, or `specs/005-memory-productization/**`.

**Spot-check:** Documented in [README.md](./README.md) when T038 lands. Example:

```sh
# Against the polish PR tip vs merge-base (expect empty product diff under 001–005)
git diff --name-only origin/master...HEAD -- \
  specs/001-multi-model-bots specs/002-identity-personas \
  specs/003-skills-ux specs/004-routines-cron \
  specs/005-memory-productization
```

**Claim:** Recipe + README T038 note — Verifier / Spec confirm on implement PRs.

---

## Cron additive (SC-008)

**Acceptance:** FR-011 · SC-008 · [scenario-2-event-routine.md](./scenario-2-event-routine.md)

Absence of event triggers replacing cron MUST NOT Fail Pass. Cron create/list/pause/resume/fire from P4 remain available; events are additive.

**Spot-check:**

```sh
! rg -n -i 'event.*(replaces|replace).*cron|Pass.*(fails|fail).*additive|cron.*(removed|replaced).*(required|must)' \
  specs/006-connectors-mcp-events-trust/verifier/scenario-*.md \
  specs/006-connectors-mcp-events-trust/verifier/README.md
rg -n 'SC-008|cron.*(usable|additive|unchanged)' \
  specs/006-connectors-mcp-events-trust/verifier/scenario-2-event-routine.md \
  specs/006-connectors-mcp-events-trust/verifier/non-goals.md
```

**Claim:** Scenario 2 recipe already notes SC-008 — spot-check confirms no over-strict gate.

---

## Traceability

| Artifact | Role |
|----------|------|
| [../contracts/non-goals.md](../contracts/non-goals.md) | Contract absence table |
| [connector-event-trust-seam-locks.md](./connector-event-trust-seam-locks.md) | Full seam lock set |
| [scenario-6-full-replay.md](./scenario-6-full-replay.md) | SC-006 composite (T035 — Verifier owns; must keep non-goals green) |
| [evidence/non-goals/](./evidence/non-goals/) | Measured-check home (T034) |
| [../spec.md](../spec.md) Out of Scope · FR-009…012 · FR-017/018 · SC-005 · SC-008 | Normative non-goals |
| T033 / T037 / T038 | Absences + bus guard + no-rewrite |
