# Implementation Plan: Phase 2 — Identity / Personas

**Branch**: `cursor/p2-plan-92fa` | **Date**: 2026-09-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-identity-personas/spec.md` (Status: Clarified)

**Linear**: Epic [MOH-88](https://linear.app/momadhoun/issue/MOH-88/p2-identity-personas) · Plan issue [MOH-94](https://linear.app/momadhoun/issue/MOH-94/p2-spec-kit-plan-identity-personas) · Verifier gate [MOH-95](https://linear.app/momadhoun/issue/MOH-95/p2-verifier-gate-plan-002-identity-personas) · Project **DeepSeek Harness - Cursor** only

**Note**: Filled by `/speckit-plan`. Phase 0–1 design only — no feature implementation in this change. Tasks landed (PR #72); next: analyze → `taskstoissues` → implement. Do **not** rewrite `specs/001-multi-model-bots`.

## Summary

Ship Phase 2 identity/personas on durable DeepSeek Harness + Electron seams already proven in P1: users edit each bot’s **job / voice / anti-jobs**, **rename** and set a **preset avatar marker**, organize bots into **sidebar sections** (with Unassigned/default), and **delete with confirm**. Saved persona fields **persist** and are **applied as bot instructions** on subsequent turns; Verifier Pass measures durable profile + overview visibility, **not** LLM reply adherence. Record an **ADR-only** agent-vs-user memory layers decision under `MzM-Docs/adr/` — **no** memory product UX. Prefer reuse of Agent Teams bot identity, `dsh-persona` / system-prompt instruction wiring, and Desktop Web client; no P3 skills or P5 memory productization.

## Technical Context

**Language/Version**: TypeScript (ESM), Node `^22.19 || >=24`, Electron Desktop packaging

**Primary Dependencies**: DeepSeek Harness Cordis plugins (`@deepseek-ai/dsh-*`), `apps/desktop` + `apps/desktop-host`, experimental Agent Teams (`createBot` / roster), `@deepseek-ai/dsh-persona` + `@deepseek-ai/dsh-system-prompt`, Web client under Desktop wrapper

**Storage**: Host-owned bot identity / Team roster (extend P1 Bot record); Host-durable sidebar section membership; persona fields durable with the bot; no memory store productization in P2

**Testing**: Vitest unit/behavior; Desktop Verifier scripted path for SC-001…SC-008; keyless snapshots where session/instruction-visible; Linear issues only after `taskstoissues`

**Target Platform**: Electron Desktop (Windows-first for Mohammed; mac/Linux as Verifier environment allows)

**Project Type**: desktop-app (Electron shell + Desktop Host runtime + Web client)

**Performance Goals**: No separate TTFT SLO for P2; reuse P1 operable-session baseline. Persona save → subsequent-turn instruction application must be deterministic at the wiring layer (FR-013 / SC-008).

**Constraints**:
- P2 In only: job/voice/anti-jobs; rename/avatar (preset markers); sidebar sections + Unassigned; delete-confirm; memory ADR only
- Out: P5 memory productization UX; P3 skills library; arbitrary image-file avatar upload; transcript/mailbox wipe as Pass gate
- Clarify locks (2026-09-27): instructions applied after save; Verifier does not gate LLM adherence; ADR under `MzM-Docs/adr/`; preset avatars; Unassigned allowed; delete Pass = identity removal only
- Host owns durable bot identity mutations; Electron Main stays thin (no parallel identity bus)
- Constitution v1.0.0 wedge-first; no north-star C scope creep beyond P2 In
- Do not rewrite `specs/001-multi-model-bots` — extend via new feature dir + contracts

**Scale/Scope**: Single primary user (Mohammed); identity surfaces for existing P1 bots; operable UI not Grok chrome parity

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Wedge-First A→C | PASS | P2 advances durable persona/identity seams toward C without throwaway UX; memory ADR only, no rewrite trap |
| II. Spec-Driven Delivery | PASS | Artifacts under `specs/002-identity-personas/`; Linear after tasks; living plan is scope lock, not tickets |
| III. Product Over Theater | PASS | Prioritizes editable persona, rename/avatar, sections, delete-confirm; defers skills/memory UX/chrome parity |
| IV. Verify Against Spec | PASS | SC-001…008 + contracts; Verifier gates Done; no silent P3/P5 absorption |
| V. Simplicity & Seam Honesty | PASS | Reuse Agent Teams bot identity, persona/system-prompt instruction seam, Desktop Web; no duplicate identity bus |
| Stack & Seam Constraints | PASS | DSH + Electron + Spec Kit + Linear (Cursor project); seams named in research / contracts |

**Post-design re-check:** PASS — research/data-model/contracts/quickstart introduce no P3/P5 product surfaces and no unjustified new top-level apps. Complexity Tracking empty.

## Project Structure

### Documentation (this feature)

```text
specs/002-identity-personas/
├── spec.md              # Clarified feature spec
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1 validation guide
├── contracts/           # Phase 1 interface contracts
│   ├── README.md
│   ├── persona-profile.md
│   ├── rename-avatar.md
│   ├── sidebar-sections.md
│   ├── delete-confirm.md
│   └── memory-layers-adr.md
├── checklists/          # From specify/clarify
├── tasks.md             # /speckit-tasks (PR #72)
└── analyze-report.md    # /speckit-analyze (this gate)
```

### Source Code (repository root) — touch targets for later implement

```text
apps/desktop/                          # Thin Electron shell (confirm dialogs may shell-host; no identity store)
apps/desktop-host/                     # Desktop Host child; Host RPC surface
packages/experimental/agent-team/      # Bot create/roster; extend identity fields + delete/rename mutations
packages/preset/persona/               # Per-agent persona row (instruction application seam)
packages/core/                         # Agent / system-prompt consumers as needed for instruction bind
# Web/client UI — identity/profile editor, overview anti-jobs, sidebar sections, delete confirm
MzM-Docs/adr/                          # New program ADR tree; agent-vs-user memory ADR file (implement)
```

**Structure Decision:** Extend the existing Desktop dual-process layout and P1 Agent Teams bot identity. No new top-level app. Sidebar section persistence stays Host-durable (exact store chosen in tasks within Host/settings seams). Memory work in P2 is documentation-only under `MzM-Docs/adr/`.

## Phase 0 — Research

See [research.md](./research.md). All Technical Context unknowns resolved. Clarify session 2026-09-27 locks honored.

## Phase 1 — Design

| Artifact | Path |
|----------|------|
| Data model | [data-model.md](./data-model.md) |
| Contracts | [contracts/](./contracts/) |
| Quickstart | [quickstart.md](./quickstart.md) |

### Capability → ownership → contract (plan matrix)

| Capability | Host (Runtime) | Electron / Client | Contract |
|------------|----------------|-------------------|----------|
| Job / voice / anti-jobs + instruction apply | Persist persona profile; bind into bot instructions via persona/system-prompt | Identity/profile editor + overview anti-jobs | [persona-profile.md](./contracts/persona-profile.md) |
| Rename + preset avatar | Persist displayName + avatar marker on bot identity | Sidebar + overview render | [rename-avatar.md](./contracts/rename-avatar.md) |
| Sidebar sections + Unassigned | Persist section names + membership | Sidebar grouping UI | [sidebar-sections.md](./contracts/sidebar-sections.md) |
| Delete with confirm | Remove bot from identity/roster/sections | Explicit confirm UI; cancel safe | [delete-confirm.md](./contracts/delete-confirm.md) |
| Memory layers ADR only | N/A (docs) | N/A (no memory UX) | [memory-layers-adr.md](./contracts/memory-layers-adr.md) |

### Locks honored (clarify 2026-09-27)

| Lock | Plan treatment |
|------|----------------|
| Persona fields applied as bot instructions; Verifier does not gate LLM adherence | R2 + persona-profile contract; SC-008 wiring check only |
| Memory ADR under `MzM-Docs/adr/`; filename identifies agent vs user memory | R6 + memory-layers-adr contract |
| Avatar = preset shape and/or color markers; no image upload for Pass | R3 + rename-avatar contract |
| Unassigned/default grouping allowed; named sections optional overlays | R4 + sidebar-sections contract |
| Delete Pass = sidebar/overview/section removal only; no transcript/mailbox wipe gate | R5 + delete-confirm contract |

### Implementation workstreams (for `/speckit-tasks` — not executed here)

1. **Runtime:** extend Host bot identity with persona profile, avatar marker, rename, delete; bind saved fields into instruction seam for subsequent turns.
2. **Client/Web:** identity/profile editor, bot overview anti-jobs, preset avatar picker, sidebar sections + Unassigned, delete confirm/cancel.
3. **Electron:** keep thin shell; host native confirm only if product chooses shell dialog — no identity store in Main.
4. **Docs:** land `MzM-Docs/adr/<agent-vs-user-memory-filename>.md` (FR-009 / SC-006); prove no memory product UX in P2 surfaces.
5. **Verifier:** scripted path covering create/use → rename → persona edit → avatar → section assign → overview anti-jobs → delete confirm/cancel/confirm (SC-001…008).

## Complexity Tracking

> No Constitution Check violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

## Open gaps (for Lead / follow-ons)

1. **Architect (optional before tasks fan-out):** Confirm Host store for sidebar sections (Team journal vs settings service) if Runtime wants a seam pick locked earlier than tasks.
2. **Runtime (tasks):** Exact mutation API names for rename / persona update / delete on Agent Teams (extend `createBot` surface; P1 had create only).
3. **Not gaps:** Clarify resolutions (Done MOH-92/93); P2 In/Out (living plan); ADR path (locked under `MzM-Docs/adr/`); Verifier gate issue (MOH-95).

## Ready for next command / Handoff

**`/speckit-analyze`** (this report) → **`/speckit-taskstoissues`** (Linear **DeepSeek Harness - Cursor** / MOH-88, T001–T042) → implement (Host foundations T005–T012 before US fan-out). See [tasks.md](./tasks.md) and [analyze-report.md](./analyze-report.md). Do not implement feature code from Spec Kit design commits. Leave MOH-98 In Progress until Verifier MOH-99 Pass and PO path.
