# Evidence — Scenario 5 (Full Phase 5 replay)

**Recipe:** [../../scenario-5-full-replay.md](../../scenario-5-full-replay.md) (T033)
**Acceptance:** SC-007 · FR-011/012 (composite of Scenarios 1–4 + foundational stamp + T035 bus)
**Linear:** T033 [MOH-271](https://linear.app/momadhoun/issue/MOH-271) · T035 [MOH-273](https://linear.app/momadhoun/issue/MOH-273)
**Stamp:** see [VERDICT.txt](./VERDICT.txt)

## Artifacts (this stamp)

| Artifact | Content | Notes |
|----------|---------|-------|
| `00-agent-team-open-sc007.png` | Fresh Desktop Agent Team open | SC-007 smoke (DISPLAY=:1 CDP 9222) |
| `01-memory-surface-sc007.png` | Memory surface live (write/browse; Host catalog copy) | SC-007 smoke |
| `panel-state-sc007.json` · `p5-t033-sc007-smoke-cdp.log` | CDP hard-assert state + driver log | Supporting |
| `replay-pointer.log` | Gate + SHA/UTC + cited Scenario 1–3 | Required |
| `vitest-electron-bus.log` | T035 `no-electron-memory-bus` **3 passed** | Required |
| `vitest-foundations.log` | Supporting Host memory vitest | Supporting |
| `non-goals-spotcheck.log` | Contracts + exclusions + no-rewrite + Scenario 1–3 present | Supporting |
| `VERDICT.txt` | Composite stamp | Required |

## Cited prior FR-011 media (not duplicated)

| Scenario | Evidence home | Stamp |
|----------|---------------|-------|
| 1 | [../scenario-1/](../scenario-1/) | T016/T019/T022 Pass |
| 2 | [../scenario-2/](../scenario-2/) | T026 Pass |
| 3 | [../scenario-3/](../scenario-3/) | T030 Pass |
| 4 / non-goals | [../non-goals/](../non-goals/) (alias [../scenario-4/](../scenario-4/)) | T031 [#194](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/194) |

Unit/jsdom alone **fails** the GUI half. Foundational Pass (T013) MUST be green before this stamp counts toward product Done.

## Reuse policy

Do **not** delete existing media under `scenario-1/`…`scenario-3/`. Scenario 5 cites those paths rather than duplicating bytes. New composite-only artifacts live here.
