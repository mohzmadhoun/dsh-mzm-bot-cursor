# Scenario — Cron fire + last-run (quickstart Scenario 3 / US4 / T028)

**Status:** Product SC-003 Pass stamped 2026-09-27 — see [evidence/scenario-3/VERDICT.txt](./evidence/scenario-3/VERDICT.txt)
**Owners:** DH Verifier (this recipe + Pass stamp) · DH Runtime (Host cron wake + `lastRunAt`) · DH Client (last-run / fire indicator)
**Linear:** [MOH-221](https://linear.app/momadhoun/issue/MOH-221) · Epic [MOH-188](https://linear.app/momadhoun/issue/MOH-188)
**Acceptance slice:** T028 — Verifier Scenario cron-fire recipe covering SC-003 with mandatory FR-010/011 (standing orders **11** + **12**) desktop evidence
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 3
**Contract:** [../contracts/cron-fire.md](../contracts/cron-fire.md)
**Architect locks:** Host Routine catalog SoT + Host cron wake; `dsh-schedule` ≠ Routines Pass fire path; do **not** score LLM reply wording (R4)

## Numbering note (read first)

| Name | Meaning |
|------|---------|
| This file `scenario-4-cron-fire.md` | Verifier **US4** recipe id (tasks T028 “Scenario 3/4”) |
| Quickstart **Scenario 3** | Cron fire + last-run (SC-003) — **this** recipe |
| Evidence home | `verifier/evidence/scenario-3/` (quickstart Scenario 3) |
| `scenario-3-pause-resume.md` | US3 pause/resume — evidence under `evidence/scenario-2/` |
| `evidence/scenario-4/` | Reserved for quickstart Scenario 4 (non-goals / SC-004) if used; **not** this stamp |

Do **not** file cron-fire Pass media under `evidence/scenario-2/` or `evidence/scenario-4/`. Align evidence with quickstart Scenario 3 → `evidence/scenario-3/`.

---

## Measurable Done (this recipe)

| Check | Pass bar |
|-------|----------|
| Recipe present | This file documents Steps A–C with Pass/Fail and evidence tags |
| SC / FR coverage | SC-003: active routine fires via Host cron wake within ≤6 min product window · last-run visible · FR-005 · FR-010/011 |
| ≤6 min fire | **measured** Host `evaluateDueRoutines` / ticker wake + `lastRunAt` commit (T025) — **or** measured wall-clock wait ≤6 min on Desktop; full wall-clock wait **not required** when Host unit/session proof holds |
| Last-run UI | Desktop pane shows fire indicator / last-run from Host `lastRunAt` (T027) |
| LLM wording | **Not scored** |
| Sub-5m schedule | **Not required** — `@every 5m` (or product equivalent) is acceptable |
| FR-010 (SO 11) | Desktop screenshot(s) and/or short screen recording of the **real Desktop app** under `verifier/evidence/scenario-3/` — unit/jsdom alone **fails** GUI half |
| FR-011 (SO 12) | Evidence **committed** on the PR branch under that path **and** embedded in the GUI PR body via absolute `/opt/cursor/artifacts/…` `<img>` / `<video controls>` — artifact page links alone **fail** |
| Product SC stamp | **Pass (SC-003)** @ tip recorded in [evidence/scenario-3/VERDICT.txt](./evidence/scenario-3/VERDICT.txt) |

---

## Scope and prerequisites

| Layer | Required for | Status at recipe authoring |
|-------|--------------|----------------------------|
| Foundational Pass (T014) | Any product SC | **measured:** [README.md](./README.md#foundational-pass-checklist--recorded) |
| Host cron ticker wake + `lastRunAt` (T025) | FR-005 fire commit | **measured:** [#161](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/161) · verifier [#162](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/162) |
| Client last-run / fire indicator (T027) | Desktop last-run surface | **measured:** [#163](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/163) · SO11 under `evidence/us4-client-t027/` |
| Active routine + pane list | Visible row to observe fire | **measured:** on master (US1–US3) |

**Desktop prerequisites:** buildable Desktop with P1 bots; Host Routine catalog + cron evaluator on Desktop Host; bot routines pane (`data-team-routines-pane`) with fire indicator (`data-team-routine-fire-indicator`); ≥1 **active** Host-projected routine on a product-supported schedule (e.g. `@every 5m`); `DISPLAY` when Cloud Agent.

**Host/Client rehearsal** (does **not** alone mark SC-003 Done without Desktop FR-010 for last-run UI):

```sh
pnpm exec vitest run \
  packages/experimental/agent-team/tests/routine-cron.spec.ts \
  packages/experimental/agent-team/tests/team.spec.ts \
  -t 'US4 T025'
pnpm exec vitest run \
  packages/experimental/client-ui-agent-team/tests/team-action.client.spec.tsx \
  -t 'T027 / US4'
pnpm exec vitest run apps/desktop/tests/no-electron-routines-bus.spec.ts
```

---

## Fixtures (deterministic strings)

Prefer a Host-persisted **active** routine already listed on bot A (create via Scenario 1 if needed):

| Field | Pass expectation |
|-------|------------------|
| Pane surface | `data-team-routines-pane` (Agent Team bot routines) |
| Fire indicator | `data-team-routine-fire-indicator="never"` before fire · `"fired"` after Host `lastRunAt` |
| Schedule | Product-supported recurring (e.g. `@every 5m` / “Every 5m”) — **no** sub-5m test-only schedule required |
| Host wake | `evaluateDueRoutines` wakes due **active** rows; updates `lastRunAt` after fire commit/enqueue |
| Paused | Paused rows MUST NOT wake (covered by SC-002 / T022; not re-scored here) |
| LLM reply | Ignored for Pass |

---

## Step A — Host cron wake + `lastRunAt` (SC-003 fire · FR-005)

**Preferred measured path (no wall-clock ≤6 min wait):**

1. Prove Host wakes due **active** routines and commits `lastRunAt` via focused T025 vitest (`evaluateDueRoutines` / ticker path).
2. Confirm paused does not fire; failed wake does not advance `lastRunAt`.
3. File Host log under `evidence/scenario-3/` (e.g. `p4-t028-host-t025-vitest.log`).
4. Document that the ≤6-minute product window is satisfied by Host unit/session proof of due-wake + `lastRunAt` within the product schedule class (`@every 5m`), **not** by a Verifier wall-clock sit.

**Optional Desktop wait path** (only when practical): with an active `@every 5m` routine and `lastRunAt` null, wait ≤6 minutes for ≥1 automatic Host fire without manual trigger, then confirm last-run UI (Step B). Do **not** invent a sub-5-minute test-only schedule.

| Observation | Pass | Fail |
|-------------|------|------|
| Host wake | Active due routine wakes; `lastRunAt` set after commit | No wake path; list-only; `dsh-schedule` as SoT |
| Paused | Does not fire | Paused wakes |
| Wait | Host unit/session proof **or** measured ≤6 min Desktop wait | Requiring sub-5m schedule; claiming Pass without fire/`lastRunAt` |
| LLM | Not scored | Scoring reply wording as Pass bar |

**Claim tags:** Host wake + `lastRunAt` → **measured** (required for SC-003 fire half); wall-clock Desktop wait → **measured** when run, else **documented** as Host-proof substitute per this recipe.

---

## Step B — Last-run / fire indicator visible (SC-003 visibility · FR-005)

**User / Verifier path (desktop):**

1. Launch the real Desktop app (not jsdom).
2. Select a bot with ≥1 routine; open the **bot routines pane**.
3. Confirm at least one row shows last-run / fire indicator from Host `lastRunAt` (`data-team-routine-fire-indicator="fired"` + locale last-run copy).
4. Optionally capture a “never” row for contrast (`"never"` / Not run yet) — supporting, not a substitute for fired.
5. Leave/return (or reload) → fired indicator remains (Host projection).
6. Capture FR-010/011 evidence (`02-` / `03-` / `04-` frames + walkthrough).

| Observation | Pass | Fail |
|-------------|------|------|
| Fired UI | Pane shows last-run / fire indicator from Host | List-only without fire indicator after due/fire |
| Evidence | Desktop screenshot/recording under `evidence/scenario-3/` | Unit/jsdom-only |
| Durability | Fired remains after leave/return | Client-only flash |

**Claim tags:** desktop UI → **measured** (required for SC-003 GUI half).

---

## Step C — Explicit non-scores

| Item | Rule |
|------|------|
| LLM reply wording | **Not scored** |
| Box / Shell / MCP success | **Not required** |
| `ctx.jobs` in-flight id | Optional visibility only — **not** Pass SoT (T026 optional) |
| Sub-5m test schedule | **Not required** |
| Electron Main routines bus | **Forbidden** (T011) |
| `dsh-schedule` as fire SoT | **Fail** |

---

## Fail path (record; does not block Pass when Host+Client are healthy)

| Condition | Required behavior |
|-----------|-------------------|
| List-only without fire indicator after due/fire | **Fail** SC-003 |
| Unit/jsdom-only evidence for GUI last-run | Scenario 3 GUI **Fail** (FR-010) |
| Evidence not committed / not PR-embedded | GUI **Fail** (FR-011 / SO 12) |
| Media only under `us4-client-t027/` without Scenario-path copies in `evidence/scenario-3/` | Scenario / SC stamp **Fail** until Scenario-path media lands |
| Pass claimed via `dsh-schedule` / `ui-schedule` header alone | **Fail** |
| Pass claimed via Electron Main routines bus | **Fail** (T011 / FR-007) |
| Scoring LLM wording | **Fail** recipe honesty |
| Full SC-002 pause/resume re-stamp | Out of scope — T024 |

---

## FR-010 / FR-011 desktop visual evidence (mandatory — SO 11 + 12)

**Standing order 11 (FR-010):** Scenario 3 GUI Pass **requires** desktop screenshot(s) and/or a short screen recording of the **real Desktop app**. Vitest/jsdom alone **fails** the GUI half (Host wake log alone does **not** complete GUI Pass).

**Standing order 12 (FR-011):** Those artifacts MUST be **committed** under `specs/004-routines-cron/verifier/evidence/scenario-3/` on the PR branch **and** embedded in the GUI PR body via HTML `<img>` / `<video controls>` using absolute `/opt/cursor/artifacts/…` paths. Cursor agent artifact page links alone MUST NOT satisfy Pass.

**Directory:**

```text
specs/004-routines-cron/verifier/evidence/scenario-3/
```

**Required artifacts (minimum):**

| Artifact | Content |
|----------|---------|
| `02-fire-never.png` (or `.webp`) | Optional contrast — `never` / Not run yet |
| `03-fire-fired.png` (or `.webp`) | Fired last-run / fire indicator from Host `lastRunAt` |
| `04-after-return-fired.png` (or `.webp`) | Fired indicator after leave/return |
| `cron-fire-walkthrough.mp4` / `.webm` (optional but preferred) | Short recording covering last-run indicator |
| `p4-t028-host-t025-vitest.log` | Host `evaluateDueRoutines` / T025 (≤6 min fire half) |
| `panel-state.json` | CDP hard-assert state when Desktop CDP path used |
| `VERDICT.txt` | Filled SC-003 stamp |

Also copy/publish walkthrough copies under `/opt/cursor/artifacts/` when running as Cloud Agent Verifier (SO 11). **Reuse:** Client T027 media already filed under [`evidence/us4-client-t027/`](./evidence/us4-client-t027/) MAY satisfy FR-010 frames when byte-identical and CDP hard-assert holds; T028 adds Host T025 remeasure + this recipe + SC-003 stamp under `evidence/scenario-3/`.

---

## Pass stamp (filled — see VERDICT.txt; template for reruns)

```text
Verdict: Pass (SC-003 / quickstart Scenario 3)
Stamp: YYYY-MM-DD · tip <sha> · desktop <build> (DISPLAY=:1)
Linear: MOH-221 · Epic MOH-188
SC-003 Host fire + lastRunAt: Pass — evidence: evidence/scenario-3/p4-t028-host-t025-*.log
SC-003 last-run UI: Pass — evidence: evidence/scenario-3/{02,03,04}.*
FR-010: desktop screenshots/recording present; not unit/jsdom-only (SO 11)
FR-011: media committed under verifier/evidence/scenario-3/ + PR embeds via /opt/cursor/artifacts/… (SO 12)
LLM wording: not scored
Wall-clock ≤6 min Desktop wait: not run (Host unit/session proof used)
Blockers: none (SO12 PR HTML embeds owned by PO ManagePullRequest)
```

**Rule:** Do not mark SC-003 Done in Linear without a filled stamp that includes FR-010/011 desktop evidence for last-run **and** measured Host wake + `lastRunAt` (or measured Desktop ≤6 min fire). Leave [MOH-221](https://linear.app/momadhoun/issue/MOH-221) **In Progress** until PO merges + SO12 embeds; PO closes Done.

---

## Explicit non-goals

- Host/Client cron-fire product implementation (T025 / T027) — already on master
- Optional `ctx.jobs` in-flight visibility (T026) — leave unchecked unless already done
- Pause / resume scoring (quickstart Scenario 2 / US3 / T024)
- Create / reject / isolation (T018) · pane-list (T021)
- Event listeners, memory UX, Box/Shell, MCP
- Electron Main routines bus (forbidden; T011)
- Mounting `dsh-schedule` / `ui-schedule` as Routines SoT
- Closing [MOH-221](https://linear.app/momadhoun/issue/MOH-221) — leave **In Progress**; PO Done after merge + SO12

---

## Traceability

| Artifact | Role |
|----------|------|
| [../quickstart.md](../quickstart.md) Scenario 3 | User-facing outline |
| [../contracts/cron-fire.md](../contracts/cron-fire.md) | Contract Pass bars |
| [../spec.md](../spec.md) FR-005/010/011 · SC-003 · US4 | Normative requirements |
| [schedule-not-routines.md](./schedule-not-routines.md) | SoT honesty lock |
| [README.md](./README.md) | Scenario owners map + FR-010/011 mandate |
| [evidence/us4-host-t025/](./evidence/us4-host-t025/) | Supporting Host T025 stamp |
| [evidence/us4-client-t027/](./evidence/us4-client-t027/) | Supporting Client T027 stamp (mirrored Scenario media) |
| [scenario-3-pause-resume.md](./scenario-3-pause-resume.md) | US3 pause/resume — do not collide evidence dirs |
| This file | T028 rerunnable cron-fire recipe |
| T025–T027 | Host wake + Client last-run |

## Evidence for PO / DH Lead

**SC-003 Scenario path Pass stamped** (2026-09-27) with FR-010/011 media under [evidence/scenario-3/](./evidence/scenario-3/) (reused T027 Desktop frames + walkthrough) and Host T025 remeasure logs `p4-t028-host-t025-*.log`. Product tips: Host T025 [#161](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/161) · Client T027 [#163](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/163). Leave [MOH-221](https://linear.app/momadhoun/issue/MOH-221) **In Progress** until this stamp PR merges; PO closes after SO12 PR embeds land. Do **not** merge from Verifier; do **not** mark Linear Done here.
