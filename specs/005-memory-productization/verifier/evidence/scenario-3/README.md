# Evidence — scenario-3 (agent vs user layers)

FR-011/012 / standing orders **11** + **12** artifacts for:

- [Scenario 3 layers recipe](../../scenario-3-layers.md) (T030 SC-005 / SC-010)

Commit media here; embed absolute `/opt/cursor/artifacts/…` copies in GUI PR bodies.

## Required filenames (minimum) — T030 / SC-005 / SC-010

| Artifact | Content | Owner recipe | Status |
|----------|---------|--------------|--------|
| `01-agent-on-a.png` | Bot A memory pane after agent-scoped note save | T030 | **Present** (SC-005 Pass) |
| `02-agent-absent-on-b.png` | Bot B — A’s agent fact **not** listed | T030 | **Present** (SC-005 Pass) |
| `03-user-shared-both.png` | User-scoped profile visible in A and B contexts | T030 | **Present** (SC-005 Pass) |
| `04-orthogonality-kinds-layers.png` | note×agent + note×user + profile×user (SC-010) | T030 | **Present** (SC-010 Pass) |
| `06-post-restart-isolation-and-share.png` | After Desktop cold restart — isolation + sharing hold | T030 | **Present** (SC-005 Pass) |
| Optional `00-agent-team-open.png` | Agent Team open during layer path | T030 | **Present** |
| Optional `05-post-restart-agent-team.png` | Agent Team after cold restart | T030 | **Present** |
| Optional `07-post-restart-layer-filter.png` | Layer filter after restart | T030 | **Present** |
| Optional `scenario-3-layers-walkthrough.mp4` | Short recording covering Steps 1–5 | T030 | **Present** |
| `panel-state.json` · `p5-t030-scenario3-cdp.log` | CDP hard-assert state + driver log | T030 | **Present** |
| `p5-t030-host-t027-vitest.log` | Host T027 supporting vitest | T030 | **Present** |
| `VERDICT.txt` | Filled stamp when SC Pass is claimed | Verifier | **SC-005 + SC-010 Pass** (see file) |

**Provenance (T030):** Desktop CDP hard-assert agent isolation + user sharing + cold restart + orthogonality on tip `d3229a120c` (#192 Client T028; #193 Host T027) (DISPLAY=:1). See [VERDICT.txt](./VERDICT.txt) · `panel-state.json` · `p5-t030-scenario3-cdp.log`.

**SO11 mirrors (T030):** `/opt/cursor/artifacts/p5-t030-01-agent-on-a.png`, `p5-t030-02-agent-absent-on-b.png`, `p5-t030-03-user-shared-both.png`, `p5-t030-04-orthogonality-kinds-layers.png`, `p5-t030-06-post-restart-isolation-and-share.png`, `p5-t030-scenario3-layers-walkthrough.mp4`, `p5-t030-00-agent-team-open.png`, `p5-t030-05-post-restart-agent-team.png`, `p5-t030-07-post-restart-layer-filter.png`.
