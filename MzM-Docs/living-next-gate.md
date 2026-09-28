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

**P7 (Computer / box + subagent parity + settings chrome)** — **Current / implement · Foundational T007–T015 in progress.** Epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350/p7-computer-box-subagent-parity-settings-chrome) In Progress on DeepSeek Harness - Cursor (`P-MOH-2`). Specify–analyze Done (#228→#236 @ `6fa18cfcfe`; implement unlocked). **Setup T001–T006 Done** — parent [MOH-356](https://linear.app/momadhoun/issue/MOH-356/p7-setup-t001-t006-inventories-verifier-recipe-home) Done; PRs [#237](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/237)–[#241](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/241) on `master` @ `c202083e91`. Specs under `specs/007-box-subagent-settings/`. Linear T001–T035 children via `taskstoissues` only (do **not** invent MOH-* ids).

## Next gate

**Implement — Foundational T007–T015 in progress** under epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350/p7-computer-box-subagent-parity-settings-chrome). Plan home: [mzm-bot-plan.md](./mzm-bot-plan.md) §4 P7. Tasks: `specs/007-box-subagent-settings/tasks.md`.

- **Setup Done** — T001–T006 inventories + Verifier recipe home + seam locks on `master` @ `c202083e91` ([MOH-356](https://linear.app/momadhoun/issue/MOH-356/p7-setup-t001-t006-inventories-verifier-recipe-home) Done; PRs #237–#241).
- **Foundational now** — T007–T015. **T015 foundational stamp blocks all US1–US3 product work** (analyze I1: prefer stamp rule over informal T009/T011/T012 fan-out notes).
- **No US fan-out** until T015 lands.
- **Scope lock (plan In):** Box/Shell backends; computerUse-class subagents; settings/chrome polish toward Grok-easy.
- **Clarify + plan + tasks + analyze locks:** Global Settings → **Computer**; rows **Shell** + **Computer use**; computerUse Pass = screenshot-only (or equiv.) + parent handoff; Box readiness = clear not-ready/starting ≠ ready; Path A seams; evidence slices `verifier/evidence/shell-box/`, `computer-use/`, `settings/`.
- **Out:** Treating “Verifier” as a P7 feature — Verifier already gates every phase. Inventory items listed as program Out until a later named phase amends the plan (voice, draft-first send-on-behalf, group channels, user machines, learn-from-demo, billing chrome, full skill pack, pixel Grok).
- **Exit (Verifier-provable):** one local Shell/box tool path proven; one computerUse-class subagent path proven; settings rows required for those daily paths present (chrome polish ≠ Verifier substitute).
- **SO 11+12** — GUI recipes need desktop screenshots/recordings committed under `verifier/evidence/` + PR embeds.
- Lead does **not** invent a second P7 epic or child T### / MOH-* ids. This living update is docs only — **no product code**.

## Phase 7 active (implement · Foundational)

1. **DH Runtime** — **Go** on Foundational T007–T012 (Box readiness SoT; Shell mount; computerUse provider; subagent spawn; Computer settings SoT; Host HTTP/WS Remotes).
2. **DH Electron** — **Go** on Foundational T013–T014 (host-protocol exclusions + no-Electron bus guard).
3. **DH Spec / DH Verifier** — **Go** on Foundational T015 stamp after T007–T014 green (blocks US1–US3).
4. **DH Lead** — This living gate; Status / Next gate / Owners; no feature code; epic MOH-350 bound.
5. **PO** — Orchestration under MOH-350; ship/no-ship on later gates; no second epic; spawn Foundational owners.
6. **DH Architect** — Idle unless Foundational Path A seam question.
7. **US1–US3** — **Held** until Foundational T015 stamp.

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

### Foundational (T007–T015) — **in progress · blocks US**

| Task | Owner | Outcome |
|------|-------|---------|
| T007 BoxBackend readiness SoT | **DH Runtime** | Host projection `not_ready\|starting\|ready\|failed` |
| T008 Mount sandboxed Shell Pass path | **DH Runtime** | Host Shell mount for Desktop |
| T009 computerUse registry + Pass slot | **DH Runtime** | Provider registry wired |
| T010 Subagent spawn-in-process | **DH Runtime** | Desktop Host in-process spawn |
| T011 Computer settings document fields | **DH Runtime** | Host settings SoT |
| T012 Host HTTP/WS Remotes | **DH Runtime** | Box + Computer settings Remotes |
| T013 host-protocol exclusions | **DH Electron** | Forbidden IPC names documented |
| T014 no-Electron bus guard | **DH Electron** | Regression test + absence docs |
| T015 Foundational checklist stamp | **DH Spec / DH Verifier** | Stamp in `verifier/README.md` — **blocks US1–US3** |

**No US1–US3 product work before T015.**

## Owners / next

| Role | Action |
|------|--------|
| **DH Runtime** | **Go** — Foundational T007–T012 |
| **DH Electron** | **Go** — Foundational T013–T014 |
| **DH Spec** | **Go** — T015 stamp with Verifier after T007–T014 |
| **DH Verifier** | **Go** — T015 stamp co-owner; evidence dirs ready |
| **DH Lead** | This living gate; epic MOH-350; no feature code |
| **PO Assistant** | Orchestration under MOH-350; spawn Foundational; no second epic invent |
| **DH Architect** | Idle unless Foundational Path A seam clarification |
| **US owners** | Idle until T015 foundational stamp |

## Blockers

None for Foundational start. P7 epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350/p7-computer-box-subagent-parity-settings-chrome) In Progress; Setup [MOH-356](https://linear.app/momadhoun/issue/MOH-356/p7-setup-t001-t006-inventories-verifier-recipe-home) **Done** (#237–#241 @ `c202083e91`). Hard gate before US1–US3: **T015 foundational stamp**.
