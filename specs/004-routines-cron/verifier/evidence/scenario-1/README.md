# Evidence — scenario-1 (create + pane list)

FR-010/011 / standing orders **11** + **12** artifacts for:

- [Scenario 1 create-list recipe](../../scenario-1-create-list.md) (T018)
- [Pane-list durability recipe](../../scenario-2-pane-list.md) (T021 US2 split)

Commit media here; embed absolute `/opt/cursor/artifacts/…` copies in GUI PR bodies.

## Required filenames (minimum)

| Artifact | Content | Owner recipe | Status |
|----------|---------|--------------|--------|
| `01-create-listed-active.png` (or `.webp`) | Bot A routines pane after create — intent identity + active | T018 | Pending |
| `02-reject-empty-or-invalid.png` (or recording segment) | Clear rejection for empty intent and/or bad schedule | T018 | Pending |
| `03-bot-b-isolation.png` (or recording segment) | Bot B pane without A’s routine | T018 | Pending |
| `04-pane-listed-fields.png` (or `.webp`) | Identity + schedule + status (+ last-run if shown) on bot routines pane | T021 | **Present** (US2 Pass) |
| `05-pane-after-leave-return.png` (or `.webp`) | Same Host list after leave/return or reload | T021 | **Present** (US2 Pass) |
| Optional `scenario-1-walkthrough.mp4` / `.webm` | Short recording covering create / reject / isolation (+ durability) | T018/T021 | — |
| Optional `scenario-1-pane-list-walkthrough.mp4` / `.webm` | Durability-only recording (Steps A–B of pane-list recipe) | T021 | **Present** |
| `VERDICT.txt` | Filled stamp when product SC / US2 path Pass is claimed | Verifier | **US2 pane-list Pass** (see file) |

**Numbering:** Pane-list US2 media stays in **this** directory (`04-`/`05-`). Do **not** put T021 Pass media under `../scenario-2/` — that folder is reserved for quickstart Scenario 2 (pause/resume / T024).

**Provenance (T021):** `04-`/`05-` (+ walkthrough) copied byte-identical from [`../us2-client-t020/`](../us2-client-t020/) Desktop Verifier frames (leave/return CDP-asserted). See [VERDICT.txt](./VERDICT.txt).

**SO11 mirrors:** `/opt/cursor/artifacts/p4-t021-04-pane-listed-fields.png`, `p4-t021-05-pane-after-leave-return.png`, `p4-t021-scenario-1-pane-list-walkthrough.mp4`.
