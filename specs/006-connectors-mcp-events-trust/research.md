# Research: Phase 6 — Connectors / MCP + event routines + trust

**Feature**: `specs/006-connectors-mcp-events-trust`
**Date**: 2026-09-28
**Inputs**: [spec.md](./spec.md) (Clarified Session 2026-09-28) · `MzM-Docs/mzm-bot-plan.md` §4 P6 · `MzM-Docs/mzm-bot-initial-plan.md` §5/§9/§13 · constitution v1.0.0 · predecessors `specs/001`–`005` · clarify merged PR #200 @ `e67210bec0` · package READMEs for `dsh-mcp-client`, `dsh-webhook`, `dsh-credentials`, `dsh-authorization`, `dsh-user-approval` · **DH Architect Path A** (seam stamp on `cursor/p6-plan-fe1d`)

All Technical Context unknowns from plan.md are resolved below. Format: Decision / Rationale / Alternatives.

**Clarify locks — do not reopen.** **Architect Path A — do not reopen** (answers former open questions 1–6).

---

## R0 — Clarify locks (binding)

| Lock | Decision |
|------|----------|
| Event family for Pass | **Webhook harness / Verifier fixture** only; named live Slack/GitHub/Linear/email **not** required (FR-018) |
| Vault UX | **Optional** — required only when Pass connector cannot authenticate via in-app store; **not** mandatory Pass gate (FR-009) |
| Pass connector | **Any one** from thin managed catalog **or** Verifier fixture; **not** a fixed named connector (FR-017) |

**Rationale:** Clarify Session 2026-09-28 Q1–Q3.

**Alternatives considered:** Live family Pass; mandatory 1Password; fixed named connector — all rejected by clarify.

---

## R1 — Host-owned Connector catalog is the product SoT (Architect Option A — locked)

**Decision:** Phase 6 product connector install/auth/ready state lives in a **Host-owned Connector catalog**. Client connector surface **projects** Host state over authenticated Host HTTP/WS. Electron Main and Client local stores MUST NOT be SoT.

**MCP substrate:** Compose `@deepseek-ai/dsh-mcp-client` so authenticated connectors register tools on `ctx.tools` (`mcp__<serverName>__<tool>`). Catalog rows bind product install/auth state to an MCP server registration (stdio or streamable-http). Thin managed catalog + Verifier fixture connector satisfy Pass — full Grok catalog is Out.

**Persistence home:** Extend **`packages/experimental/agent-team/`** Host journal (P2–P5 pattern) for `ConnectorRecord` install/auth state. Adjacent Host service only if MCP lifecycle cannot live cleanly in Agent Teams — default for tasks is Agent Teams.

**Rationale:** Mirrors P2–P5 Host SoT + Client projection; keeps secrets and install state off Main; reuses real MCP seam instead of catalog theater. Architect Path A Q1.

**Alternatives considered:**

| # | Option | Verdict |
|---|--------|---------|
| 1 | Electron Main owns connector install + secrets; Host reads via IPC | **Reject** — parallel bus; violates dual-process lock |
| 2 | Client-only / cordis.yml-only config as product SoT | **Reject** — fails product install/auth UX + restart honesty |
| 3 | Mount mcp-client alone with no product catalog | **Reject for Pass** — FR-001 requires user-visible install surface |
| 4 | **Host Connector catalog + mcp-client bind** | **Choose (Option A — locked)** |

---

## R2 — Pass connector = thin catalog / Verifier fixture (any one)

**Decision:** Pass does **not** name Linear/GitHub/Gmail/Slack/Drive. Implementers + Verifier pick **any one** connector that completes install→auth→successful tool call. Prefer a **thin Verifier fixture MCP server** under **`packages/experimental/agent-team/`** or **desktop test fixture** (deterministic; in-app auth token/harness credential). Product thin catalog MUST still show an installable entry (fixture may be that entry). **In-app auth is sufficient** for the Pass fixture — vault stays optional (FR-009).

**Rationale:** FR-017 / SC-001; clarify Q3; Architect Path A Q5.

**Alternatives considered:** Fixed named connector (rejected); require multi-family catalog (Out); require vault for Pass fixture (rejected).

---

## R3 — Event routines extend Host Routine catalog; Pass = webhook harness B1 (Architect — locked)

**Decision:** Extend P4 **Host Routine catalog** with **additive** fields (no rewrite of `specs/004-routines-cron`):

| Field | Cron (P4) | Event (P6 Pass) |
|-------|-----------|-----------------|
| `triggerKind` | `cron` | `event` |
| Schedule / event | `scheduleExpr` (unchanged) | `eventTrigger` = `webhook_harness` (Verifier fixture family) |
| Fire | Host cron wake | Host **event match** → same **bot wake / intent turn** on **existing bot** (P4 fire shape) |
| Pause | Suppresses cron fire | Suppresses event fire |

Existing cron rows remain valid without migration rewrite of P4 acceptance. Pane labels must distinguish trigger types.

**Harness path (Pass) — B1 locked:** Adapt `@deepseek-ai/dsh-webhook` **ingress** style so a Verifier (or script) delivers one matching event to a **documented Host webhook harness endpoint / fixture** → Host matches active event routines → **Routine wake on the existing bot with intent** → updates `lastRunAt`. Do **not** require webhookRuntime’s default “create new Workspace Session” as the Pass fire path — wrap/adapt ingress → catalog wake. Named live adapters (`dsh-webhook-github`, Slack, …) are **optional beyond Pass**.

**Rationale:** FR-004/005/018; P4 deferred events to P6; clarify Q1; Architect Path A Q2–Q3.

**Alternatives considered:**

| # | Option | Verdict |
|---|--------|---------|
| B1 | Adapt `dsh-webhook` ingress → Routine wake (existing bot + intent); Host harness for Verifier | **Choose (locked)** |
| B2 | Thin Host-only harness without webhookRuntime for Pass | Reject — less reuse; B1 preferred |
| — | Require live Slack/GitHub Pass | Reject (clarify) |
| — | Replace cron with events / rewrite `specs/004` | Forbidden |
| — | Electron Main webhook listener as SoT | Reject |
| — | Replace `scheduleExpr` with a breaking union that invalidates P4 rows | Reject — additive `triggerKind` + `eventTrigger` only |

---

## R4 — Denied-permission path via approval / standing deny (Architect — locked)

**Decision:** Prove one deny using **either**:

1. **User-deny** via `@deepseek-ai/dsh-user-approval` (`ask` → user denies), **or**
2. **Standing `never` / block** rule

Either path is OK for Pass (FR-006 / SC-003). Denial MUST be user-visible and distinct from success; action MUST NOT proceed as permitted.

**Desktop Client answerer:** Lives on the **Host HTTP/WS** path (Client projects approval prompts / deny cards via authenticated Remotes — same dual-process data plane as P2–P5). Electron Main MUST NOT own the answerer or trust bus.

**Rationale:** FR-006 / SC-003; inventory §13 vocabulary without full Grok auto-review chrome; Architect Path A Q4.

**Alternatives considered:** Silent fail as “deny” (reject); require full auto-review rules product (YAGNI for Pass); Electron Main answerer (reject).

---

## R5 — Credentials: in-app primary; vault optional (locked)

**Decision:** Connector secrets use **Host credential seam** (`dsh-credentials` + `dsh-credentials-local`; `dsh-authorization` flows when human sign-in/code entry is needed). Honor P1 lock: in-app primary; env/keys = dev/CI only; **not** Pass product path. Secrets MUST NOT appear as plaintext in session dumps / exportable session artifacts (FR-007). Renderer MUST NOT hold durable secret SoT (FR-008).

**Vault / 1Password-class:** Implement **only if** the chosen Pass connector cannot complete auth via in-app store. Pass fixture uses **in-app auth** — vault surface is **not** required for Pass (FR-009 / SC-007).

**Rationale:** Clarify Q2; plan §5 auth; P1 trust floor; Architect Path A Q5.

**Alternatives considered:** Mandatory vault Pass gate (rejected); chat-paste tokens as Pass (rejected); env-file Pass (rejected).

---

## R6 — Topology & no Electron Main connector/event/trust bus (locked)

**Decision:**
- **Electron shell** (`apps/desktop`): spawn Host child; lifecycle IPC only; load `dsh-app://`. Does **not** own connector catalog, webhook SoT, trust rules, or credential values.
- **Desktop Host** (`apps/desktop-host` + Host plugins): Connector CRUD/auth bind, MCP registration, event harness (B1), Routine event fire, approval enforcement, credential store.
- **Client / Web:** Connector / routines / approval / auth UI; locale-owned copy; mutate via Host Remotes only; **user-approval answerer** on Host HTTP path.
- **Main ↔ Host IPC:** lifecycle-only (`ready` / `fatal` / `shutdown-complete` / `update-tasks` + Main `shutdown` / `update-tasks`). **Forbidden** on that channel (mirror memory/routine exclusion style in `apps/desktop/src/host-protocol.ts`):
  - connector-catalog, connector-install, connector-auth
  - mcp-tool-call control payloads
  - event-routine-create, event-routine-fire, webhook-delivery
  - permission-deny / trust-rule control
  - credential **values** / credential-set / secret payloads
- **Data plane:** mutations + projections travel **shipped authenticated Host HTTP/WS** only.
- **Guard expectation:** Verifier non-goals / tasks include a “no Electron connectors/events/trust bus” absence check (clone P4/P5 pattern).

**Rationale:** Constitution V; dual-process freeze from P1–P5; Architect Path A Q6.

---

## R7 — Verifier evidence (SO 11+12)

**Decision:** GUI scenarios (US1–US3, US5 GUI) require desktop screenshots and/or short screen recordings, **committed** under `specs/006-connectors-mcp-events-trust/verifier/evidence/<slice>/` and embedded in GUI PR bodies via absolute `/opt/cursor/artifacts/…` paths. US4 dump inspection may be non-GUI log/artifact evidence (still committed). Unit/jsdom alone fails GUI Pass.

**Rationale:** FR-014/015; standing orders 11+12.

---

## R8 — Linear tracking honesty

**Decision:** Do **not** invent P6 epic/issue numbers. Plan/tasks/implement proceed on git + PR until free-issue capacity returns; then PO opens real issues on **DeepSeek Harness - Cursor** and backfills. No Linear comments from this plan PR.

**Rationale:** Spec Assumptions; living-next-gate; user mission.

---

## R9 — host-protocol exclusion names (Architect — locked)

**Decision:** Extend `DESKTOP_HOST_CHILD_EVENT_TYPES` / `DESKTOP_HOST_CONTROL_TYPES` docs (and exclusion prose) so implementers cannot add these control/payload names on Node IPC:

| Forbidden family | Example names (documentation / guard vocabulary) |
|------------------|--------------------------------------------------|
| Connector | `connector-catalog`, `connector-install`, `connector-auth`, `mcp-tool-call` |
| Event routines | `event-routine-create`, `event-routine-fire`, `webhook-delivery` |
| Trust | `permission-deny`, `trust-rule` |
| Credentials | `credential-value`, `credential-set`, `secret-payload` |

Same pattern as identity / skills / routines / memory exclusions already in `apps/desktop/src/host-protocol.ts`.

**Rationale:** Architect Path A Q6; FR seam honesty.

---

## Seam map (summary)

```text
User (Desktop Client)
    │  connector install/auth/tool · event routine create/list · deny · auth UX
    │  (Host HTTP/WS Remotes only — including user-approval answerer)
    ▼
Desktop Host
    ├── Connector catalog (SoT) ──► dsh-mcp-client tools on ctx.tools
    ├── Routine catalog (cron + event; additive triggerKind + eventTrigger)
    ├── B1: dsh-webhook-style ingress ──► Routine wake (existing bot + intent)
    ├── Host webhook harness / Verifier fixture (Pass event family)
    ├── dsh-user-approval user-deny OR standing never (trust Pass)
    └── dsh-credentials (+ authorization); secrets never in session dumps
Electron Main ──► lifecycle IPC only; NO connector/event/trust/credential-value bus
```

---

## Architect Path A answers (former open questions — locked)

| # | Question | Answer |
|---|----------|--------|
| 1 | Connector catalog home | **Option A** — Host catalog + `dsh-mcp-client` bind; prefer Agent Teams journal |
| 2 | Event fire path | **B1** — adapt `dsh-webhook` ingress → Routine wake on existing bot with intent; Host harness for Verifier; not new-Session Pass |
| 3 | RoutineRecord shape | **Additive** `triggerKind` + `eventTrigger`; cron `scheduleExpr` rows unchanged; no rewrite `specs/004` |
| 4 | Trust deny Pass | User-deny via `dsh-user-approval` **or** standing `never` — either OK; Desktop Client answerer on **Host HTTP** path |
| 5 | Pass fixture connector | Thin Verifier fixture under **agent-team** or **desktop test fixture**; **in-app** auth (vault stays optional) |
| 6 | host-protocol exclusions | Forbid connector / event / trust / credential-value payloads on Electron Node IPC (R6 / R9) |

Until Linear capacity returns, track via PR only. Implementers MUST NOT invent a competing SoT (Main bus, Client-only catalog, live-family Pass).
