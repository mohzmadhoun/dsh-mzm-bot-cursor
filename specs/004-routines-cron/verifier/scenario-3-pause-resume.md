# Scenario — Pause / resume (quickstart Scenario 2 / US3 / T024)

**Status:** Product SC-002 Pass stamped 2026-09-27 — see [evidence/scenario-2/VERDICT.txt](./evidence/scenario-2/VERDICT.txt)
**Owners:** DH Verifier (this recipe + Pass stamp) · DH Runtime (Host pause/resume + wake gate) · DH Client (pause/resume controls)
**Linear:** [MOH-217](https://linear.app/momadhoun/issue/MOH-217) · Epic [MOH-188](https://linear.app/momadhoun/issue/MOH-188)
**Acceptance slice:** T024 — Verifier Scenario pause/resume recipe covering SC-002 with mandatory FR-010/011 (standing orders **11** + **12**) desktop evidence
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 2
**Contract:** [../contracts/pause-resume.md](../contracts/pause-resume.md)
**Architect locks:** Host Routine catalog SoT; paused rows MUST NOT receive Host cron wakes (`isRoutineEligibleForWake`); Electron Main / `dsh-schedule` ≠ Routines Pass surface

## Numbering note (read first)

| Name | Meaning |
|------|---------|
| This file `scenario-3-pause-resume.md` | Verifier **US3** recipe id (tasks T024 “Scenario 2/3”) |
| Quickstart **Scenario 2** | Pause / resume (SC-002) — **this** recipe |
| Evidence home | `verifier/evidence/scenario-2/` (quickstart Scenario 2) |
| `scenario-2-pane-list.md` | US2 pane-list split — **not** pause/resume; evidence under `evidence/scenario-1/` |
| `evidence/scenario-3/` | Reserved for quickstart Scenario 3 (cron fire / SC-003 / T028) |

Do **not** file pause/resume Pass media under `evidence/scenario-3/` or `evidence/scenario-1/`.

---

## Measurable Done (this recipe)

| Check | Pass bar |
|-------|----------|
| Recipe present | This file documents Steps A–D with Pass/Fail and evidence tags |
| SC / FR coverage | SC-002: pause → pane paused → **no Host cron wake while paused** → resume → active · durable status · FR-003/004 |
| FR-010 (SO 11) | Desktop screenshot(s) and/or short screen recording of the **real Desktop app** under `verifier/evidence/scenario-2/` — unit/jsdom alone **fails** GUI half |
| FR-011 (SO 12) | Evidence **committed** on the PR branch under that path **and** embedded in the GUI PR body via absolute `/opt/cursor/artifacts/…` `<img>` / `<video controls>` — artifact page links alone **fail** |
| No-fire while paused | **measured** Host wake eligibility (`isRoutineEligibleForWake` / journal pause) — **or** measured Desktop last-run unchanged across a practical wait; do **not** invent multi-interval cron waits longer than practical |
| Product SC stamp | **Pass (SC-002)** @ tip recorded in [evidence/scenario-2/VERDICT.txt](./evidence/scenario-2/VERDICT.txt) |

---

## Scope and prerequisites

| Layer | Required for | Status at recipe authoring |
|-------|--------------|----------------------------|
| Foundational Pass (T014) | Any product SC | **measured:** [README.md](./README.md#foundational-pass-checklist--recorded) |
| Host pause/resume + wake gate (T022) | FR-003/004 · no wake while paused | **measured:** [#157](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/157) |
| Client pause/resume pane controls (T023) | Desktop pause/resume surface | **measured:** [#158](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/158) · SO11 under `evidence/scenario-2/` + `evidence/us3-client-t023/` |
| Pane list (T019/T020) | Visible routine row to pause | **measured:** on master |

**Desktop prerequisites:** buildable Desktop with P1 bots; Host Routine catalog on Desktop Host; bot routines pane (`data-team-routines-pane`) with pause/resume controls (`data-team-routine-pause` / `data-team-routine-resume`); ≥1 **active** Host-projected routine; `DISPLAY` when Cloud Agent.

**Host/Client rehearsal** (does **not** alone mark SC-002 Done without Desktop FR-010 for UI states):

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/routine-cron.spec.ts \
  packages/experimental/agent-team/tests/team.spec.ts -t 'US3 T022|wake-eligible'
pnpm exec vitest run packages/experimental/client-ui-agent-team/tests/team-action.client.spec.tsx -t 'T023'
```

---

## Fixtures (deterministic strings)

Prefer a Host-persisted active routine already listed on bot A (create via Scenario 1 if needed):

| Field | Pass expectation |
|-------|------------------|
| Pane surface | `data-team-routines-pane` (Agent Team bot routines) |
| Controls | `data-team-routine-pause` when active · `data-team-routine-resume` when paused |
| Status | Host-projected `active` ↔ `paused` (locale labels OK) |
| Schedule | Product schedule still visible while paused (e.g. `@every 5m` / “Every 5m”) |
| Wake gate | `isRoutineEligibleForWake(pausedRow) === false`; resume restores `true` |
| Last-run | Unchanged by pause alone (no invented fire while paused) |

---

## Step A — Pause active routine (SC-002 pause · FR-003)

**User / Verifier path (desktop):**

1. Launch the real Desktop app (not jsdom).
2. Select a bot with ≥1 **active** Host routine; open the **bot routines pane**.
3. Capture the active row (status + Pause control).
4. Activate **Pause**; confirm status becomes **paused** and Resume control appears.
5. Capture FR-010/011 evidence (`02-` / `03-` frames).

| Observation | Pass | Fail |
|-------------|------|------|
| Pause | Pane shows paused from Host projection | UI-only hide; status stays active; silent no-op |
| Controls | Resume visible; Pause gone (or disabled) for that row | Controls invent Client-only status |
| Evidence | Desktop screenshot/recording under `evidence/scenario-2/` | Unit/jsdom-only |

**Claim tags:** desktop UI → **measured** (required for SC-002 GUI half).

---

## Step B — No Host cron wake while paused (SC-002 no-fire · FR-003)

**Preferred measured path (no multi-minute cron wait):**

1. With the routine paused (Step A), prove Host wake suppression via `isRoutineEligibleForWake` / `routinesEligibleForWake` and Host `pauseRoutine` journal persistence (T022 vitest).
2. File the Host log under `evidence/scenario-2/` (e.g. `p4-t024-host-wake-eligibility.log`).
3. Optionally note Desktop last-run still “Not run yet” / unchanged on the paused row frame (`03-paused.*`) — supporting UI, not a substitute for the Host gate when the gate is measured.

**Optional Desktop wait path** (only when practical): wait at most one product schedule interval while paused and confirm no last-run / fire indicator update. Do **not** invent waits longer than practical for Pass.

| Observation | Pass | Fail |
|-------------|------|------|
| Wake gate | Paused row not wake-eligible; active remains eligible | Paused row still eligible / wakes |
| Evidence | Host vitest/session log **measured** (+ Desktop paused frame) | Claim without Host gate or Desktop no-fire proof |
| Wait | Optional ≤1 interval; Host eligibility alone OK | Requiring full 5m+ multi-interval wait for Pass |

**Claim tags:** Host eligibility → **measured** (required for SC-002 no-fire half); Desktop wait → **measured** when run, else **inferred** from Host gate + paused UI status.

---

## Step C — Resume → active (SC-002 resume · FR-004)

**User / Verifier path (desktop):**

1. On the paused row, activate **Resume**.
2. Confirm status returns to **active** and Pause control returns.
3. Capture FR-010/011 evidence (`04-active-after-resume.*`).
4. Host observation: `isRoutineEligibleForWake(resumed) === true` (covered by T022 rehearsal).

| Observation | Pass | Fail |
|-------------|------|------|
| Resume | Pane shows active from Host | Stuck paused; Client-only flip without Host |
| Evidence | Desktop frame after resume under `evidence/scenario-2/` | Vitest-only as GUI Pass |

---

## Step D — Durable status across leave/return or reload (SC-002 durability)

**User / Verifier path (desktop):**

1. With an **active** (or **paused**) status showing, leave the Agent Team / routines pane **or** reload Desktop so Client re-reads Host projection.
2. Return to the same bot’s routines pane.
3. Confirm the **same** status remains (Host durable — not Client-only memory).
4. Capture FR-010/011 evidence (`05-` / `06-` frames).

| Observation | Pass | Fail |
|-------------|------|------|
| Durability | Status matches Host after leave/return or reload | Status resets incorrectly; Client-only |
| Evidence | Desktop frames under `evidence/scenario-2/` | Claim without visual proof |

---

## Fail path (record; does not block Pass when Host is healthy)

| Condition | Required behavior |
|-----------|-------------------|
| Pause that only hides UI row | **Fail** — must suppress Host wake ([pause-resume.md](../contracts/pause-resume.md)) |
| Unit/jsdom-only evidence for GUI states | Scenario 2 GUI **Fail** (FR-010) |
| Evidence not committed / not PR-embedded | GUI **Fail** (FR-011 / SO 12) |
| Media only under `us3-client-t023/` without Scenario-path copies in `evidence/scenario-2/` | Scenario / SC stamp **Fail** until Scenario-path media lands |
| Pass claimed via `dsh-schedule` / `ui-schedule` header alone | **Fail** |
| Pass claimed via Electron Main routines bus | **Fail** (T011 / FR-007) |
| Full SC-003 cron fire / last-run scoring | Out of scope — T028 |

---

## FR-010 / FR-011 desktop visual evidence (mandatory — SO 11 + 12)

**Standing order 11 (FR-010):** Scenario 2 GUI Pass **requires** desktop screenshot(s) and/or a short screen recording of the **real Desktop app**. Vitest/jsdom alone **fails** the GUI half (Host wake log alone does **not** complete GUI Pass).

**Standing order 12 (FR-011):** Those artifacts MUST be **committed** under `specs/004-routines-cron/verifier/evidence/scenario-2/` on the PR branch **and** embedded in the GUI PR body via HTML `<img>` / `<video controls>` using absolute `/opt/cursor/artifacts/…` paths. Cursor agent artifact page links alone MUST NOT satisfy Pass.

**Directory:**

```text
specs/004-routines-cron/verifier/evidence/scenario-2/
```

**Required artifacts (minimum):**

| Artifact | Content |
|----------|---------|
| `02-active-before-pause.png` (or `.webp`) | Active status + Pause control |
| `03-paused.png` (or `.webp`) | Paused status + Resume control |
| `04-active-after-resume.png` (or `.webp`) | Active after resume |
| `05-after-return-active.png` / `06-after-return-paused.png` | Durability after leave/return |
| `pause-resume-walkthrough.mp4` / `.webm` (optional but preferred) | Short recording covering pause ↔ resume |
| `p4-t024-host-wake-eligibility.log` | Host `isRoutineEligibleForWake` / T022 vitest (no-fire half) |
| `panel-state.json` | CDP hard-assert state when Desktop CDP path used |
| `VERDICT.txt` | Filled SC-002 stamp |

Also copy/publish walkthrough copies under `/opt/cursor/artifacts/` when running as Cloud Agent Verifier (SO 11). **Reuse:** Client T023 media already filed under this directory (and mirrored in [`evidence/us3-client-t023/`](./evidence/us3-client-t023/)) MAY satisfy FR-010 frames when byte-identical and CDP `pass=true`; T024 adds Host wake eligibility proof + this recipe + SC-002 stamp.

---

## Pass stamp (filled — see VERDICT.txt; template for reruns)

```text
Verdict: Pass (SC-002 / quickstart Scenario 2)
Stamp: YYYY-MM-DD · tip <sha> · desktop <build> (DISPLAY=:1)
Linear: MOH-217 · Epic MOH-188
SC-002 pause UI: Pass — evidence: evidence/scenario-2/{02,03}.*
SC-002 no Host wake while paused: Pass — evidence: evidence/scenario-2/p4-t024-host-wake-eligibility.log (+ 03-paused.*)
SC-002 resume UI: Pass — evidence: evidence/scenario-2/04-active-after-resume.*
SC-002 durability: Pass — evidence: evidence/scenario-2/{05,06}.*
FR-010: desktop screenshots/recording present; not unit/jsdom-only (SO 11)
FR-011: media committed under verifier/evidence/scenario-2/ + PR embeds via /opt/cursor/artifacts/… (SO 12)
Blockers: none (SO12 PR HTML embeds owned by PO ManagePullRequest)
```

**Rule:** Do not mark SC-002 Done in Linear without a filled stamp that includes FR-010/011 desktop evidence for both paused and active states **and** measured Host wake suppression (or measured Desktop no-fire). Leave [MOH-217](https://linear.app/momadhoun/issue/MOH-217) **In Progress** until PO merges + SO12 embeds; PO closes Done.

---

## Explicit non-goals

- Host/Client pause/resume product implementation (T022 / T023) — already on master
- Cron fire + last-run scoring (quickstart Scenario 3 / US4 / T028)
- Create / reject / isolation (T018) · pane-list durability recipe body (T021)
- Event listeners, memory UX, Box/Shell, MCP
- Electron Main routines bus (forbidden; T011)
- Mounting `dsh-schedule` / `ui-schedule` as Routines SoT
- Closing [MOH-217](https://linear.app/momadhoun/issue/MOH-217) — leave **In Progress**; PO Done after merge + SO12

---

## Traceability

| Artifact | Role |
|----------|------|
| [../quickstart.md](../quickstart.md) Scenario 2 | User-facing outline |
| [../contracts/pause-resume.md](../contracts/pause-resume.md) | Contract Pass bars |
| [../spec.md](../spec.md) FR-003/004/010/011 · SC-002 · US3 | Normative requirements |
| [schedule-not-routines.md](./schedule-not-routines.md) | SoT honesty lock |
| [README.md](./README.md) | Scenario owners map + FR-010/011 mandate |
| [evidence/us3-client-t023/](./evidence/us3-client-t023/) | Supporting Client T023 stamp (mirrored Scenario media) |
| [scenario-2-pane-list.md](./scenario-2-pane-list.md) | US2 pane-list — do not collide evidence dirs |
| This file | T024 rerunnable pause/resume recipe |
| T022–T023 | Host wake gate + Client controls |

## Evidence for PO / DH Lead

**SC-002 Scenario path Pass stamped** (2026-09-27) with FR-010/011 media under [evidence/scenario-2/](./evidence/scenario-2/) (reused T023 Desktop frames + walkthrough) and Host wake-eligibility log `p4-t024-host-wake-eligibility.log`. Product tips: Host T022 [#157](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/157) · Client T023 [#158](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/158). Leave [MOH-217](https://linear.app/momadhoun/issue/MOH-217) **In Progress** until this stamp PR merges; PO closes after SO12 PR embeds land. Do **not** merge from Verifier; do **not** mark Linear Done here.
