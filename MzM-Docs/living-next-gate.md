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

**P7 (Computer / box + subagent parity + settings chrome)** — **Current / implement · US1 T016–T019 in progress.** Epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350/p7-computer-box-subagent-parity-settings-chrome) In Progress on DeepSeek Harness - Cursor (`P-MOH-2`). Specify–analyze Done (#228→#236 @ `6fa18cfcfe`). **Setup T001–T006 Done** — parent [MOH-356](https://linear.app/momadhoun/issue/MOH-356/p7-setup-t001-t006-inventories-verifier-recipe-home) Done; PRs [#237](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/237)–[#241](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/241) @ `c202083e91`. **Foundational T007–T015 Done** — T007–T012 [#243](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/243) @ `742b8bf3f6`; T013–T014 [#244](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/244) @ `47cd9dd45f`; **T015 stamp Pass** [#245](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/245) @ `fbe2ec21d8` **unlocked US**. Specs under `specs/007-box-subagent-settings/`. Linear T001–T035 children via `taskstoissues` only (do **not** invent MOH-* ids).

## Next gate

**Implement — US1 T016–T019 in progress** under epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350/p7-computer-box-subagent-parity-settings-chrome). Plan home: [mzm-bot-plan.md](./mzm-bot-plan.md) §4 P7. Tasks: `specs/007-box-subagent-settings/tasks.md`.

- **Setup Done** — T001–T006 inventories + Verifier recipe home + seam locks on `master` @ `c202083e91` ([MOH-356](https://linear.app/momadhoun/issue/MOH-356/p7-setup-t001-t006-inventories-verifier-recipe-home) Done; PRs #237–#241).
- **Foundational Done** — T007–T015 on `master`. T007–T012 [#243](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/243) @ `742b8bf3f6`; T013–T014 [#244](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/244) @ `47cd9dd45f`; T015 checklist stamp Pass [#245](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/245) @ `fbe2ec21d8` (Verifier README foundational Pass; [MOH-371](https://linear.app/momadhoun/issue/MOH-371)).
- **US1 now** — T016–T019 (local Shell/box success + not-ready paths + Client projection + Scenario 1 recipe). **T015 unlocked US**; US1 is the active product slice.
- **No US2+ fan-out** until US1 checkpoint holds (or owners explicitly parallelize after Foundational per tasks.md — Lead gate stays US1-only until PO says otherwise).
- **Scope lock (plan In):** Box/Shell backends; computerUse-class subagents; settings/chrome polish toward Grok-easy.
- **Clarify + plan + tasks + analyze locks:** Global Settings → **Computer**; rows **Shell** + **Computer use**; computerUse Pass = screenshot-only (or equiv.) + parent handoff; Box readiness = clear not-ready/starting ≠ ready; Path A seams; evidence slices `verifier/evidence/shell-box/`, `computer-use/`, `settings/`.
- **Out:** Treating “Verifier” as a P7 feature — Verifier already gates every phase. Inventory items listed as program Out until a later named phase amends the plan (voice, draft-first send-on-behalf, group channels, user machines, learn-from-demo, billing chrome, full skill pack, pixel Grok).
- **Exit (Verifier-provable):** one local Shell/box tool path proven; one computerUse-class subagent path proven; settings rows required for those daily paths present (chrome polish ≠ Verifier substitute).
- **SO 11+12** — GUI recipes need desktop screenshots/recordings committed under `verifier/evidence/` + PR embeds.
- Lead does **not** invent a second P7 epic or child T### / MOH-* ids. This living update is docs only — **no product code**.

## Phase 7 active (implement · US1)

1. **DH Runtime** — **Go** on US1 T016–T017 (Shell/box success path; not-ready/starting/failed projection).
2. **DH Client / Web** — **Go** on US1 T018 (Client projects Shell/box success + not-ready via Host HTTP/WS; locale-owned copy).
3. **DH Verifier** — **Go** on US1 T019 (Scenario 1 recipe + `verifier/evidence/shell-box/` SO 11+12).
4. **DH Lead** — This living gate; Status / Next gate / Owners; no feature code; epic MOH-350 bound.
5. **PO** — Orchestration under MOH-350; ship/no-ship on later gates; no second epic; spawn US1 owners.
6. **DH Architect** — Idle unless Path A seam question.
7. **DH Electron** — Idle unless US1 needs Shell protocol clarification (Foundational T013–T014 already on master).
8. **US2–US3** — **Held** at this living gate (Foundational unlocked them; Lead keeps focus on US1 T016–T019).

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

**T015 Pass on master unlocks US1–US3.** Active living gate = **US1 only**.

### US1 (T016–T019) — **in progress**

| Task | Owner | Outcome |
|------|-------|---------|
| T016 Host Shell/box success path | **DH Runtime** | `ready` → local sandboxed Shell success + session-logged outcome |
| T017 Host not-ready / starting / failed path | **DH Runtime** | Not-ready ≠ SC-001 Pass; distinguishable projection |
| T018 Client Shell/box indicators | **DH Client / Web** | Host HTTP/WS tool card / conversation surface; locale-owned |
| T019 Scenario 1 Verifier recipe | **DH Verifier** | `scenario-1-shell-box.md` + evidence under `verifier/evidence/shell-box/` (SO 11+12) |

**Checkpoint:** US1 Shell/box path works independently with Verifier recipe + desktop evidence.

## Owners / next

| Role | Action |
|------|--------|
| **DH Runtime** | **Go** — US1 T016–T017 |
| **DH Client / Web** | **Go** — US1 T018 |
| **DH Verifier** | **Go** — US1 T019 Scenario 1 + shell-box evidence |
| **DH Spec** | Idle unless US1 acceptance wording needs Spec Kit touch |
| **DH Electron** | Idle (Foundational T013–T014 Done) |
| **DH Lead** | This living gate; epic MOH-350; no feature code |
| **PO Assistant** | Orchestration under MOH-350; spawn US1; no second epic invent; no US2+ until US1 checkpoint |
| **DH Architect** | Idle unless Path A seam clarification |
| **US2–US3 owners** | Idle at this living gate |

## Blockers

None for US1 start. P7 epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350/p7-computer-box-subagent-parity-settings-chrome) In Progress; Setup [MOH-356](https://linear.app/momadhoun/issue/MOH-356/p7-setup-t001-t006-inventories-verifier-recipe-home) **Done**; Foundational T007–T015 **Done** — T015 Pass [#245](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/245) @ `fbe2ec21d8` **unlocked US**. Active slice: **US1 T016–T019**.
