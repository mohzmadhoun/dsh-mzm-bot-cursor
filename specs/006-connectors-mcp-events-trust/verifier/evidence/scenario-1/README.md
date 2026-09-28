# Evidence — scenario-1 (connector install → auth → tool · US5 credential UX)

FR-014/015 / standing orders **11** + **12** artifacts for [Scenario 1 connector recipe](../../scenario-1-connector.md) (T021 / SC-001 · SC-007) and Client T031 US5 credential UX ([credential-ux-in-app.md](../../credential-ux-in-app.md); deep recipe [scenario-5-credential-ux.md](../../scenario-5-credential-ux.md) on T032). See [VERDICT.txt](./VERDICT.txt) (T019–T020) and [VERDICT-T031.txt](./VERDICT-T031.txt) (T031 Desktop Pass).

Commit media here; embed absolute `/opt/cursor/artifacts/…` copies in GUI PR bodies.

## Required filenames (minimum)

| Artifact | Content | Owner recipe | Status |
|----------|---------|--------------|--------|
| `00-catalog-open.png` | Connector catalog open (verifier-fixture) | T019 / T031 | **measured** Desktop Pass |
| `01-connector-installed.png` | Durable installed row | T019 / T031 | **measured** Desktop Pass |
| `02a-auth-surface.png` | In-app credential form + vault-not-required marker | T031 / T032 / SC-007 | **measured** Desktop Pass @ `b8609fad91` |
| `02-auth-ready.png` | In-app auth ready + tools bound | T020 / T031 / T032 / SC-007 | **measured** Desktop Pass @ `b8609fad91` |
| `03-tool-success.png` | User-visible successful connector tool outcome | T020 / SC-001 | **measured** Desktop Pass (`Tool call succeeded`) |
| `scenario-1-connector-walkthrough.mp4` | Short recording covering Steps A–C (US1) | T021 | **measured** Desktop |
| `p6-t031-us5-credential-ux-walkthrough.mp4` | US5 auth-surface → ready walkthrough | T031 | **measured** Desktop Pass |
| `03-tool-error.png` | Prior Fail frame (historical) | Verifier | Retained — superseded by `03-tool-success.png` |
| `VERDICT.txt` | US1 stamp | Verifier | **Pass** @ tip `743ebf6eb1` |
| `VERDICT-T031.txt` | US5 / T031 stamp | Verifier | **Pass** @ tip `b8609fad91` |

## Standing orders 11 + 12 (mandatory for GUI Pass)

| Order | FR | Rule |
|-------|-----|------|
| **SO 11** | FR-014 | Real Desktop app screenshots and/or short screen recording — unit/jsdom alone **fails** |
| **SO 12** | FR-015 | Media **committed** under this directory on the PR branch **and** embedded in the GUI PR body via `<img>` / `<video controls>` with absolute `/opt/cursor/artifacts/…` paths — Cursor agent artifact page links alone **fail** |

## SO11 mirror names (T031 Pass stamp)

| Committed | `/opt/cursor/artifacts/` mirror |
|-----------|----------------------------------|
| `02a-auth-surface.png` | `p6-t031-02a-auth-surface.png` |
| `02-auth-ready.png` | `p6-t031-02-auth-ready.png` |
| `p6-t031-us5-credential-ux-walkthrough.mp4` | `p6-t031-us5-credential-ux-walkthrough.mp4` |

**Status:** T031 US5 / SC-007 Desktop Pass stamped 2026-09-28 on tip `b8609fad91` (PR #221). Auth surface + vault-not-required + Host RPC ready measured on Desktop.
