# Research: Phase 6 — Connectors / MCP + event routines + trust

**Feature**: `specs/006-connectors-mcp-events-trust`
**Date**: 2026-09-28
**Inputs**: [spec.md](./spec.md) (Clarified Session 2026-09-28) · `MzM-Docs/mzm-bot-plan.md` §4 P6 · `MzM-Docs/mzm-bot-initial-plan.md` §5/§9/§13 · constitution v1.0.0 · predecessors `specs/001`–`005` · clarify merged PR #200 @ `e67210bec0` · package READMEs for `dsh-mcp-client`, `dsh-webhook`, `dsh-credentials`, `dsh-authorization`, `dsh-user-approval`

All Technical Context unknowns from plan.md are resolved **for Spec planning** below. Format: Decision / Rationale / Alternatives.

**Clarify locks — do not reopen.** Options **A–E** are Spec-recommended defaults; **DH Architect confirms or replaces** before `/speckit-tasks`.

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

## R1 — Host-owned Connector catalog is the product SoT (Spec Option A — Architect confirm)

**Decision (recommended):** Phase 6 product connector install/auth/ready state lives in a **Host-owned Connector catalog**. Client connector surface **projects** Host state over authenticated Host HTTP/WS. Electron Main and Client local stores MUST NOT be SoT.

**MCP substrate:** Prefer compose `@deepseek-ai/dsh-mcp-client` so authenticated connectors register tools on `ctx.tools` (`mcp__<serverName>__<tool>`). Catalog rows bind product install/auth state to an MCP server registration (stdio or streamable-http). Thin managed catalog + optional Verifier fixture connector satisfy Pass — full Grok catalog is Out.

**Persistence home (preference):** Extend **`packages/experimental/agent-team/`** Host journal (P2–P5 pattern) **or** adjacent Host service if MCP lifecycle cannot live cleanly in Agent Teams — **Architect chooses**.

**Rationale:** Mirrors P2–P5 Host SoT + Client projection; keeps secrets and install state off Main; reuses real MCP seam instead of catalog theater.

**Alternatives considered:**

| # | Option | Verdict |
|---|--------|---------|
| 1 | Electron Main owns connector install + secrets; Host reads via IPC | **Reject** — parallel bus; violates dual-process lock |
| 2 | Client-only / cordis.yml-only config as product SoT | **Reject** — fails product install/auth UX + restart honesty |
| 3 | Mount mcp-client alone with no product catalog | **Reject for Pass** — FR-001 requires user-visible install surface |
| 4 | **Host Connector catalog + mcp-client bind** | **Recommend (Option A)** |

---

## R2 — Pass connector = thin catalog / Verifier fixture (any one)

**Decision:** Pass does **not** name Linear/GitHub/Gmail/Slack/Drive. Implementers + Verifier pick **any one** connector that completes install→auth→successful tool call. Prefer a **Verifier fixture MCP server** (deterministic, keyless or harness-token) when live OAuth is costly; product thin catalog MUST still show installable entry (fixture may be that entry).

**Rationale:** FR-017 / SC-001; clarify Q3.

**Alternatives considered:** Fixed named connector (rejected); require multi-family catalog (Out).

---

## R3 — Event routines extend Host Routine catalog; Pass = webhook harness (Spec Option B — Architect confirm)

**Decision (recommended):** Extend P4 **Host Routine catalog** with a discriminant:

| Field | Cron (P4) | Event (P6 Pass) |
|-------|-----------|-----------------|
| `triggerKind` | `cron` | `event` |
| Schedule / event | `scheduleExpr` | `eventTrigger` = webhook-harness / Verifier-fixture family |
| Fire | Host cron wake | Host **event match** → same **bot wake / intent turn** pattern as P4 |
| Pause | Suppresses cron fire | Suppresses event fire |

Do **not** rewrite `specs/004-routines-cron`. Cron paths remain. Pane labels must distinguish trigger types.

**Harness path (Pass):** Verifier (or script) delivers one matching event to a **documented Host webhook harness endpoint / fixture** → Host matches active event routines → fires wake → updates `lastRunAt`. Named live adapters (`dsh-webhook-github`, Slack, …) are **optional beyond Pass**.

**`dsh-webhook` relationship:** Package provides `ctx.webhookRuntime` that can create Workspace Sessions from verified deliveries. P6 Pass needs **routine wake on an existing bot** (P4 fire shape), which may be:

- **B1:** Host harness adapter that uses webhookRuntime-style ingress but dispatches to Routine catalog wake (preferred product story), or
- **B2:** Thin Host-only harness without mounting webhookRuntime for Pass

**Architect must pick B1 vs B2** (and whether webhookRuntime’s “new Session” action is reused, wrapped, or bypassed for routine wake).

**Rationale:** FR-004/005/018; P4 deferred events to P6; clarify Q1.

**Alternatives considered:** Require live Slack/GitHub Pass (rejected); replace cron with events (forbidden); Electron Main webhook listener as SoT (reject).

---

## R4 — Denied-permission path via approval / standing deny (Spec Option C — Architect confirm)

**Decision (recommended):** Prove one deny using existing `@deepseek-ai/dsh-user-approval` (policy `ask` → user denies, or policy/standing `never` / block rule) for a connector tool or trust-gated connector action. Denial MUST be user-visible and distinct from success; action MUST NOT proceed as permitted.

**Rationale:** FR-006 / SC-003; inventory §13 auto-review vocabulary without requiring full Grok auto-review chrome.

**Alternatives considered:** Silent fail as “deny” (reject — must be user-visible); require full auto-review rules product (YAGNI for Pass — complementary OK).

**Architect confirm:** Client answerer composition for Desktop; whether standing deny is session policy, Host rule table, or both for Pass.

---

## R5 — Credentials: in-app primary; vault optional (Spec Option D)

**Decision:** Connector secrets use **Host credential seam** (`dsh-credentials` + `dsh-credentials-local`; `dsh-authorization` flows when human sign-in/code entry is needed). Honor P1 lock: in-app primary; env/keys = dev/CI only; **not** Pass product path. Secrets MUST NOT appear as plaintext in session dumps / exportable session artifacts (FR-007). Renderer MUST NOT hold durable secret SoT (FR-008).

**Vault / 1Password-class:** Implement **only if** the chosen Pass connector cannot complete auth via in-app store. If in-app suffices, vault surface is **not** required for Pass (FR-009 / SC-007). Prefer selecting a Pass connector that authenticates in-app over building vault for Pass.

**Rationale:** Clarify Q2; plan §5 auth; P1 trust floor.

**Alternatives considered:** Mandatory vault Pass gate (rejected); chat-paste tokens as Pass (rejected); env-file Pass (rejected).

---

## R6 — Topology & no Electron Main connector/event/trust bus

**Decision:**
- **Electron shell** (`apps/desktop`): spawn Host child; lifecycle IPC only; load `dsh-app://`. Does **not** own connector catalog, webhook SoT, trust rules, or credential values.
- **Desktop Host** (`apps/desktop-host` + Host plugins): Connector CRUD/auth bind, MCP registration, event harness, Routine event fire, approval enforcement, credential store.
- **Client / Web:** Connector / routines / approval / auth UI; locale-owned copy; mutate via Host Remotes only.
- **Main ↔ Host IPC:** lifecycle-only. **Forbidden** on that channel: connector-catalog, connector-install/auth, MCP tool-call control payloads, event-routine create/fire, webhook delivery, permission-deny control, credential **values**. Extend `apps/desktop/src/host-protocol.ts` exclusion list (P3–P5 pattern).
- **Data plane:** mutations + projections travel **shipped authenticated Host HTTP/WS** only.

**Rationale:** Constitution V; dual-process freeze from P1–P5.

---

## R7 — Verifier evidence (SO 11+12)

**Decision:** GUI scenarios (US1–US3, US5 GUI) require desktop screenshots and/or short screen recordings, **committed** under `specs/006-connectors-mcp-events-trust/verifier/evidence/<slice>/` and embedded in GUI PR bodies via absolute `/opt/cursor/artifacts/…` paths. US4 dump inspection may be non-GUI log/artifact evidence (still committed). Unit/jsdom alone fails GUI Pass.

**Rationale:** FR-014/015; standing orders 11+12.

---

## R8 — Linear tracking honesty

**Decision:** Do **not** invent P6 epic/issue numbers. Plan/tasks/implement proceed on git + PR until free-issue capacity returns; then PO opens real issues on **DeepSeek Harness - Cursor** and backfills. No Linear comments from this plan PR.

**Rationale:** Spec Assumptions; living-next-gate; user mission.

---

## Seam map (summary)

```text
User (Desktop Client)
    │  connector install/auth/tool · event routine create/list · deny · auth UX
    │  (Host HTTP/WS only)
    ▼
Desktop Host
    ├── Connector catalog (SoT) ──► dsh-mcp-client tools on ctx.tools
    ├── Routine catalog (cron + event) ──► Host wake on cron OR webhook-harness match
    ├── Webhook harness / Verifier fixture ingress (Pass event family)
    ├── dsh-user-approval / standing deny (trust Pass)
    └── dsh-credentials (+ authorization); secrets never in session dumps
Electron Main ──► lifecycle IPC only; NO connector/event/trust/credential-value bus
```

---

## Open questions for DH Architect (blocking tasks)

1. **Connector catalog home** — Agent Teams journal vs new Host package vs mcp-client config projection only? (Option A preference: Host catalog + mcp-client bind.)
2. **Event fire path** — B1 wrap/adapt `dsh-webhook` ingress → Routine wake, or B2 Host-only harness without webhookRuntime for Pass? Must preserve P4 “wake existing bot with intent” (not require new Workspace Session as Pass).
3. **RoutineRecord shape** — Exact discriminant (`triggerKind` + `eventTrigger` vs replace `scheduleExpr` union); migration honesty for existing cron rows without rewriting `specs/004`.
4. **Trust deny Pass** — User-deny card via `dsh-user-approval` answerer, standing `never`/block, or either? Where does Desktop Client answerer live?
5. **Pass fixture connector** — Who owns the thin-catalog / Verifier MCP fixture (package path, transport stdio vs HTTP, auth token shape)? Confirm in-app auth is sufficient so vault stays optional.
6. **host-protocol exclusions** — Confirm exact forbidden type names for connector/event/trust/credential payloads (mirror memory/routines list style).

Until Architect answers, implementers MUST NOT invent a competing SoT (Main bus, Client-only catalog, live-family Pass).
