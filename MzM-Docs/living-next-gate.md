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

**P7 (Computer / box + subagent parity + settings chrome)** — **Current / implement · US3 T024–T027 in progress.** Epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350/p7-computer-box-subagent-parity-settings-chrome) In Progress on DeepSeek Harness - Cursor (`P-MOH-2`). Specify–analyze Done (#228→#236 @ `6fa18cfcfe`). **Setup T001–T006 Done** — parent [MOH-356](https://linear.app/momadhoun/issue/MOH-356/p7-setup-t001-t006-inventories-verifier-recipe-home) Done; PRs [#237](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/237)–[#241](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/241) @ `c202083e91`. **Foundational T007–T015 Done** — T007–T012 [#243](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/243) @ `742b8bf3f6`; T013–T014 [#244](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/244) @ `47cd9dd45f`; **T015 stamp Pass** [#245](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/245) @ `fbe2ec21d8` **unlocked US**. **US1 SC-001 Done** — T016–T019 + desktop evidence [#246](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/246)–[#250](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/250) @ `17d2b3efe3`. **US2 SC-002 Done** — T020–T023 + desktop evidence [#251](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/251)–[#255](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/255) @ `ce02df7a09`. Specs under `specs/007-box-subagent-settings/`. Linear T001–T035 children via `taskstoissues` only (do **not** invent MOH-* ids).

## Next gate

**Implement — US3 T024–T027 in progress** under epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350/p7-computer-box-subagent-parity-settings-chrome). Plan home: [mzm-bot-plan.md](./mzm-bot-plan.md) §4 P7. Tasks: `specs/007-box-subagent-settings/tasks.md`.

- **Setup Done** — T001–T006 inventories + Verifier recipe home + seam locks on `master` @ `c202083e91` ([MOH-356](https://linear.app/momadhoun/issue/MOH-356/p7-setup-t001-t006-inventories-verifier-recipe-home) Done; PRs #237–#241).
- **Foundational Done** — T007–T015 on `master`. T007–T012 [#243](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/243) @ `742b8bf3f6`; T013–T014 [#244](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/244) @ `47cd9dd45f`; T015 checklist stamp Pass [#245](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/245) @ `fbe2ec21d8` (Verifier README foundational Pass; [MOH-371](https://linear.app/momadhoun/issue/MOH-371)).
- **US1 Done** — T016–T019 + **SC-001 Pass** desktop evidence [#250](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/250) @ `17d2b3efe3` (SO 11+12 under `verifier/evidence/shell-box/`).
- **US2 Done** — T020–T023 + **SC-002 Pass** desktop evidence [#255](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/255) @ `ce02df7a09` (SO 11+12 under `verifier/evidence/computer-use/`). **US3 unlocked.**
- **US3 now** — T024–T027 (Settings → Computer section + Shell / Computer use rows + Host projection + Scenario 3 recipe). Active product slice.
- **Polish held** — T028+ stays idle until US3 SC-003/SC-004 Pass (chrome ≠ substitute for SC-001/SC-002).
- **Scope lock (plan In):** Box/Shell backends; computerUse-class subagents; settings/chrome polish toward Grok-easy.
- **Clarify + plan + tasks + analyze locks:** Global Settings → **Computer**; rows **Shell** + **Computer use**; computerUse Pass = screenshot-only (or equiv.) + parent handoff; Box readiness = clear not-ready/starting ≠ ready; Path A seams; evidence slices `verifier/evidence/shell-box/`, `computer-use/`, `settings/`.
- **Out:** Treating “Verifier” as a P7 feature — Verifier already gates every phase. Inventory items listed as program Out until a later named phase amends the plan (voice, draft-first send-on-behalf, group channels, user machines, learn-from-demo, billing chrome, full skill pack, pixel Grok).
- **Exit (Verifier-provable):** one local Shell/box tool path proven; one computerUse-class subagent path proven; settings rows required for those daily paths present (chrome polish ≠ Verifier substitute).
- **SO 11+12** — GUI recipes need desktop screenshots/recordings committed under `verifier/evidence/` + PR embeds.
- Lead does **not** invent a second P7 epic or child T### / MOH-* ids. This living update is docs only — **no product code**.

## Phase 7 active (implement · US3)

1. **DH Client / Web** — **Go** on US3 T024–T025 (Global Settings → **Computer** section; locale-owned **Shell** + **Computer use** rows; Host HTTP/WS Remotes only).
2. **DH Runtime** — **Go** on US3 T026 (Host settings projection for Computer-section fields via authenticated Remotes; no Electron Main Computer-settings SoT).
3. **DH Verifier** — **Go** on US3 T027 (Scenario 3 recipe + SC-003/SC-004; `verifier/evidence/settings/` SO 11+12).
4. **DH Lead** — This living gate; Status / Next gate / Owners; no feature code; epic MOH-350 bound.
5. **PO** — Orchestration under MOH-350; ship/no-ship on later gates; no second epic; spawn US3 owners; Polish held.
6. **DH Architect** — Idle unless Path A / settings Remotes need clarification.
7. **DH Electron** — Idle (Foundational T013–T014 already on master; no Main Computer-settings SoT).
8. **Polish** — **Held** at this living gate until US3 SC-003/SC-004 Pass.

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

**T015 Pass on master unlocks US1–US3.** Active living gate = **US3 only**.

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

### US3 (T024–T027) — **in progress**

| Task | Owner | Outcome |
|------|-------|---------|
| T024 Client Global Settings → Computer section | **DH Client / Web** | Locale-owned `settings.section` **Computer**; wire Desktop Client profile ([MOH-380](https://linear.app/momadhoun/issue/MOH-380)) |
| T025 Client Shell + Computer use rows | **DH Client / Web** | Rows under Settings → Computer via Host HTTP/WS; per-agent gear alone ≠ FR-016 ([MOH-381](https://linear.app/momadhoun/issue/MOH-381)) |
| T026 Host Computer settings projection | **DH Runtime** | Authenticated Remotes for Shell readiness + Computer use config; no Main SoT ([MOH-382](https://linear.app/momadhoun/issue/MOH-382)) |
| T027 Scenario 3 Verifier recipe | **DH Verifier** | SC-003 both rows + SC-004 chrome ≠ substitute; evidence under `verifier/evidence/settings/` ([MOH-383](https://linear.app/momadhoun/issue/MOH-383)) |

**Checkpoint:** US3 settings rows independently testable; SC-004 coupling explicit in Scenario 3 recipe.

## Owners / next

| Role | Action |
|------|--------|
| **DH Client / Web** | **Go** — US3 T024–T025 |
| **DH Runtime** | **Go** — US3 T026 |
| **DH Verifier** | **Go** — US3 T027 Scenario 3 + settings evidence |
| **DH Spec** | Idle unless US3 acceptance wording needs Spec Kit touch |
| **DH Electron** | Idle (Foundational T013–T014 Done; no Main Computer-settings SoT) |
| **DH Lead** | This living gate; epic MOH-350; no feature code |
| **PO Assistant** | Orchestration under MOH-350; spawn US3; no second epic invent; Polish held until US3 Pass |
| **DH Architect** | Idle unless Path A / settings Remotes clarification |
| **Polish owners** | Idle at this living gate |

## Blockers

None for US3 start. P7 epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350/p7-computer-box-subagent-parity-settings-chrome) In Progress; Setup [MOH-356](https://linear.app/momadhoun/issue/MOH-356/p7-setup-t001-t006-inventories-verifier-recipe-home) **Done**; Foundational T007–T015 **Done**; **US1 SC-001 Done** [#250](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/250) @ `17d2b3efe3`; **US2 SC-002 Done** [#255](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/255) @ `ce02df7a09` **unlocked US3**. Active slice: **US3 T024–T027**. Polish held.
