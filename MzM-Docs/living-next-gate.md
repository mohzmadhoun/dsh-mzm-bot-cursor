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

**P7 (Computer / box + subagent parity + settings chrome)** — **Done** on `master`. Epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350/p7-computer-box-subagent-parity-settings-chrome) **Done** (PO). Living flip [#266](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/266) @ `8ac0cc65f8`. Specs under `specs/007-box-subagent-settings/`. T001–T035 complete. **US1 SC-001** [#250](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/250) @ `17d2b3efe3`; **US2 SC-002** [#255](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/255) @ `ce02df7a09`; **US3 SC-003** [#260](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/260) @ `2042cb0e60`. Polish docs [#263](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/263) (T033–T035) + [#264](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/264) (T028–T031). **SC-006** composite Desktop Pass [#265](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/265) @ `cfb70fe177` (SO 11+12 under `verifier/evidence/scenario-5/`). Plan has no P8.

## Next gate

**P1–P7 complete / await PO next phase.** Program plan [mzm-bot-plan.md](./mzm-bot-plan.md) names phases through P7 only; inventory beyond P7 stays Out until a later named phase amends the plan. Do **not** invent a P8 or new product epic.

- **P7 Done** — epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350/p7-computer-box-subagent-parity-settings-chrome) Done (PO); living [#266](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/266) @ `8ac0cc65f8`; product SC-006 [#265](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/265) @ `cfb70fe177`.
- **Evidence cites:** SC-006 [#265](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/265) @ `cfb70fe177`; polish [#263](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/263)/[#264](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/264); US1 [#250](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/250); US2 [#255](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/255); US3 [#260](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/260).
- **Out (unchanged):** voice, draft-first send-on-behalf, group channels, user machines, learn-from-demo, billing chrome, full skill pack, pixel Grok — until PO names a next phase.
- Lead does **not** invent Linear ids, product code, or a P8.

## Phase 7 closed

1. **DH Lead** — Living honesty stamp (MOH-350 Done); no feature code.
2. **PO** — Name next phase if any (or hold); open this stamp PR via ManagePullRequest.
3. **DH Spec / Electron / Runtime / Client / Architect / Verifier** — Idle at this gate unless PO opens a named next phase.

### P7 evidence rollup (master @ `8ac0cc65f8`)

| Slice | Outcome |
|-------|---------|
| Setup T001–T006 | Done — [#237](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/237)–[#241](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/241) @ `c202083e91` |
| Foundational T007–T015 | Done — [#243](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/243)–[#245](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/245); T015 unlocked US |
| US1 SC-001 | Done — [#250](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/250) @ `17d2b3efe3` (`verifier/evidence/shell-box/`) |
| US2 SC-002 | Done — [#255](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/255) @ `ce02df7a09` (`verifier/evidence/computer-use/`) |
| US3 SC-003 | Done — [#260](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/260) @ `2042cb0e60` (`verifier/evidence/settings/`) |
| Polish T033–T035 | Done — [#263](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/263) |
| Polish T028–T031 | Done — [#264](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/264) |
| SC-006 composite | Done — [#265](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/265) @ `cfb70fe177` (`verifier/evidence/scenario-5/`) |
| Living P7 Done flip | Done — [#266](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/266) @ `8ac0cc65f8` |
| Epic MOH-350 | **Done** (PO) |

## Owners / next

| Role | Action |
|------|--------|
| **DH Lead** | MOH-350 Done stamp on living gate; idle until PO names next phase |
| **PO Assistant** | Open stamp PR; decide next named phase (or hold) |
| **DH Spec / Electron / Runtime / Client / Architect / Verifier** | Idle — no P8 in plan |

## Blockers

None. P1–P7 complete; epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350/p7-computer-box-subagent-parity-settings-chrome) **Done**. Awaiting PO next phase.
