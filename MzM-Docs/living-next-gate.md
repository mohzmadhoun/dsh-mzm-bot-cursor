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

**P6 (Connectors / MCP + event routines + trust)** — **Current / In Progress.** Specs under `specs/006-connectors-mcp-events-trust/`. Spec Kit **specify → analyze Done** on `master` ([#198](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/198)–[#203](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/203); analyze **PASS** @ `ff149f38d1` / [#203](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/203)). **Linear epic/create still blocked** (workspace free issue limit) — no P6 epic/T### ids; do **not** invent fake Linear ids; track via PR only until capacity returns. `taskstoissues` deferred.

## Next gate

**Implement unlocked — Setup (T001–T006)** first (parallel; no US1–US5 fan-out yet). Plan home: [mzm-bot-plan.md](./mzm-bot-plan.md) §4 P6. Tasks: `specs/006-connectors-mcp-events-trust/tasks.md`.

### Setup (T001–T006) — parallel / **go**

| Task | Owner |
|------|-------|
| T001 Confirm design tree complete | **DH Spec** |
| T002 [P] Inventory Host Connector catalog + MCP bind | **DH Runtime** |
| T003 [P] Inventory event-Routine + webhook B1 wake | **DH Runtime** |
| T004 [P] Inventory credential + approval/deny seams | **DH Runtime** |
| T005 [P] Document seam locks for implementers | **DH Spec** / **DH Architect** |
| T006 Create Verifier recipe README (Scenarios 1–6) | **DH Verifier** |

### After Setup — Foundational (T007–T016) **blocks** US fan-out

No US1–US5 product work until foundational stamp (T016). Then US fan-out per `tasks.md` priority: US1 → US2 → US3 → US4 → US5.

- **Scope lock (plan In):** MCP/connectors; event-triggered routines; richer trust/permissions productization; 1Password-class credential UX if needed.
- **Out:** Box/computer parity (P7).
- **Exit (Verifier-provable):** one connector install → auth → successful tool call; one event-triggered routine fires end-to-end; one denied-permission path proven; secrets absent from session dumps.
- **Architect Path A locks:** Host Connector catalog SoT + `dsh-mcp-client`; Pass connector = any thin-catalog/fixture; event Pass = webhook harness only (B1); additive `triggerKind`/`eventTrigger`; deny = user-deny or standing `never`; in-app primary / vault optional; **no** Electron Main connector/event/trust/credential bus.
- **SO 11+12** — GUI recipes need desktop screenshots/recordings committed under `verifier/evidence/` + PR embeds.
- **Linear:** when free-issue capacity returns, PO opens real P6 epic + `taskstoissues` on **DeepSeek Harness - Cursor** (`P-MOH-2`) and backfills ids — Lead does **not** invent them.
- This living update is docs only — **no product code** on this branch.

## Phase 6 active (implement Setup)

1. **DH Spec / Runtime / Architect / Verifier** — Setup T001–T006 in parallel against `specs/006-connectors-mcp-events-trust/`.
2. **DH Lead** — This living gate; Status / Next gate / Owners; no feature code; no fake Linear ids.
3. **PO** — Orchestration; open real P6 Linear epic + `taskstoissues` when workspace capacity allows; ship/no-ship on later gates.
4. **DH Electron** — Idle for Setup; engage on foundational T013 (no-Electron bus) and later story slices.
5. **Held until after Setup** — Foundational T007–T016, then US fan-out.

## Owners / next

| Role | Action |
|------|--------|
| **DH Spec** | **Go** — Setup T001 + T005 |
| **DH Runtime** | **Go** — Setup T002–T004 (inventories) |
| **DH Architect** | **Go** — T005 seam locks with Spec; engage on foundations |
| **DH Verifier** | **Go** — Setup T006 recipe README |
| **DH Electron** | Idle until foundational T013 / story shell work |
| **DH Lead** | This living gate; no feature code; no fake Linear ids |
| **PO Assistant** | Orchestration; backfill Linear epic when free-issue limit clears |

## Blockers

**Linear create blocked** (free issue limit) — docs + Spec Kit git / PR path only; no invented issue ids. Spec Kit design closed; **implement Setup T001–T006 is not blocked**. Hard gate before US product work: Foundational T007–T016.
