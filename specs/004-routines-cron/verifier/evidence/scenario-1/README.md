# Evidence — scenario-1 (create + pane list)

FR-010/011 / standing orders **11** + **12** artifacts for:

- [Scenario 1 create-list recipe](../../scenario-1-create-list.md) (T018)
- [Pane-list durability recipe](../../scenario-2-pane-list.md) (T021 US2 split)

Commit media here; embed absolute `/opt/cursor/artifacts/…` copies in GUI PR bodies.

## Required filenames (minimum) — T030 expectations

| Artifact | Content | Owner recipe | Status |
|----------|---------|--------------|--------|
| `01-create-listed-active.png` (or `.webp`) | Bot A routines pane after create — intent identity + active | T018 | **Present** (SC-001 Pass) |
| `02-reject-empty-or-invalid.png` (or recording segment) | Clear rejection for empty intent and/or bad schedule | T018 | **Present** (SC-001 Pass) |
| `03-bot-b-isolation.png` (or recording segment) | Bot B pane without A’s routine | T018 | **Present** (SC-006 Pass) |
| `04-pane-listed-fields.png` (or `.webp`) | Identity + schedule + status (+ last-run if shown) on bot routines pane | T021 | **Present** (US2 Pass) |
| `05-pane-after-leave-return.png` (or `.webp`) | Same Host list after leave/return or reload | T021 | **Present** (US2 Pass) |
| Optional `scenario-1-walkthrough.mp4` / `.webm` | Short recording covering create / reject / isolation (+ durability) | T018/T021 | — |
| Optional `scenario-1-create-walkthrough.mp4` / `.webm` | Create-path recording (Steps A–C) | T018 | **Present** |
| Optional `scenario-1-pane-list-walkthrough.mp4` / `.webm` | Durability-only recording (Steps A–B of pane-list recipe) | T021 | **Present** |
| `panel-state.json` · supporting `*.log` | CDP / Host supporting logs | T018/T021 | **Present** (T021 + `p4-t018-*`) |
| `VERDICT.txt` | Filled stamp when product SC / US2 path Pass is claimed | Verifier | **Full Scenario 1 Pass** (see file) |

**Numbering:** Pane-list US2 media stays in **this** directory (`04-`/`05-`). Do **not** put T021 Pass media under `../scenario-2/` — that folder is reserved for quickstart Scenario 2 (pause/resume / T024).

**Do not delete** existing `04-`/`05-` / walkthrough / VERDICT when filling T018 gaps.

**Provenance (T018):** Desktop CDP hard-assert create/reject/isolation on tip `85df964e51` (DISPLAY=:1). See [VERDICT.txt](./VERDICT.txt) · `p4-t018-create-cdp.log` · `p4-t018-panel-state.json`.

**Provenance (T021):** `04-`/`05-` (+ pane-list walkthrough) copied byte-identical from [`../us2-client-t020/`](../us2-client-t020/) Desktop Verifier frames (leave/return CDP-asserted).

**SO11 mirrors (T018):** `/opt/cursor/artifacts/p4-t018-01-create-listed-active.png`, `p4-t018-02-reject-empty-or-invalid.png`, `p4-t018-03-bot-b-isolation.png`, `p4-t018-scenario-1-create-walkthrough.mp4`.

**SO11 mirrors (T021):** `/opt/cursor/artifacts/p4-t021-04-pane-listed-fields.png`, `p4-t021-05-pane-after-leave-return.png`, `p4-t021-scenario-1-pane-list-walkthrough.mp4`.
