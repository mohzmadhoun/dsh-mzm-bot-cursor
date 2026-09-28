# Scenario 4 — Secrets absent from session dumps

**Status:** Recipe **Pass** (T030) · Host dump-inspection evidence committed under [evidence/scenario-4/](./evidence/scenario-4/) · Product SC-004 Host exportable-artifact half **Pass** on tip below · GUI auth SO 11+12 when auth UI is shown → cross-ref Scenario 1 (not re-required for dump-only Pass)
**Owners:** DH Verifier (this recipe + dump stamp) · DH Runtime (Host credential seam + session-dump honesty — T011 / T018 / T029)
**Linear:** [MOH-328](https://linear.app/momadhoun/issue/MOH-328/t030-us4-verifier-scenario-4-secrets-absent-recipe) · Epic [MOH-281](https://linear.app/momadhoun/issue/MOH-281/p6-connectors-mcp-events-trust)
**Acceptance slice:** T030 — Verifier Scenario 4 dump-inspection recipe covering SC-004 with committed evidence under `verifier/evidence/scenario-4/` (dump log/artifact OK; GUI auth steps still need standing orders **11** + **12** when shown)
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 4
**Contract:** [../contracts/secrets.md](../contracts/secrets.md)
**Architect locks:** Credentials in Host `dsh-credentials` seam only (R5); secrets absent from session dumps / exportable artifacts (FR-007); in-app primary / vault optional (FR-008/009); chat-paste / env-file not product Pass path; describe never returns secret values; no Electron Main credential-value bus (R6 / R9)

## Measurable Done (this recipe)

| Check | Pass bar |
|-------|----------|
| Recipe present | This file documents Steps A–C with Pass/Fail and evidence tags |
| SC coverage | SC-004 secrets/tokens/passwords/API keys absent from dumps · FR-007 · FR-008 chat-paste not primary |
| Dump evidence | Committed dump log / artifact under `verifier/evidence/scenario-4/` — **non-GUI OK** for dump-only Pass (FR-015) |
| GUI auth (when shown) | If Verifier shows Desktop auth UX in this scenario path, FR-014/015 (SO 11+12) apply — otherwise cross-ref Scenario 1 auth evidence |
| Product SC stamp | Host dump-inspection **Pass** — see `evidence/scenario-4/VERDICT.txt` |

---

## Scope and prerequisites

| Layer | Required for | Status at recipe authoring |
|-------|--------------|----------------------------|
| Foundational Pass (T016) | Any product SC | **measured:** stamped in [README.md](./README.md#foundational-pass-checklist--recorded) · tip `origin/master` @ `7d71b5f0ee` (#208) |
| Credential / dump honesty inventory (T004) | FR-007 seam honesty | **measured:** [credentials-trust-inventory.md](./credentials-trust-inventory.md) |
| Architect Path A locks (T005) | R5 credentials | **measured:** [connector-event-trust-seam-locks.md](./connector-event-trust-seam-locks.md) |
| Electron no-bus (T013/T014) | Seam honesty | **measured:** [#206](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/206) |
| Host credential seam + describe value-free (T011) | FR-007 store/describe | **measured:** `storeConnectorSecret` / `describeConnectorCredential` on master (#208) |
| US1 auth→ready (T017–T020) | Known secret after connector auth | **measured:** Scenario 1 Desktop Pass under [evidence/scenario-1/](./evidence/scenario-1/) |
| US4 Host dump honesty (T029) | Session-log / export path hardening | **inferred:** T011/T018 already keep secrets off journal/view/describe; T029 may deepen export paths — recipe remains valid against current Host dump surfaces |

**Dump-inspection path (primary Pass for SC-004):** After connector auth with a known fixture secret, inspect Host exportable artifacts (Team journal projection / `agentTeams/view` / `describeConnectorCredential` / session-log export when available) and confirm the plaintext secret is **absent**. Commit the inspection log under `evidence/scenario-4/`.

**GUI auth (conditional):** Desktop visual evidence is required **only** when this scenario’s walkthrough shows the user-visible auth surface. Dump-only Pass may skip SO 11+12 embeds (FR-015). When auth UI is shown, reuse or capture SO 11+12 media (Scenario 1 evidence is an acceptable cross-ref for the same in-app auth path).

---

## Fixtures (deterministic strings)

| Field | Value |
|-------|-------|
| Pass connector | `verifier-fixture` (FR-017 any-one) |
| Known secret (Host rehearsal) | `fixture-token-not-for-dumps` (must **not** appear in dumps) |
| Auth mode | `in_app` (chat-paste not primary — FR-008) |
| Dump surfaces (Pass) | `describeConnectorCredential` JSON · Remote describe · `agentTeams/view` / connector projection · Team journal `team/connector` payload when exported · any product session-dump / export artifact |

Do **not** accept “secret lives only in Host credential store” as Pass without inspecting at least one exportable dump/projection surface. Do **not** require vault for Pass when in-app works (SC-007 / FR-009 — owned primarily by Scenario 1 / US5).

---

## Step A — Authenticate Pass connector with a known secret (SC-004 setup · FR-007/008)

**User / Verifier path (desktop — optional for dump-only Pass):**

1. Launch Desktop if capturing auth UI: `DISPLAY=:1 DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop`.
2. Complete Scenario 1 install → in-app auth for any one Pass connector (`verifier-fixture` default).
3. Record the known secret / token used for auth (fixture value for Host rehearsal).
4. Confirm auth reaches `authState=ready` without chat-paste as primary path.
5. If auth UI is shown: capture FR-014/015 evidence (or cite Scenario 1 auth frames).

**Host observation (dump-primary rehearsal):**

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/connector-catalog.spec.ts \
  -t 'authenticateConnector stores secret'
```

Assert `authenticateConnector` stores the secret via Host credentials only, reaches `authState=ready`, and `describeConnectorCredential` returns value-free facts (`configured` / `kind` / `credentialKey` address — never the secret string).

| Observation | Pass | Fail |
|-------------|------|------|
| Auth | Connector ready after in-app credential save | Chat-paste primary; env-file product Pass; abandoned auth claimed ready |
| Secret known | Verifier records the plaintext used for later dump grep | No known secret to search for |
| Plane | Secret written to Host credential seam | Secret written into journal / Main IPC / Client durable SoT |

**Claim tags:** Host auth + describe → **measured**; Desktop auth UI → **measured** only when shown (else **inferred** via Scenario 1).

---

## Step B — Export / dump session artifacts (SC-004 dump · FR-007)

**Verifier path (required):**

1. After Step A, obtain exportable artifacts for that session / Host catalog:
   - Host `agentTeams/view` (or Remote view) JSON — includes `connectors` projection
   - `describeConnectorCredential` / Remote describe JSON
   - Team journal `team/connector` event payload when session-log dump/export is available
   - Any product “export session” / dump file documented by Host
2. Persist the dump text (redact unrelated PII if needed; **do not** redact by deleting the search for the known secret — absence is the claim).
3. Commit the dump log / artifact under `verifier/evidence/scenario-4/`.

**Host observation:**

```sh
# Same vitest as Step A — asserts:
#   JSON.stringify(described) does not contain secret
#   JSON.stringify(remoteDescribe.value) does not contain secret
#   JSON.stringify(view) does not contain secret
pnpm exec vitest run packages/experimental/agent-team/tests/connector-catalog.spec.ts \
  -t 'authenticateConnector stores secret'
```

| Observation | Pass | Fail |
|-------------|------|------|
| Dump obtained | At least one exportable surface captured after auth | No dump; “trust the store” without inspection |
| Projection honesty | Connector projection exposes `credentialConfigured` (boolean) not secret values | Projection / dump includes token/password/API key plaintext |
| Evidence | Dump log committed under `evidence/scenario-4/` | Ephemeral CI log only; no committed artifact |

**Claim tags:** dump file + grep → **measured** (required for SC-004 Done).

---

## Step C — Confirm secrets absent + auth path honesty (SC-004 outcome · FR-007/008)

**Verifier path (required):**

1. Search dump artifacts for the known secret string from Step A.
2. Confirm **absent** (no plaintext recoverable credential value).
3. Confirm auth path did not instruct chat-paste of long-lived secrets as primary (FR-008).
4. Record Pass/Fail in `VERDICT.txt`.

| Observation | Pass | Fail |
|-------------|------|------|
| Absent | Known secret/token/password/API key **not** present in dumps | Plaintext secret recoverable from dump/view/describe/journal export |
| Address OK | `credentialKey` / `credentialConfigured` metadata alone is fine | Metadata that embeds the secret value |
| Auth UX | In-app primary; chat-paste not primary Pass path | Chat-paste / env-file presented as product Pass |
| Evidence | Committed dump inspection + VERDICT | Verbal claim; unit assertion without committed log |

**Claim tags:** dump grep result → **measured** (required for SC-004 Done).

---

## Fail path (record; does not block recipe delivery)

| Condition | Required behavior |
|-----------|-------------------|
| Plaintext secrets in dumps / view / describe | **Fail** FR-007 / SC-004 |
| Chat-paste as primary Pass auth | **Fail** FR-008 |
| Env-file as product Pass | **Fail** FR-008 |
| No committed dump artifact | **Fail** SC-004 evidence bar |
| GUI auth shown without SO 11+12 media | **Fail** FR-014/015 for that GUI slice (dump-only Pass still OK if no GUI shown) |
| Pass claimed via Electron Main credential-value bus | **Fail** (T013/T014 / R6) |
| Vault required when in-app works | **Fail** over-gate / FR-009 (Scenario 1 / US5) |

---

## Evidence — dump inspection (primary) + conditional GUI

**Directory:**

```text
specs/006-connectors-mcp-events-trust/verifier/evidence/scenario-4/
```

**Required artifacts (minimum for dump-only Pass):**

| Artifact | Content |
|----------|---------|
| `p6-t030-secrets-absent-vitest.log` | Host vitest dump-inspection run (authenticate + assert secret absent from describe/view) |
| `dump-inspection.txt` | Measured checklist: surfaces inspected, secret marker, Pass/Fail lines |
| `VERDICT.txt` | Filled stamp when SC-004 dump Pass is claimed |
| Optional `00-auth-ready.png` (+ SO12 embed) | Only when Scenario 4 walkthrough shows Desktop auth UI |
| Optional `session-dump.json` / `.log` | Raw exportable dump excerpt (must not contain the secret) |

Also copy walkthrough / log mirrors under `/opt/cursor/artifacts/` when running as Cloud Agent Verifier. Placeholder README: [evidence/scenario-4/README.md](./evidence/scenario-4/README.md).

**Standing orders 11 + 12 (conditional):**

| Order | FR | Rule for Scenario 4 |
|-------|-----|---------------------|
| **SO 11** | FR-014 | Required **when** Desktop auth (or other GUI) is shown in this scenario’s evidence set — unit/jsdom alone fails that GUI slice |
| **SO 12** | FR-015 | GUI media **committed** + PR-embedded via `/opt/cursor/artifacts/…` when GUI is shown; **dump-only** Pass may skip GUI embeds |

---

## Pass stamp template (fill when evidence lands)

```text
Verdict: Pass
Stamp: YYYY-MM-DD · tip <sha> · dump-inspection (Host vitest / exportable artifacts)
Linear: MOH-328 · Epic MOH-281
SC-004: Pass — evidence: evidence/scenario-4/{p6-t030-secrets-absent-vitest.log,dump-inspection.txt}
FR-007: Pass — known fixture secret absent from describe / view / dump surfaces
FR-008: Pass — in-app credential seam; chat-paste not primary
FR-014/015: N/A for dump-only (or SO 11+12 when auth GUI shown — cite Scenario 1 / local frames)
Blockers: none
```

**Rule:** Do not mark SC-004 Done without a filled stamp that cites committed dump-inspection evidence. Host vitest dump assertions **do** satisfy SC-004 when the committed log proves secret absence from exportable surfaces. Leave [MOH-328](https://linear.app/momadhoun/issue/MOH-328/t030-us4-verifier-scenario-4-secrets-absent-recipe) for PO merge — Verifier does **not** mark Linear Done unasked after recipe-only delivery unless product stamp is complete and PO confirms.

---

## Explicit non-goals

- Host T029 session-log export hardening product code — companion Host task; out of this Verifier recipe PR when already proven by T011/T018 surfaces
- Client credential UX polish (US5 / T031–T032)
- Connector install→auth→tool success chrome (Scenario 1) — prerequisite for known secret
- Event-routine fire (Scenario 2) · trust deny (Scenario 3)
- Electron Main credential-value bus (forbidden)
- Mandatory vault when in-app works
- Requiring GUI embeds for dump-only Pass

---

## Traceability

| Artifact | Role |
|----------|------|
| [../quickstart.md](../quickstart.md) Scenario 4 | User-facing outline |
| [../contracts/secrets.md](../contracts/secrets.md) | Contract Pass bars |
| [../spec.md](../spec.md) FR-007/008/014/015 · SC-004 | Normative requirements |
| [README.md](./README.md) | Scenario owners map + FR-014/015 mandate (dump OK) |
| [credentials-trust-inventory.md](./credentials-trust-inventory.md) | Setup inventory (T004) |
| [connector-event-trust-seam-locks.md](./connector-event-trust-seam-locks.md) | Architect Path A locks |
| [scenario-1-connector.md](./scenario-1-connector.md) | Auth GUI evidence cross-ref |
| This file | T030 rerunnable Scenario 4 secrets-absent recipe |
| T011 / T018 / T029 | Host credential store + dump honesty |
| T034 | Broader evidence directory packaging |

## Evidence for PO / DH Lead

**T030 recipe + Host dump-inspection Pass.** Committed under [evidence/scenario-4/](./evidence/scenario-4/). Known fixture secret `fixture-token-not-for-dumps` absent from `describeConnectorCredential` and `agentTeams/view` JSON (**measured** via vitest). GUI auth SO 11+12 not required for dump-only SC-004; Scenario 1 already holds auth Desktop evidence. T029 may still deepen raw session-log export paths — recipe remains the Verifier acceptance script. Verifier does **not** merge or mark Linear Done unasked.
