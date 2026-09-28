# Implementation Plan: Phase 5 — Memory productization

**Branch**: `cursor/p5-plan-fe1d` | **Date**: 2026-09-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-memory-productization/spec.md` (Status: Clarified Session 2026-09-28)

**Linear**: Epic [MOH-228](https://linear.app/momadhoun/issue/MOH-228/p5-memory-productization) · Plan issue [MOH-233](https://linear.app/momadhoun/issue/MOH-233/p5-spec-kit-plan-memory-productization) · Clarify [MOH-231](https://linear.app/momadhoun/issue/MOH-231) Done (PR #169 @ `749d75626f`) · Specify [MOH-229](https://linear.app/momadhoun/issue/MOH-229) · Project **DeepSeek Harness - Cursor** only

**Architect / PO lock**: MOH-233 mission — **Host-owned Memory catalog = SoT**. Do **not** reopen. Agent layer per bot; user layer account-wide (ADR); kinds profile/log/note orthogonal to layers; persist on Host (prefer `packages/experimental/agent-team/` journal / Host journal pattern from P4 routines); Client write/browse/recall via Host Remotes; model-visible recall via Host context/instruction injection reconstructable from session log; **no Electron Main memory bus**; transcript ≠ curated memory; Write Pass = user-visible UI (bot-tool optional); Recall Pass = surface + one model-visible path; SO 11+12 for GUI Verifier evidence.

**Note**: Filled by `/speckit-plan`. Do **not** create `tasks.md` in this command. Do **not** rewrite FRs in `specs/001`–`004`. No product code in this PR.

## Summary

Ship Phase 5 memory productization on a **Host-owned Memory catalog**: users **write** non-empty **profile / log / note** facts on a user-visible surface, **browse/recall** them after app restart with kinds distinguishable, honor **agent vs user** layers (ADR), and prove **one model-visible recall path** via Host instruction/context injection — with **desktop screenshots/recordings committed** under `verifier/evidence/` (FR-011/FR-012 / standing orders 11+12). Client mutates and lists via **authenticated Host HTTP/WS** only. Electron Main stays lifecycle-only (no memory SoT). Prefer extending Agent Teams Lead journal (same home as P4 `team/routine`). Out: Grok chrome parity beyond ADR, P6 connectors/events, P7 Box/Shell, bot-tool write as Pass, kind→layer locks, edit/delete as Pass.

## Technical Context

**Language/Version**: TypeScript (ESM), Node `^22.19 || >=24`, Electron Desktop packaging

**Primary Dependencies**: DeepSeek Harness Cordis plugins (`@deepseek-ai/dsh-*`), Desktop Host (`apps/desktop-host`), thin Electron shell (`apps/desktop`), Agent Teams / Host bot identity (P1–P4), Web client under Desktop wrapper; locale-owned Client UI copy

**Storage**: Host-owned durable **Memory catalog** (`MemoryRecord`: kind × layer); agent rows keyed by `botId`; user rows account-wide; pane/surface is a **Client projection** of Host state; no Electron Main durable memory store; no Client-only persistence as SoT; transcript is not the catalog

**Testing**: Vitest unit/behavior; Desktop Verifier scripted path for SC-001…SC-010 with FR-011/012 visual evidence; absence check “no Electron memory bus”; Linear issues only after `taskstoissues`

**Target Platform**: Electron Desktop (Windows-first for Mohammed; mac/Linux as Verifier environment allows)

**Project Type**: desktop-app (Electron shell + **bundled-Node Desktop Host child** + Web client)

**Performance Goals**: No separate TTFT SLO for P5; Pass measures durable write + recall return + injection path — not LLM reply latency or semantic ranking quality

**Constraints**:
- P5 In only: write profile/log/note; surface recall after restart; one model-visible Host injection path; agent vs user layers; kinds×layers orthogonal
- Out: Grok chrome parity beyond ADR; connectors/MCP/event routines (P6); Box/Shell (P7); rewrite of `specs/001`–`004`
- Clarify locks (2026-09-28): Write Pass = UI only; Recall Pass = surface + model-visible; kinds orthogonal to layers
- **PO-locked Option:** Host Memory catalog SoT; reject Electron Main memory bus; prefer Agent Teams / Host journal
- Topology freeze: dual-process Desktop Host child; **Node IPC lifecycle-only**; memory data plane = **shipped authenticated Host HTTP/WS** + `dsh-app://`; no Main parallel memory bus
- FR-011 / FR-012 / standing orders 11+12 mandatory for GUI scenarios
- Constitution v1.0.0 wedge-first; no north-star C / P6–P7 creep
- Model-visible ⟺ logged (injection reconstructable from session log)

**Scale/Scope**: Single primary user (Mohammed); memory surfaces for existing P1–P4 bots; operable UI not Grok chrome parity

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Wedge-First A→C | PASS | P5 advances durable memory seams toward C; profile/log/note + layers + recall; no P6/P7 theater |
| II. Spec-Driven Delivery | PASS | Artifacts under `specs/005-memory-productization/`; Linear after tasks; PO Option encoded in research |
| III. Product Over Theater | PASS | Prioritizes write/browse/recall + layer honesty; defers Grok chrome, connectors, box, bot-tool Pass |
| IV. Verify Against Spec | PASS | SC-001…010 + contracts + FR-011/012 desktop evidence; Verifier gates Done |
| V. Simplicity & Seam Honesty | PASS | Host Memory catalog + Host injection; Client projects; no Electron Main bus; transcript ≠ curated; prefer Agent Teams journal |
| Stack & Seam Constraints | PASS | DSH + Electron dual-process + Spec Kit + Linear (Cursor project); topology one-liner below |

**Post-design re-check:** PASS — design matches PO-locked Host Memory catalog Option. Complexity Tracking empty.

### Topology one-liner (PO / Architect)

Bundled-Node **Desktop Host child** + shipped authenticated **Host HTTP/WS** data plane + Node IPC **lifecycle-only** + `dsh-app://`. Forbidden on Main↔Host IPC: memory-catalog, memory-write, memory-list/browse, memory-recall, memory-injection payloads (extend `apps/desktop/src/host-protocol.ts` exclusion list like identity + skills + routines).

## Project Structure

### Documentation (this feature)

```text
specs/005-memory-productization/
├── spec.md              # Clarified feature spec
├── plan.md              # This file
├── research.md          # Phase 0 (PO-locked Host Memory catalog Option)
├── data-model.md        # Phase 1 — MemoryRecord / projection / injection
├── quickstart.md        # Phase 1 validation guide
├── contracts/           # Phase 1 interface contracts
│   ├── README.md
│   ├── write-kinds.md
│   ├── recall.md
│   ├── layers.md
│   └── non-goals.md
├── checklists/          # From specify/clarify
└── tasks.md             # /speckit-tasks — NOT created by this plan command
```

### Source Code (repository root) — touch targets for later implement

```text
apps/desktop/                          # Thin Electron shell; lifecycle IPC only; NO memory store
apps/desktop-host/                     # Desktop Host child; Memory catalog + Remotes + injection bind
packages/experimental/agent-team/      # Prefer extend Host journal (P2/P3/P4 pattern) for MemoryRecord
# Web/client UI — memory write + browse/recall surfaces (Host RPC); locale-owned copy
# Optional: adjacent Host service only if Agent Teams cannot hold user-layer account scope
```

**Structure Decision:** Extend Desktop dual-process layout. **New Host-owned Memory catalog** adjacent to Agent Teams bot identity / routines journal. Surfaces are Client projections over Host HTTP/WS. Exact package/file paths finalized in tasks within these seams. Default preference: `packages/experimental/agent-team/` (research R1).

## Phase 0 — Research

See [research.md](./research.md). PO-locked Host Memory catalog Option. Clarify session 2026-09-28 locks honored.

## Phase 1 — Design

| Artifact | Path |
|----------|------|
| Data model | [data-model.md](./data-model.md) |
| Contracts | [contracts/](./contracts/) |
| Quickstart | [quickstart.md](./quickstart.md) |

### Capability → ownership → contract (plan matrix)

| Capability | Host (Runtime / Desktop Host) | Electron / Client | Contract |
|------------|-------------------------------|-------------------|----------|
| Write profile/log/note | Durable Memory catalog CRUD; reject empty | User-visible write UI via Host RPC; locale copy; no Main store | [write-kinds.md](./contracts/write-kinds.md) |
| Surface + model-visible recall | Persist across restart; project list; inject ≥1 fact into subsequent turn (session-log reconstructable) | Browse/recall surface; observe injection/application indicator when present | [recall.md](./contracts/recall.md) |
| Agent vs user layers + orthogonal kinds | Agent rows per botId; user rows account-wide; any kind on either layer | Layer-distinguishable UI; Verifier layer demo | [layers.md](./contracts/layers.md) |
| Non-goals + absence | No Grok chrome / P6 / P7 / Main bus; transcript ≠ catalog; bot-tool / edit-delete optional | Absence checks + no Electron memory bus guard | [non-goals.md](./contracts/non-goals.md) |

### Locks honored (clarify 2026-09-28 + PO Option)

| Lock | Plan treatment |
|------|----------------|
| Write Pass = user-visible UI; bot-tool optional | R4 + write-kinds; FR-015 / SC-009 |
| Recall Pass = surface + model-visible Host inject | R5 + recall; FR-005 / FR-016 / SC-004 |
| Kinds × layers orthogonal | R3 + layers; FR-017 / SC-010 |
| Host Memory catalog SoT (Agent Teams / journal) | R1–R2; Constitution V |
| No Electron Main memory bus | Topology + non-goals absence (P4 clone) |
| Transcript ≠ curated memory | R6; layers / non-goals |
| SO 11+12 GUI evidence | R8; FR-011/012 |

### Complexity Tracking

> None — no constitution violations.

## Next (held)

After **Verifier Pass** on this plan PR: `/speckit-tasks` → analyze → `taskstoissues` under MOH-228 → implement. PO marks [MOH-233](https://linear.app/momadhoun/issue/MOH-233/p5-spec-kit-plan-memory-productization) Done only after Verifier Pass. **Leave MOH-233 In Progress until then.**
