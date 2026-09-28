# Verifier recipes — Phase 6 Connectors / MCP + event routines + trust

**Feature:** `specs/006-connectors-mcp-events-trust`
**Role:** DH Verifier evidence home. Recipes are rerunnable acceptance scripts/outlines; they do not implement product features.
**Quickstart outline:** [../quickstart.md](../quickstart.md)
**Contracts:** [../contracts/](../contracts/) — start at [contracts/README.md](../contracts/README.md)
**Architect Path A:** Host Connector catalog SoT + `dsh-mcp-client`; B1 webhook→Routine wake; additive `triggerKind`/`eventTrigger`; deny = user-deny or standing never; in-app primary / vault optional; no Electron Main bus — see [research.md](../research.md) / [plan.md](../plan.md) / [connector-event-trust-seam-locks.md](./connector-event-trust-seam-locks.md)
**Setup inventories:** [host-connector-inventory.md](./host-connector-inventory.md) (T002) · [event-harness-inventory.md](./event-harness-inventory.md) (T003) · [credentials-trust-inventory.md](./credentials-trust-inventory.md) (T004) · [connector-event-trust-seam-locks.md](./connector-event-trust-seam-locks.md) (T005) · [credential-ux-in-app.md](./credential-ux-in-app.md) (T031)
**Evidence:** [evidence/](./evidence/) — Scenario 1 under [evidence/scenario-1/](./evidence/scenario-1/) (T021); Scenario 2 under [evidence/scenario-2/](./evidence/scenario-2/) (T025); Scenario 3 under [evidence/scenario-3/](./evidence/scenario-3/) (T028); Scenario 4 dump under [evidence/scenario-4/](./evidence/scenario-4/) (T030); US5 credential-UX / SC-007 deep checks in [scenario-5-credential-ux.md](./scenario-5-credential-ux.md) (T032; auth-surface evidence reuses `evidence/scenario-1/`); remaining dirs in polish T034; Scenario recipes land with US tasks
**Linear:** **Blocked** — workspace free-issue limit; **no invented epic/issue ids**; **no `taskstoissues` in this PR**. Track T001–T040 via PR only until capacity returns (project **DeepSeek Harness - Cursor** / `P-MOH-2` only — never GrokBot).

## T001 — Design tree confirm (Setup)

**Verdict:** **Pass** (design artifacts only)
**Stamp:** 2026-09-28 · tip `origin/master` @ `ff149f38d1` (analyze #203 landed)
**Linear:** Blocked — PR-only tracking

| Artifact | Path | Present |
|----------|------|---------|
| Spec | [spec.md](../spec.md) | Yes |
| Plan | [plan.md](../plan.md) | Yes |
| Research (Architect Path A) | [research.md](../research.md) | Yes |
| Data model | [data-model.md](../data-model.md) | Yes |
| Quickstart | [quickstart.md](../quickstart.md) | Yes |
| Contracts | [contracts/](../contracts/) (`README`, connector, event-routine, trust-deny, secrets, non-goals) | Yes |
| Requirements checklist | [checklists/requirements.md](../checklists/requirements.md) | Yes |
| Analyze report | [analyze-report.md](../analyze-report.md) | Yes (pre-implement) |

**Implementer pointers:** Start at [contracts/README.md](../contracts/README.md). Honor Architect **Path A** in [research.md](../research.md) R0–R6 / R9 — Host Connector catalog + mcp-client; B1 harness wake; additive Routines; either deny path; in-app credentials; no Electron Main bus. Do not invent a competing SoT.

**Cross-links:** Inventories T002–T004 above · seam locks T005 · this README T006.

## Foundational Pass gate (T016)

**Rule:** Product success criteria **SC-001…SC-008** MUST NOT be marked Done without a recorded foundational Pass (Host `ConnectorRecord` + additive event `RoutineRecord` + catalog/MCP/credential bind + Host projection/mutations + Electron exclusion docs + no-Electron-connectors-events-trust-bus guard + B1 harness doc). Product SC evidence stays under Scenario recipes; T016 stamps this README when T007–T015 land.

### Foundational Pass checklist — recorded

**Verdict:** **Pass** (foundations only)
**Stamp:** 2026-09-28 · branch `cursor/p6-foundation-host-fe1d` (T007–T012 Host + T015 B1 doc; T013–T014 Electron on master via #206)
**Linear:** Blocked — PR-only tracking (project `P-MOH-2`)

| # | Gate | Tasks | Bar | Evidence | Result |
|---|------|-------|-----|----------|--------|
| 1 | **Types + validation** | T007 | `ConnectorRecord` / `ConnectorCatalogEntry` branded ids + install/auth/transport vocab | `packages/experimental/agent-team/src/{types,validation}.ts` | Pass |
| 2 | **Additive routines** | T008 | `triggerKind`/`eventTrigger`; cron rows unchanged; cron due skips event | `routine-cron.ts` + focused vitest | Pass |
| 3 | **Host connector catalog** | T009 | Thin catalog + journal `team/connector` install/list — not Electron Main | `TeamService` + `connector-bind.ts`; [vitest-connector-event.log](./evidence/foundation-host/vitest-connector-event.log) | Pass |
| 4 | **MCP fixture bind** | T010 | Ready auth registers `ctx.tools` via `dsh-mcp-client` (`verifier-fixture` / `mcp__verifier_fixture__ping`) | `bindPassConnectorMcpTools`; same vitest log | Pass |
| 5 | **Credential seam** | T011 | Secrets in Host `ctx.credentials`; describe value-free (FR-007) | `describeConnectorCredential` / `storeConnectorSecret`; same vitest log | Pass |
| 6 | **Host HTTP/WS Remotes** | T012 | Catalog/install/auth/describe + event `createRoutine` Remotes; `TeamView.connectors` | `index.ts` / `client.ts` / `projection.ts`; [vitest-team-routines.log](./evidence/foundation-host/vitest-team-routines.log) | Pass |
| 7 | **Electron thin shell** | T013–T014 | Forbidden IPC + `no-electron-connectors-events-trust-bus` | master #206 | Pass |
| 8 | **B1 harness doc** | T015 | Webhook ingress → match event routines → existing-bot wake (not new-Session) | [webhook-harness-b1.md](./webhook-harness-b1.md) | Pass |

**Scope lock:** This Pass does **not** mark SC-001…SC-008 Done. Scenario recipes and product US1–US5 implementation remain open. US fan-out may begin after this stamp lands on master.

Setup T001–T006 does **not** claim foundational Pass.

## FR-014/015 / standing orders 11+12 — desktop visual evidence (mandatory)

**Rule:** Every **GUI** acceptance scenario (US1–US3, US5 GUI / SC-001…003 / SC-006 / SC-007) requires **desktop screenshot(s) and/or a short screen recording** of the real Desktop app, **committed** under `specs/006-connectors-mcp-events-trust/verifier/evidence/` **and** embedded in the GUI PR body (absolute `/opt/cursor/artifacts/…` paths for ManagePullRequest uploads). Unit/jsdom alone **fails** those scenarios. Scenario 4 (secrets dump inspection) may use non-GUI log/artifact evidence (still committed); GUI auth steps still need SO 11+12 when shown. Scenario 5 (non-goals / seam absence) is docs/absence — GUI screenshot optional.

Expected evidence layout (T034 placeholders):

```text
specs/006-connectors-mcp-events-trust/verifier/evidence/
├── scenario-1/   # QS1 connector install→auth→tool — screenshots / recording + VERDICT
├── scenario-2/   # QS2 event routine create + harness fire
├── scenario-3/   # QS3 denied permission
├── scenario-4/   # QS4 secrets absent (dump/log OK)
├── non-goals/    # QS5 / SC-005 measured absence checks
└── scenario-6/   # QS6 full replay
```

## Scenario 1–6 owners map (T006)

Mapped to [quickstart.md](../quickstart.md). Owner columns name who owns scripts/evidence for that scenario (not who implements the product feature alone). Owner labels are **Host / Runtime** / **Client** / **Electron** / **Verifier** per tasks.md ownership legend.

| Scenario | Quickstart | Recipe path (later) | Evidence | Primary owners | Acceptance | FR-014/015 |
|----------|------------|---------------------|----------|----------------|------------|------------|
| **1** Install → auth → tool call | [Scenario 1](../quickstart.md#scenario-1--connector-install--auth--successful-tool-call) | [scenario-1-connector.md](./scenario-1-connector.md) (T021) · US5 deep SC-007: [scenario-5-credential-ux.md](./scenario-5-credential-ux.md) (T032) · [connector.md](../contracts/connector.md) / [secrets.md](../contracts/secrets.md) | [evidence/scenario-1/](./evidence/scenario-1/) | **Host / Runtime** + **Client** + **Verifier** | SC-001, SC-007 | **Required** |
| **2** Event routine create + fire | [Scenario 2](../quickstart.md#scenario-2--event-triggered-routine-e2e) | [scenario-2-event-routine.md](./scenario-2-event-routine.md) (T025) · [event-routine.md](../contracts/event-routine.md) | [evidence/scenario-2/](./evidence/scenario-2/) | **Host / Runtime** + **Client** + **Verifier** | SC-002, SC-008 | **Required** |
| **3** Denied permission | [Scenario 3](../quickstart.md#scenario-3--denied-permission) | [scenario-3-trust-deny.md](./scenario-3-trust-deny.md) (T028) · [trust-deny.md](../contracts/trust-deny.md) | [evidence/scenario-3/](./evidence/scenario-3/) | **Host / Runtime** + **Client** + **Verifier** | SC-003 | **Required** |
| **4** Secrets absent from dumps | [Scenario 4](../quickstart.md#scenario-4--secrets-absent-from-session-dumps) | [scenario-4-secrets-absent.md](./scenario-4-secrets-absent.md) (T030) · [secrets.md](../contracts/secrets.md) | [evidence/scenario-4/](./evidence/scenario-4/) | **Host / Runtime** + **Verifier** | SC-004, SC-007 | Dump log OK; GUI auth if shown |
| **5** Non-goals absence | [Scenario 5](../quickstart.md#scenario-5--non-goals-absence) | `non-goals.md` (T033) · [contracts/non-goals.md](../contracts/non-goals.md) | `evidence/non-goals/` | **Host / Runtime** + **Electron** + **Verifier** | SC-005 | Docs/absence OK |
| **6** Full Phase 6 replay | [Scenario 6](../quickstart.md#scenario-6--full-phase-6-replay) | `scenario-6-full-replay.md` (T035) · all contracts | `evidence/scenario-6/` | **Verifier** | SC-006 (+ composite of 1–5 + T016) | **Required** for GUI slices |

Foundational Pass (T016) must hold before Scenario evidence counts toward phase Done. Scenario recipes themselves are **not** created in Setup T001–T006.

## Owner roles

| Owner | Owns for Verifier evidence |
|-------|----------------------------|
| **Host / Runtime** | Connector catalog durability, MCP bind, B1 harness wake, credential store, deny enforce, Host Remotes |
| **Client** | Connector / event-routine / approval / auth surfaces on Desktop Web (Host HTTP/WS only) |
| **Electron** | Thin-shell absence: no Main connector/event/trust/credential-value bus (T013/T014); desktop launch path for GUI evidence |
| **Verifier** | Rerunnable recipes, pass/fail stamps, FR-014/015 committed screenshots/recordings + PR embeds, Scenario 6 composite replay |

## Clarify / Architect locks (honor in every recipe)

1. Host Connector catalog is SoT + `dsh-mcp-client` bind — Client and Electron Main invent no durable connector rows (R1).
2. Pass connector = any one thin-catalog / Verifier fixture — not a fixed name (FR-017).
3. Event Pass = webhook harness / Verifier fixture only; B1 adapt `dsh-webhook` ingress → Routine wake on **existing bot** + intent (FR-018 / R3).
4. Additive `triggerKind` + `eventTrigger` — cron rows unchanged; no rewrite `specs/004` (SC-008).
5. Deny Pass = user-deny via `dsh-user-approval` **or** standing `never` / block; Client answerer on Host HTTP (R4).
6. Credentials: in-app primary via Host credential seam; vault optional; secrets absent from session dumps (R5).
7. No Electron Main connector/event/trust/credential-value bus — lifecycle IPC only; data plane = authenticated Host HTTP/WS (R6 / R9).
8. FR-014/015 desktop visual evidence required for all GUI scenarios; commit under `verifier/evidence/` + PR embeds (SO 11+12).
9. Linear / `taskstoissues` blocked — no invented issue ids; PR-only tracking until capacity.

## Fan-out policy

- Setup T001–T006 may land before Host foundation.
- **US1–US5 product work blocked** until Foundational T007–T016 land on master.
- Scenario 6 requires Scenarios 1–5 (or equivalent) plus foundational Pass.
- Quickstart non-goals MUST NOT appear in Pass criteria ([quickstart.md](../quickstart.md) Scenario 5).
- Do **not** rewrite `specs/001`–`005` in P6 implement PRs (T038).

## Rerun Setup (idempotent)

```sh
test -f specs/006-connectors-mcp-events-trust/spec.md
test -f specs/006-connectors-mcp-events-trust/plan.md
test -f specs/006-connectors-mcp-events-trust/research.md
test -f specs/006-connectors-mcp-events-trust/data-model.md
test -f specs/006-connectors-mcp-events-trust/quickstart.md
test -f specs/006-connectors-mcp-events-trust/contracts/README.md
test -f specs/006-connectors-mcp-events-trust/contracts/connector.md
test -f specs/006-connectors-mcp-events-trust/contracts/event-routine.md
test -f specs/006-connectors-mcp-events-trust/contracts/trust-deny.md
test -f specs/006-connectors-mcp-events-trust/contracts/secrets.md
test -f specs/006-connectors-mcp-events-trust/contracts/non-goals.md
test -f specs/006-connectors-mcp-events-trust/checklists/requirements.md
test -f specs/006-connectors-mcp-events-trust/verifier/README.md
test -f specs/006-connectors-mcp-events-trust/verifier/host-connector-inventory.md
test -f specs/006-connectors-mcp-events-trust/verifier/event-harness-inventory.md
test -f specs/006-connectors-mcp-events-trust/verifier/credentials-trust-inventory.md
test -f specs/006-connectors-mcp-events-trust/verifier/connector-event-trust-seam-locks.md
rg -n 'T001 — Design tree confirm' specs/006-connectors-mcp-events-trust/verifier/README.md
rg -n 'Scenario 1–6 owners map' specs/006-connectors-mcp-events-trust/verifier/README.md
rg -n 'standing orders 11\+12' specs/006-connectors-mcp-events-trust/verifier/README.md
rg -n 'Linear.*Blocked' specs/006-connectors-mcp-events-trust/verifier/README.md
rg -n 'Architect Path A' specs/006-connectors-mcp-events-trust/verifier/connector-event-trust-seam-locks.md
```

**PO / DH Lead:** Setup T001–T006 complete on this branch. Do **not** mark product SC Done. Next: Foundational T007–T016 (Host catalog + additive Routines + MCP/credential bind + protocol exclusions + B1 doc). Linear remains blocked — leave tracking on the PR.
