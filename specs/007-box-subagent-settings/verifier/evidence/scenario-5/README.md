# Evidence — Scenario 5 (Full Phase 7 replay)

**Recipe:** [../../scenario-5-full-replay.md](../../scenario-5-full-replay.md) (T030)
**Acceptance:** SC-006 · FR-012 · FR-013 · FR-014 (composite of Scenarios 1–4 + foundational stamp + bus / non-goals)
**Linear:** [MOH-386](https://linear.app/momadhoun/issue/MOH-386/t030-verifier-scenario-5-full-replay-sc-006) · Epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350) · `P-MOH-2` only

## Required filenames (minimum)

| Artifact | Content | Status |
|----------|---------|--------|
| `replay-pointer.log` | Gate + SHA/UTC + cited Scenario 1–4 evidence paths | Placeholder (T030) |
| `vitest-electron-bus.log` | T032 `no-electron-box-shell-computer-bus` rerun | Placeholder (T032 / composite) |
| `non-goals-spotcheck.log` | Contracts + exclusions + no-rewrite + Scenario recipes present | Placeholder |
| `00-desktop-smoke-sc006.png` (optional) | Fresh Desktop Shell/box + computerUse + Settings smoke | Placeholder until composite run |
| `VERDICT.txt` | Composite SC-006 stamp | **Not filled** — do not claim product Pass without composite Desktop evidence |

## Cited prior FR-013/014 media (not duplicated)

| Scenario | Evidence home | Recipe |
|----------|---------------|--------|
| 1 | [../shell-box/](../shell-box/) | [scenario-1-shell-box.md](../../scenario-1-shell-box.md) |
| 2 | [../computer-use/](../computer-use/) | [scenario-2-computer-use.md](../../scenario-2-computer-use.md) |
| 3 | [../settings/](../settings/) | [scenario-3-settings-computer.md](../../scenario-3-settings-computer.md) |
| 4 / non-goals | [../non-goals/](../non-goals/) | [non-goals.md](../../non-goals.md) |

Unit/jsdom alone **fails** the GUI half. Foundational Pass (T015) MUST be green before this stamp counts toward product Done.

## Standing orders 11 + 12 (mandatory for GUI slices)

| Order | FR | Rule |
|-------|-----|------|
| **SO 11** | FR-013 | Real Desktop screenshots/recording for Scenarios 1–3 — unit/jsdom alone **fails** |
| **SO 12** | FR-014 | Media **committed** under scenario homes (or cited) **and** GUI PR embeds via `/opt/cursor/artifacts/…` |

## Reuse policy

Do **not** delete existing media under `shell-box/` · `computer-use/` · `settings/` or `non-goals/`. Scenario 5 cites those paths rather than duplicating bytes. New composite-only artifacts live here.

## Stamp policy

Created by T030. Fill [VERDICT.txt](./VERDICT.txt) only after composite Desktop evidence run per [scenario-5-full-replay.md](../../scenario-5-full-replay.md). Recipe-only delivery MUST NOT claim product SC-006 Pass.
