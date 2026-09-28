# Living next gate — MzM Bot

| Field | Value |
|-------|-------|
| **Updated** | 2026-09-28 |
| **Owner** | DH Lead |
| **Tracker** | DeepSeek Harness - Cursor (`P-MOH-2`) only |
| **Program plan** | [mzm-bot-plan.md](./mzm-bot-plan.md) |

## Status

**P1 (Wedge A)** — Done on `master` (epic [MOH-37](https://linear.app/momadhoun/issue/MOH-37/p1-wedge-a-per-bot-models-11-messaging-electron-ui)). Specs under `specs/001-multi-model-bots`.

**Deferred (non-blocking):** SC-005 live Desktop full Phase 1 replay — recipe present; `specs/001-multi-model-bots/verifier/evidence/scenario-5/VERDICT.txt` = Deferred (`LIVE_DESKTOP: Skipped`). Does **not** block later phases.

**P2 (Identity / personas)** — **Done.** Epic [MOH-88](https://linear.app/momadhoun/issue/MOH-88/p2-identity-personas) Done. Specs under `specs/002-identity-personas/`. Phase 2 product Verifier Pass merged as [#104](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/104). Memory layers ADR only (no product UX): [adr/agent-vs-user-memory-layers.md](./adr/agent-vs-user-memory-layers.md).

**P3 (Skills UX)** — **Done.** Epic [MOH-142](https://linear.app/momadhoun/issue/MOH-142/p3-skills-ux) Done (PO). Specs under `specs/003-skills-ux/`. Phase 3 product Verifier **Pass** merged as [#136](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/136) @ `337f25a964`.

**P4 (Routines — cron only)** — **Done.** Epic [MOH-188](https://linear.app/momadhoun/issue/MOH-188/p4-routines-cron-only) Done. Specs under `specs/004-routines-cron/`. SC-001…SC-005 Pass; product close merged as [#166](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/166) @ `aca0c2b7c5` (optional T026 canceled).

**P5 (Memory productization)** — **Done.** Epic [MOH-228](https://linear.app/momadhoun/issue/MOH-228/p5-memory-productization) Done. Specs under `specs/005-memory-productization/`. T001–T037 complete (MOH-262 Duplicate canceled); polish close merged as [#196](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/196) @ `16cafad98d`.

**P6 (Connectors / MCP + event routines + trust)** — **Done** on `master`. Epic [MOH-281](https://linear.app/momadhoun/issue/MOH-281/p6-connectors-mcp-event-routines-trust) Done. Specs under `specs/006-connectors-mcp-events-trust/`. T001–T040 complete; US1–US5 Verifier Pass (SO 11+12); SC-006 full replay Pass [#225](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/225) @ `b7052eddd2`. Prior living hold [MOH-349](https://linear.app/momadhoun/issue/MOH-349/p6-living-next-gate-p7-hold) Done.

**P7 (Computer / box + subagent parity + settings chrome)** — **Current / implement · Polish T028–T035 in progress.** Epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350/p7-computer-box-subagent-parity-settings-chrome) In Progress on DeepSeek Harness - Cursor (`P-MOH-2`). Specify–analyze Done (#228→#236 @ `6fa18cfcfe`). **Setup T001–T006 Done** — parent [MOH-356](https://linear.app/momadhoun/issue/MOH-356/p7-setup-t001-t006-inventories-verifier-recipe-home) Done; PRs [#237](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/237)–[#241](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/241) @ `c202083e91`. **Foundational T007–T015 Done** — T007–T012 [#243](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/243) @ `742b8bf3f6`; T013–T014 [#244](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/244) @ `47cd9dd45f`; **T015 stamp Pass** [#245](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/245) @ `fbe2ec21d8` **unlocked US**. **US1 SC-001 Done** — T016–T019 + desktop evidence [#246](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/246)–[#250](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/250) @ `17d2b3efe3`. **US2 SC-002 Done** — T020–T023 + desktop evidence [#251](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/251)–[#255](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/255) @ `ce02df7a09`. **US3 SC-003 Done** — T024–T027 + desktop evidence [#256](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/256)–[#260](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/260) @ `2042cb0e60`. Specs under `specs/007-box-subagent-settings/`. Linear T001–T035 children via `taskstoissues` only (do **not** invent MOH-* ids).

## Next gate

**Implement — Polish T028–T035 in progress** under epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350/p7-computer-box-subagent-parity-settings-chrome). Plan home: [mzm-bot-plan.md](./mzm-bot-plan.md) §4 P7. Tasks: `specs/007-box-subagent-settings/tasks.md`.

- **Setup Done** — T001–T006 inventories + Verifier recipe home + seam locks on `master` @ `c202083e91` ([MOH-356](https://linear.app/momadhoun/issue/MOH-356/p7-setup-t001-t006-inventories-verifier-recipe-home) Done; PRs #237–#241).
- **Foundational Done** — T007–T015 on `master`. T007–T012 [#243](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/243) @ `742b8bf3f6`; T013–T014 [#244](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/244) @ `47cd9dd45f`; T015 checklist stamp Pass [#245](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/245) @ `fbe2ec21d8` (Verifier README foundational Pass; [MOH-371](https://linear.app/momadhoun/issue/MOH-371)).
- **US1 Done** — T016–T019 + **SC-001 Pass** desktop evidence [#250](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/250) @ `17d2b3efe3` (SO 11+12 under `verifier/evidence/shell-box/`).
- **US2 Done** — T020–T023 + **SC-002 Pass** desktop evidence [#255](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/255) @ `ce02df7a09` (SO 11+12 under `verifier/evidence/computer-use/`).
- **US3 Done** — T024–T027 + **SC-003 Pass** desktop evidence [#260](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/260) @ `2042cb0e60` (SO 11+12 under `verifier/evidence/settings/`; chrome ≠ SC-001/SC-002 per SC-004 / FR-005). **Polish unlocked.**
- **Polish now** — T028–T035 (non-goals recipe; evidence placeholders; SC-006 full replay; quickstart/recipe map; no-Electron bus reconfirm; no specs/001–006 rewrite; Pass-path language; Linear tracking note). Active slice.
- **Scope lock (plan In):** Box/Shell backends; computerUse-class subagents; settings/chrome polish toward Grok-easy.
- **Clarify + plan + tasks + analyze locks:** Global Settings → **Computer**; rows **Shell** + **Computer use**; computerUse Pass = screenshot-only (or equiv.) + parent handoff; Box readiness = clear not-ready/starting ≠ ready; Path A seams; evidence slices `verifier/evidence/shell-box/`, `computer-use/`, `settings/`.
- **Out:** Treating “Verifier” as a P7 feature — Verifier already gates every phase. Inventory items listed as program Out until a later named phase amends the plan (voice, draft-first send-on-behalf, group channels, user machines, learn-from-demo, billing chrome, full skill pack, pixel Grok).
- **Exit (Verifier-provable):** one local Shell/box tool path proven; one computerUse-class subagent path proven; settings rows required for those daily paths present (chrome polish ≠ Verifier substitute).
- **SO 11+12** — GUI recipes need desktop screenshots/recordings committed under `verifier/evidence/` + PR embeds.
- Lead does **not** invent a second P7 epic or child T### / MOH-* ids. This living update is docs only — **no product code**.

## Phase 7 active (implement · Polish)

1. **DH Verifier / DH Spec** — **Go** on Polish T028 (non-goals recipe SC-005), T029 (evidence placeholders SO 11+12), T030 (Scenario 5 full replay SC-006), T031 (quickstart ↔ recipe map).
2. **DH Electron** — **Go** on Polish T032 (reconfirm no-Electron box/Shell/computerUse bus still green).
3. **DH Spec** — **Go** on Polish T033 (no rewrite of specs/001–006), T034 (Pass-path language), T035 (Linear taskstoissues tracking note).
4. **DH Lead** — This living gate; Status / Next gate / Owners; no feature code; epic MOH-350 bound.
5. **PO** — Orchestration under MOH-350; ship/no-ship on phase exit; no second epic; spawn Polish owners; final Verifier composite after Polish.
6. **DH Architect** — Idle unless Path A / non-goals seam question.
7. **DH Client / Web** — Idle (US3 T024–T025 Done on master).
8. **DH Runtime** — Idle (US3 T026 Done on master) unless T034 Pass-path docs need Host touch.

### Setup (T001–T006) — **Done**

| Task | Owner | Outcome |
|------|-------|---------|
| T001 Confirm design tree | DH Spec | Done — [#241](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/241) |
| T002 Host Shell/box inventory | DH Runtime | Done — [#240](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/240) |
| T003 computerUse inventory | DH Runtime | Done — [#240](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/240) |
| T004 Settings/Computer inventory | DH Electron | Done — [#239](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/239) |
| T005 Seam locks doc | DH Spec | Done — [#241](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/241) |
| T006 Verifier recipe README | DH Verifier / Spec | Done — [#237](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/237) |

Parent [MOH-356](https://linear.app/momadhoun/issue/MOH-356/p7-setup-t001-t006-inventories-verifier-recipe-home) **Done** on `master` @ `c202083e91`.

### Foundational (T007–T015) — **Done · US unlocked**

| Task | Owner | Outcome |
|------|-------|---------|
| T007 BoxBackend readiness SoT | DH Runtime | Done — [#243](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/243) @ `742b8bf3f6` |
| T008 Mount sandboxed Shell Pass path | DH Runtime | Done — [#243](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/243) @ `742b8bf3f6` |
| T009 computerUse registry + Pass slot | DH Runtime | Done — [#243](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/243) @ `742b8bf3f6` |
| T010 Subagent spawn-in-process | DH Runtime | Done — [#243](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/243) @ `742b8bf3f6` |
| T011 Computer settings document fields | DH Runtime | Done — [#243](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/243) @ `742b8bf3f6` |
| T012 Host HTTP/WS Remotes | DH Runtime | Done — [#243](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/243) @ `742b8bf3f6` |
| T013 host-protocol exclusions | DH Electron | Done — [#244](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/244) @ `47cd9dd45f` |
| T014 no-Electron bus guard | DH Electron | Done — [#244](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/244) @ `47cd9dd45f` |
| T015 Foundational checklist stamp | DH Spec / DH Verifier | Done — Pass [#245](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/245) @ `fbe2ec21d8` — **unlocked US** |

**T015 Pass on master unlocks US1–US3.** Active living gate = **Polish only**.

### US1 (T016–T019) — **Done · SC-001 Pass**

| Task | Owner | Outcome |
|------|-------|---------|
| T016 Host Shell/box success path | DH Runtime | Done — [#246](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/246) |
| T017 Host not-ready / starting / failed path | DH Runtime | Done — [#246](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/246) |
| T018 Client Shell/box indicators | DH Client / Web | Done — [#248](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/248) |
| T019 Scenario 1 Verifier recipe | DH Verifier | Done — [#249](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/249); **SC-001 Pass** evidence [#250](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/250) @ `17d2b3efe3` |

**Checkpoint:** US1 Shell/box path works independently with Verifier recipe + desktop evidence — **held**. SC-001 Pass unlocked US2.

### US2 (T020–T023) — **Done · SC-002 Pass**

| Task | Owner | Outcome |
|------|-------|---------|
| T020 Host computerUse Pass provider | DH Runtime | Done — [#251](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/251) @ `d904c36f63` |
| T021 Host computerUse-class subagent path | DH Runtime | Done — [#251](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/251) @ `d904c36f63` |
| T022 Client screenshot + handoff projection | DH Client / Web | Done — [#254](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/254) @ `c85ed4c804` |
| T023 Scenario 2 Verifier recipe | DH Verifier | Done — [#252](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/252) @ `33e1f29ac7`; **SC-002 Pass** evidence [#255](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/255) @ `ce02df7a09` |

**Checkpoint:** US2 computerUse-class path independently testable with Verifier recipe + desktop evidence — **held**. SC-002 Pass unlocked US3.

### US3 (T024–T027) — **Done · SC-003 Pass**

| Task | Owner | Outcome |
|------|-------|---------|
| T024 Client Global Settings → Computer section | DH Client / Web | Done — [#257](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/257) @ `0d3af3453b` ([MOH-380](https://linear.app/momadhoun/issue/MOH-380)) |
| T025 Client Shell + Computer use rows | DH Client / Web | Done — [#257](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/257) @ `0d3af3453b` ([MOH-381](https://linear.app/momadhoun/issue/MOH-381)) |
| T026 Host Computer settings projection | DH Runtime | Done — [#256](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/256) @ `2d2e8a275e` ([MOH-382](https://linear.app/momadhoun/issue/MOH-382)) |
| T027 Scenario 3 Verifier recipe | DH Verifier | Done — [#258](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/258) @ `99e46a102f`; **SC-003 Pass** evidence [#260](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/260) @ `2042cb0e60` ([MOH-383](https://linear.app/momadhoun/issue/MOH-383)) |

**Checkpoint:** US3 settings rows independently testable; SC-004 coupling explicit (chrome ≠ SC-001/SC-002). SC-003 Pass unlocked Polish.

### Polish (T028–T035) — **in progress**

| Task | Owner | Outcome |
|------|-------|---------|
| T028 Verifier non-goals recipe (SC-005) | **DH Verifier / DH Spec** | `verifier/non-goals.md` — no user machines / voice / draft-first / group / learn-from-demo / billing / full skill pack / pixel Grok; no Verifier-as-feature; no rewrite 001–006; no interactive-browser Pass; no PTC/remote-as-Shell; **no Electron box/Shell/computerUse bus** ([MOH-384](https://linear.app/momadhoun/issue/MOH-384)) |
| T029 Evidence dir placeholders + SO 11+12 | **DH Verifier** | Placeholders + README under `verifier/evidence/{shell-box,computer-use,settings}/` ([MOH-385](https://linear.app/momadhoun/issue/MOH-385)) |
| T030 Scenario 5 full replay (SC-006) | **DH Verifier** | `verifier/scenario-5-full-replay.md` — Scenarios 1–4 + foundational; GUI evidence mandatory ([MOH-386](https://linear.app/momadhoun/issue/MOH-386)) |
| T031 Re-validate quickstart ↔ recipe map | **DH Spec / DH Verifier** | `quickstart.md` + `verifier/README.md` owners + evidence paths ([MOH-387](https://linear.app/momadhoun/issue/MOH-387)) |
| T032 Confirm no-Electron bus still green | **DH Electron** | `no-electron-box-shell-computer-bus.spec.ts` + `host-protocol.ts` exclusions ([MOH-388](https://linear.app/momadhoun/issue/MOH-388)) |
| T033 Confirm no rewrite of specs/001–006 | **DH Spec** | Document FR-009 check in `verifier/README.md` ([MOH-389](https://linear.app/momadhoun/issue/MOH-389)) |
| T034 Pass-path language (no Main/Client SoT myths) | **DH Spec / implementers** | No “Electron Main store,” “Client-only SoT,” “interactive-browser required,” “PTC-as-Shell Pass,” “per-agent gear alone,” or “settings chrome = Done” ([MOH-390](https://linear.app/momadhoun/issue/MOH-390)) |
| T035 Linear taskstoissues tracking note | **DH Spec** | Epic MOH-350 / tasks MOH-354; children via `taskstoissues` only; P-MOH-2 ([MOH-391](https://linear.app/momadhoun/issue/MOH-391)) |

**Checkpoint:** Polish = absence + evidence layout + SC-006 full replay; no new product scope. Final Verifier composite after T028–T035.

## Owners / next

| Role | Action |
|------|--------|
| **DH Verifier** | **Go** — Polish T028–T031 (non-goals, evidence placeholders, SC-006 replay, recipe map) |
| **DH Spec** | **Go** — Polish T028/T031/T033–T035 |
| **DH Electron** | **Go** — Polish T032 no-Electron bus reconfirm |
| **DH Client / Web** | Idle (US3 Done) |
| **DH Runtime** | Idle (US3 Done) unless T034 Host docs |
| **DH Lead** | This living gate; epic MOH-350; no feature code |
| **PO Assistant** | Orchestration under MOH-350; spawn Polish; no second epic invent; final composite after Polish |
| **DH Architect** | Idle unless Path A / non-goals clarification |
| **US product owners** | Idle at this living gate |

## Blockers

None for Polish start. P7 epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350/p7-computer-box-subagent-parity-settings-chrome) In Progress; Setup [MOH-356](https://linear.app/momadhoun/issue/MOH-356/p7-setup-t001-t006-inventories-verifier-recipe-home) **Done**; Foundational T007–T015 **Done**; **US1 SC-001 Done** [#250](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/250) @ `17d2b3efe3`; **US2 SC-002 Done** [#255](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/255) @ `ce02df7a09`; **US3 SC-003 Done** [#260](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/260) @ `2042cb0e60` **unlocked Polish**. Active slice: **Polish T028–T035**.
