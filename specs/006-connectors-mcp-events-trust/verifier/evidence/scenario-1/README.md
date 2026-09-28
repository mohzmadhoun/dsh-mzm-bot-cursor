# Evidence — scenario-1 (connector install → auth → tool)

FR-014/015 / standing orders **11** + **12** artifacts for [Scenario 1 connector recipe](../../scenario-1-connector.md) (T021 / SC-001 · SC-007). Client T019–T020 Desktop verify: see [VERDICT.txt](./VERDICT.txt).

Commit media here; embed absolute `/opt/cursor/artifacts/…` copies in GUI PR bodies.

## Required filenames (minimum)

| Artifact | Content | Owner recipe | Status |
|----------|---------|--------------|--------|
| `00-catalog-open.png` | Connector catalog open (verifier-fixture) | T019 / SC-001 | **measured** Desktop Pass |
| `01-connector-installed.png` | Durable installed row | T019 / SC-001 | **measured** Desktop Pass |
| `02-auth-ready.png` | In-app auth ready + tools bound | T020 / SC-001 · SC-007 | **measured** Desktop Pass |
| `03-tool-success.png` | User-visible successful connector tool outcome | T020 / SC-001 | **measured** Desktop Pass (`Tool call succeeded`) |
| `scenario-1-connector-walkthrough.mp4` | Short recording covering Steps A–C | T021 | **measured** Desktop |
| `03-tool-error.png` | Prior Fail frame (historical) | Verifier | Retained — superseded by `03-tool-success.png` |
| `VERDICT.txt` | Stamp | Verifier | **Pass** @ tip `743ebf6eb1` |

## Standing orders 11 + 12 (mandatory for GUI Pass)

| Order | FR | Rule |
|-------|-----|------|
| **SO 11** | FR-014 | Real Desktop app screenshots and/or short screen recording — unit/jsdom alone **fails** |
| **SO 12** | FR-015 | Media **committed** under this directory on the PR branch **and** embedded in the GUI PR body via `<img>` / `<video controls>` with absolute `/opt/cursor/artifacts/…` paths — Cursor agent artifact page links alone **fail** |

## SO11 mirror names (Pass stamp)

| Committed | `/opt/cursor/artifacts/` mirror |
|-----------|----------------------------------|
| `00-catalog-open.png` | `p6-t019-t020-00-catalog-open.png` |
| `01-connector-installed.png` | `p6-t019-t020-01-connector-installed.png` |
| `02-auth-ready.png` | `p6-t019-t020-02-auth-ready.png` |
| `03-tool-success.png` | `p6-t019-t020-03-tool-success.png` |
| `scenario-1-connector-walkthrough.mp4` | `p6-t019-t020-scenario-1-connector-walkthrough.mp4` |

**Status:** Pass stamped 2026-09-28 on tip `743ebf6eb1` (Client unwrap fix). SC-001 install→auth→tool success measured on Desktop.
