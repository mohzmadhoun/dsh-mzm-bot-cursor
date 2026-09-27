# Scenario 1 — Create cron routine + pane list (create path)

**Status:** Recipe + product SC Pass stamped — see [evidence/scenario-1/VERDICT.txt](./evidence/scenario-1/VERDICT.txt)
**Owners:** DH Verifier (this recipe + Pass stamp) · DH Runtime (Host create / per-bot catalog) · DH Client (create UI + pane list)
**Linear:** [MOH-211](https://linear.app/momadhoun/issue/MOH-211) · Epic [MOH-188](https://linear.app/momadhoun/issue/MOH-188)
**Acceptance slice:** T018 — Verifier Scenario 1 recipe covering SC-001 / SC-006 / SC-007 create path with mandatory FR-010/011 (standing orders **11** + **12**) desktop evidence
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 1
**Contract:** [../contracts/create-list.md](../contracts/create-list.md)
**Architect locks:** Host Routine catalog SoT (Option 3); `dsh-schedule` ≠ Routines; confirm/edit optional (SC-007); per-bot isolation (SC-006)

## Measurable Done (this recipe)

| Check | Pass bar |
|-------|----------|
| Recipe present | This file documents Steps A–D with Pass/Fail and evidence tags |
| SC coverage | SC-001 create + reject · SC-006 per-bot · SC-007 confirm/edit absence must not fail Pass |
| FR-010 (SO 11) | Desktop screenshot(s) and/or short screen recording of the **real Desktop app** under `verifier/evidence/scenario-1/` — unit/jsdom alone **fails** |
| FR-011 (SO 12) | Evidence **committed** on the PR branch under that path **and** embedded in the GUI PR body via absolute `/opt/cursor/artifacts/…` `<img>` / `<video controls>` — artifact page links alone **fail** |
| Product SC stamp | **measured:** `evidence/scenario-1/VERDICT.txt` Pass (01–03 create path + retained 04–05 pane durability) |

**T021 pane-list durability:** Split recipe [scenario-2-pane-list.md](./scenario-2-pane-list.md) owns leave/return or reload durability + FR-002 field checks (evidence still under `verifier/evidence/scenario-1/` as `04-`/`05-`). Initial list appearance after create (SC-001) remains required here (Step A).

---

## Scope and prerequisites

| Layer | Required for | Status at recipe authoring |
|-------|--------------|----------------------------|
| Foundational Pass (T014) | Any product SC | **measured:** stamped in [README.md](./README.md#foundational-pass-checklist--recorded) · tip `a141d11045` (#148) |
| Host create + validate (T015) | SC-001 Host half | **measured:** `createRoutine` rejects empty intent / bad `scheduleExpr`; persists `status: active` ([#147](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/147)) |
| Host per-bot + confirm optional (T016) | SC-006 · SC-007 | **measured:** create keyed by `botId`; no confirm / displayName required ([#147](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/147)) |
| Client create-routine UI (T017) | SC-001 desktop path | **measured:** [#150](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/150) |
| Host list projection + Client pane (T019/T020) | Full pane list chrome | **measured:** T019 [#153](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/153) · T020 [#154](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/154) — create Pass still requires the routine **visible** on that bot’s routines pane (SC-001 / FR-002); durability Steps → [scenario-2-pane-list.md](./scenario-2-pane-list.md) |

**Desktop prerequisites** (full Scenario 1 create Pass): buildable Desktop (`apps/desktop`, `apps/desktop-host`) with P1 create-bot; ≥2 bots for SC-006; ability to open the **bot routines pane** (not session Schedule header alone); Host Routine catalog on Desktop Host; `DISPLAY` when Cloud Agent.

**Host-only rehearsal** (does **not** alone mark SC-001/SC-006 Done): Agent Teams vitest below — proves Host create / reject / per-bot before Client UI.

---

## Fixtures (deterministic strings)

Use these exact values so Pass/Fail diffs stay greppable:

| Field | Bot A (create Pass) | Reject probes | Bot B (isolation) |
|-------|---------------------|---------------|-------------------|
| Bot | Bot A (create target) | same | Bot B (must stay clean of A’s routine) |
| `intent` | `Check inbox` | empty / whitespace-only | — (do not create A’s routine on B) |
| `scheduleExpr` (valid) | `@every 5m` | — | — |
| `scheduleExpr` (invalid) | — | `@every 1m` (below 5m floor) and/or unsupported garbage | — |
| Expected status after create | `active` | no saved row | pane must not list A’s routine |

Identity MAY be the intent string or an intent-derived label — do not require a separate display-name field (FR-001 / SC-007).

---

## Step A — Create valid cron routine (SC-001 create)

**User / Verifier path (desktop):**

1. Launch the real Desktop app (not jsdom).
2. Select **bot A**; open the **bot routines pane** (not the session Schedule / `ui-schedule` header alone).
3. Create a routine with fixture intent `Check inbox` and schedule `@every 5m` (confirm step optional — skip if absent).
4. Confirm the routine is listed on bot A with human-readable identity (intent or intent-derived) and **active** status.
5. Capture FR-010/011 evidence (see Evidence section).

**Host observation (when Client UI is not yet available):**

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts -t 'persists createRoutine'
```

Assert `createRoutine` / `listRoutinesByBot` / `view.routines` shows a Host `RoutineRecord` for bot A with non-empty intent, product-supported `scheduleExpr`, and `status: active`.

| Observation | Pass | Fail |
|-------------|------|------|
| Create | Routine visible on bot A routines pane (or Host list for Host-only rehearsal) | Missing; only in Electron Main / Schedule overlay / DevTools |
| Identity | Intent or intent-derived label readable | Blank identity required separate displayName for Pass |
| Status | Shows active (or equivalent) | Wrong status or silent no-op |
| Evidence | Desktop screenshot/recording filed + committed + PR-embedded | Unit/jsdom-only claim |

**Claim tags:** desktop UI → **measured** (required for SC-001 Done); Host vitest-only → **measured** (Host half) + **inferred** (does not complete SC-001).

---

## Step B — Reject empty intent / invalid schedule (SC-001 reject)

**User / Verifier path (desktop):**

1. On bot A routines pane, attempt create with **empty** or whitespace-only intent (valid schedule OK) → rejected with a **clear user-visible** reason; no new listed routine.
2. Attempt create with non-empty intent and **invalid/unsupported** schedule (fixture `@every 1m` or garbage) → rejected with a clear user-visible reason; no new listed routine.
3. Capture FR-010/011 evidence of the rejection UI (or error surface).

**Host observation:**

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts -t 'persists createRoutine'
```

Assert empty intent and bad `scheduleExpr` throw / reject **without** writing a catalog row.

| Observation | Pass | Fail |
|-------------|------|------|
| Empty intent | Clear reason; no saved row | Silent accept or opaque failure |
| Bad schedule | Clear reason; no saved row | Accepts `@every 1m` / garbage as Pass |
| Evidence | Desktop frame of rejection (GUI Pass) | Host log only presented as GUI Pass |

---

## Step C — Per-bot isolation (SC-006)

**User / Verifier path (desktop):**

1. With bot A’s routine from Step A still present.
2. Select **bot B**; open bot B’s routines pane.
3. Confirm bot A’s routine is **not** listed solely because it exists on A.
4. Capture FR-010/011 evidence (bot B pane empty of A’s routine, or showing only B’s own rows).

**Host observation:**

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts -t 'persists createRoutine'
```

Assert `listRoutinesByBot` for bot B does not include bot A’s `routineId`.

| Observation | Pass | Fail |
|-------------|------|------|
| Isolation | Bot B pane does not show A’s routine | Global-only dump lists A’s row on B |
| Evidence | Desktop screenshot of bot B pane | Claim without visual proof |

---

## Step D — Confirm / edit absence must not fail (SC-007)

**User / Verifier path:**

1. After Steps A–C, do **not** fail Pass solely because a confirm-on-create step is missing.
2. Do **not** fail Pass solely because edit-routine UX is absent.
3. Optional confirm/edit chrome, if present, must not be required to complete Steps A–C.

| Observation | Pass | Fail / out of scope |
|-------------|---------------------|---------------------|
| Confirm optional | Create succeeds without confirm | Treating missing confirm as Fail |
| Edit optional | Pass without edit UI | Treating missing edit as Fail |

---

## Fail path (record; does not block Pass when Host is healthy)

| Condition | Required behavior |
|-----------|-------------------|
| Host catalog unavailable | Clear user-visible failure; **no** silent empty “success” |
| Unit/jsdom-only evidence | Scenario 1 GUI **Fail** (FR-010) |
| Evidence not committed / not PR-embedded | GUI **Fail** (FR-011 / SO 12) |
| Pass claimed via `dsh-schedule` / `ui-schedule` header alone | **Fail** — not Routines SoT ([schedule-not-routines.md](./schedule-not-routines.md)) |
| Pass claimed via Electron Main routines bus | **Fail** (T011 / FR-007) |

---

## FR-010 / FR-011 desktop visual evidence (mandatory — SO 11 + 12)

**Standing order 11 (FR-010):** Scenario 1 GUI Pass **requires** desktop screenshot(s) and/or a short screen recording of the **real Desktop app**. Vitest/jsdom alone **fails**.

**Standing order 12 (FR-011):** Those artifacts MUST be **committed** under `specs/004-routines-cron/verifier/evidence/scenario-1/` on the PR branch **and** embedded in the GUI PR body via HTML `<img>` / `<video controls>` using absolute `/opt/cursor/artifacts/…` paths. Cursor agent artifact page links alone MUST NOT satisfy Pass.

**Directory:**

```text
specs/004-routines-cron/verifier/evidence/scenario-1/
```

**Required artifacts (minimum):**

| Artifact | Content |
|----------|---------|
| `01-create-listed-active.png` (or `.webp`) | Bot A routines pane after create — intent identity + active |
| `02-reject-empty-or-invalid.png` (or recording segment) | Clear rejection for empty intent and/or bad schedule |
| `03-bot-b-isolation.png` (or recording segment) | Bot B pane without A’s routine |
| `04-pane-listed-fields.png` (T021) | Identity + schedule + status on bot routines pane — see [scenario-2-pane-list.md](./scenario-2-pane-list.md) |
| `05-pane-after-leave-return.png` (T021) | Same list after leave/return or reload |
| Optional `scenario-1-walkthrough.mp4` / `.webm` | Short recording covering Steps A–C (+ T021 durability) |
| `VERDICT.txt` | Filled stamp (template below) when product SC is claimed |

Also copy/publish walkthrough copies under `/opt/cursor/artifacts/` when running as Cloud Agent Verifier (SO 11). Placeholder README: [evidence/scenario-1/README.md](./evidence/scenario-1/README.md).

---

## Pass stamp template (fill when evidence lands — do not claim now)

```text
Verdict: Pass
Stamp: YYYY-MM-DD · tip <sha> · desktop <build> (DISPLAY=:1)
Linear: MOH-211 · Epic MOH-188
SC-001: Pass — evidence: evidence/scenario-1/{01-create-listed-active,02-reject-empty-or-invalid}.*
SC-006: Pass — evidence: evidence/scenario-1/03-bot-b-isolation.*
SC-007: Pass — confirm/edit absence did not fail create path
FR-002 / US2 durability: Pass — evidence: evidence/scenario-1/{04-pane-listed-fields,05-pane-after-leave-return}.* (recipe: scenario-2-pane-list.md)
FR-010: desktop screenshots/recording present; not unit/jsdom-only (SO 11)
FR-011: media committed under verifier/evidence/scenario-1/ + PR embeds via /opt/cursor/artifacts/… (SO 12)
Blockers: none
```

**Rule:** Do not mark SC-001 / SC-006 / SC-007 Done in Linear / Spec without a filled stamp that includes FR-010/011 desktop evidence once Client create + pane UI exists (including T021 `04-`/`05-` when claiming full Scenario 1). Host vitest alone may advance catalog confidence but does **not** close US1 / Scenario 1.

---

## Explicit non-goals

- Client create-routine UI implementation (T017) — out of this Verifier recipe PR
- Pane-list durability recipe body (owned by [scenario-2-pane-list.md](./scenario-2-pane-list.md) / T021)
- Pause / resume (quickstart Scenario 2 / US3)
- Cron fire + last-run (Scenario 3 / US4)
- Event listeners, memory UX, Box/Shell, MCP
- Electron Main routines bus (forbidden; T011)
- Mounting `dsh-schedule` / `ui-schedule` as Routines SoT
- Product SC-001…SC-007 Done stamps on this docs-only delivery

---

## Traceability

| Artifact | Role |
|----------|------|
| [../quickstart.md](../quickstart.md) Scenario 1 | User-facing outline |
| [../contracts/create-list.md](../contracts/create-list.md) | Contract Pass bars |
| [../spec.md](../spec.md) FR-001/002/006/007/010/011 · SC-001/006/007 | Normative requirements |
| [schedule-not-routines.md](./schedule-not-routines.md) | SoT honesty lock |
| [README.md](./README.md) | Scenario owners map + foundational Pass + FR-010/011 mandate |
| This file | T018 rerunnable Scenario 1 create-list recipe |
| [scenario-2-pane-list.md](./scenario-2-pane-list.md) | T021 pane-list + durability (evidence `04-`/`05-` here) |
| T015–T017 | Host create/validate/per-bot + Client create UI |
| T019–T020 | Host list projection + Client pane |
| T030 | Evidence directory filename expectations (when packaging) |

## Evidence for PO / DH Lead

**T018 create path Pass stamped** with Desktop FR-010/011 media `01–03` + walkthrough under [evidence/scenario-1/](./evidence/scenario-1/) (plus retained T021 `04–`/`05-`). Leave [MOH-211](https://linear.app/momadhoun/issue/MOH-211) **In Progress** until PO merges the stamp PR and completes SO12 PR embeds — Verifier does **not** mark Linear Done.
