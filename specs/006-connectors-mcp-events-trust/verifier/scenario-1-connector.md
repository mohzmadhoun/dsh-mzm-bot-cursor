# Scenario 1 — Connector install → auth → successful tool call

**Status:** Recipe drafted — product SC Pass **not** stamped (FR-014/015 evidence pending US1 Host/Client Desktop path + Desktop run)
**Owners:** DH Verifier (this recipe + Pass stamp) · DH Runtime (Host catalog / MCP bind / credentials) · DH Client (connector install + auth + tool-success surfaces)
**Linear:** [MOH-319](https://linear.app/momadhoun/issue/MOH-319/t021-us1-verifier-scenario-1-connector-recipe) · Epic [MOH-281](https://linear.app/momadhoun/issue/MOH-281/p6-connectors-mcp-events-trust)
**Acceptance slice:** T021 — Verifier Scenario 1 recipe covering SC-001 (install→auth→ready→successful tool call; FR-017 any-one fixture) with mandatory FR-014/015 (standing orders **11** + **12**) desktop evidence under `verifier/evidence/scenario-1/`
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 1
**Contract:** [../contracts/connector.md](../contracts/connector.md)
**Architect locks:** Host Connector catalog SoT + `dsh-mcp-client` bind (R1); Pass connector = any one thin-catalog / Verifier fixture (FR-017 / R2); in-app credentials primary / vault optional (R5); no Electron Main connector bus (R6 / R9)

## Measurable Done (this recipe)

| Check | Pass bar |
|-------|----------|
| Recipe present | This file documents Steps A–D with Pass/Fail and evidence tags |
| SC coverage | SC-001 install → auth → ready → successful tool call · SC-007 vault not required when in-app works · FR-017 any-one fixture |
| FR-014 (SO 11) | Desktop screenshot(s) and/or short screen recording of the **real Desktop app** under `verifier/evidence/scenario-1/` — unit/jsdom alone **fails** |
| FR-015 (SO 12) | Evidence **committed** on the PR branch under that path **and** embedded in the GUI PR body via absolute `/opt/cursor/artifacts/…` `<img>` / `<video controls>` — artifact page links alone **fail** |
| Product SC stamp | **Deferred** — fill `evidence/scenario-1/VERDICT.txt` only after Desktop FR-014/015 media lands |

**T032 note:** Credential-UX / SC-007 deep checks may extend this recipe later. In-app auth success without vault is already required here (Step B / SC-007).

---

## Scope and prerequisites

| Layer | Required for | Status at recipe authoring |
|-------|--------------|----------------------------|
| Foundational Pass (T016) | Any product SC | **measured:** stamped in [README.md](./README.md#foundational-pass-checklist--recorded) · tip `origin/master` @ `7d71b5f0ee` (#208) |
| Host catalog + install journal (T007/T009/T012) | SC-001 Host half | **measured:** `listConnectorCatalog` / `installConnector` / `TeamView.connectors` ([#208](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/208)) |
| Host auth + MCP fixture bind (T010/T011) | SC-001 auth/tool Host half | **measured:** `authenticateConnector` → `authState=ready` + `mcp__verifier_fixture__ping` on `ctx.tools` ([#208](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/208)) |
| Electron no-bus (T013/T014) | Seam honesty | **measured:** [#206](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/206) |
| US1 Host Desktop install path (T017) | Product install polish | **inferred:** open — foundation Host APIs exist; Desktop Host/Client product path may still land |
| US1 Host auth/tool outcome (T018) | Product auth + tool-success observability | **inferred:** open until Runtime lands remaining US1 Host work |
| Client catalog + install UI (T019) | SC-001 desktop install | **inferred:** open until Client lands |
| Client auth + tool-success UI (T020) | SC-001 desktop auth/tool | **inferred:** open until Client lands |

**Desktop prerequisites** (full Scenario 1 Pass): buildable Desktop (`apps/desktop`, `apps/desktop-host`) with ≥1 bot from prior phases; connector catalog / install / auth / tool-success surfaces on the real Desktop app; Host Connector catalog on Desktop Host; `DISPLAY` when Cloud Agent (`DISPLAY=:1`, `DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop`).

**Host-only rehearsal** (does **not** alone mark SC-001 Done): Agent Teams vitest below — proves Host install / auth / MCP bind before Client UI.

---

## Fixtures (deterministic strings)

Pass connector = **any one** thin-catalog / Verifier fixture entry (FR-017). Default Host Pass fixture (not a fixed live connector name):

| Field | Value |
|-------|-------|
| `catalogId` | `verifier-fixture` |
| `displayName` | `Verifier Fixture Connector` |
| `serverName` | `verifier_fixture` |
| Public tool (after ready) | `mcp__verifier_fixture__ping` |
| Auth mode | `in_app` (vault optional — SC-007) |
| Install secret (Host rehearsal) | non-empty fixture token — **never** assert the value appears in session dump / projection JSON |

Do **not** require a fixed named live connector (Slack/GitHub/etc.) for Pass. Another thin-catalog entry that completes the same install→auth→tool path also satisfies FR-017.

---

## Step A — Install one Pass connector (SC-001 install · FR-001 · FR-017)

**User / Verifier path (desktop):**

1. Launch the real Desktop app (not jsdom): `DISPLAY=:1 DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop`.
2. Open the **connector** surface (catalog / install UI — not chat-paste alone).
3. Install **any one** thin-catalog or Verifier-fixture connector (default: `verifier-fixture` / Verifier Fixture Connector).
4. Confirm a durable installed row is user-visible (`installState=installed` or equivalent label); available≠installed.
5. Capture FR-014/015 evidence (see Evidence section).

**Host observation (when Client UI is not yet available):**

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/connector-catalog.spec.ts -t 'listConnectorCatalog \+ installConnector'
```

Assert `installConnector` persists a Host `ConnectorRecord` with `installState: installed`, `authState: needs_auth` (or equivalent pre-ready), and `listConnectors` / `view.connectors` includes that row. Assert unknown `catalogId` rejects without writing a Pass success row.

| Observation | Pass | Fail |
|-------------|------|------|
| Install | Durable installed connector visible on Desktop connector surface (or Host list for Host-only rehearsal) | Catalog text alone; Electron Main SoT; silent no-op |
| Any-one | Completes with fixture **or** another thin entry | Pass gated on a fixed live connector name |
| Evidence | Desktop screenshot/recording filed + committed + PR-embedded | Unit/jsdom-only claim |

**Claim tags:** desktop UI → **measured** (required for SC-001 Done); Host vitest-only → **measured** (Host half) + **inferred** (does not complete SC-001).

---

## Step B — Authenticate to ready via in-app credential UX (SC-001 auth · SC-007 · FR-002)

**User / Verifier path (desktop):**

1. On the installed connector from Step A, complete auth via **in-app** credential UX (primary path).
2. Confirm `authState=ready` (or equivalent user-visible ready indicator).
3. Do **not** require vault / 1Password for Pass when in-app succeeds (SC-007).
4. Do **not** use chat-paste of secrets as the primary auth path (FR-002 / FR-008).
5. Capture FR-014/015 evidence of the auth surface and ready state.

**Host observation:**

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/connector-catalog.spec.ts -t 'authenticateConnector'
```

Assert `authenticateConnector` with non-empty secret reaches `authState: ready`, `credentialConfigured: true`, and `describeConnectorCredential` / projection JSON **omit** the secret value. Empty/whitespace secret rejects without ready.

| Observation | Pass | Fail |
|-------------|------|------|
| Ready | User-visible ready after in-app auth | Stuck needs_auth presented as success; abandoned auth claimed as Pass |
| Vault optional | Pass without vault when in-app works | Vault mandatory for Pass |
| Chat-paste | Not required as primary | Secrets pasted into chat as primary auth |
| Evidence | Desktop frame of auth / ready (GUI Pass) | Host log only presented as GUI Pass |

---

## Step C — Successful connector tool call (SC-001 tool · FR-003 · FR-016)

**User / Verifier path (desktop):**

1. With connector auth ready (Step B), invoke **one** connector tool (fixture: `mcp__verifier_fixture__ping` or the ready connector’s exposed tool).
2. Observe a **user-visible success** indicator / outcome (`outcome=success` or equivalent).
3. Do **not** score LLM wording (FR-016).
4. Capture FR-014/015 evidence of the success indicator.

**Host observation:**

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/connector-catalog.spec.ts -t 'authenticateConnector'
```

Assert after ready, `ctx.tools.get('mcp__verifier_fixture__ping')` (or `passFixturePublicToolName()`) is defined. Host tool registration alone is supporting (**inferred** for user-visible Desktop success).

| Observation | Pass | Fail |
|-------------|------|------|
| Success | User-visible tool success on Desktop | Tool registered only in Host logs / DevTools; success claimed without UI |
| LLM | Wording not scored | Pass requires particular assistant prose |
| Evidence | Desktop screenshot/recording of success | Unit/jsdom-only claim |

**Claim tags:** desktop UI → **measured** (required for SC-001 Done).

---

## Step D — Failed / abandoned paths must not count as Pass

**User / Verifier path (desktop):**

1. Attempt install of an unknown / invalid catalog entry → clear reject; no Pass success row.
2. Abandon auth before ready → must **not** claim Story 1 / SC-001 Pass.
3. Empty connector surface or catalog-only browse without install → Fail FR-001.

| Observation | Pass | Fail / out of scope |
|-------------|---------------------|---------------------|
| Bad install | Clear reason; no installed success | Silent accept; catalog-only “success” |
| Abandoned auth | Not stamped as SC-001 Pass | Claiming Pass without ready + tool success |

---

## Fail path (record; does not block recipe delivery)

| Condition | Required behavior |
|-----------|-------------------|
| Host catalog unavailable | Clear user-visible failure; **no** silent empty “success” |
| Unit/jsdom-only evidence | Scenario 1 GUI **Fail** (FR-014 / SO 11) |
| Evidence not committed / not PR-embedded | GUI **Fail** (FR-015 / SO 12) |
| Pass claimed via Electron Main connector bus | **Fail** (T013/T014 / R6) |
| Pass requires fixed named live connector | **Fail** (FR-017) |
| Secrets appear in session dump / projection as Pass proof | **Fail** (FR-007; Scenario 4 owns dump proof) |

---

## FR-014 / FR-015 desktop visual evidence (mandatory — SO 11 + 12)

**Standing order 11 (FR-014):** Scenario 1 GUI Pass **requires** desktop screenshot(s) and/or a short screen recording of the **real Desktop app**. Vitest/jsdom alone **fails**.

**Standing order 12 (FR-015):** Those artifacts MUST be **committed** under `specs/006-connectors-mcp-events-trust/verifier/evidence/scenario-1/` on the PR branch **and** embedded in the GUI PR body via HTML `<img>` / `<video controls>` using absolute `/opt/cursor/artifacts/…` paths. Cursor agent artifact page links alone MUST NOT satisfy Pass.

**Directory:**

```text
specs/006-connectors-mcp-events-trust/verifier/evidence/scenario-1/
```

**Required artifacts (minimum):**

| Artifact | Content |
|----------|---------|
| `01-connector-installed.png` (or `.webp`) | Connector surface after install — durable installed row (any-one fixture / thin entry) |
| `02-auth-ready.png` (or recording segment) | In-app auth surface and/or ready indicator (`authState=ready`) |
| `03-tool-success.png` (or recording segment) | User-visible successful connector tool outcome |
| Optional `00-catalog-open.png` | Connector catalog open before install |
| Optional `scenario-1-connector-walkthrough.mp4` / `.webm` | Short recording covering Steps A–C |
| `VERDICT.txt` | Filled stamp (template below) when product SC is claimed |

Also copy/publish walkthrough copies under `/opt/cursor/artifacts/` when running as Cloud Agent Verifier (SO 11). Placeholder README: [evidence/scenario-1/README.md](./evidence/scenario-1/README.md).

---

## Pass stamp template (fill when evidence lands — do not claim now)

```text
Verdict: Pass
Stamp: YYYY-MM-DD · tip <sha> · desktop <build> (DISPLAY=:1)
Linear: MOH-319 · Epic MOH-281
SC-001: Pass — evidence: evidence/scenario-1/{01-connector-installed,02-auth-ready,03-tool-success}.*
SC-007: Pass — in-app auth succeeded; vault not required
FR-017: Pass — any-one thin-catalog / verifier-fixture (not fixed live name)
FR-014: desktop screenshots/recording present; not unit/jsdom-only (SO 11)
FR-015: media committed under verifier/evidence/scenario-1/ + PR embeds via /opt/cursor/artifacts/… (SO 12)
Blockers: none
```

**Rule:** Do not mark SC-001 / SC-007 Done in Linear / Spec without a filled stamp that includes FR-014/015 desktop evidence once Client connector UI exists. Host vitest alone may advance catalog confidence but does **not** close US1 / Scenario 1. Leave [MOH-319](https://linear.app/momadhoun/issue/MOH-319/t021-us1-verifier-scenario-1-connector-recipe) **In Progress** until PO merges GUI evidence + SO12 embeds — Verifier does **not** mark Linear Done on recipe-only delivery.

---

## Explicit non-goals

- Client connector UI implementation (T019–T020) — out of this Verifier recipe PR
- Remaining US1 Host Desktop polish (T017–T018) product code — out of this PR
- Event-triggered routines (Scenario 2 / US2)
- Denied permission path (Scenario 3 / US3)
- Session-dump secrets inspection (Scenario 4 / US4)
- Full credential-UX / vault-optional deep stamp (T032 may extend this recipe)
- Full multi-family live connector catalog (P7 / non-goal)
- Electron Main connector / credential-value bus (forbidden; T013/T014)
- Product SC-001…SC-008 Done stamps on this docs-only delivery

---

## Traceability

| Artifact | Role |
|----------|------|
| [../quickstart.md](../quickstart.md) Scenario 1 | User-facing outline |
| [../contracts/connector.md](../contracts/connector.md) | Contract Pass bars |
| [../spec.md](../spec.md) FR-001/002/003/014/015/016/017 · SC-001/007 | Normative requirements |
| [README.md](./README.md) | Scenario owners map + foundational Pass + FR-014/015 mandate |
| [host-connector-inventory.md](./host-connector-inventory.md) | Setup inventory (T002) |
| [connector-event-trust-seam-locks.md](./connector-event-trust-seam-locks.md) | Architect Path A locks |
| This file | T021 rerunnable Scenario 1 connector recipe |
| T017–T020 | Host Desktop install/auth + Client catalog/auth/tool UI |
| T032 | Optional SC-007 credential-UX extension of this recipe |
| T034 | Broader evidence directory packaging |

## Evidence for PO / DH Lead

**Recipe delivered (T021).** Product SC Pass **not** stamped. Host foundation (catalog install / auth ready / MCP fixture bind) is on master via [#208](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/208) / foundational T016. Full Scenario 1 Done waits on US1 Host/Client Desktop path (T017–T020) plus Verifier FR-014/015 desktop evidence using Steps A–C above. Placeholders under [evidence/scenario-1/](./evidence/scenario-1/) require SO 11+12 media before GUI Pass.
