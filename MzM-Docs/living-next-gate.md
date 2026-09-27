# Living next gate — MzM Bot

| Field | Value |
|-------|-------|
| **Updated** | 2026-09-27 |
| **Owner** | DH Lead |
| **Tracker** | DeepSeek Harness - Cursor (`P-MOH-2`) only |
| **Program plan** | [mzm-bot-plan.md](./mzm-bot-plan.md) |

## Status

**P1 (Wedge A)** — Done on `master` (epic [MOH-37](https://linear.app/momadhoun/issue/MOH-37/p1-wedge-a-per-bot-models-11-messaging-electron-ui)). Specs under `specs/001-multi-model-bots`.

**Deferred (non-blocking):** SC-005 live Desktop full Phase 1 replay — recipe present; `specs/001-multi-model-bots/verifier/evidence/scenario-5/VERDICT.txt` = Deferred (`LIVE_DESKTOP: Skipped`). Does **not** block P4.

**P2 (Identity / personas)** — **Done.** Epic [MOH-88](https://linear.app/momadhoun/issue/MOH-88/p2-identity-personas) Done. Specs under `specs/002-identity-personas/`. Phase 2 product Verifier Pass merged as [#104](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/104).

**P3 (Skills UX)** — **Done.** Epic [MOH-142](https://linear.app/momadhoun/issue/MOH-142/p3-skills-ux) Done (PO). Specs under `specs/003-skills-ux/`. Phase 3 product Verifier **Pass** merged as [#136](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/136) @ `337f25a964`.

**P4 (Routines — cron only)** — Epic [MOH-188](https://linear.app/momadhoun/issue/MOH-188/p4-routines-cron-only) **In Progress**. Specs under `specs/004-routines-cron/` on `master`.

- Spec Kit **design Done** (specify → clarify → plan → tasks → analyze + taskstoissues):
  - Specify [#139](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/139) · Clarify [#140](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/140) · Plan [#141](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/141) Architect Option 3 · Tasks [#142](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/142)
  - Analyze + taskstoissues **Done** ([MOH-193](https://linear.app/momadhoun/issue/MOH-193/p4-spec-kit-analyze-taskstoissues-routines-cron) / [#143](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/143) @ `646eb4e993`; analyze **PASS**, 0 CRITICAL)
  - Linear children T001–T034 → [MOH-194](https://linear.app/momadhoun/issue/MOH-194)…[MOH-227](https://linear.app/momadhoun/issue/MOH-227) under epic MOH-188

## Next gate

**Implement — Setup + Foundational (T001–T014 / MOH-194…MOH-207) kicked.** No US1–US4 product fan-out until T014 foundational stamp.

### Architect Option 3 (non-negotiable)

1. Host-owned Routine catalog = Routines SoT (Agent Teams / Host journal — not Electron Main, not `dsh-schedule`).
2. Host cron wake applies intent as bot turn; pane last-run from Host after fire commit.
3. Optional `dsh-jobs` visibility only — never catalog/cron SoT.
4. **No Electron Main routines bus** — lifecycle IPC only; routine traffic on authenticated Host HTTP/WS.
5. FR-010/FR-011 / SO 11+12 desktop visual evidence on every GUI recipe.

### Tree ownership (non-overlapping)

| Owner | Owns (write) | Do not touch |
|-------|--------------|--------------|
| **DH Runtime** | Host catalog/cron: `packages/experimental/agent-team/`, `apps/desktop-host/`, optional `packages/jobs/jobs/` + `jobs-local/`; Setup inventories T002–T003; Foundational T006–T009 (+ optional T013) | `apps/desktop/**` Main bus; Client pane UI under `client-ui-agent-team` |
| **DH Electron** | Thin shell + no Main bus: `apps/desktop/src/host-protocol.ts`, `apps/desktop/src/ipc.ts`, `apps/desktop/tests/no-electron-routines-bus.spec.ts` (T010–T011); later US pane UI under `packages/experimental/client-ui-agent-team/src/client/` | Host catalog SoT, cron ticker, Agent Teams store |
| **DH Spec** | Setup T001 + T004 (`schedule-not-routines.md`); T012 spot-check with Runtime | Product Host/Electron code |
| **DH Verifier** | Setup T005 recipe README; Foundational T014 stamp; later SC recipes + evidence gate | Product feature code |

### Setup (T001–T005 / MOH-194…198) — parallel OK

| Task | Issue | Owner |
|------|-------|-------|
| T001 Confirm design tree | [MOH-194](https://linear.app/momadhoun/issue/MOH-194) | **DH Spec** |
| T002 Inventory Host Routine catalog | [MOH-195](https://linear.app/momadhoun/issue/MOH-195) | **DH Runtime** |
| T003 Inventory cron-wake / jobs visibility | [MOH-196](https://linear.app/momadhoun/issue/MOH-196) | **DH Runtime** |
| T004 Document `dsh-schedule` ≠ Routines SoT | [MOH-197](https://linear.app/momadhoun/issue/MOH-197) | **DH Spec** |
| T005 Verifier recipe README (SO 11+12) | [MOH-198](https://linear.app/momadhoun/issue/MOH-198) | **DH Verifier** |

### Foundational (T006–T014 / MOH-199…207) — **blocks** US fan-out

| Task | Issue | Owner |
|------|-------|-------|
| T006 `RoutineRecord` types/validation | [MOH-199](https://linear.app/momadhoun/issue/MOH-199) | **DH Runtime** |
| T007 Host Routine catalog service | [MOH-200](https://linear.app/momadhoun/issue/MOH-200) | **DH Runtime** |
| T008 Host cron expression evaluator | [MOH-201](https://linear.app/momadhoun/issue/MOH-201) | **DH Runtime** |
| T009 Host HTTP/WS create/list APIs | [MOH-202](https://linear.app/momadhoun/issue/MOH-202) | **DH Runtime** |
| T010 `host-protocol.ts` routine exclusions | [MOH-203](https://linear.app/momadhoun/issue/MOH-203) | **DH Electron** |
| T011 `no-electron-routines-bus.spec.ts` | [MOH-204](https://linear.app/momadhoun/issue/MOH-204) | **DH Electron** |
| T012 Schedule≠Routines regression note | [MOH-205](https://linear.app/momadhoun/issue/MOH-205) | **DH Spec** / **DH Runtime** |
| T013 Optional jobs visibility (not SoT) | [MOH-206](https://linear.app/momadhoun/issue/MOH-206) | **DH Runtime** (optional) |
| T014 Foundational checklist stamp | [MOH-207](https://linear.app/momadhoun/issue/MOH-207) | **DH Verifier** |

### After T014 — US slices (hold until stamp)

Prefer US1 → US2 → US3 → US4 per `tasks.md`. Within a story: Runtime Host API first, then Electron pane UI `[P]` once Host contract stable. Issues MOH-208…MOH-227 stay Backlog until foundational checkpoint.

- Do **not** rewrite `specs/001`, `002`, or `003`.
- Epic MOH-188 stays open until Phase 4 product Verifier Pass + PO Done.

## Owners / held

| Role | Action |
|------|--------|
| **PO Assistant** | Spawn **DH Runtime** + **DH Electron** from this kick; Linear statuses; ship/no-ship later |
| **DH Runtime** | Setup T002–T003 + Foundational T006–T009 (+ optional T013) — Host catalog/cron only |
| **DH Electron** | Foundational T010–T011 (no Main bus); later US pane UI — no Host SoT |
| **DH Spec** | Setup T001 + T004; T012 with Runtime |
| **DH Verifier** | Setup T005 + Foundational T014; product SC gate after US |
| **DH Architect** | Idle unless Option 3 seam question |
| **DH Lead** | This living gate only; **no** feature code; no epic Done |

## Blockers

None for Setup + Foundational T001–T014 kick. Analyze #143 PASS; MOH-193 Done. Hard gate before US1–US4: T014 foundational stamp.
