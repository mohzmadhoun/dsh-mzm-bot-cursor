# Evidence — Foundational T007–T012 (Host readiness + mounts)

**Verdict:** PASS
**Under test:** `cursor/p7-foundational-runtime-dc28` @ `9624bc575c` · draft PR [#243](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/243)
**Linear:** MOH-363…MOH-368 · epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350) · project **DeepSeek Harness - Cursor** (`P-MOH-2`)
**Verifier branch:** `cursor/p7-foundational-verifier-0a15`

## Acceptance checked

| # | Criterion | Result | Evidence class |
|---|-----------|--------|----------------|
| 1 | Diff scoped to desktop-host + pass-provider doc + tasks checkboxes (+ lockfile/deps) | PASS | **measured** — `git diff --name-only origin/master...9624bc575c` |
| 2 | No Electron Main SoT / no Client Computer UI / no MzM-Docs | PASS | **measured** — absent from name list |
| 3 | T007 Host readiness SoT `not_ready\|starting\|ready\|failed`, `local: true` | PASS | **measured** — `computer-settings.ts` / `box-readiness.ts` + vitest |
| 4 | T008/T010 Shell + subagent availability asserted | PASS | **measured** — `assertPassShellStack` / `assertPassSubagentStack`; base profile mounts (inventory) |
| 5 | T009 computerUse + Pass fixture + doc | PASS | **measured** — `computer-use-pass-fixture.ts` + `computer-use-pass-provider.md` |
| 6 | T011/T012 Computer settings + Host HTTP/WS via `remote.settings` | PASS | **measured** describe/update on `computer` ns; **inferred** wire = existing `dsh-api-settings-controller` on web-app (projects every registered ns) |
| 7 | Focused vitest | PASS | **measured** — 3 files / 10 tests |
| 8 | Path A locks | PASS | **measured** Host SoT + fixture; no Main bus in PR |

## Commands

```sh
pnpm exec vitest run \
  apps/desktop-host/tests/box-readiness.spec.ts \
  apps/desktop-host/tests/computer-use-pass-fixture.spec.ts \
  apps/desktop-host/tests/computer.spec.ts
# Test Files  3 passed (3)
# Tests  10 passed (10)
```

Log: [`vitest-focused.log`](./vitest-focused.log) · also `/opt/cursor/artifacts/p7-foundational-t007-t012/vitest-focused.log`

## Non-claims

- Not SC-001 / SC-002 / SC-003 product Pass (US1–US3 still locked)
- Not T013–T015 Foundational close
- No GUI desktop evidence required for this Host-substrate slice
