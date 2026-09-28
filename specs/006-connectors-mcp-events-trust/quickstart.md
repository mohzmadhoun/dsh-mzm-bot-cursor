# Quickstart: Phase 6 — Connectors / MCP + event routines + trust validation guide

**Feature**: `specs/006-connectors-mcp-events-trust`
**Date**: 2026-09-28
**Purpose:** Runnable validation scenarios for Verifier / implementers. Not an implementation guide.

Prerequisites and expected outcomes reference [contracts/](./contracts/) and [data-model.md](./data-model.md).
Verifier recipes home: [verifier/](./verifier/) — owners map in [verifier/README.md](./verifier/README.md) (T036).

**Standing orders 11+12 / FR-014/015:** Every GUI scenario below requires desktop screenshot(s) and/or a short screen recording of the real Desktop app, **committed** under `specs/006-connectors-mcp-events-trust/verifier/evidence/` and embedded in the GUI PR body. Unit/jsdom alone fails.

**Clarify locks:** Pass event = webhook harness / Verifier fixture. Vault optional. Any one thin-catalog / fixture connector.

**Seam reminder:** Host catalogs + Host credential store. Do **not** validate Pass via Main IPC bus, Client-only SoT, chat-pasted secrets, or live Slack/GitHub as the only Pass path.

---

## Prerequisites

1. Desktop app buildable (`apps/desktop`, `apps/desktop-host`) with P1–P5 bots/routines/memory available.
2. Host Connector catalog + event-capable Routine catalog mounted (Architect Path A: Agent Teams journal + mcp-client; B1 webhook→Routine wake).
3. Thin catalog or Verifier fixture connector installable; webhook harness endpoint documented for Verifier.
4. Spec artifacts: [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md).
5. Topology: dual-process Host child; connector/event/trust traffic on Host HTTP/WS — not Main IPC.

---

## Scenario checklist (contracts + visual evidence)

| Scenario | Contract | Evidence dir | Success criteria | FR-014/015 |
|----------|----------|--------------|------------------|------------|
| **1** Install → auth → tool call | [connector.md](./contracts/connector.md) | `verifier/evidence/scenario-1/` | SC-001, SC-007 | Required |
| **2** Event routine create + fire | [event-routine.md](./contracts/event-routine.md) | `verifier/evidence/scenario-2/` | SC-002, SC-008 | Required |
| **3** Denied-permission path | [trust-deny.md](./contracts/trust-deny.md) | `verifier/evidence/scenario-3/` | SC-003 | Required |
| **4** Secrets absent from dumps | [secrets.md](./contracts/secrets.md) | `verifier/evidence/scenario-4/` | SC-004, SC-007 | Dump log OK; GUI auth if shown |
| **5** Non-goals absence | [non-goals.md](./contracts/non-goals.md) | `verifier/evidence/non-goals/` | SC-005 | Docs/absence OK |
| **6** Full Phase 6 replay | All above | `verifier/evidence/scenario-6/` | SC-006 | Required for GUI slices |

### Scenario → recipe map (T036)

| Quickstart | Recipe file(s) | Evidence dir | Primary owners |
|------------|----------------|--------------|----------------|
| Scenario 1 Install → auth → tool | [verifier/scenario-1-connector.md](./verifier/scenario-1-connector.md) · US5 deep: [verifier/scenario-5-credential-ux.md](./verifier/scenario-5-credential-ux.md) | `evidence/scenario-1/` | Host / Runtime + Client + Verifier |
| Scenario 2 Event routine E2E | [verifier/scenario-2-event-routine.md](./verifier/scenario-2-event-routine.md) | `evidence/scenario-2/` | Host / Runtime + Client + Verifier |
| Scenario 3 Denied permission | [verifier/scenario-3-trust-deny.md](./verifier/scenario-3-trust-deny.md) | `evidence/scenario-3/` | Host / Runtime + Client + Verifier |
| Scenario 4 Secrets absent | [verifier/scenario-4-secrets-absent.md](./verifier/scenario-4-secrets-absent.md) | `evidence/scenario-4/` | Host / Runtime + Verifier |
| Scenario 5 Non-goals absence | [verifier/non-goals.md](./verifier/non-goals.md) · [contracts/non-goals.md](./contracts/non-goals.md) | `evidence/non-goals/` | Host / Runtime + Electron + Verifier |
| Scenario 6 Full Phase 6 replay | [verifier/scenario-6-full-replay.md](./verifier/scenario-6-full-replay.md) | `evidence/scenario-6/` | Verifier |

**Naming note:** Recipe file `scenario-5-credential-ux.md` is the US5 / SC-007 auth-surface split (evidence stays under `scenario-1/`). Quickstart Scenario 5 is **non-goals** (`non-goals.md` / SC-005), not the credential-UX file.

Mirror walkthrough copies under `/opt/cursor/artifacts/` when Cloud Agent Verifier runs (standing order 11). Commit under `verifier/evidence/` and embed in PR body (standing order 12).

---

## Scenario 1 — Connector install → auth → successful tool call

**Contract:** [contracts/connector.md](./contracts/connector.md)

1. Launch Desktop; ensure ≥1 bot from prior phases.
2. Open **connector** surface; install **any one** thin-catalog or Verifier-fixture connector (not a fixed name requirement).
3. Complete auth via in-app credential UX (vault only if in-app cannot complete this connector).
4. Invoke one connector tool; observe **user-visible success** (do not score LLM wording).
5. Capture desktop visual evidence → `verifier/evidence/scenario-1/` (commit + PR embed).

**Expected:** SC-001 · SC-007 (vault not mandatory when in-app works).

---

## Scenario 2 — Event-triggered routine E2E

**Contract:** [contracts/event-routine.md](./contracts/event-routine.md)

1. Create a routine with non-empty intent and **webhook-harness / Verifier-fixture** event trigger (not cron).
2. Confirm it appears in the bot’s routines pane **distinguishable** from cron routines.
3. Deliver one matching event via documented harness path → routine fires without manual “Run now”; last-run / fire indicator visible.
4. Pause the routine; deliver matching event → **no** fire for that interval.
5. Confirm cron routines from P4 still usable (SC-008).
6. Capture desktop visual evidence → `verifier/evidence/scenario-2/`.

**Expected:** SC-002, SC-008. Live Slack/GitHub/Linear/email **not** required.

---

## Scenario 3 — Denied permission

**Contract:** [contracts/trust-deny.md](./contracts/trust-deny.md)

1. With a connector tool or trust-gated action available, trigger a permission gate.
2. Deny (user deny card **or** standing deny/block).
3. Confirm action does **not** proceed as success; denial is user-visible and distinct.
4. Capture desktop visual evidence → `verifier/evidence/scenario-3/`.

**Expected:** SC-003.

---

## Scenario 4 — Secrets absent from session dumps

**Contract:** [contracts/secrets.md](./contracts/secrets.md)

1. After Scenario 1 auth (or equivalent credential save), export/dump session artifacts via Verifier-documented path.
2. Inspect for plaintext connector tokens/passwords/API keys — must be **absent**.
3. Confirm auth UX did not instruct chat-paste of long-lived secrets as primary path.
4. Commit dump-inspection evidence → `verifier/evidence/scenario-4/`. GUI auth steps still need SO 11+12 when shown.

**Expected:** SC-004, SC-007.

---

## Scenario 5 — Non-goals absence

**Contract:** [contracts/non-goals.md](./contracts/non-goals.md)
**Recipe:** [verifier/non-goals.md](./verifier/non-goals.md) (T033)
**Evidence:** `verifier/evidence/non-goals/` (T034)

Documented absence checks: no Box/Shell Pass requirement; no full catalog / live-family Pass requirement; no rewrite of `specs/001`–`005`; no Electron Main connector/event/trust bus; vault not mandatory when in-app works; cron additive (SC-008).

**Expected:** SC-005.

---

## Scenario 6 — Full Phase 6 replay

**Recipe:** [verifier/scenario-6-full-replay.md](./verifier/scenario-6-full-replay.md) (T035)
**Evidence:** `verifier/evidence/scenario-6/` (T034)

Re-run Scenarios 1–5 on the real desktop app (plus foundational Pass T016); record pass/fail against this spec including FR-014/015 for GUI slices (SC-006).

---

## Failure shortcuts (auto-Fail)

| Condition | Result |
|-----------|--------|
| Unit/jsdom-only for GUI stories | Fail FR-014 |
| Evidence not committed / not PR-embedded | Fail FR-015 |
| Pass requires named live event family | Fail clarify lock / FR-018 |
| Pass requires fixed named connector | Fail FR-017 |
| Pass requires vault when in-app auth works | Fail FR-009 |
| Secrets in session dumps | Fail FR-007 / SC-004 |
| Event fire only via manual Run now | Fail US2 / SC-002 |
| Electron Main as connector/event SoT | Fail seam honesty |

---

## Evidence path convention

```text
specs/006-connectors-mcp-events-trust/verifier/evidence/
├── scenario-1/   # QS1 connector install→auth→tool (+ US5 credential UX)
├── scenario-2/   # QS2 event routine create + harness fire
├── scenario-3/   # QS3 denied permission
├── scenario-4/   # QS4 secrets absent (dump/log OK)
├── non-goals/    # QS5 / SC-005 measured absence checks
└── scenario-6/   # QS6 full replay (SC-006)
```

## Next

Polish T033–T036 deliver Verifier non-goals + evidence layout + SC-006 full-replay recipe + this map. Product SC Done remains Verifier-stamped per scenario. Linear/`taskstoissues` blocked — PR-only until capacity.
