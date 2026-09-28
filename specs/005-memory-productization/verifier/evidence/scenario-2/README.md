# Evidence — scenario-2 (recall after restart)

FR-011/012 / standing orders **11** + **12** artifacts for:

- [Scenario 2 recall recipe](../../scenario-2-recall.md) (T026 SC-004)

Commit media here; embed absolute `/opt/cursor/artifacts/…` copies in GUI PR bodies.

## Required filenames (minimum) — T026 / SC-004

| Artifact | Content | Owner recipe | Status |
|----------|---------|--------------|--------|
| `01-post-restart-surface.png` | Bot memory pane after Desktop cold restart — profile+log+note distinguishable | T026 | **Present** (SC-004 Pass) |
| `02-browse-recall.png` | After Browse / recall Host `listMemories` re-project | T026 | **Present** (SC-004 Pass) |
| `03-inject-path.png` | Subsequent bot turn on Desktop (inject path exercised; LLM wording not scored) | T026 | **Present** (SC-004 Pass) |
| Optional `00-pre-restart-three-kinds.png` | Three kinds before restart | T026 | **Present** |
| Optional `00-agent-team-open-post-restart.png` | Agent Team open after restart | T026 | **Present** |
| Optional `scenario-2-recall-walkthrough.mp4` | Short recording: surface browse after restart + subsequent turn | T026 | **Present** |
| `panel-state.json` · `p5-t026-scenario2-cdp.log` | CDP hard-assert state + driver log | T026 | **Present** |
| `p5-t026-host-inject-vitest.log` | Host T024 `agent-teams:memory-recall` assemble wiring | T026 | **Present** |
| `p5-t026-host-t023-vitest.log` | Host T023 durable list across restart (supporting) | T026 | **Present** |
| `VERDICT.txt` | Filled stamp when SC Pass is claimed | Verifier | **SC-004 Pass** (see file) |

**Provenance (T026):** Desktop CDP hard-assert cold restart + browse/recall + subsequent turn on tip `e6f958e90a` (#189 on tip; #190 Host inject) (DISPLAY=:1). See [VERDICT.txt](./VERDICT.txt) · `panel-state.json` · `p5-t026-scenario2-cdp.log`.

**SO11 mirrors (T026):** `/opt/cursor/artifacts/p5-t026-01-post-restart-surface.png`, `p5-t026-02-browse-recall.png`, `p5-t026-03-inject-path.png`, `p5-t026-scenario2-recall-walkthrough.mp4`, `p5-t026-00-pre-restart-three-kinds.png`, `p5-t026-00-agent-team-open-post-restart.png`.
