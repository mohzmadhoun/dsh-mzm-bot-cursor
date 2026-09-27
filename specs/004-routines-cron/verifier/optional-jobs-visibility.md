# T013 — Optional `dsh-jobs` in-flight fire visibility only

**Status:** Documented (Foundational T013 — optional; not catalog/cron SoT)
**Owners:** DH Runtime (author) · DH Verifier (rerun) · PO (scope)
**Linear:** [MOH-206](https://linear.app/momadhoun/issue/MOH-206) · Epic [MOH-188](https://linear.app/momadhoun/issue/MOH-188)
**Acceptance:** research R6 · Architect Option 3 · [contracts/cron-fire.md](../contracts/cron-fire.md)
**Branch:** `cursor/p4-foundation-host-fe1d`

## Measurable Done

| Check | Pass bar |
|-------|----------|
| Availability | Desktop Host composition can resolve `ctx.jobs` (via shipped `dsh-jobs-local` on base/desktop profile) |
| Role | Jobs MAY show **in-flight** cron-fire work only |
| Non-SoT | Jobs MUST NOT be Routine catalog, cron evaluator, pause/resume authority, or pane list SoT |
| Pass independence | Verifier Pass does **not** require jobs UI; last-run from Host `RoutineRecord.lastRunAt` is sufficient |

---

## Current Desktop Host wiring

| Package | Where | Role for P4 |
|---------|-------|-------------|
| `@deepseek-ai/dsh-jobs` | Contract peer / types (`apps/desktop-host` depends) | Registry contract |
| `@deepseek-ai/dsh-jobs-local` | `packages/bundle/base/cordis.patch.yml` (`id: jobs`) — Desktop profile inherits | Process-local registry; dies with Host |
| `@deepseek-ai/dsh-tool-jobs` | Base bundle (`id: tool-jobs`) | Model tools + completion notices |

`apps/desktop-host/src/update-tasks.ts` already reads `ctx.get('jobs')` for update-task inspection — proves jobs service is mounted on Desktop Host. No additional Routine-catalog mount is introduced here.

## Allowed use (US4 / T026 later)

When Host cron wake starts a bot turn for an active routine, producers MAY register a short-lived job for **in-flight visibility** (`ctx.jobs`). Settlement does not replace durable `lastRunAt` on the Host Routine catalog.

## Forbidden

- Storing `RoutineRecord` rows as job records
- Using `job_list` / jobs UI as the routines pane SoT
- Treating jobs as cron expression authority or pause/resume store
- Electron Main owning jobs-as-routines bus

## Spot-check

1. Host Routine create/list works with jobs service present or absent for catalog SoT proofs.
2. If a fire visibility job appears, it is labeled as in-flight only and disappears with Host process — catalog rows remain on `team/routine`.
