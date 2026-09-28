# Scenario 3 — Denied permission

**Status:** Recipe drafted — product SC Pass **not** stamped (FR-014/015 evidence pending US3 Host/Client Desktop path + Desktop run)
**Owners:** DH Verifier (this recipe + Pass stamp) · DH Runtime (Host deny enforce via `dsh-user-approval` / standing never) · DH Client (approval/deny card or standing-deny control + blocked-state UI on Host HTTP)
**Linear:** [MOH-326](https://linear.app/momadhoun/issue/MOH-326/t028-us3-verifier-scenario-3-trust-deny-recipe) · Epic [MOH-281](https://linear.app/momadhoun/issue/MOH-281/p6-connectors-mcp-events-trust)
**Acceptance slice:** T028 — Verifier Scenario 3 recipe covering SC-003 (one deny with user-visible distinct blocked state) with mandatory FR-014/015 (standing orders **11** + **12**) desktop evidence under `verifier/evidence/scenario-3/`
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 3
**Contract:** [../contracts/trust-deny.md](../contracts/trust-deny.md)
**Architect locks:** Deny Pass = user-deny via `dsh-user-approval` **or** standing `never` / block — either OK (R4 / FR-006); Client answerer on **Host HTTP/WS** only; Electron Main MUST NOT own the answerer or trust-rule bus (R6 / R9); denial MUST remain distinguishable from successful tool call; silent fail as “deny” fails; retry-with-allow after deny is complementary UX — not required for Pass

## Measurable Done (this recipe)

| Check | Pass bar |
|-------|----------|
| Recipe present | This file documents Steps A–C with Pass/Fail and evidence tags |
| SC coverage | SC-003 one deny · FR-006 user-deny **or** standing never · denial ≠ success |
| FR-014 (SO 11) | Desktop screenshot(s) and/or short screen recording of the **real Desktop app** under `verifier/evidence/scenario-3/` — unit/jsdom alone **fails** |
| FR-015 (SO 12) | Evidence **committed** on the PR branch under that path **and** embedded in the GUI PR body via absolute `/opt/cursor/artifacts/…` `<img>` / `<video controls>` — artifact page links alone **fail** |
| Product SC stamp | **Deferred** — fill `evidence/scenario-3/VERDICT.txt` only after Desktop FR-014/015 media lands |

---

## Scope and prerequisites

| Layer | Required for | Status at recipe authoring |
|-------|--------------|----------------------------|
| Foundational Pass (T016) | Any product SC | **measured:** stamped in [README.md](./README.md#foundational-pass-checklist--recorded) · tip `origin/master` @ `7d71b5f0ee` (#208) |
| Approval / deny seam inventory (T004) | FR-006 seam honesty | **measured:** [credentials-trust-inventory.md](./credentials-trust-inventory.md) |
| Architect Path A locks (T005) | R4 answerer plane | **measured:** [connector-event-trust-seam-locks.md](./connector-event-trust-seam-locks.md) |
| Electron no-bus (T013/T014) | Seam honesty | **measured:** [#206](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/206) |
| US1 connector tool path (T017–T020) | Prefer deny target = real connector tool | **measured:** Scenario 1 Desktop Pass under [evidence/scenario-1/](./evidence/scenario-1/) |
| US3 Host deny enforce (T026) | SC-003 Host half | **inferred:** open until Runtime lands gate wiring + `outcome=denied` |
| Client approval/deny UI (T027) | SC-003 desktop deny card / standing control | **inferred:** open until Client lands Host-HTTP answerer |

**Desktop prerequisites** (full Scenario 3 Pass): buildable Desktop (`apps/desktop`, `apps/desktop-host`) with ≥1 bot; a connector tool or trust-gated action that can raise a permission gate; user-deny card **or** standing deny/block control answering on Host HTTP/WS; clear blocked/denied chrome distinct from success; `DISPLAY` when Cloud Agent (`DISPLAY=:1`, `DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop`).

**Host-only rehearsal** (does **not** alone mark SC-003 Done): focused Agent Teams / approval vitest after T026 — proves deny outcome without treating the action as success. Until T026 exists, inventory alone is **not** deny proof.

---

## Fixtures (deterministic strings)

Pass deny = **one** proven path (contract rule 1). Either family satisfies SC-003:

| Path | Mechanism | Observation |
|------|-----------|-------------|
| **A — User deny** | Policy `ask` + Client answerer on Host HTTP returns `rejected` | User-visible deny card / blocked state; tool/action `outcome=denied` (or equivalent) |
| **B — Standing never** | Effective approval policy `never` / standing block | Auto-reject without requiring interactive prompt; still user-visible blocked/denied ≠ success |

Prefer targeting a **connector tool or trust-gated connector action** when Scenario 1 fixture is available (`verifier-fixture` / `mcp__verifier_fixture__ping` or equivalent). Another trust-gated action that exercises the same Host approval seam also satisfies FR-006.

Do **not** require both paths for Pass. Do **not** accept silent failure, cancelled-as-success, or Electron Main answerer as Pass.

---

## Step A — Trigger a permission / trust gate (SC-003 setup · FR-006)

**User / Verifier path (desktop):**

1. Launch the real Desktop app (not jsdom): `DISPLAY=:1 DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop`.
2. Ensure a connector tool or trust-gated action is available (Scenario 1 install→auth→ready preferred; standing-deny-only setups may skip tool-ready if the gate still fires).
3. Trigger the permission gate (invoke the gated tool/action, or open the standing-deny control surface).
4. Confirm a pending decision / policy gate is observable (approval card, standing-deny control, or equivalent Host-projected prompt) — not a silent no-op.
5. Capture FR-014/015 evidence of the gate surface when practical (optional `00-…` frame).

**Host observation (after T026 lands):**

Focused Host vitest covering `ctx.approval.request` (or product gate) for a connector / trust-gated action — assert a pending decision path exists and fail-closed behavior when no answerer is composed. Until T026 exists, Host catalog/tool vitest alone is **not** deny-gate proof.

| Observation | Pass | Fail |
|-------------|------|------|
| Gate | Permission / trust gate is user-visible or Host-observable before allow | Action succeeds with no gate; silent skip |
| Plane | Gate/prompt travels Host HTTP/WS → Client | Electron Main owns the answerer or trust bus |
| Evidence | Desktop frame of gate (GUI Pass) | Unit/jsdom-only claim |

**Claim tags:** desktop UI → **measured** (required for SC-003 Done); Host vitest-only → **measured** (Host gate half) + **inferred** (does not complete SC-003).

---

## Step B — Deny (user deny **or** standing never) (SC-003 deny · FR-006)

**User / Verifier path (desktop):**

1. Choose **one** Pass path:
   - **User deny:** On the approval card / prompt, choose Deny / Reject (locale-owned copy).
   - **Standing never:** Apply standing deny/block (`never` policy or equivalent product control) so the gated action is auto-rejected.
2. Confirm the decision is recorded as deny / rejected — not allow-once / success.
3. Do **not** require a subsequent retry-with-allow for Pass (contract rule 4).
4. Capture FR-014/015 evidence of the deny control / decision moment.

**Host observation (after T026 lands):**

Assert answerer/`never` path yields `rejected` (or product `outcome=denied`) and that the gated action does **not** complete as permitted/executed. Session audit may show `approval/asked` + `approval/decided` with deny decision (supporting; not a substitute for user-visible denial).

| Observation | Pass | Fail |
|-------------|------|------|
| Deny | User deny **or** standing never produces an explicit deny decision | Only allow path works; deny unavailable |
| Either-OK | Completes with Path A **or** Path B | Pass requires both paths, or a third product-only invention |
| Main bus | Decision answered on Host HTTP | Main IPC answerer / trust-rule bus |

---

## Step C — Denial distinct from success (SC-003 outcome · FR-006)

**User / Verifier path (desktop):**

1. After Step B, confirm the connector tool / trust-gated action does **not** present as successfully permitted/executed.
2. Confirm a clear user-visible **blocked / denied** state distinct from the Scenario 1 success chrome (not identical “tool succeeded” labeling).
3. Capture FR-014/015 evidence of the denied / blocked outcome (required `01-…` / `02-…` frames).

**Host observation (after T026 lands):**

Assert Host projection / tool result records deny (`outcome=denied` or equivalent) and does not emit a Pass success tool result for that gated invocation.

| Observation | Pass | Fail |
|-------------|------|------|
| Not success | Action not treated as successfully permitted/executed | Silent fail painted as success; success row for denied call |
| Distinct | User-visible denial/blocked state ≠ success indicator | Same chrome as success; no denial cue |
| Evidence | Desktop denied/blocked frame (GUI Pass) | Host log only presented as GUI Pass |

**Claim tags:** desktop UI + deny decision → **measured** (required for SC-003 Done).

---

## Fail path (record; does not block recipe delivery)

| Condition | Required behavior |
|-----------|-------------------|
| Host deny enforce unavailable | Clear user-visible failure; **no** silent empty “success” |
| Unit/jsdom-only evidence | Scenario 3 GUI **Fail** (FR-014 / SO 11) |
| Evidence not committed / not PR-embedded | GUI **Fail** (FR-015 / SO 12) |
| Pass claimed via Electron Main answerer / trust bus | **Fail** (T013/T014 / R6) |
| Silent fail presented as success | **Fail** (FR-006 / research R4) |
| No user-visible denial | **Fail** (SC-003) |
| Denied action still shown as successful tool call | **Fail** (FR-006 / contract rule 2–3) |
| Pass requires both user-deny **and** standing never | **Fail** (either-OK; over-gate) |

---

## FR-014 / FR-015 desktop visual evidence (mandatory — SO 11 + 12)

**Standing order 11 (FR-014):** Scenario 3 GUI Pass **requires** desktop screenshot(s) and/or a short screen recording of the **real Desktop app**. Vitest/jsdom alone **fails**.

**Standing order 12 (FR-015):** Those artifacts MUST be **committed** under `specs/006-connectors-mcp-events-trust/verifier/evidence/scenario-3/` on the PR branch **and** embedded in the GUI PR body via HTML `<img>` / `<video controls>` using absolute `/opt/cursor/artifacts/…` paths. Cursor agent artifact page links alone MUST NOT satisfy Pass.

**Directory:**

```text
specs/006-connectors-mcp-events-trust/verifier/evidence/scenario-3/
```

**Required artifacts (minimum):**

| Artifact | Content |
|----------|---------|
| `01-permission-gate.png` (or `.webp`) | Permission / trust gate visible (approval card, standing-deny control, or equivalent) |
| `02-denied-blocked-state.png` (or recording segment) | After deny — user-visible blocked/denied state **distinct** from success |
| Optional `00-tool-or-gate-setup.png` | Pre-gate connector tool / trust surface before deny |
| Optional `03-standing-never.png` | Standing `never` / block control if Path B is used (may merge with `01-…`) |
| Optional `scenario-3-trust-deny-walkthrough.mp4` / `.webm` | Short recording covering Steps A–C |
| `VERDICT.txt` | Filled stamp (template below) when product SC is claimed |

Also copy/publish walkthrough copies under `/opt/cursor/artifacts/` when running as Cloud Agent Verifier (SO 11). Placeholder README: [evidence/scenario-3/README.md](./evidence/scenario-3/README.md).

---

## Pass stamp template (fill when evidence lands — do not claim now)

```text
Verdict: Pass
Stamp: YYYY-MM-DD · tip <sha> · desktop <build> (DISPLAY=:1)
Linear: MOH-326 · Epic MOH-281
SC-003: Pass — evidence: evidence/scenario-3/{01-permission-gate,02-denied-blocked-state}.*
FR-006: Pass — user-deny OR standing never (either OK); denial ≠ success
FR-014: desktop screenshots/recording present; not unit/jsdom-only (SO 11)
FR-015: media committed under verifier/evidence/scenario-3/ + PR embeds via /opt/cursor/artifacts/… (SO 12)
Blockers: none
```

**Rule:** Do not mark SC-003 Done in Linear / Spec without a filled stamp that includes FR-014/015 desktop evidence once Client approval/deny UI + Host deny enforce exist. Host vitest alone may advance deny-gate confidence but does **not** close US3 / Scenario 3. Leave [MOH-326](https://linear.app/momadhoun/issue/MOH-326/t028-us3-verifier-scenario-3-trust-deny-recipe) **In Progress** until PO merges GUI evidence + SO12 embeds — Verifier does **not** mark Linear Done on recipe-only delivery.

---

## Explicit non-goals

- Host deny-enforce product code (T026) — out of this Verifier recipe PR
- Client approval/deny card / standing-deny UI (T027) — out of this PR
- Connector install→auth→tool success (Scenario 1 / US1) — prerequisite preference only
- Event-routine fire (Scenario 2 / US2)
- Session-dump secrets inspection (Scenario 4 / US4)
- Electron Main approval answerer / trust-rule bus (forbidden; T013/T014)
- Requiring both user-deny **and** standing never for Pass
- Product SC-001…SC-008 Done stamps on this docs-only delivery

---

## Traceability

| Artifact | Role |
|----------|------|
| [../quickstart.md](../quickstart.md) Scenario 3 | User-facing outline |
| [../contracts/trust-deny.md](../contracts/trust-deny.md) | Contract Pass bars |
| [../spec.md](../spec.md) FR-006/014/015 · SC-003 | Normative requirements |
| [README.md](./README.md) | Scenario owners map + foundational Pass + FR-014/015 mandate |
| [credentials-trust-inventory.md](./credentials-trust-inventory.md) | Setup inventory (T004) |
| [connector-event-trust-seam-locks.md](./connector-event-trust-seam-locks.md) | Architect Path A locks |
| This file | T028 rerunnable Scenario 3 trust-deny recipe |
| T026–T027 | Host deny enforce + Client Host-HTTP answerer UI |
| T034 | Broader evidence directory packaging |

## Evidence for PO / DH Lead

**Recipe delivered (T028).** Product SC Pass **not** stamped. Foundational approval seam + no-Main-bus locks are on master; US1 connector tool path is Pass-stamped under Scenario 1. Full Scenario 3 Done waits on US3 Host/Client Desktop path (T026–T027) plus Verifier FR-014/015 desktop evidence using Steps A–C above. Placeholders under [evidence/scenario-3/](./evidence/scenario-3/) require SO 11+12 media before GUI Pass.
