# Scenario — Pane list + durability (US2 / T021)

**Status:** Product US2 pane-list Pass stamped 2026-09-27 — see [evidence/scenario-1/VERDICT.txt](./evidence/scenario-1/VERDICT.txt) (FR-002 + durability only; full SC-001 Scenario 1 Done still needs T018 `01–03`)
**Owners:** DH Verifier (this recipe + Pass stamp) · DH Runtime (Host list projection) · DH Client (bot routines pane)
**Linear:** [MOH-214](https://linear.app/momadhoun/issue/MOH-214) · Epic [MOH-188](https://linear.app/momadhoun/issue/MOH-188)
**Acceptance slice:** T021 — Verifier pane-list + leave/return (or reload) durability with mandatory FR-010/011 (standing orders **11** + **12**) desktop evidence
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 1 list steps (this file is the **US2 split** of create+list — **not** quickstart Scenario 2 pause/resume)
**Contract:** [../contracts/create-list.md](../contracts/create-list.md)
**Sibling create path:** [scenario-1-create-list.md](./scenario-1-create-list.md) (T018 Steps A–D)
**Architect locks:** Host Routine catalog SoT; `dsh-schedule` / `ui-schedule` header ≠ Routines Pass surface; per-bot isolation (SC-006)

## Numbering note (read first)

| Name | Meaning |
|------|---------|
| This file `scenario-2-pane-list.md` | Verifier **US2** recipe id (tasks T021 “if split”) |
| Quickstart **Scenario 2** | Pause / resume (SC-002) — owned by T024 → `scenario-3-pause-resume.md` / `evidence/scenario-2/` |
| Evidence home for **this** recipe | `verifier/evidence/scenario-1/` (same SC-001 create+list family as T018) |

Do **not** file pane-list Pass media under `evidence/scenario-2/` — that directory is reserved for quickstart Scenario 2 (pause/resume).

---

## Measurable Done (this recipe)

| Check | Pass bar |
|-------|----------|
| Recipe present | This file documents Steps A–C with Pass/Fail and evidence tags |
| SC / FR coverage | FR-002 pane list · US2 leave/return or reload durability · SC-001 list half (with T018 create path for full Scenario 1) |
| FR-010 (SO 11) | Desktop screenshot(s) and/or short screen recording of the **real Desktop app** under `verifier/evidence/scenario-1/` — unit/jsdom alone **fails** |
| FR-011 (SO 12) | Evidence **committed** on the PR branch under that path **and** embedded in the GUI PR body via absolute `/opt/cursor/artifacts/…` `<img>` / `<video controls>` — artifact page links alone **fail** |
| Product SC stamp | **Pass (US2 pane-list path)** @ tip `d72ff352f4` — [evidence/scenario-1/VERDICT.txt](./evidence/scenario-1/VERDICT.txt); full SC-001 still deferred pending T018 `01–03` |


---

## Scope and prerequisites

| Layer | Required for | Status at recipe authoring |
|-------|--------------|----------------------------|
| Foundational Pass (T014) | Any product SC | **measured:** [README.md](./README.md#foundational-pass-checklist--recorded) · tip `a141d11045` (#148) |
| Host create + per-bot (T015/T016) | ≥1 routine on bot A | **measured:** [#151](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/151) / Verifier [#152](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/152) |
| Host list projection (T019) | FR-002 Host half | **measured:** [#153](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/153) / Verifier [#155](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/155) |
| Client pane list UI (T020) | Desktop list surface | **measured:** [#154](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/154) · tip includes `data-team-routines-pane` |
| Scenario 1 create recipe (T018) | Full SC-001 composite | **measured:** [scenario-1-create-list.md](./scenario-1-create-list.md) (#149) — create/reject/isolation still required for Scenario 1 Done |

**Desktop prerequisites:** buildable Desktop with P1 bots; Host Routine catalog on Desktop Host; bot routines pane (`data-team-routines-pane`) — **not** session Schedule / `ui-schedule` header alone; `DISPLAY` when Cloud Agent; ≥1 Host-projected routine on the target bot (create via T017 UI or Host fixture).

**Host/Client rehearsal** (does **not** alone mark Scenario 1 / US2 Done):

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts -t 'listRoutinesByBot|projectRoutine'
pnpm exec vitest run packages/experimental/client-ui-agent-team/tests/team-action.client.spec.tsx -t 'T020 / US2'
```

---

## Fixtures (deterministic strings)

Prefer the same create fixtures as [scenario-1-create-list.md](./scenario-1-create-list.md) when composing a full Scenario 1 run. For pane-list-only rehearsal, any Host-persisted row with greppable identity is OK:

| Field | Pass expectation |
|-------|------------------|
| Pane surface | `data-team-routines-pane` (Agent Team bot routines) |
| Identity | Intent or intent-derived label readable on the row |
| Schedule | Product schedule label / `scheduleExpr` visible (e.g. `@every 5m` / “Every 5m”) |
| Status | `active` or `paused` (or equivalent) visible |
| Last-run | Null / “Not run yet” / timestamp — projected, not invented by Client |
| Durability | Same row(s) after leave/return **or** app reload |

---

## Step A — Open pane; list Host-projected rows (FR-002)

**User / Verifier path (desktop):**

1. Launch the real Desktop app (not jsdom).
2. Select a bot that already has ≥1 Host routine (create first via Scenario 1 Step A if needed).
3. Open the **bot routines pane** (`data-team-routines-pane`) — not the session Schedule / `ui-schedule` header alone.
4. Confirm each listed row shows human-readable identity, schedule, and active/paused (or equivalent) status from Host `RoutineProjection` (last-run may be empty/never).
5. Capture FR-010/011 evidence (see Evidence section).

| Observation | Pass | Fail |
|-------------|------|------|
| Surface | Bot routines pane lists Host rows | Empty success while Host has rows; or only `ui-schedule` / Main store |
| Fields | Identity + schedule + status readable | Missing status; Client-invented catalog |
| Evidence | Desktop screenshot/recording filed + committed + PR-embedded under `evidence/scenario-1/` | Unit/jsdom-only; media only under `us2-client-t020/` claimed as Scenario Pass |

**Claim tags:** desktop UI → **measured** (required for US2 / FR-002 Done); vitest-only → **measured** (supporting) + **inferred** (does not complete GUI Pass).

---

## Step B — Leave / return or reload durability (US2)

**User / Verifier path (desktop):**

1. With Step A list visible, leave the Agent Team / routines pane (close panel or navigate away) **or** reload/restart the Desktop app so Client re-reads Host projection.
2. Return to the same bot’s routines pane.
3. Confirm the **same** routine row(s) remain listed without re-creating them (identity + status still match Host).
4. Capture FR-010/011 evidence of the post-return (or post-reload) pane.

| Observation | Pass | Fail |
|-------------|------|------|
| Durability | Rows still listed from Host after leave/return or reload | List empty until user re-creates; Client-only memory |
| Evidence | Desktop frame after return/reload under `evidence/scenario-1/` | Claim without visual proof; T020-only path presented as Scenario stamp |

---

## Step C — Not Schedule header; not Electron Main (seam honesty)

**User / Verifier path:**

1. Confirm Pass path used `data-team-routines-pane` (or equivalent bot routines chrome), not `packages/client/ui-schedule/` header catalog alone.
2. Do **not** accept Electron Main / Node IPC as the list SoT ([schedule-not-routines.md](./schedule-not-routines.md)).

| Observation | Pass | Fail |
|-------------|------|------|
| SoT | Host HTTP/WS projection into bot pane | Schedule overlay alone; Main routines bus |

---

## Fail path (record; does not block Pass when Host is healthy)

| Condition | Required behavior |
|-----------|-------------------|
| Host catalog unavailable | Clear user-visible failure; **no** silent empty “success” |
| Unit/jsdom-only evidence | Pane-list GUI **Fail** (FR-010) |
| Evidence not committed / not PR-embedded | GUI **Fail** (FR-011 / SO 12) |
| Media only under `us2-client-t020/` without `evidence/scenario-1/` Scenario copies | Scenario / SC stamp **Fail** until Scenario-path media lands |
| Pass claimed via `dsh-schedule` / `ui-schedule` header alone | **Fail** |
| Pass claimed via Electron Main routines bus | **Fail** (T011 / FR-007) |

---

## FR-010 / FR-011 desktop visual evidence (mandatory — SO 11 + 12)

**Standing order 11 (FR-010):** Pane-list GUI Pass **requires** desktop screenshot(s) and/or a short screen recording of the **real Desktop app**. Vitest/jsdom alone **fails**.

**Standing order 12 (FR-011):** Those artifacts MUST be **committed** under `specs/004-routines-cron/verifier/evidence/scenario-1/` on the PR branch **and** embedded in the GUI PR body via HTML `<img>` / `<video controls>` using absolute `/opt/cursor/artifacts/…` paths. Cursor agent artifact page links alone MUST NOT satisfy Pass.

**Directory:**

```text
specs/004-routines-cron/verifier/evidence/scenario-1/
```

**Required artifacts for this US2 slice (minimum; add to T018 create set):**

| Artifact | Content |
|----------|---------|
| `04-pane-listed-fields.png` (or `.webp`) | Bot routines pane with identity + schedule + status (+ last-run if shown) |
| `05-pane-after-leave-return.png` (or `.webp`) | Same Host list after leave/return **or** post-reload |
| Optional `scenario-1-pane-list-walkthrough.mp4` / `.webm` | Short recording covering Steps A–B |
| `VERDICT.txt` | Filled stamp (template below) when product SC / US2 Scenario path is claimed |

Also copy/publish walkthrough copies under `/opt/cursor/artifacts/` when running as Cloud Agent Verifier (SO 11). Placeholder README: [evidence/scenario-1/README.md](./evidence/scenario-1/README.md).

**T020 supporting media** ([evidence/us2-client-t020/](./evidence/us2-client-t020/)) may be **referenced** in the stamp notes but MUST be **copied or re-captured** into `evidence/scenario-1/` (`04-` / `05-` names) before Scenario Pass.

---

## Pass stamp (filled — see VERDICT.txt; template for reruns)

```text
Verdict: Pass (US2 pane-list path)
Stamp: YYYY-MM-DD · tip <sha> · desktop <build> (DISPLAY=:1)
Linear: MOH-214 · Epic MOH-188
FR-002: Pass — evidence: evidence/scenario-1/04-pane-listed-fields.*
US2 durability: Pass — evidence: evidence/scenario-1/05-pane-after-leave-return.*
FR-010: desktop screenshots/recording present; not unit/jsdom-only (SO 11)
FR-011: media committed under verifier/evidence/scenario-1/ + PR embeds via /opt/cursor/artifacts/… (SO 12)
Note: Full SC-001/006/007 Scenario 1 Done still requires T018 Steps A–D media (01–03) in the same directory
Blockers: none
```

**Rule:** Do not mark SC-001 Done in Linear / Spec on this recipe alone. US2 pane-list Pass may advance FR-002 confidence when `04-`/`05-` media + stamp exist; composite Scenario 1 Done waits on T018 create/reject/isolation evidence plus this durability path.

---

## Explicit non-goals

- Client pane list implementation (T020) — product code out of this Verifier recipe PR
- Create / reject / isolation desktop path (T018 Steps A–D) — sibling recipe
- Pause / resume (quickstart Scenario 2 / US3 / T024)
- Cron fire + last-run scoring (Scenario 3 / US4)
- Event listeners, memory UX, Box/Shell, MCP
- Electron Main routines bus (forbidden; T011)
- Mounting `dsh-schedule` / `ui-schedule` as Routines SoT
- Product SC-001…SC-007 Done stamps on this docs-only delivery
- Closing [MOH-214](https://linear.app/momadhoun/issue/MOH-214) — leave **In Progress** until Scenario-path FR-010/011 stamp

---

## Traceability

| Artifact | Role |
|----------|------|
| [../quickstart.md](../quickstart.md) Scenario 1 list steps | User-facing outline |
| [../contracts/create-list.md](../contracts/create-list.md) | Contract Pass bars |
| [../spec.md](../spec.md) FR-002/006/007/010/011 · SC-001 · US2 | Normative requirements |
| [scenario-1-create-list.md](./scenario-1-create-list.md) | T018 create / reject / isolation |
| [schedule-not-routines.md](./schedule-not-routines.md) | SoT honesty lock |
| [README.md](./README.md) | Scenario owners map + FR-010/011 mandate |
| [evidence/us2-client-t020/](./evidence/us2-client-t020/) | Supporting Client T020 stamp (not Scenario path) |
| This file | T021 rerunnable pane-list + durability recipe |
| T019–T020 | Host projection + Client pane |
| T024 | Pause/resume recipe (quickstart Scenario 2) — do not collide evidence dirs |

## Evidence for PO / DH Lead

**US2 pane-list Scenario path Pass stamped** (2026-09-27) at master tip `d72ff352f4` (#156 recipe) with FR-010/011 media under [evidence/scenario-1/](./evidence/scenario-1/) (`04-`/`05-` + walkthrough). Provenance: byte-identical copy of T020 Desktop Verifier leave/return frames. Full SC-001 Scenario 1 Done still waits on T018 `01–03`. Leave [MOH-214](https://linear.app/momadhoun/issue/MOH-214) **In Progress** until the stamp PR merges; PO closes after SO12 PR embeds land.
