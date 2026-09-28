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

**P7 (Computer / box + subagent parity + settings chrome)** — **Current / tasks in progress.** Epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350/p7-computer-box-subagent-parity-settings-chrome) In Progress on DeepSeek Harness - Cursor (`P-MOH-2`). Specify [MOH-351](https://linear.app/momadhoun/issue/MOH-351/p7-spec-kit-specify-computer-box-subagent-parity-settings-chrome) **Done** ([#228](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/228) @ `db82670947`) → `specs/007-box-subagent-settings/`. Clarify [MOH-352](https://linear.app/momadhoun/issue/MOH-352/p7-spec-kit-clarify-007-box-subagent-settings) **Done** ([#230](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/230) @ `3c232d67df`). Plan [MOH-353](https://linear.app/momadhoun/issue/MOH-353/p7-spec-kit-plan-007-box-subagent-settings) **Done** ([#232](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/232) @ `da8184f1b9`). Tasks child [MOH-354](https://linear.app/momadhoun/issue/MOH-354/p7-spec-kit-tasks-007-box-subagent-settings) In Progress (do **not** rewrite `specs/001`–`006`).

## Next gate

**Spec Kit tasks in progress** — [MOH-354](https://linear.app/momadhoun/issue/MOH-354/p7-spec-kit-tasks-007-box-subagent-settings) under epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350/p7-computer-box-subagent-parity-settings-chrome). Plan home: [mzm-bot-plan.md](./mzm-bot-plan.md) §4 P7.

- **DH Spec Go** — `/speckit-tasks` for P7 only under `specs/007-box-subagent-settings/`.
- After tasks: continue Spec Kit order (analyze) under PO orchestration before implement fan-out.
- **Scope lock (plan In):** Box/Shell backends; computerUse-class subagents; settings/chrome polish toward Grok-easy.
- **Clarify + plan locks (honor in tasks):** Global Settings → **Computer**; rows **Shell** + **Computer use**; computerUse Pass = screenshot-only (or equiv.) + parent handoff; Box readiness = clear not-ready/starting ≠ ready; Path A seams; evidence slices `verifier/evidence/shell-box/`, `computer-use/`, `settings/`.
- **Out:** Treating “Verifier” as a P7 feature — Verifier already gates every phase. Inventory items listed as program Out until a later named phase amends the plan (voice, draft-first send-on-behalf, group channels, user machines, learn-from-demo, billing chrome, full skill pack, pixel Grok).
- **Exit (Verifier-provable):** one local Shell/box tool path proven; one computerUse-class subagent path proven; settings rows required for those daily paths present (chrome polish ≠ Verifier substitute).
- **SO 11+12** — GUI recipes need desktop screenshots/recordings committed under `verifier/evidence/` + PR embeds.
- Lead does **not** invent a second P7 epic or child T### ids. This living update is docs only — **no product code**.

## Phase 7 active (tasks)

1. **DH Spec** — **Go** on tasks (MOH-354) → `specs/007-box-subagent-settings/`.
2. **DH Lead** — This living gate; Status / Next gate / Owners; no feature code; epic MOH-350 bound.
3. **PO** — Orchestration; ship/no-ship on later gates; no second epic.
4. **DH Architect** — Idle unless Spec needs seam clarification during tasks.
5. **DH Runtime / Electron / Verifier** — **Idle** until after tasks→analyze (or as later gates unlock).

## Owners / next

| Role | Action |
|------|--------|
| **DH Spec** | **Go** — Spec Kit tasks (MOH-354) → `specs/007-box-subagent-settings/` |
| **DH Lead** | This living gate; epic MOH-350; no feature code |
| **PO Assistant** | Orchestration under MOH-350; no second epic invent |
| **DH Architect** | Idle unless Spec needs seam clarification during tasks |
| **DH Runtime** | Idle until after tasks→analyze |
| **DH Electron** | Idle until after tasks→analyze |
| **DH Verifier** | Idle until after tasks→analyze |

## Blockers

None. P7 epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350/p7-computer-box-subagent-parity-settings-chrome) In Progress; specify [MOH-351](https://linear.app/momadhoun/issue/MOH-351/p7-spec-kit-specify-computer-box-subagent-parity-settings-chrome) Done (#228); clarify [MOH-352](https://linear.app/momadhoun/issue/MOH-352/p7-spec-kit-clarify-007-box-subagent-settings) Done (#230 @ `3c232d67df`); plan [MOH-353](https://linear.app/momadhoun/issue/MOH-353/p7-spec-kit-plan-007-box-subagent-settings) Done (#232 @ `da8184f1b9`); tasks [MOH-354](https://linear.app/momadhoun/issue/MOH-354/p7-spec-kit-tasks-007-box-subagent-settings) In Progress. Hard gate before implement: finish Spec Kit tasks→analyze.
