# Implementation Plan: Phase 4 — Routines (cron only)

**Branch**: `cursor/p4-plan-3e3a` | **Date**: 2026-09-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-routines-cron/spec.md` (Status: Clarified)

**Linear**: Epic [MOH-188](https://linear.app/momadhoun/issue/MOH-188/p4-routines-cron-only) · Plan issue [MOH-191](https://linear.app/momadhoun/issue/MOH-191/p4-spec-kit-plan-routines-cron) · Clarify [MOH-190](https://linear.app/momadhoun/issue/MOH-190) Done (#140) · Project **DeepSeek Harness - Cursor** only

**Architect lock**: MOH-191 comment (DH Architect) — Option 3 chosen. Do **not** ship P4 as “mount `dsh-schedule`.” Host-owned Routine catalog + Host cron wake; pane projects Host; optional `dsh-jobs` for in-flight fire visibility only; no Electron Main routines bus; Desktop Host child topology unchanged.

**Note**: Filled by `/speckit-plan` then **rewritten** to match Architect. Do **not** create `tasks.md` in this command. Do **not** rewrite FRs in `specs/001`–`003`.

## Summary

Ship Phase 4 cron routines on a **Host-owned Routine catalog** (prefer Agent Teams / Host journal extension, same pattern as P2 persona + P3 skills): users **create** a cron routine (non-empty intent + product-supported schedule, including 5-field cron and/or shorthands as Spec allows) for a **bot**, see it in that bot’s **routines pane**, **pause/resume** it, and observe a **Host cron wake** that applies intent as a bot turn — with **desktop screenshots/recordings committed** under `verifier/evidence/` (FR-010/FR-011 / standing orders 11+12). Client mutates and lists via **authenticated Host HTTP/WS** only. Electron Main stays lifecycle-only (no routines SoT). **`@deepseek-ai/dsh-schedule` is session-local reminders — not the Routines pane SoT.** Optional `@deepseek-ai/dsh-jobs` / `dsh-jobs-local` may show in-flight fire visibility only. Out: event listeners (P6), memory UX (P5), Box/Shell, MCP.

## Technical Context

**Language/Version**: TypeScript (ESM), Node `^22.19 || >=24`, Electron Desktop packaging

**Primary Dependencies**: DeepSeek Harness Cordis plugins (`@deepseek-ai/dsh-*`), Desktop Host (`apps/desktop-host`), thin Electron shell (`apps/desktop`), Agent Teams / Host bot identity (P1–P3), Web client under Desktop wrapper; **optional** `dsh-jobs` + `dsh-jobs-local` for in-flight fire visibility; **`dsh-schedule` not product Routines SoT** (session reminders only; optional time-math reuse)

**Storage**: Host-owned durable **Routine catalog** keyed by bot (`RoutineRecord`); pane is a **Client projection** of Host state; no Electron Main durable routines store; no Client-only persistence as SoT

**Testing**: Vitest unit/behavior; Desktop Verifier scripted path for SC-001…SC-007 with FR-010/011 visual evidence; ≤6-minute observation window for fire; absence check “no Electron routines bus”; Linear issues only after `taskstoissues`

**Target Platform**: Electron Desktop (Windows-first for Mohammed; mac/Linux as Verifier environment allows)

**Project Type**: desktop-app (Electron shell + **bundled-Node Desktop Host child** + Web client)

**Performance Goals**: No separate TTFT SLO for P4; Verifier fire wait ≤6 minutes on shortest product-supported recurring schedule (`@every 5m` acceptable). Fire proof is last-run / wake indicator — not LLM reply latency.

**Constraints**:
- P4 In only: create / pause / resume / pane list; Host-owned catalog + Host cron wake; cron only
- Out: event listeners (P6); memory recall UX (P5); Box/Shell (P7); MCP/connectors (P6)
- Clarify locks (2026-09-27): fire = Host wake + last-run (no LLM wording); Verifier ≤6 min / no sub-5m test schedule; confirm optional; edit optional; identity MAY derive from intent
- **Architect Option 3:** Host Routine catalog SoT; **reject** mounting `dsh-schedule` as Routines; **reject** Electron Main timers/store; optional `ctx.jobs` for in-flight fire only
- Topology freeze: dual-process Desktop Host child; **Node IPC lifecycle-only**; routine data plane = **shipped authenticated Host HTTP/WS** + `dsh-app://`; no Main parallel routines bus
- FR-010 / FR-011 / standing orders 11+12 mandatory for GUI scenarios
- Constitution v1.0.0 wedge-first; no north-star C / P5–P7 creep
- Do not rewrite `specs/001-*` / `002-*` / `003-*`

**Scale/Scope**: Single primary user (Mohammed); routines surfaces for existing P1–P3 bots; operable UI not Grok chrome parity

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Wedge-First A→C | PASS | P4 advances durable automation seams toward C; cron only; no event-listener theater |
| II. Spec-Driven Delivery | PASS | Artifacts under `specs/004-routines-cron/`; Linear after tasks; Architect lock encoded in research |
| III. Product Over Theater | PASS | Prioritizes create/list/pause/resume/fire visibility; defers events, memory, box, MCP |
| IV. Verify Against Spec | PASS | SC-001…007 + contracts + FR-010/011 desktop evidence; Verifier gates Done |
| V. Simplicity & Seam Honesty | PASS | Host Routine catalog + Host cron wake; Client projects; no Electron Main bus; `dsh-schedule` not misused as Routines SoT; jobs optional visibility only |
| Stack & Seam Constraints | PASS | DSH + Electron dual-process + Spec Kit + Linear (Cursor project); topology one-liner below |

**Post-design re-check:** PASS — design matches Architect Option 3. Complexity Tracking empty.

### Topology one-liner (Architect)

Bundled-Node **Desktop Host child** + shipped authenticated **Host HTTP/WS** data plane + Node IPC **lifecycle-only** + `dsh-app://`. Forbidden on Main↔Host IPC: routine-catalog, create/pause/resume, cron-fire, last-run payloads (extend `apps/desktop/src/host-protocol.ts` exclusion list like identity + skills).

## Project Structure

### Documentation (this feature)

```text
specs/004-routines-cron/
├── spec.md              # Clarified feature spec
├── plan.md              # This file
├── research.md          # Phase 0 (Architect Option 3)
├── data-model.md        # Phase 1 — RoutineRecord / projection / fire
├── quickstart.md        # Phase 1 validation guide
├── contracts/           # Phase 1 interface contracts
│   ├── README.md
│   ├── create-list.md
│   ├── pause-resume.md
│   ├── cron-fire.md
│   └── non-goals.md
├── checklists/          # From specify/clarify
└── tasks.md             # /speckit-tasks — NOT created by this plan command
```

### Source Code (repository root) — touch targets for later implement

```text
apps/desktop/                          # Thin Electron shell; lifecycle IPC only; NO routines store
apps/desktop-host/                     # Desktop Host child; Routine catalog + cron wake + HTTP/WS APIs
packages/experimental/agent-team/      # Prefer extend bot/Host journal pattern (P2/P3) for Routine records
packages/jobs/jobs/                    # Optional: ctx.jobs contract for in-flight fire visibility only
packages/jobs/jobs-local/              # Optional: process-local jobs provider (dies with Host)
packages/schedule/schedule/            # NOT Routines SoT — session-local reminders only; optional time-math reuse
packages/client/ui-schedule/           # Session reminder catalog — NOT Routines pane Pass surface
# Web/client UI — bot info-pane routines list + create/pause/resume + last-run (Host RPC)
```

**Structure Decision:** Extend Desktop dual-process layout. **New Host-owned Routine catalog** adjacent to Agent Teams bot identity. Pane is Client projection over Host HTTP/WS. Do **not** mount Schedule overlay as product Routines. Exact package/file paths finalized in tasks within these seams.

## Phase 0 — Research

See [research.md](./research.md). Architect Option 3 locked. Clarify session 2026-09-27 locks honored.

## Phase 1 — Design

| Artifact | Path |
|----------|------|
| Data model | [data-model.md](./data-model.md) |
| Contracts | [contracts/](./contracts/) |
| Quickstart | [quickstart.md](./quickstart.md) |

### Capability → ownership → contract (plan matrix)

| Capability | Host (Runtime / Desktop Host) | Electron / Client | Contract |
|------------|-------------------------------|-------------------|----------|
| Create + pane list | Durable Routine catalog CRUD; project by botId | Bot info-pane list + create via Host RPC; no Main store | [create-list.md](./contracts/create-list.md) |
| Pause / resume | Durable status on RoutineRecord; paused suppresses wake | Pause/resume controls + status in pane | [pause-resume.md](./contracts/pause-resume.md) |
| Cron fire + last-run | Host cron evaluation → bot wake/turn; update lastRunAt; optional jobs visibility | Show last-run / fire indicator | [cron-fire.md](./contracts/cron-fire.md) |
| Non-goals + absence | No event listeners / memory / box / MCP; no Main bus; schedule ≠ Routines SoT | Absence checks | [non-goals.md](./contracts/non-goals.md) |

### Locks honored (clarify 2026-09-27 + Architect)

| Lock | Plan treatment |
|------|----------------|
| Fire = Host wake + last-run; no LLM wording | R4 + cron-fire; FR-005 / SC-003 |
| Verifier ≤6 min; no sub-5m test schedule | R5; `@every 5m` acceptable |
| Confirm / edit optional; identity from intent | create-list; SC-007; FR-001/012 |
| Host Routine catalog SoT (not dsh-schedule) | R1–R3; Constitution V |
| Optional jobs for in-flight fire only | R6 |
| No Electron Main routines bus | Topology + non-goals absence |

### Complexity Tracking

> None — no constitution violations.

## Next (held)

After Verifier Pass on this plan PR: `/speckit-tasks` → analyze → `taskstoissues` under MOH-188 → implement. PO marks [MOH-191](https://linear.app/momadhoun/issue/MOH-191/p4-spec-kit-plan-routines-cron) Done only after Verifier Pass. **Leave MOH-191 In Progress until then.**
