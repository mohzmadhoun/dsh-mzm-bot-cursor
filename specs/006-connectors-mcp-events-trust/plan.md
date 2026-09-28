# Implementation Plan: Phase 6 — Connectors / MCP + event routines + trust

**Branch**: `cursor/p6-plan-fe1d` | **Date**: 2026-09-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-connectors-mcp-events-trust/spec.md` (Status: Clarified Session 2026-09-28; clarify merged PR #200 @ `e67210bec0`)

**Linear**: **Blocked** — workspace free-issue limit; **no invented epic/issue ids**; track via PR only until capacity returns (project **DeepSeek Harness - Cursor** / `P-MOH-2` only — never GrokBot). `taskstoissues` deferred.

**Clarify locks (do not reopen):** (1) Event Pass = **webhook harness / Verifier fixture** — named live Slack/GitHub/Linear/email **not** required. (2) **Vault UX optional** — 1Password-class **not** a mandatory Pass gate when in-app auth completes the Pass connector. (3) Pass connector = **any one** from thin managed catalog / Verifier fixture — **not** a fixed named connector.

**Architect:** Seam Options below are Spec-recommended defaults for planning. **DH Architect must confirm or replace** before tasks (open questions at end of [research.md](./research.md) and in Completion Report). Do **not** invent a locked Option id until Architect answers.

**Note**: Filled by `/speckit-plan`. Do **not** create `tasks.md` in this command. Do **not** rewrite FRs in `specs/001`–`005`. No product code. No `MzM-Docs/` living edits in this PR.

## Summary

Ship Phase 6 connectors/events/trust on durable **Host-owned** seams: users **install → authenticate → successfully call** one connector tool from a thin catalog/fixture; create one **event-triggered** routine (webhook harness / Verifier fixture) that **fires E2E** with last-run visibility and pause suppress; prove one **denied-permission** path; keep connector secrets **out of session dumps**; credential UX stays **in-app primary** (vault only if Pass connector cannot complete in-app). Client mutates/lists via **authenticated Host HTTP/WS**. Electron Main stays lifecycle-only (no connector / event / trust SoT bus). Prefer extending P4 Host Routine catalog for event triggers and composing existing `dsh-mcp-client`, `dsh-webhook` (or Host harness sibling), `dsh-credentials` / `dsh-authorization`, and `dsh-user-approval` — exact package homes **Architect-owned**. Out: Box/Shell (P7); full Grok connector catalog; named live event families as Pass; mandatory vault when in-app suffices; rewrite of `specs/001`–`005`.

## Technical Context

**Language/Version**: TypeScript (ESM), Node `^22.19 || >=24`, Electron Desktop packaging

**Primary Dependencies**: DeepSeek Harness Cordis plugins (`@deepseek-ai/dsh-*`), Desktop Host (`apps/desktop-host`), thin Electron shell (`apps/desktop`), Agent Teams / Host bot identity + P4 Routine catalog + P5 Memory (predecessors), Web client under Desktop wrapper; candidate seams: `dsh-mcp-client` / `dsh-mcp-resources`, `dsh-webhook` (+ optional `dsh-webhook-github` later — **not** Pass), `dsh-credentials` / `dsh-credentials-local` / `dsh-authorization`, `dsh-user-approval` / permission presets; locale-owned Client UI copy

**Storage**: Host-owned **Connector catalog** (install/auth/ready state) + extended **Routine catalog** (cron **and** event triggers) + Host credential store (secrets never in session dumps); panes/surfaces are **Client projections**; no Electron Main durable connector/event/trust store; no Client-only SoT

**Testing**: Vitest unit/behavior; Desktop Verifier scripted path for SC-001…SC-008 with FR-014/015 visual evidence; dump-inspection evidence for secrets; absence checks (no Main bus; no P7/full-catalog/live-family Pass requirements); Linear issues only after capacity + `taskstoissues`

**Target Platform**: Electron Desktop (Windows-first for Mohammed; mac/Linux as Verifier environment allows)

**Project Type**: desktop-app (Electron shell + **bundled-Node Desktop Host child** + Web client)

**Performance Goals**: No separate TTFT SLO for P6; Pass measures install→auth→tool success, event fire + last-run, deny visibility, secrets-absent dump — not LLM reply latency or live multi-provider fan-out

**Constraints**:
- P6 In only: MCP/connectors; event-triggered routines; richer trust/permissions; vault UX **if needed**
- Out: Box/Shell (P7); full connector-catalog parity; send-on-behalf/group/voice; rewrite `specs/001`–`005`; env/key-file as product Pass auth
- Clarify locks (2026-09-28): webhook harness Pass; vault optional; any thin-catalog/fixture connector
- Topology freeze: dual-process Desktop Host child; **Node IPC lifecycle-only**; connector/event/trust data plane = **shipped authenticated Host HTTP/WS** + `dsh-app://`; no Main parallel bus
- FR-014 / FR-015 / standing orders 11+12 mandatory for GUI scenarios
- Constitution v1.0.0 wedge-first; no north-star C / P7 creep
- Model-visible ⟺ logged where connector tool outcomes / event wakes reach the model
- Cron routines from P4 remain; event triggers are **additive**

**Scale/Scope**: Single primary user (Mohammed); thin connector catalog sufficient for one Pass path; one webhook-harness event family for Pass; operable UI not Grok chrome parity

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Wedge-First A→C | PASS | P6 advances connectors + event routines + trust toward C; thin catalog + harness — no full Grok theater |
| II. Spec-Driven Delivery | PASS | Artifacts under `specs/006-connectors-mcp-events-trust/`; Linear after tasks **when capacity**; clarify locks encoded |
| III. Product Over Theater | PASS | Prioritizes one real install→auth→tool, one harness event fire, one deny, secrets-absent; defers vault/live families/full catalog |
| IV. Verify Against Spec | PASS | SC-001…008 + contracts + FR-014/015 desktop evidence; Verifier gates Done |
| V. Simplicity & Seam Honesty | PASS | Prefer existing mcp/webhook/credentials/approval seams + Host catalogs; Client projects; no Electron Main bus; Architect confirms homes |
| Stack & Seam Constraints | PASS | DSH + Electron dual-process + Spec Kit; Linear deferred honestly |

**Post-design re-check:** PASS — design honors clarify locks; package/home Options flagged for Architect. Complexity Tracking empty.

### Topology one-liner (Spec recommendation → Architect confirm)

Bundled-Node **Desktop Host child** + shipped authenticated **Host HTTP/WS** data plane + Node IPC **lifecycle-only** + `dsh-app://`. Forbidden on Main↔Host IPC: connector-catalog / install / auth / tool-call control, event-routine create/fire, webhook delivery payloads, permission-deny control, credential values (extend `apps/desktop/src/host-protocol.ts` exclusion list like identity + skills + routines + memory).

## Project Structure

### Documentation (this feature)

```text
specs/006-connectors-mcp-events-trust/
├── spec.md              # Clarified feature spec (PR #200)
├── plan.md              # This file
├── research.md          # Phase 0 (clarify locks + Spec-recommended Options)
├── data-model.md        # Phase 1 — Connector / EventRoutine / Trust / Credential
├── quickstart.md        # Phase 1 validation guide
├── contracts/           # Phase 1 interface contracts
│   ├── README.md
│   ├── connector.md
│   ├── event-routine.md
│   ├── trust-deny.md
│   ├── secrets.md
│   └── non-goals.md
├── checklists/          # From specify/clarify
└── tasks.md             # /speckit-tasks — NOT created by this plan command
```

### Source Code (repository root) — touch targets for later implement

```text
apps/desktop/                          # Thin Electron shell; lifecycle IPC only; NO connector/event/trust SoT
apps/desktop-host/                     # Desktop Host child; catalogs + Remotes + harness + credential bind
packages/experimental/agent-team/      # Prefer extend Host journal (P2–P5) for event Routine rows + connector install state if Architect agrees
packages/mcp/mcp-client/               # MCP tool registration on ctx.tools (Pass tool call substrate)
packages/mcp/mcp-resources/            # Shared MCP resource discovery (as needed)
packages/webhook/webhook/              # Host webhookRuntime candidate for harness dispatch (Architect: wake vs new-Session)
packages/webhook/webhook-github/       # NOT required for Pass (live family deferred)
packages/credentials/credentials/      # Credential seam (secrets out of config / dumps)
packages/credentials/credentials-local/# Local durable credential store
packages/credentials/authorization/    # Human auth flows when needed
packages/interaction/user-approval/    # One-shot ask/deny for trust path (deny Pass)
# Web/client UI — connector surface, event-routine create, approval card, auth UX (Host RPC); locale-owned copy
# Optional Verifier fixture MCP server / webhook harness under apps/desktop-host or specs/.../verifier/
```

**Structure Decision:** Extend Desktop dual-process layout. **Host-owned** connector + event-routine + trust/credential seams; Client projects over HTTP/WS. Prefer Agent Teams journal for durable product rows when Architect agrees (P2–P5 pattern). Exact package/file paths finalized in tasks after Architect answers open questions.

## Phase 0 — Research

See [research.md](./research.md). Clarify Session 2026-09-28 locks honored. Spec-recommended Options **A–E** await Architect confirmation.

## Phase 1 — Design

| Artifact | Path |
|----------|------|
| Data model | [data-model.md](./data-model.md) |
| Contracts | [contracts/](./contracts/) |
| Quickstart | [quickstart.md](./quickstart.md) |

### Capability → ownership → contract (plan matrix)

| Capability | Host (Runtime / Desktop Host) | Electron / Client | Contract |
|------------|-------------------------------|-------------------|----------|
| Connector install + auth + ready | Durable Connector catalog; bind MCP; auth via credentials/authorization | Catalog + install + auth UI via Host RPC; no Main store; no chat-paste primary | [connector.md](./contracts/connector.md) |
| Successful connector tool call | MCP tools on ctx.tools; success outcome logged/projected | User-visible tool success indicator | [connector.md](./contracts/connector.md) |
| Event-triggered routine create + fire | Extend Routine catalog (`triggerKind=event`); harness match → bot wake; lastRunAt; pause suppress | Create/list with trigger labeling; last-run; pause/resume (P4) | [event-routine.md](./contracts/event-routine.md) |
| Denied-permission path | Enforce deny (user deny or standing deny); fail closed; distinct outcome | Approval/deny UI or standing-deny control; clear blocked state | [trust-deny.md](./contracts/trust-deny.md) |
| Secrets absent + credential UX | Store secrets in credential seam; never session-dump plaintext; in-app primary | Auth surface without renderer durable secrets; vault only if needed | [secrets.md](./contracts/secrets.md) |
| Non-goals + absence | No P7 / full catalog / live-family Pass; no Main bus; no 001–005 rewrite | Absence checks | [non-goals.md](./contracts/non-goals.md) |

### Locks honored (clarify 2026-09-28)

| Lock | Plan treatment |
|------|----------------|
| Event Pass = webhook harness / Verifier fixture | R3 + event-routine; FR-018 / SC-002 |
| Vault UX optional | R5 + secrets; FR-009 / SC-007 |
| Any thin-catalog / fixture connector | R1–R2 + connector; FR-017 / SC-001 |
| SO 11+12 GUI evidence | R7; FR-014/015 |
| Cron additive (no P4 rewrite) | R3; SC-008 |
| No Linear ids invented | research R8; Next (held) |

### Complexity Tracking

> None — no constitution violations.

## Next (held)

After **Architect confirms** open questions + **Verifier Pass** on this plan PR: `/speckit-tasks` → analyze → `taskstoissues` **when Linear capacity exists** → implement. Until then track via PR only. Living gate / plan file updates remain DH Lead / PO-owned (not this PR).
