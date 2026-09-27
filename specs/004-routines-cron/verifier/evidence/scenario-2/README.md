# Evidence — scenario-2 (pause / resume · SC-002)

FR-010/011 artifacts for **quickstart Scenario 2 — pause / resume** (SC-002).

**Recipe:** [../../scenario-3-pause-resume.md](../../scenario-3-pause-resume.md) (T024 / [MOH-217](https://linear.app/momadhoun/issue/MOH-217))
**Stamp:** [VERDICT.txt](./VERDICT.txt) — SC-002 Pass (Host wake gate + Desktop UI)
**T030 filename expectations:** keep the table below; do **not** delete present media when polishing.

## Required / present filenames (FR-010/011)

| File | What it shows | Status |
|------|----------------|--------|
| `01-agent-team-open.png` | Agent Team panel open | **Present** |
| `02-active-before-pause.png` | Active + Pause control | **Present** |
| `03-paused.png` | Paused + Resume control | **Present** |
| `04-active-after-resume.png` | Active after resume | **Present** |
| `05-after-return-active.png` | Active after leave/return | **Present** |
| `06-after-return-paused.png` | Paused after leave/return | **Present** |
| `panel-state.json` | CDP hard-assert state (T023 Verifier) | **Present** |
| `pause-resume-walkthrough.mp4` | Short Desktop recording | **Present** |
| `p4-us3-client-t023-verifier-cdp.log` | CDP driver log (T023 provenance) | **Present** |
| `p4-us3-client-t023-vitest.log` | Focused Client T023 vitest | **Present** |
| `p4-t024-host-wake-eligibility.log` | Host `isRoutineEligibleForWake` / T022 (no-fire half) | **Present** |
| `p4-t024-host-t022-verbose.log` | Verbose Host T022 pause/resume + wake gate | **Present** |
| `VERDICT.txt` | SC-002 Scenario stamp | **Present** |

**Provenance:** Desktop frames + walkthrough reused from Client US3 T023 ([MOH-216](https://linear.app/momadhoun/issue/MOH-216) / [#158](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/158)); mirrored under [`../us3-client-t023/`](../us3-client-t023/). Host no-wake proof measured on this tip via T022 vitest (preferred over multi-minute cron wait).

Commit media here; embed absolute `/opt/cursor/artifacts/…` copies in GUI PR bodies (standing orders 11+12).

**Not for pane-list:** US2 pane-list durability (T021) files evidence under [`../scenario-1/`](../scenario-1/) via [../../scenario-2-pane-list.md](../../scenario-2-pane-list.md). Do not place T021 Pass screenshots here.

**Not for cron fire:** quickstart Scenario 3 (SC-003) uses [`../scenario-3/`](../scenario-3/) / T028.
