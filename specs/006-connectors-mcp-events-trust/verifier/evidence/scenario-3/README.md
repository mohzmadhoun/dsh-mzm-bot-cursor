# Evidence — scenario-3 (denied permission)

FR-014/015 / standing orders **11** + **12** artifacts for [Scenario 3 trust-deny recipe](../../scenario-3-trust-deny.md) (T028 / SC-003).

Commit media here; embed absolute `/opt/cursor/artifacts/…` copies in GUI PR bodies.

## Required filenames (minimum)

| Artifact | Content | Owner recipe | Status |
|----------|---------|--------------|--------|
| `01-permission-gate.png` | Permission / trust gate visible (standing-deny control + Permission request) | T028 / SC-003 | **Present** — Pass |
| `02-denied-blocked-state.png` | After deny — `Blocked (denied)` ≠ success | T028 / SC-003 | **Present** — Pass |
| `03-standing-never.png` | Standing `never` on (Path B) | T028 / FR-006 | **Present** |
| `scenario-3-trust-deny-walkthrough.mp4` | Short recording Steps A–C (Path B) | T028 | **Present** |
| `panel-state.json` · `p6-t027-scenario3-cdp.log` | CDP hard-assert provenance | Verifier | **Present** |
| `VERDICT.txt` | Product SC Pass stamp | Verifier | **Pass** @ tip `bd9b86c084` |

## Standing orders 11 + 12 (mandatory for GUI Pass)

| Order | FR | Rule |
|-------|-----|------|
| **SO 11** | FR-014 | Real Desktop app screenshots and/or short screen recording — unit/jsdom alone **fails** |
| **SO 12** | FR-015 | Media **committed** under this directory on the PR branch **and** embedded in the GUI PR body via `<img>` / `<video controls>` with absolute `/opt/cursor/artifacts/…` paths — Cursor agent artifact page links alone **fail** |

## SO11 mirror names (Cloud Agent Verifier)

| Committed | `/opt/cursor/artifacts/` mirror |
|-----------|----------------------------------|
| `01-permission-gate.png` | `p6-t028-01-permission-gate.png` |
| `02-denied-blocked-state.png` | `p6-t028-02-denied-blocked-state.png` |
| `03-standing-never.png` | `p6-t028-03-standing-never.png` |
| `scenario-3-trust-deny-walkthrough.mp4` | `p6-t028-scenario-3-trust-deny-walkthrough.mp4` |

**Status:** Desktop Pass stamped — Path B standing never · tip `bd9b86c084` (Client `d02d11fe30` + `$on` bind fix). See [VERDICT.txt](./VERDICT.txt).

**T034 layout:** Quickstart Scenario 3 evidence home. Required filenames above satisfy FR-014/015 / SO 11+12.
