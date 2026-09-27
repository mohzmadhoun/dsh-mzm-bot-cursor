# Implementation Plan: Phase 3 — Skills UX

**Branch**: `cursor/p3-plan-fe1d` | **Date**: 2026-09-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-skills-ux/spec.md` (Status: Clarified)

**Linear**: Epic [MOH-142](https://linear.app/momadhoun/issue/MOH-142/p3-skills-ux) · Plan issue [MOH-145](https://linear.app/momadhoun/issue/MOH-145/p3-spec-kit-plan-skills-ux) · Project **DeepSeek Harness - Cursor** only

**Note**: Filled by `/speckit-plan`. Do **not** create `tasks.md` in this command. Do **not** rewrite FRs in `specs/001-multi-model-bots` or `specs/002-identity-personas`. Do **not** edit `MzM-Docs/living-next-gate.md` from Spec. Architect not spawned — seams named from existing skill family + Agent Teams / Desktop Host.

## Summary

Ship Phase 3 Skills UX on durable DeepSeek Harness skill seams already present in-repo: users **discover** a **thin managed pack** (exactly **one** managed skill for Pass), **load** (make available to attach), **attach/run** skills **per bot**, and **author** one reusable user skill (non-empty name + body; reject empty). Attached skill instructional content is **applied as bot instructions** on subsequent turns; Verifier Pass measures discover/load, attach/run UI, authoring, and **desktop screenshots/recordings** (FR-012 / standing order 11) — **not** LLM reply adherence. Prefer reuse of `packages/skill/` (`ctx.skills`, filesystem provider, tool-skill catalog), Host identity/Agent Teams attachment store, and Desktop Web client; no full managed catalog, learn-from-demonstration, or plugin skills.

## Technical Context

**Language/Version**: TypeScript (ESM), Node `^22.19 || >=24`, Electron Desktop packaging

**Primary Dependencies**: DeepSeek Harness Cordis plugins (`@deepseek-ai/dsh-*`), `apps/desktop` + `apps/desktop-host`, skill family (`dsh-skill`, `dsh-skill-filesystem`, `dsh-tool-skill`, optional badge/office), experimental Agent Teams bot identity (P1/P2), Web client under Desktop wrapper, session-controller skills list Remote where useful

**Storage**: Host-owned skill catalog projections; Host-durable **user-authored** skills; Host-durable **per-bot skill attachments**; thin pack = one platform-shipped managed skill on Desktop profile; no plugin-skill store in P3

**Testing**: Vitest unit/behavior; Desktop Verifier scripted path for SC-001…SC-007 with **FR-012 visual evidence**; keyless snapshots where skill/instruction-visible; Linear issues only after `taskstoissues`

**Target Platform**: Electron Desktop (Windows-first for Mohammed; mac/Linux as Verifier environment allows)

**Project Type**: desktop-app (Electron shell + Desktop Host runtime + Web client)

**Performance Goals**: No separate TTFT SLO for P3; reuse P1 operable-session baseline. Attach → subsequent-turn instruction application must be deterministic at the wiring layer (FR-014 / SC-007).

**Constraints**:
- P3 In only: load/discover + authoring; thin managed pack; attach/run on a bot
- Out: full managed catalog parity; learn-from-demonstration; plugin/connector skills (P6); memory UX; routines; MCP; Box/Shell
- Clarify locks (2026-09-27): reject empty author fields; load = available-to-attach; multi-attach allowed; run = control or session UI; instruction apply after attach; Verifier does not gate LLM adherence
- **Thin pack membership (plan lock):** exactly **one** managed skill required for Verifier Pass (≥1 satisfied by one); not inventory §6
- Host owns durable skill + attachment mutations; Electron Main stays thin (no parallel skill bus)
- FR-012 / standing order 11 mandatory for GUI scenarios
- Constitution v1.0.0 wedge-first; no north-star C scope creep beyond P3 In
- Do not rewrite `specs/001-*` / `specs/002-*` — extend via this feature dir + contracts

**Scale/Scope**: Single primary user (Mohammed); skills surfaces for existing P1/P2 bots; operable UI not Grok chrome parity

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Wedge-First A→C | PASS | P3 advances durable skills seams toward C; thin pack only; no throwaway catalog theater |
| II. Spec-Driven Delivery | PASS | Artifacts under `specs/003-skills-ux/`; Linear after tasks; living plan is scope lock, not tickets |
| III. Product Over Theater | PASS | Prioritizes discover/load, attach/run, one authoring path; defers full catalog / learn-from-demo / plugins |
| IV. Verify Against Spec | PASS | SC-001…007 + contracts + FR-012 desktop evidence; Verifier gates Done; no silent P4–P7 absorption |
| V. Simplicity & Seam Honesty | PASS | Reuse `packages/skill/` registry/providers/tool-skill + Host bot identity; no duplicate skill bus in Electron Main |
| Stack & Seam Constraints | PASS | DSH + Electron + Spec Kit + Linear (Cursor project); seams named in research / contracts |

**Post-design re-check:** PASS — research/data-model/contracts/quickstart introduce no P4–P7 product surfaces and no unjustified new top-level apps. Complexity Tracking empty. Architect not required for this plan (optional confirm during tasks if Runtime wants store pick locked earlier).

## Project Structure

### Documentation (this feature)

```text
specs/003-skills-ux/
├── spec.md              # Clarified feature spec
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1 validation guide
├── contracts/           # Phase 1 interface contracts
│   ├── README.md
│   ├── discover-load.md
│   ├── attach-run.md
│   ├── skill-authoring.md
│   └── thin-managed-pack.md
├── checklists/          # From specify/clarify
└── tasks.md             # /speckit-tasks — NOT created by this plan command
```

### Source Code (repository root) — touch targets for later implement

```text
apps/desktop/                          # Thin Electron shell; no skill store in Main
apps/desktop-host/                     # Desktop Host child; Host RPC / profile skills mount
packages/skill/                        # ctx.skills registry, filesystem provider, tool-skill catalog
packages/experimental/agent-team/      # Per-bot attachment association on bot identity (extend)
packages/preset/persona/               # Instruction application seam (compose attached skill text)
packages/api/session-controller/       # skills/list Remote reuse where Client discovery fits
# Web/client UI — skills discovery/library, authoring, per-bot attach/run surfaces
```

**Structure Decision:** Extend existing Desktop dual-process layout, P1/P2 bot identity, and the skill capability family. No new top-level app. Thin pack ships as one managed skill on the Desktop Host profile (filesystem or badge-class provider). User-authored skills persist Host-durably under a user skill root. Attachments persist on the bot identity record (or Host equivalent). Exact package/file paths finalized in tasks within these seams.

## Phase 0 — Research

See [research.md](./research.md). All Technical Context unknowns resolved. Clarify session 2026-09-27 locks honored. **Thin pack membership locked** (R1).

## Phase 1 — Design

| Artifact | Path |
|----------|------|
| Data model | [data-model.md](./data-model.md) |
| Contracts | [contracts/](./contracts/) |
| Quickstart | [quickstart.md](./quickstart.md) |

### Capability → ownership → contract (plan matrix)

| Capability | Host (Runtime) | Electron / Client | Contract |
|------------|----------------|-------------------|----------|
| Discover / load | Mount thin pack + user skills on `ctx.skills`; project catalog | Skills discovery/library UI; select-for-attach = load | [discover-load.md](./contracts/discover-load.md) |
| Attach / run + instruction apply | Persist per-bot attachments; bind into instructions; run/active projection | Per-bot skills surface; run control and/or session active UI | [attach-run.md](./contracts/attach-run.md) |
| Author skill | Persist user-authored skills; reject empty name/body | Authoring create/edit UI | [skill-authoring.md](./contracts/skill-authoring.md) |
| Thin managed pack | Ship exactly one managed skill for Pass | List that skill in discovery | [thin-managed-pack.md](./contracts/thin-managed-pack.md) |

### Locks honored (clarify 2026-09-27 + plan thin pack)

| Lock | Plan treatment |
|------|----------------|
| Reject empty author name/body | R3 + skill-authoring contract; FR-013 / SC-003 |
| Load = available-to-attach; no separate ritual required | R2 + discover-load contract |
| Multi-attach allowed; Pass ≥1 | R4 + attach-run + data-model |
| Run = dedicated control OR session application with UI run/active; no LLM adherence | R5 + attach-run; SC-002 |
| Attached skill text applied as instructions; Verifier UI-not-LLM | R6 + attach-run; FR-014 / SC-007 |
| Thin pack = one managed skill for Pass; membership deferred from clarify → **resolved here** | R1 + thin-managed-pack contract |
| FR-012 desktop screenshots/recordings | All GUI contracts + quickstart; standing order 11 kept |

### Implementation workstreams (for `/speckit-tasks` — not executed here)

1. **Runtime:** ship one thin-pack managed skill; user-authored skill CRUD (reject empty); per-bot attach persist; instruction bind for attached skills; run/active observability hooks.
2. **Client/Web:** discovery/library, authoring surface, per-bot attach UI, run/active indication; FR-012 evidence hooks for Verifier.
3. **Electron:** keep thin shell; no skill store in Main.
4. **Verifier:** scripted path covering discover/load → attach/run → author (empty reject + happy path) with desktop screenshots/recordings under `verifier/evidence/` (SC-001…007).

## Complexity Tracking

> No Constitution Check violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

## Open gaps (for Lead / follow-ons)

1. **Runtime (tasks):** Exact technical id / filesystem path for the single thin-pack managed skill (product display name must be human-readable in discovery).
2. **Runtime (tasks):** Exact Host store for user-authored skills and per-bot attachment lists within existing Host / Agent Teams / skill-filesystem seams.
3. **Architect (optional):** Confirm attachment field lives on bot identity vs separate Host skills-attachment service — Spec prefers bot-identity extension (R4); Architect confirm only if Runtime disagrees.
4. **Not gaps:** Clarify resolutions (Done MOH-144 / #107); thin pack count (locked = 1); FR-012; P3 In/Out.

## Ready for next command

After Verifier Pass on this plan: `/speckit-tasks` (creates `tasks.md`) → analyze → `taskstoissues` under epic MOH-142 on **DeepSeek Harness - Cursor**. Do **not** invent Linear implement tickets from this plan. Do **not** start implement until tasks + Verifier gates say so.
