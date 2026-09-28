# Evidence — scenario-1 (connector install → auth → tool)

FR-014/015 / standing orders **11** + **12** artifacts for [Scenario 1 connector recipe](../../scenario-1-connector.md) (T021 / SC-001 · SC-007). Client T019–T020 Desktop verify tip: see [VERDICT.txt](./VERDICT.txt).

Commit media here; embed absolute `/opt/cursor/artifacts/…` copies in GUI PR bodies.

## Required filenames (minimum)

| Artifact | Content | Owner recipe | Status |
|----------|---------|--------------|--------|
| `00-catalog-open.png` | Connector catalog open (verifier-fixture) | T019 / SC-001 | **measured** Desktop |
| `01-connector-installed.png` | Durable installed row (`needs_auth`) | T019 / SC-001 | **measured** Desktop |
| `02-auth-ready.png` | In-app auth ready + tools bound | T020 / SC-001 · SC-007 | **measured** Desktop |
| `03-tool-success.png` | User-visible successful connector tool outcome | T020 / SC-001 | **missing** — Fail frame is `03-tool-error.png` |
| `03-tool-error.png` | Run tool shows "Tool call error" (not success) | Verifier Fail | **measured** Desktop |
| `VERDICT.txt` | Stamp | Verifier | **Fail** — see file |

## Standing orders 11 + 12 (mandatory for GUI Pass)

| Order | FR | Rule |
|-------|-----|------|
| **SO 11** | FR-014 | Real Desktop app screenshots and/or short screen recording — unit/jsdom alone **fails** |
| **SO 12** | FR-015 | Media **committed** under this directory on the PR branch **and** embedded in the GUI PR body via `<img>` / `<video controls>` with absolute `/opt/cursor/artifacts/…` paths — Cursor agent artifact page links alone **fail** |

## SO11 mirror names (this Fail stamp)

| Committed | `/opt/cursor/artifacts/` mirror |
|-----------|----------------------------------|
| `00-catalog-open.png` | `p6-t019-t020-00-catalog-open.png` |
| `01-connector-installed.png` | `p6-t019-t020-01-connector-installed.png` |
| `02-auth-ready.png` | `p6-t019-t020-02-auth-ready.png` |
| `03-tool-error.png` | `p6-t019-t020-03-tool-error.png` |

**Status:** Desktop exercised. Catalog/install/auth **Pass** measured. Tool success **Fail** — Client does not unwrap Host `InvokeConnectorToolResult.toolCall` (see VERDICT). SC-001 not Done.
