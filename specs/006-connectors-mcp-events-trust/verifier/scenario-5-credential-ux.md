# US5 Credential UX — SC-007 deep checks (auth surface)

**Status:** Recipe delivered (T032). Product SC-007 deep stamp **deferred** until Verifier re-stamps with FR-014/015 auth-surface frames after T031 Client credential-UX confirm lands (Scenario 1 already holds install→auth→tool Pass @ tip `743ebf6eb1`).
**Owners:** DH Verifier (this recipe + Pass stamp) · DH Client (in-app credential UX) · DH Runtime (Host credential seam)
**Linear:** [MOH-330](https://linear.app/momadhoun/issue/MOH-330/t032-us5-verifier-credential-ux-sc-007-checks) · Epic [MOH-281](https://linear.app/momadhoun/issue/MOH-281/p6-connectors-mcp-events-trust)
**Acceptance slice:** T032 — Verifier Scenario credential-UX / SC-007 checks (split from Scenario 1 Step B) requiring FR-014/015 (standing orders **11** + **12**) desktop evidence of the **auth surface** under `verifier/evidence/scenario-1/` when GUI is shown
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 1 auth step (US5 Independent Test) — **not** quickstart Scenario 5 (non-goals / T033)
**Contract:** [../contracts/secrets.md](../contracts/secrets.md)
**Companion:** [scenario-1-connector.md](./scenario-1-connector.md) (SC-001 install→auth→tool) · forthcoming [credential-ux-in-app.md](./credential-ux-in-app.md) (T031)
**Architect locks:** In-app credentials primary / vault optional (R5 / FR-009); secrets off renderer durable storage (FR-008); no chat-paste primary; no env-file product Pass; no Electron Main credential-value bus (R6 / R9)

> **Naming:** File is `scenario-5-credential-ux.md` because tasks.md allows a split for US5. It does **not** replace quickstart Scenario 5 (`non-goals.md` / SC-005 / T033). Evidence stays under `evidence/scenario-1/` because US5 reuses the Story 1 auth surface.

## Measurable Done (this recipe)

| Check | Pass bar |
|-------|----------|
| Recipe present | This file documents Steps A–D with Pass/Fail and evidence tags |
| SC coverage | SC-007 in-app primary · vault not mandatory when in-app works · FR-008 secrets off renderer durable SoT · FR-009 vault optional · no env-file / chat-paste Pass |
| FR-014 (SO 11) | When GUI auth is shown: desktop screenshot(s) and/or short screen recording of the **real Desktop app** auth surface under `verifier/evidence/scenario-1/` — unit/jsdom alone **fails** |
| FR-015 (SO 12) | Evidence **committed** on the PR branch under that path **and** embedded in the GUI PR body via absolute `/opt/cursor/artifacts/…` `<img>` / `<video controls>` — artifact page links alone **fail** |
| Product SC stamp | **Deferred** — fill `evidence/scenario-1/VERDICT.txt` US5 / SC-007 deep lines only after T031 + auth-surface re-verify |

---

## Scope and prerequisites

| Layer | Required for | Status at recipe authoring |
|-------|--------------|----------------------------|
| Foundational Pass (T016) | Any product SC | **measured:** stamped in [README.md](./README.md#foundational-pass-checklist--recorded) · tip `origin/master` @ `7d71b5f0ee` (#208) |
| Host credential seam (T011) | FR-007/008 Host half | **measured:** `describeConnectorCredential` value-free; secrets in `ctx.credentials` (#208) |
| Electron no-bus (T013/T014) | No Main credential-value bus | **measured:** [#206](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/206) |
| US1 Scenario 1 Desktop Pass (T019–T021) | Auth surface exists | **measured:** [evidence/scenario-1/](./evidence/scenario-1/) · tip `743ebf6eb1` · includes `02-auth-ready.png` |
| US4 Host secrets dump path (T029) | Complementary SC-004 | **measured:** on master via [#219](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/219) — dump proof is Scenario 4, not this recipe |
| US5 Client credential UX confirm (T031) | SC-007 Client half + `credential-ux-in-app.md` | **inferred:** open at recipe authoring — Host/Client auth already ships via T020; T031 documents vault-optional lock |

**Desktop prerequisites** (full US5 / SC-007 GUI Pass): buildable Desktop with Scenario 1 connector install path; user-visible **in-app** credential / auth surface (Host RPC only); ready indicator after auth; `DISPLAY` when Cloud Agent (`DISPLAY=:1`, `DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop`).

**Host-only rehearsal** (does **not** alone mark SC-007 Done): Agent Teams credential vitest — proves Host store / describe value-free before Client UX stamp.

---

## Fixtures (deterministic strings)

Reuse Scenario 1 Pass connector (FR-017 any-one):

| Field | Value |
|-------|-------|
| `catalogId` | `verifier-fixture` (or another thin-catalog entry) |
| Auth mode | `in_app` |
| Install / auth secret | non-empty fixture token — **never** assert the value appears in session dump / projection JSON / renderer durable storage |
| Vault | **Not required** for Pass when in-app reaches ready (SC-007 / FR-009) |

---

## Step A — Open in-app credential / auth surface (SC-007 · FR-008 · FR-014/015)

**User / Verifier path (desktop):**

1. Launch the real Desktop app (not jsdom): `DISPLAY=:1 DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop`.
2. Reach an installed Pass connector that still needs auth, or re-open the connector auth control (Scenario 1 Step A install preferred).
3. Open the **in-app** credential / auth surface (secure form / Host-RPC auth control — not chat composer, not env-file instructions as product Pass).
4. Confirm the surface is user-visible on Desktop Client via Host HTTP/WS — not Electron Main credential-value IPC.
5. Capture FR-014/015 evidence of the **auth surface** (required frame when GUI is shown — see Evidence section).

| Observation | Pass | Fail |
|-------------|------|------|
| Surface | User-visible in-app auth / credential control | Chat-paste primary; env-file product Pass; no auth UI |
| Plane | Auth submits via Host RPC | Renderer durable secret SoT; Main credential-value bus |
| Evidence | Desktop frame of auth surface filed + committed + PR-embedded | Unit/jsdom-only claim; Host log alone as GUI Pass |

**Claim tags:** desktop UI → **measured** (required for SC-007 GUI Done when auth is shown); Host vitest-only → **measured** (Host half) + **inferred** (does not complete US5 GUI).

---

## Step B — Complete auth to ready without vault (SC-007 · FR-009 · FR-002)

**User / Verifier path (desktop):**

1. Submit a non-empty fixture credential via the in-app surface from Step A.
2. Confirm `authState=ready` (or equivalent user-visible ready indicator).
3. Do **not** require vault / 1Password-class UI for Pass when in-app succeeds (FR-009 / SC-007).
4. Do **not** fail Pass solely because vault UX is absent while in-app works (over-strict gate = Fail).
5. Capture FR-014/015 evidence of ready (reuse / refresh `02-auth-ready.png` under `evidence/scenario-1/`).

**Host observation:**

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/connector-catalog.spec.ts -t 'authenticateConnector'
```

Assert `authenticateConnector` reaches `authState: ready`, `credentialConfigured: true`, and `describeConnectorCredential` / projection JSON **omit** the secret value.

| Observation | Pass | Fail |
|-------------|------|------|
| Ready | User-visible ready after in-app auth | Stuck needs_auth presented as success |
| Vault optional | Pass without vault when in-app works | Vault mandatory for Pass; Fail solely for missing vault UI |
| Chat-paste / env | Not required as primary | Secrets pasted into chat or env-file as product Pass |

---

## Step C — Renderer / chat / env non-goals for Pass (SC-007 · FR-008)

**Verifier checks (docs + observation):**

1. Confirm Client auth path documents Host RPC only — secrets **not** written to renderer durable storage (localStorage / IndexedDB / Client-only SoT as Pass secret store).
2. Confirm product Pass path does **not** instruct chat-paste of long-lived connector secrets as primary auth (FR-008).
3. Confirm env / `.env` / CI key files remain **dev/CI only** — not the product Pass auth path (FR-008 / research R5).
4. Cross-check T031 `credential-ux-in-app.md` when present; until then, this recipe’s Steps A–B + Scenario 1 `02-auth-ready` evidence are the GUI bar.

| Observation | Pass | Fail |
|-------------|------|------|
| Renderer | No durable secret SoT in Client for Pass | Client holds connector secret as durable SoT |
| Chat-paste | Not primary Pass | Chat-paste required / documented as Pass |
| Env-file | Dev/CI only | Env-file presented as product Pass |

**Claim tags:** code/docs inspection → **measured**; absence of forbidden path → **measured** when guarded by existing no-secret-IPC / thin-shell tests (**inferred** until T031 docs land).

---

## Step D — Failed / abandoned / over-strict paths must not count as Pass

| Condition | Required behavior |
|-----------|-------------------|
| Abandon auth before ready | Must **not** claim US5 / SC-007 Pass |
| Empty / whitespace secret | Clear reject; no ready |
| Fail Pass only because vault UI missing while in-app works | **Fail** this recipe (over-strict FR-009) |
| Claim SC-007 via dump inspection alone | Wrong scenario — SC-004 / Scenario 4 owns dumps; this recipe needs auth-surface evidence when GUI shown |
| Unit/jsdom-only “auth UX” proof | GUI **Fail** (FR-014 / SO 11) |

---

## Fail path (record; does not block recipe delivery)

| Condition | Required behavior |
|-----------|-------------------|
| Unit/jsdom-only evidence when GUI auth shown | US5 GUI **Fail** (FR-014 / SO 11) |
| Evidence not committed / not PR-embedded | GUI **Fail** (FR-015 / SO 12) |
| Pass claimed via Electron Main credential-value bus | **Fail** (T013/T014 / R6) |
| Vault mandatory while in-app reaches ready | **Fail** (FR-009 / SC-007) |
| Chat-paste or env-file as product Pass | **Fail** (FR-008) |
| Secrets appear in projection / describe as Pass proof | **Fail** (FR-007; Scenario 4 owns dump proof) |

---

## FR-014 / FR-015 desktop visual evidence (mandatory when GUI shown — SO 11 + 12)

**Standing order 11 (FR-014):** When the auth surface is shown for US5 / SC-007 GUI Pass, Verifier **requires** desktop screenshot(s) and/or a short screen recording of the **real Desktop app**. Vitest/jsdom alone **fails**.

**Standing order 12 (FR-015):** Those artifacts MUST be **committed** under `specs/006-connectors-mcp-events-trust/verifier/evidence/scenario-1/` on the PR branch **and** embedded in the GUI PR body via HTML `<img>` / `<video controls>` using absolute `/opt/cursor/artifacts/…` paths. Cursor agent artifact page links alone MUST NOT satisfy Pass.

**Directory (shared with Scenario 1 — auth surface):**

```text
specs/006-connectors-mcp-events-trust/verifier/evidence/scenario-1/
```

**Required artifacts for this US5 recipe (minimum when GUI shown):**

| Artifact | Content |
|----------|---------|
| `02-auth-ready.png` (or `.webp`) | **Required** — in-app auth surface and/or ready indicator (`authState=ready`). May reuse Scenario 1 frame when still valid; refresh after T031 if UX changes |
| Optional `02a-auth-surface.png` | Dedicated frame of the credential form / auth control before submit (preferred when distinguishing surface from ready) |
| Optional `scenario-1-connector-walkthrough.mp4` / `.webm` segment | Auth portion of Scenario 1 recording |
| `VERDICT.txt` | Append / refresh US5 · SC-007 deep lines when product stamp is claimed |

Also copy/publish walkthrough copies under `/opt/cursor/artifacts/` when running as Cloud Agent Verifier (SO 11). Placeholder README: [evidence/scenario-1/README.md](./evidence/scenario-1/README.md).

**Host-only / docs-only rehearsal** may proceed without new screenshots but **must not** mark SC-007 GUI Done.

---

## Pass stamp template (fill when evidence lands — do not claim now)

```text
Verdict: Pass (US5 / SC-007 deep)
Stamp: YYYY-MM-DD · tip <sha> · desktop <build> (DISPLAY=:1)
Linear: MOH-330 · Epic MOH-281
SC-007: Pass — in-app auth surface completed to ready; vault not required; no chat-paste / env-file Pass; secrets off renderer durable SoT
FR-008: Pass — Host RPC auth; no renderer durable secret SoT; env/CI not product Pass
FR-009: Pass — vault optional; Pass not failed for missing vault while in-app works
FR-014: desktop screenshot/recording of auth surface present; not unit/jsdom-only (SO 11)
FR-015: media committed under verifier/evidence/scenario-1/ + PR embeds via /opt/cursor/artifacts/… (SO 12)
Evidence: evidence/scenario-1/{02-auth-ready,optional 02a-auth-surface}.*
Blockers: none
```

**Rule:** Do not mark SC-007 Done in Linear / Spec for the US5 deep slice without a filled stamp that includes FR-014/015 auth-surface evidence once GUI is shown. Scenario 1’s existing SC-007 line (vault not required) remains supporting; this recipe owns the US5 Independent Test deep bar. Leave [MOH-330](https://linear.app/momadhoun/issue/MOH-330/t032-us5-verifier-credential-ux-sc-007-checks) **In Progress** until PO merges GUI evidence + SO12 embeds — Verifier does **not** mark Linear Done on recipe-only delivery.

---

## Explicit non-goals

- Client credential UX product edits (T031) — out of this Verifier recipe PR
- Session-dump secrets inspection (Scenario 4 / US4 / SC-004) — complementary; not this recipe’s evidence
- Quickstart Scenario 5 non-goals absence (T033 / SC-005) — different file (`non-goals.md`)
- Full multi-family live connector catalog / mandatory vault (P7 / non-goal)
- Electron Main connector / credential-value bus (forbidden; T013/T014)
- Product SC-001…SC-008 Done stamps on this docs-only delivery

---

## Traceability

| Artifact | Role |
|----------|------|
| [../quickstart.md](../quickstart.md) Scenario 1 auth | User-facing US5 Independent Test outline |
| [../contracts/secrets.md](../contracts/secrets.md) | Contract Pass bars (SC-007 / FR-008/009) |
| [../spec.md](../spec.md) FR-008/009/014/015 · SC-007 · US5 | Normative requirements |
| [scenario-1-connector.md](./scenario-1-connector.md) | SC-001 companion; Step B light SC-007 |
| [credential-ux-in-app.md](./credential-ux-in-app.md) | T031 Client vault-optional doc (when present) |
| [README.md](./README.md) | Scenario owners map + FR-014/015 mandate |
| [credentials-trust-inventory.md](./credentials-trust-inventory.md) | Setup inventory (T004) |
| This file | T032 rerunnable US5 credential-UX / SC-007 recipe |
| T031 | Client in-app credential UX confirm |
| T034 | Broader evidence directory packaging |

## Evidence for PO / DH Lead

**Recipe delivered (T032).** Product SC-007 deep Pass **not** stamped on this PR. Scenario 1 already holds Desktop install→auth→tool evidence including `02-auth-ready.png` under [evidence/scenario-1/](./evidence/scenario-1/). Full US5 Independent Test Done waits on T031 Client credential-UX confirm + Verifier FR-014/015 re-stamp of the auth surface using Steps A–B above (reuse or refresh `02-auth-ready` / optional `02a-auth-surface`). Leave MOH-330 In Progress until SO 11+12 media + PR embeds land.
