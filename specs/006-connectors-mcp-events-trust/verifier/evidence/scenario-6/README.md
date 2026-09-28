# Evidence — Scenario 6 (Full Phase 6 replay)

**Recipe:** [../../scenario-6-full-replay.md](../../scenario-6-full-replay.md) (T035)
**Acceptance:** SC-006 · FR-013 · FR-014/015 (composite of Scenarios 1–5 + foundational stamp + bus / non-goals)
**Linear:** **Blocked** — PR-only tracking (Epic MOH-281 / `P-MOH-2`; no invented issue ids)

## Required filenames (minimum)

| Artifact | Content | Status |
|----------|---------|--------|
| `replay-pointer.log` | Gate + SHA/UTC + cited Scenario 1–5 evidence paths | Placeholder (T034) |
| `vitest-electron-bus.log` | T037 `no-electron-connectors-events-trust-bus` rerun | Placeholder (when T037 stamps) |
| `non-goals-spotcheck.log` | Contracts + exclusions + no-rewrite + Scenario recipes present | Placeholder |
| `00-desktop-smoke-sc006.png` | Optional fresh Desktop Agent Team / connector surface smoke | Placeholder (when GUI composite runs) |
| `VERDICT.txt` | Composite SC-006 stamp | Placeholder |

## Cited prior FR-014/015 media (not duplicated)

| Scenario | Evidence home | Recipe |
|----------|---------------|--------|
| 1 (+ US5 auth) | [../scenario-1/](../scenario-1/) | [scenario-1-connector.md](../../scenario-1-connector.md) · [scenario-5-credential-ux.md](../../scenario-5-credential-ux.md) |
| 2 | [../scenario-2/](../scenario-2/) | [scenario-2-event-routine.md](../../scenario-2-event-routine.md) |
| 3 | [../scenario-3/](../scenario-3/) | [scenario-3-trust-deny.md](../../scenario-3-trust-deny.md) |
| 4 | [../scenario-4/](../scenario-4/) | [scenario-4-secrets-absent.md](../../scenario-4-secrets-absent.md) |
| 5 / non-goals | [../non-goals/](../non-goals/) | [non-goals.md](../../non-goals.md) |

Unit/jsdom alone **fails** the GUI half. Foundational Pass (T016) MUST be green before this stamp counts toward product Done.

## Standing orders 11 + 12 (mandatory for GUI slices)

| Order | FR | Rule |
|-------|-----|------|
| **SO 11** | FR-014 | Real Desktop screenshots/recording for Scenarios 1–3 (+ US5 auth when shown) — unit/jsdom alone **fails** |
| **SO 12** | FR-015 | Media **committed** under scenario homes (or cited) **and** GUI PR embeds via `/opt/cursor/artifacts/…` |

## Reuse policy

Do **not** delete existing media under `scenario-1/`…`scenario-4/` or `non-goals/`. Scenario 6 cites those paths rather than duplicating bytes. New composite-only artifacts live here.

## Placeholder policy

Created by T034. Fill when stamping SC-006 via [scenario-6-full-replay.md](../../scenario-6-full-replay.md).
