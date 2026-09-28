# Evidence — scenario-1 (connector install → auth → tool)

FR-014/015 / standing orders **11** + **12** artifacts for [Scenario 1 connector recipe](../../scenario-1-connector.md) (T021 / SC-001 · SC-007).

Commit media here; embed absolute `/opt/cursor/artifacts/…` copies in GUI PR bodies.

## Required filenames (minimum)

| Artifact | Content | Owner recipe | Status |
|----------|---------|--------------|--------|
| `01-connector-installed.png` (or `.webp`) | Connector surface after install — durable installed row (any-one fixture / thin entry) | T021 / SC-001 | **Placeholder** — required for GUI Pass |
| `02-auth-ready.png` (or recording segment) | In-app auth surface and/or ready indicator (`authState=ready`) | T021 / SC-001 · SC-007 | **Placeholder** — required for GUI Pass |
| `03-tool-success.png` (or recording segment) | User-visible successful connector tool outcome | T021 / SC-001 | **Placeholder** — required for GUI Pass |
| Optional `00-catalog-open.png` | Connector catalog open before install | T021 | Optional |
| Optional `scenario-1-connector-walkthrough.mp4` / `.webm` | Short recording covering Steps A–C | T021 | Optional but preferred for multi-step |
| `VERDICT.txt` | Filled stamp when product SC Pass is claimed | Verifier | **Deferred** — do not claim without SO 11+12 media |

## Standing orders 11 + 12 (mandatory for GUI Pass)

| Order | FR | Rule |
|-------|-----|------|
| **SO 11** | FR-014 | Real Desktop app screenshots and/or short screen recording — unit/jsdom alone **fails** |
| **SO 12** | FR-015 | Media **committed** under this directory on the PR branch **and** embedded in the GUI PR body via `<img>` / `<video controls>` with absolute `/opt/cursor/artifacts/…` paths — Cursor agent artifact page links alone **fail** |

## SO11 mirror names (suggested when Cloud Agent Verifier runs)

| Committed | `/opt/cursor/artifacts/` mirror |
|-----------|----------------------------------|
| `01-connector-installed.png` | `p6-t021-01-connector-installed.png` |
| `02-auth-ready.png` | `p6-t021-02-auth-ready.png` |
| `03-tool-success.png` | `p6-t021-03-tool-success.png` |
| `scenario-1-connector-walkthrough.mp4` | `p6-t021-scenario-1-connector-walkthrough.mp4` |

**Status:** Placeholder only — product Pass not stamped; recipe docs land in T021 before media. GUI Pass blocked until Host/Client US1 surfaces (T017–T020) + Desktop SO 11+12 evidence land.
