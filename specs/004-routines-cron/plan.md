# Implementation Plan: Phase 4 — Routines (cron only)

**Branch**: `cursor/p4-plan-3e3a` | **Date**: 2026-09-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-routines-cron/spec.md` (Status: Clarified)

**Linear**: Epic [MOH-188](https://linear.app/momadhoun/issue/MOH-188/p4-routines-cron-only) · Plan issue [MOH-191](https://linear.app/momadhoun/issue/MOH-191/p4-spec-kit-plan-routines-cron) · Clarify [MOH-190](https://linear.app/momadhoun/issue/MOH-190) Done (#140) · Project **DeepSeek Harness - Cursor** only

**Note**: Filled by `/speckit-plan`. Do **not** create `tasks.md` in this command. Do **not** rewrite FRs in `specs/001`–`003`. Architect **flagged** (not spawned here) for optional confirm on pause/resume Host surface + bot↔session binding — see research R2/R3 and Completion Report.

## Summary

Ship Phase 4 cron routines on durable Host schedule seams: users **create** a cron/schedule routine (non-empty intent + product-supported schedule) for a **bot**, see it in that bot’s **routines pane**, **pause/resume** it, and observe a **scheduled fire** (Host wake applying intent as a bot turn) with last-run visibility — with **desktop screenshots/recordings committed** under `verifier/evidence/` (FR-010/FR-011 / standing orders 11+12). Prefer reuse of `@deepseek-ai/dsh-schedule` (durable session schedule records + fire/dispatch follow-up) with Client pane projecting Host state; **no Electron Main routines bus**. `@deepseek-ai/dsh-jobs` remains the background-tool job registry — **not** the routines list source of truth. Out: event listeners (P6), memory UX (P5), Box/Shell, MCP.

## Technical Context

**Language/Version**: TypeScript (ESM), Node `^22.19 || >=24`, Electron Desktop packaging

**Primary Dependencies**: DeepSeek Harness Cordis plugins (`@deepseek-ai/dsh-*`), especially `dsh-schedule` (+ optional `dsh-client-ui-schedule` patterns), `dsh-jobs` / `dsh-jobs-local` (non-routines background work only), `apps/desktop` + `apps/desktop-host`, experimental Agent Teams bot identity (P1–P3), Web client under Desktop wrapper

**Storage**: Host-owned durable schedule records (session log `schedule/change` fold today); pane is a **projection** of Host state for the selected bot’s session; no Electron Main durable routines store; no event-trigger store

**Testing**: Vitest unit/behavior; Desktop Verifier scripted path for SC-001…SC-007 with FR-010/011 visual evidence; ≤6-minute observation window for fire; Linear issues only after `taskstoissues`

**Target Platform**: Electron Desktop (Windows-first for Mohammed; mac/Linux as Verifier environment allows)

**Project Type**: desktop-app (Electron shell + Desktop Host runtime + Web client)

**Performance Goals**: No separate TTFT SLO for P4; Verifier fire wait ≤6 minutes on shortest product-supported recurring schedule (`@every 5m` acceptable). Fire proof is last-run / wake indicator — not LLM reply latency.

**Constraints**:
- P4 In only: create / pause / resume / pane list; Host jobs+schedule ownership; cron only
- Out: event listeners (P6); memory recall UX (P5); Box/Shell (P7); MCP/connectors (P6)
- Clarify locks (2026-09-27): fire = Host wake + last-run (no LLM wording); Verifier ≤6 min / no sub-5m test schedule; confirm optional; edit optional; identity MAY derive from intent
- Host owns durable routine mutations; Electron Main stays thin (no parallel routines bus); pane projects Host
- FR-010 / FR-011 / standing orders 11+12 mandatory for GUI scenarios
- Constitution v1.0.0 wedge-first; no north-star C / P5–P7 creep
- Do not rewrite `specs/001-*` / `002-*` / `003-*` — extend via this feature dir + contracts

**Scale/Scope**: Single primary user (Mohammed); routines surfaces for existing P1–P3 bots; operable UI not Grok chrome parity

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Wedge-First A→C | PASS | P4 advances durable automation seams toward C; cron only; no event-listener theater |
| II. Spec-Driven Delivery | PASS | Artifacts under `specs/004-routines-cron/`; Linear after tasks; living plan is scope lock, not tickets |
| III. Product Over Theater | PASS | Prioritizes create/list/pause/resume/fire visibility; defers events, memory, box, MCP |
| IV. Verify Against Spec | PASS | SC-001…007 + contracts + FR-010/011 desktop evidence; Verifier gates Done |
| V. Simplicity & Seam Honesty | PASS | Reuse `dsh-schedule` Host authority + Client projection; forbid Electron Main routines store; `dsh-jobs` not the routines catalog |
| Stack & Seam Constraints | PASS | DSH + Electron + Spec Kit + Linear (Cursor project); seams named in research / contracts |

**Post-design re-check:** PASS — research/data-model/contracts/quickstart introduce no P5–P7 product surfaces and no unjustified new top-level apps. Complexity Tracking empty. **Architect optional confirm** recommended for R2 (pause/resume Host surface) and R3 (bot↔session binding) before/during tasks — Spec does not block plan Verifier on that spawn.

## Project Structure

### Documentation (this feature)

```text
specs/004-routines-cron/
├── spec.md              # Clarified feature spec
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
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
apps/desktop/                          # Thin Electron shell; no routines store in Main
apps/desktop-host/                     # Desktop Host; mount schedule services / profile overlay
packages/schedule/schedule/            # dsh-schedule — durable create/list/dispatch (+ pause/resume extension)
packages/schedule/                     # Schedule family README / overlays
packages/client/ui-schedule/           # Existing session-header catalog patterns (reuse/adapt; not sole Pass surface)
packages/jobs/jobs/                    # dsh-jobs contract — background tools only; NOT routines SoT
packages/jobs/jobs-local/              # In-process jobs provider if fire path needs jobs (prefer schedule wake)
packages/experimental/agent-team/      # Bot identity / per-bot session association (P1–P3)
# Web/client UI — bot info-pane routines list + create/pause/resume + last-run visibility
```

**Structure Decision:** Extend existing Desktop dual-process layout and Host `dsh-schedule` ownership. Routines pane is a Client projection of Host schedule state for the **selected bot’s** session. No new top-level app. No Electron Main durable routines bus. Exact package/file paths finalized in tasks within these seams.

## Phase 0 — Research

See [research.md](./research.md). All Technical Context unknowns resolved. Clarify session 2026-09-27 locks honored. Seam map locked (R1–R5). Architect optional confirms noted (R2, R3).

## Phase 1 — Design

| Artifact | Path |
|----------|------|
| Data model | [data-model.md](./data-model.md) |
| Contracts | [contracts/](./contracts/) |
| Quickstart | [quickstart.md](./quickstart.md) |

### Capability → ownership → contract (plan matrix)

| Capability | Host (Runtime) | Electron / Client | Contract |
|------------|----------------|-------------------|----------|
| Create + pane list | Durable schedule create (intent + recurring/cron-capable selector); project active records | Bot info-pane routines list + create UI; no Main store | [create-list.md](./contracts/create-list.md) |
| Pause / resume | Durable pause/resume of schedule record; paused must not dispatch | Pause/resume controls + status in pane | [pause-resume.md](./contracts/pause-resume.md) |
| Cron fire + last-run | Schedule timer → Host wake/follow-up applying intent; record last-run observability | Show last-run / fire indicator in pane or linked activity | [cron-fire.md](./contracts/cron-fire.md) |
| Non-goals | No event listeners / memory / box / MCP product paths | Absence acceptable for Pass | [non-goals.md](./contracts/non-goals.md) |

### Locks honored (clarify 2026-09-27)

| Lock | Plan treatment |
|------|----------------|
| Fire = Host wake + last-run; no LLM wording | R4 + cron-fire contract; FR-005 / SC-003 |
| Verifier ≤6 min; no sub-5m test schedule | R5; `@every 5m` acceptable |
| Confirm optional | create-list contract; SC-007 |
| Edit optional | FR-012; SC-007; Out of Scope |
| Identity MAY derive from intent | data-model Routine; FR-001 |

### Complexity Tracking

> None — no constitution violations.

## Next (held)

After Verifier Pass on this plan PR: `/speckit-tasks` → analyze → `taskstoissues` under MOH-188 → implement. PO marks [MOH-191](https://linear.app/momadhoun/issue/MOH-191/p4-spec-kit-plan-routines-cron) Done only after Verifier Pass.
