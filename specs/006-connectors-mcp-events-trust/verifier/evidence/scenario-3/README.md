# Evidence — scenario-3 (denied permission)

FR-014/015 / standing orders **11** + **12** artifacts for [Scenario 3 trust-deny recipe](../../scenario-3-trust-deny.md) (T028 / SC-003).

Commit media here; embed absolute `/opt/cursor/artifacts/…` copies in GUI PR bodies.

## Required filenames (minimum)

| Artifact | Content | Owner recipe | Status |
|----------|---------|--------------|--------|
| `01-permission-gate.png` (or `.webp`) | Permission / trust gate visible (approval card, standing-deny control, or equivalent) | T028 / SC-003 | **Placeholder** — required for GUI Pass |
| `02-denied-blocked-state.png` (or recording segment) | After deny — user-visible blocked/denied state **distinct** from success | T028 / SC-003 | **Placeholder** — required for GUI Pass |
| Optional `00-tool-or-gate-setup.png` | Pre-gate connector tool / trust surface before deny | T028 | Optional |
| Optional `03-standing-never.png` | Standing `never` / block control if Path B is used (may merge with `01-…`) | T028 / FR-006 | Optional if `01-…` already shows standing deny |
| Optional `scenario-3-trust-deny-walkthrough.mp4` / `.webm` | Short recording covering Steps A–C | T028 | Optional but preferred for multi-step |
| `VERDICT.txt` | Filled stamp when product SC Pass is claimed | Verifier | **Deferred** — do not claim without SO 11+12 media |

## Standing orders 11 + 12 (mandatory for GUI Pass)

| Order | FR | Rule |
|-------|-----|------|
| **SO 11** | FR-014 | Real Desktop app screenshots and/or short screen recording — unit/jsdom alone **fails** |
| **SO 12** | FR-015 | Media **committed** under this directory on the PR branch **and** embedded in the GUI PR body via `<img>` / `<video controls>` with absolute `/opt/cursor/artifacts/…` paths — Cursor agent artifact page links alone **fail** |

## SO11 mirror names (suggested when Cloud Agent Verifier runs)

| Committed | `/opt/cursor/artifacts/` mirror |
|-----------|----------------------------------|
| `01-permission-gate.png` | `p6-t028-01-permission-gate.png` |
| `02-denied-blocked-state.png` | `p6-t028-02-denied-blocked-state.png` |
| `scenario-3-trust-deny-walkthrough.mp4` | `p6-t028-scenario-3-trust-deny-walkthrough.mp4` |

**Status:** Placeholder only — product Pass not stamped; recipe docs land in T028 before media. GUI Pass blocked until Host/Client US3 surfaces (T026–T027) + Desktop SO 11+12 evidence land.
