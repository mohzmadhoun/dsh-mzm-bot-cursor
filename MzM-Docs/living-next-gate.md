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

**P6 (Connectors / MCP + event routines + trust)** — **Current.** Plan home: [mzm-bot-plan.md](./mzm-bot-plan.md) §4 P6. **Linear epic create blocked** (workspace free issue limit) — no P6 epic/specify issue ids; do **not** invent fake Linear ids. Proceed on **docs + Spec Kit git path**.

## Next gate

**P6 specify** — **DH Spec** `/speckit-specify` for P6 only → new `specs/006-…` tree. Do **not** rewrite `specs/001`–`005`. Scope = plan §4 P6.

- **Scope lock (plan In):** MCP/connectors; event-triggered routines; richer trust/permissions productization; 1Password-class credential UX if needed.
- **Out:** Box/computer parity (P7).
- **Exit (Verifier-provable):** one connector install → auth → successful tool call; one event-triggered routine fires end-to-end; one denied-permission path proven; secrets absent from session dumps.
- **Linear:** when free-issue capacity returns, PO opens real P6 epic (+ specify child) on **DeepSeek Harness - Cursor** (`P-MOH-2`) and backfills ids — Lead does **not** invent them.
- Do **not** start implement until specify (and later Spec Kit gates) land; no product code on this living-gate kick.

## Phase 6 active (Spec Kit path)

1. **DH Spec** — `/speckit-specify` for P6 → `specs/006-…` from plan §4 P6 In/Out/Exit.
2. **DH Lead** — This living gate; Status / Next gate / Owners; no feature code; no fake Linear ids.
3. **PO** — Orchestration; open real P6 Linear epic when workspace capacity allows; ship/no-ship on later gates.
4. **DH Verifier / Architect / Runtime / Electron** — Idle until specify (then clarify → plan → tasks → analyze) authorizes their gates.

## Owners / next

| Role | Action |
|------|--------|
| **DH Spec** | **Next:** `/speckit-specify` → `specs/006-…` |
| **DH Lead** | This living gate; no feature code; no fake Linear ids |
| **PO Assistant** | Orchestration; backfill Linear epic when free-issue limit clears |
| **DH Verifier / Architect / Runtime / Electron** | Idle until specify authorizes next gates |

## Blockers

**Linear create blocked** (free issue limit) — docs + Spec Kit git path only; no invented issue ids. Spec Kit specify is **not** blocked.
