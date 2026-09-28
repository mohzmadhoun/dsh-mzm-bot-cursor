# Evidence — scenario-4 (secrets absent from dumps)

Dump-inspection artifacts for [Scenario 4 secrets-absent recipe](../../scenario-4-secrets-absent.md) (T030 / SC-004 · FR-007).

**Dump log/artifact OK** for Pass (FR-015). GUI auth steps still need standing orders **11** + **12** **when shown**; dump-only Pass may skip GUI embeds and may cross-ref [Scenario 1 auth evidence](../scenario-1/).

## Required filenames (minimum)

| Artifact | Content | Owner recipe | Status |
|----------|---------|--------------|--------|
| `p6-t030-secrets-absent-vitest.log` | Host vitest: authenticate + assert secret absent from describe/view | T030 / SC-004 | **Present** — Pass |
| `dump-inspection.txt` | Measured surfaces + secret marker + Pass lines | T030 / FR-007 | **Present** — Pass |
| `VERDICT.txt` | Product SC dump stamp | Verifier | **Pass** (Host dump-inspection) |
| Optional `00-auth-ready.png` | Desktop auth UI only if Scenario 4 shows GUI | SO 11+12 | N/A for dump-only (cite Scenario 1) |

## Standing orders 11 + 12 (conditional)

| Order | FR | Rule |
|-------|-----|------|
| **SO 11** | FR-014 | Real Desktop screenshots/recording **when** auth (or other GUI) is shown in this evidence set — unit/jsdom alone **fails** that GUI slice |
| **SO 12** | FR-015 | GUI media **committed** here + PR embeds via `/opt/cursor/artifacts/…` when GUI is shown; **dump-only** Pass may skip GUI embeds |

## SO11 / artifact mirrors (Cloud Agent Verifier)

| Committed | `/opt/cursor/artifacts/` mirror |
|-----------|----------------------------------|
| `p6-t030-secrets-absent-vitest.log` | `p6-t030-secrets-absent-vitest.log` |
| `dump-inspection.txt` | `p6-t030-dump-inspection.txt` |

**Status:** Host dump-inspection Pass stamped — see [VERDICT.txt](./VERDICT.txt).

**T034 layout:** Quickstart Scenario 4 evidence home (dump/log OK). Not the non-goals home — that is [../non-goals/](../non-goals/) for quickstart Scenario 5 / SC-005.
