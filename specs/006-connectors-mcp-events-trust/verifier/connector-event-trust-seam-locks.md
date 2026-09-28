# T005 — Connector / event / trust seam locks (implementers)

**Status:** Setup seam locks documented (no product behavior)
**Owners:** DH Runtime (author) · DH Architect (Path A lock) · DH Verifier (rerun against recipes)
**Linear:** **Blocked** — track via PR only (project `DeepSeek Harness - Cursor` / `P-MOH-2`; no invented issue ids)
**Acceptance:** research R0–R6 · [contracts/non-goals.md](../contracts/non-goals.md) · Architect Path A
**Branch:** `cursor/p6-setup-t001-t006-fe1d`
**Start contracts:** [../contracts/README.md](../contracts/README.md)

## Measurable Done

| Lock | Pass bar | Fail if |
|------|----------|---------|
| Host Connector catalog SoT + mcp-client | Durable install/auth rows on **Desktop Host** (prefer Agent Teams journal); tools via `dsh-mcp-client` on `ctx.tools` | Electron Main or Client-only store is SoT; catalog theater without MCP bind |
| Pass connector = any one | Thin managed catalog **or** Verifier fixture completes install→auth→tool | Fixed named connector required; full Grok catalog required |
| B1 webhook → Routine wake | Harness delivery matches event routines → wake **existing bot** + intent; update `lastRunAt` | New-Session-only Pass; live Slack/GitHub required; manual Run now alone |
| Additive RoutineRecord | `triggerKind` + `eventTrigger`; cron rows unchanged; no rewrite `specs/004` | Breaking replace of `scheduleExpr`; P4 acceptance rewritten |
| Deny = user-deny **or** standing never | Either path OK; denial visible ≠ success; answerer on Host HTTP | Silent fail as deny; Main answerer |
| Credentials in-app primary | Host credential seam; vault optional; secrets absent from dumps | Vault mandatory when in-app works; chat-paste primary; secrets in dumps |
| No Electron Main bus | Lifecycle IPC only; connector/event/trust/credential-value payloads forbidden | Those payloads travel Node IPC |

---

## Lock detail (research crosswalk)

### 1. Host Connector catalog + mcp-client — R1 / Path A Q1

| Surface | Role |
|---------|------|
| Desktop Host + prefer `packages/experimental/agent-team/` journal | Own connector CRUD/auth state, durability, projection |
| `packages/mcp/mcp-client` | Register authenticated connector tools on `ctx.tools` (`mcp__<serverName>__<tool>`) |
| Client / Web | Install/auth/tool UI; mutate via Host Remotes only |
| Electron Main (`apps/desktop`) | Spawn Host; lifecycle IPC; load `dsh-app://` — **no** connector SoT |

Do **not** reopen Architect Option tables in [research.md](../research.md) R1.

### 2. Pass connector = any one thin-catalog / fixture — R0 / R2 / FR-017

Pass does **not** name Linear/GitHub/Gmail/Slack/Drive. Implementers + Verifier pick any one completable end-to-end connector. Prefer thin Verifier fixture under agent-team or desktop test fixture with **in-app** auth.

### 3. Event routines additive; B1 harness fire — R3 / FR-018

| Field | Cron (P4) | Event (P6 Pass) |
|-------|-----------|-----------------|
| `triggerKind` | `cron` | `event` |
| Schedule / event | `scheduleExpr` unchanged | `eventTrigger` = `webhook_harness` |
| Fire | Host cron wake | Host event match → same bot wake / intent |
| Pause | Suppresses cron | Suppresses event |

**B1 locked:** Adapt `dsh-webhook` ingress style → documented Host harness / Verifier delivery → match active event routines → wake existing bot — **not** default new-Session Pass.

### 4. Denied-permission path — R4 / FR-006

Prove one deny using **either** user-deny via `dsh-user-approval` **or** standing `never`/block. Desktop Client answerer lives on **Host HTTP/WS**. Electron Main MUST NOT own the answerer.

### 5. Credentials — R5 / FR-007…009

Host `dsh-credentials` (+ `credentials-local`; `authorization` when human sign-in needed). In-app primary. Vault optional — **not** mandatory Pass when in-app works. Secrets MUST NOT appear in session dumps. Renderer MUST NOT hold durable secret SoT. Chat-paste / env-file are not product Pass paths.

### 6. Topology & host-protocol exclusions — R6 / R9

Forbidden on Main↔Host IPC (extend `apps/desktop/src/host-protocol.ts` like identity + skills + routines + memory):

| Family | Example names |
|--------|----------------|
| Connector | `connector-catalog`, `connector-install`, `connector-auth`, `mcp-tool-call` |
| Event routines | `event-routine-create`, `event-routine-fire`, `webhook-delivery` |
| Trust | `permission-deny`, `trust-rule` |
| Credentials | `credential-value`, `credential-set`, `secret-payload` |

Data plane: shipped authenticated **Host HTTP/WS** only. Guard: Foundational T013–T014 + non-goals absence.

### 7. Verifier evidence — R7 / SO 11+12

GUI scenarios require desktop screenshots/recordings **committed** under `verifier/evidence/<slice>/` + PR embeds. US4 dump inspection may be non-GUI. Unit/jsdom alone fails GUI Pass. See [README.md](./README.md).

### 8. Linear honesty — R8

Do **not** invent P6 epic/issue numbers. Track via PR until free-issue capacity returns on **DeepSeek Harness - Cursor**. No `taskstoissues` in Setup PRs.

---

## Spot-check recipe note (Verifier)

1. **Fail if** product or recipe treats Electron Main store, Client-only catalog, live-family-only Pass, fixed named connector, or mandatory vault (when in-app works) as Pass.
2. **Fail if** event Pass is only manual “Run now” or only new-Session webhookRuntime default.
3. **Fail if** deny is silent or Main-answered.
4. **Pass only if** evidence uses Host catalogs + Host HTTP/WS Client projections + mcp-client / B1 / credentials / approval seams as locked above.
5. GUI scenarios still need FR-014/015 desktop media committed under `verifier/evidence/` + PR embeds (SO 11+12).

## Regression guard wording

> P6 Pass path is **Host-owned Connector catalog** + `dsh-mcp-client` bind, **additive** event Routines with **B1 webhook-harness** wake on the existing bot, **in-app** Host credentials (vault optional), and **user-deny or standing never** via Host HTTP answerer. Electron Main has no connector/event/trust/credential-value bus. Cron remains. Live Slack/GitHub and full Grok catalog are Out of Pass.

## Non-overlap

- T002 / T003 / T004 own inventory files — not this doc.
- T006 owns `verifier/README.md` scenario map — not this doc.
- T015 owns webhook-harness B1 path doc — later foundational.
