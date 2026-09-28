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

**P6 (Connectors / MCP + event routines + trust)** — **Current / In Progress.** Epic [MOH-281](https://linear.app/momadhoun/issue/MOH-281/p6-connectors-mcp-event-routines-trust) on DeepSeek Harness - Cursor (`P-MOH-2`). Specs under `specs/006-connectors-mcp-events-trust/`. Spec Kit **specify → analyze Done** on `master` ([#198](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/198)–[#203](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/203); analyze **PASS** @ `ff149f38d1`). **Setup T001–T006 Done** ([#205](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/205)). **Electron foundation T013–T014 Done** ([#206](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/206)). **Host foundation T007–T012 In Progress.** `taskstoissues` still deferred (epic backfilled; child T### ids not yet minted).

## Next gate

**Host foundation T007–T012** (In Progress) — finish Host seam stamp; then remaining Foundational through T016 before any US1–US5 fan-out. Plan home: [mzm-bot-plan.md](./mzm-bot-plan.md) §4 P6. Tasks: `specs/006-connectors-mcp-events-trust/tasks.md`. Epic: [MOH-281](https://linear.app/momadhoun/issue/MOH-281/p6-connectors-mcp-event-routines-trust).

### Done on master — Spec Kit + Setup + Electron

| Slice | Evidence |
|-------|----------|
| Spec Kit specify → analyze | [#198](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/198)–[#203](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/203) |
| Setup T001–T006 | [#205](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/205) |
| Electron foundation T013–T014 | [#206](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/206) |

### Host foundation (T007–T012) — **In Progress**

Finish Host Connector / MCP / event / trust / credential foundation stamps per `tasks.md`. No US1–US5 product work until foundational stamp (T016).

### After Host + remaining Foundational — US fan-out

No US1–US5 product work until foundational stamp (T016). Then US fan-out per `tasks.md` priority: US1 → US2 → US3 → US4 → US5.

- **Scope lock (plan In):** MCP/connectors; event-triggered routines; richer trust/permissions productization; 1Password-class credential UX if needed.
- **Out:** Box/computer parity (P7).
- **Exit (Verifier-provable):** one connector install → auth → successful tool call; one event-triggered routine fires end-to-end; one denied-permission path proven; secrets absent from session dumps.
- **Architect Path A locks:** Host Connector catalog SoT + `dsh-mcp-client`; Pass connector = any thin-catalog/fixture; event Pass = webhook harness only (B1); additive `triggerKind`/`eventTrigger`; deny = user-deny or standing `never`; in-app primary / vault optional; **no** Electron Main connector/event/trust/credential bus.
- **SO 11+12** — GUI recipes need desktop screenshots/recordings committed under `verifier/evidence/` + PR embeds.
- **Linear:** epic [MOH-281](https://linear.app/momadhoun/issue/MOH-281/p6-connectors-mcp-event-routines-trust) bound; PO may `taskstoissues` for child T### when ready — Lead does **not** invent child ids.
- This living update is docs only — **no product code** on this branch.

## Phase 6 active (Host foundation)

1. **DH Runtime / Host** — Host foundation T007–T012 In Progress against `specs/006-connectors-mcp-events-trust/`.
2. **DH Lead** — This living gate; Status / Next gate / Owners; no feature code; epic MOH-281 bound.
3. **PO** — Orchestration; optional `taskstoissues` child mint under MOH-281; ship/no-ship on later gates.
4. **DH Electron** — T013–T014 Done (#206); idle until later story shell slices.
5. **Held until after Foundational T016** — US1–US5 fan-out.

## Owners / next

| Role | Action |
|------|--------|
| **DH Runtime** | **Go** — Host foundation T007–T012 |
| **DH Spec** | Idle until story / remaining foundational docs need |
| **DH Architect** | Engage on Host foundation seam stamps as needed |
| **DH Verifier** | Ready for Host foundation evidence when Runtime stamps |
| **DH Electron** | Idle — T013–T014 Done (#206) |
| **DH Lead** | This living gate; epic MOH-281; no feature code |
| **PO Assistant** | Orchestration; optional `taskstoissues` under MOH-281 |

## Blockers

None on Linear create — epic [MOH-281](https://linear.app/momadhoun/issue/MOH-281/p6-connectors-mcp-event-routines-trust) exists. Hard gate before US product work: finish Host T007–T012 + remaining Foundational through T016.
