# Scenario 2 — Recall after restart (surface + model-visible inject)

**Status:** Recipe + SC-004 Pass stamped — see [evidence/scenario-2/VERDICT.txt](./evidence/scenario-2/VERDICT.txt)
**Owners:** DH Verifier (this recipe + Pass stamp) · DH Runtime (Host list + memory-recall bind) · DH Client (browse/recall surface)
**Linear:** [MOH-264](https://linear.app/momadhoun/issue/MOH-264) (T026) · Epic [MOH-228](https://linear.app/momadhoun/issue/MOH-228)
**Acceptance slice:** T026 — Scenario 2 / SC-004 (surface return of profile+log+note after restart **and** one model-visible Host inject path; **no** LLM wording scored) with mandatory FR-011/012 (standing orders **11** + **12**) desktop evidence
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 2
**Contract:** [../contracts/recall.md](../contracts/recall.md)
**Inject observation bar:** [memory-inject-bind.md](./memory-inject-bind.md) (wiring / assembly — not LLM reply wording)
**Architect locks:** Host Memory catalog SoT; Recall Pass = surface + Host inject; transcript dump ≠ Pass; no Electron Main memory bus; FR-014 LLM wording not scored

## Measurable Done (this recipe — T026 / SC-004)

| Check | Pass bar |
|-------|----------|
| Recipe present | This file documents Steps A–D with Pass/Fail and evidence tags |
| SC coverage | SC-004 — three kinds returned after restart/durable reload **and** ≥1 curated fact model-visible via Host inject wiring |
| FR-011 (SO 11) | Desktop screenshot(s) and/or short screen recording of the **real Desktop app** under `verifier/evidence/scenario-2/` — unit/jsdom alone **fails** |
| FR-012 (SO 12) | Evidence **committed** on the PR branch under that path **and** embedded in the GUI PR body via absolute `/opt/cursor/artifacts/…` `<img>` / `<video controls>` — artifact page links alone **fail** |
| Product SC stamp | **measured:** `evidence/scenario-2/VERDICT.txt` Pass for SC-004 |

---

## Scope and prerequisites

| Layer | Required for | Status at recipe authoring |
|-------|--------------|----------------------------|
| Foundational Pass (T013) | Any product SC | **measured:** stamped in [README.md](./README.md#foundational-pass-checklist--recorded) |
| Scenario 1 write path (T016/T019/T022) | Three curated kinds to recall | **measured:** [evidence/scenario-1/](./evidence/scenario-1/) SC-001…SC-003 |
| Host durable list (T023) | Surface half after restart | **measured:** [#190](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/190) |
| Host memory-recall bind (T024) | Inject half (`agent-teams:memory-recall`) | **measured:** [#190](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/190) |
| Client browse/recall (T025) | Desktop surface + optional inject indicator | **measured:** [#189](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/189) |

**Desktop prerequisites:** buildable Desktop (`apps/desktop`, `apps/desktop-host`) with ≥1 teammate bot; Agent Team Bot memory surface (`data-team-bot-memories`) + Browse / recall (`data-team-browse-memories` / `data-team-memory-recall-surface`); Host Memory catalog + `agent-teams:memory-recall` bind on Desktop Host; `DISPLAY` when Cloud Agent (`DISPLAY=:1`, `DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop`). Rebuild Client UI bundle when tip advances past T025 (`pnpm --filter @deepseek-ai/dsh-experimental-client-ui-agent-team run bundle`) and Host agent-team when tip advances past T024 before claiming SC-004.

**Host-only rehearsal** (does **not** alone mark SC-004 Done): Agent Teams vitest for `US4 T023` restart list + `US4 T024` memory-recall assemble — proves Host halves before Desktop GUI.

---

## Fixtures (deterministic strings)

Prefer the same Scenario 1 fixtures so surface recall proves the same curated rows. Any greppable profile/log/note triple on one bot is OK when re-writing on a fresh Desktop profile.

| Kind | Content (canonical) | Layer |
|------|---------------------|-------|
| `profile` | `User prefers Asia/Shanghai timezone for scheduling` | `agent` (this bot) |
| `log` | `Logged standup: shipped Host writeMemory kind=log validation` | `agent` (this bot) |
| `note` | `Remember to stamp SC-003 after note write` | `agent` (this bot) |

Inject observation may use any **one** of those curated substrings (or a Scenario 2–only greppable fact written before restart). Do **not** assert assistant chat paraphrase.

---

## Step A — Ensure three kinds saved (Scenario 1 prerequisite)

**User / Verifier path (desktop):**

1. Launch the real Desktop app (not jsdom): `DISPLAY=:1 DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop`.
2. Open **Agent Team**; select a teammate bot; open the **Bot memory** surface.
3. Confirm profile + log + note rows are listed with distinguishable `data-team-memory-kind` values (write via Scenario 1 Steps A/D/G if missing).
4. Capture optional pre-restart frame (not required for SC-004 Done if Step C frames are complete).

| Observation | Pass | Fail |
|-------------|------|------|
| Three kinds | profile, log, note present and distinguishable | Missing kind; kinds unlabeled; chat-only |
| SoT | Rows from Host catalog projection | Client-only invent; transcript dump |

**Claim tags:** desktop UI → **measured** (or reuse Scenario 1 stamp as prerequisite evidence).

---

## Step B — Restart Desktop (or Verifier durable reload)

**User / Verifier path (desktop):**

1. Fully quit the Desktop Electron app (Main + Host child).
2. Relaunch with the same user-data / Host home so Lead Session replay restores the catalog (`pnpm run start:desktop`).
3. Wait until `dsh-app://app/` is interactive again.

| Observation | Pass | Fail |
|-------------|------|------|
| Restart | Cold relaunch completed | Leave/return only presented as restart |
| Evidence | Process quit + relaunch recorded in CDP/driver log | Soft reload only |

**Claim tags:** desktop restart → **measured**.

---

## Step C — Surface browse / recall (SC-004 surface half)

**User / Verifier path (desktop):**

1. Open **Agent Team** → Bot memory surface (`data-team-memory-recall-surface` / `data-team-bot-memories`).
2. Click **Browse / recall** (`data-team-browse-memories`) so Client calls Host `listMemories` and re-projects the catalog.
3. Confirm the same profile, log, and note facts return with kinds distinguishable.
4. Capture FR-011/012 evidence (see Evidence section).

| Observation | Pass | Fail |
|-------------|------|------|
| Surface return | Three kinds + fixture content after restart | Missing kind; empty list; wrong bot’s agent rows only |
| Path | Host listMemories / view.memories projection | Electron Main IPC catalog; transcript dump as memory |
| Evidence | Desktop screenshot/recording filed + committed + PR-embedded | Unit/jsdom-only claim |

**Claim tags:** desktop UI → **measured** (required for SC-004 Done).

---

## Step D — Model-visible Host inject path (SC-004 inject half; no LLM scoring)

**User / Verifier path:**

1. With ≥1 curated fact still on Host catalog for the target bot, start a **subsequent** bot turn (send a short message to that teammate) **or** observe Host `systemPrompt.assemble` / `renderPrompt` for that Agent scope.
2. Confirm Host inject wiring: scoped section `agent-teams:memory-recall` (or Host-equivalent) includes ≥1 curated fact substring from the catalog — reconstructable from Host journal / session log.
3. Optional: when Host projects `memoryRecallInjects`, note Client `data-team-memory-inject-indicator` — **absence does not fail** when Host omits the stamp field ([memory-inject-bind.md](./memory-inject-bind.md)).
4. Capture Desktop frame of the subsequent-turn path **and/or** Host assemble log proving the curated substring. **Do not** score assistant reply wording (FR-014).

| Observation | Pass | Fail |
|-------------|------|------|
| Wiring | Curated fact substring present in memory-recall assembly / apply indicator / session-log reconstructable inject | Missing from assembly; surface-only with no inject path |
| Non-scoring | No claim about LLM paraphrase quality | Pass gated on chat wording |
| Evidence | Desktop + Host wiring artifacts under `evidence/scenario-2/` | Unit-only inject without Desktop surface (or surface-only without inject) |

**Claim tags:** Host assemble / Desktop turn path → **measured**; LLM wording → **not scored**.

---

## Evidence filenames (FR-011/012 / SO 11+12)

Commit under [evidence/scenario-2/](./evidence/scenario-2/):

| Artifact | Content |
|----------|---------|
| `01-post-restart-surface.png` | Bot memory pane after Desktop restart — profile+log+note kinds distinguishable |
| `02-browse-recall.png` | After Browse / recall Host listMemories re-project |
| `03-inject-path.png` | Subsequent bot-turn path on Desktop (wiring exercised; not LLM wording) |
| Optional `00-agent-team-open-post-restart.png` | Agent Team open after restart |
| Optional `scenario-2-recall-walkthrough.mp4` | Short recording: restart → surface → browse → subsequent turn |
| `panel-state.json` · `p5-t026-scenario2-cdp.log` | CDP hard-assert state + driver log |
| `p5-t026-host-inject-vitest.log` | Host T024 assemble wiring (curated substring in `agent-teams:memory-recall`) |
| `VERDICT.txt` | Filled stamp when SC-004 Pass is claimed |
| `README.md` | Required filenames + SO11 mirror paths |

**SO11 mirrors (for PR embeds):** copy the same media to `/opt/cursor/artifacts/p5-t026-…` and embed absolute paths in the GUI PR body.

---

## VERDICT template

```text
T026 Scenario 2 recall after restart (SC-004) — DH Verifier
===========================================================
Verdict: Pass | Fail | Blocked
Stamp: <date> · tip origin/master @ <sha> (#189+#190 on tip)
  · Desktop DISPLAY=:1 CDP 9222 · DSH Local Build (Electron)
Branch: cursor/p5-t026-scenario2-recall-fe1d
Linear: MOH-264 (T026) · Epic MOH-228 — leave In Progress (PO closes after merge)
Recipe: specs/005-memory-productization/verifier/scenario-2-recall.md

Acceptance (T026 / SC-004)
--------------------------
[ ] Step B — Desktop cold restart completed
[ ] Step C — Surface returns profile+log+note with kinds distinguishable
[ ] Step D — Host model-visible inject wiring (≥1 curated fact); LLM wording not scored
[ ] FR-011 (SO 11) — real Desktop screenshots + optional walkthrough
[ ] FR-012 (SO 12) — media committed under verifier/evidence/scenario-2/
    + PR body MUST embed absolute /opt/cursor/artifacts/… paths

Scope lock
----------
Does NOT close MOH-264 — leave In Progress until PO merges this stamp PR.
Does NOT mark Linear Done. Does NOT merge.
Does NOT claim Scenario 3 layers (T027+) or Scenario 5 full replay (T033).
```

---

## Explicit non-goals (this recipe)

- LLM reply wording / “memory adherence” judgment (FR-014)
- Semantic ranking quality beyond “written fact is returned”
- Edit/delete UX; bot-tool write requirement
- Scenario 3 agent/user layer isolation (T027–T030)
- Foundational T013 re-stamp

---

## Rerun (idempotent)

```sh
# Host halves (supporting; not alone SC-004 Done)
pnpm exec vitest run packages/experimental/agent-team/tests/persistence.spec.ts -t 'US4 T023'
pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts -t 'US4 T024'

# Desktop (required for SC-004 Done)
DISPLAY=:1 DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop
# then CDP driver: write/ensure three kinds → quit → relaunch → browse/recall → subsequent turn
# evidence lands under specs/005-memory-productization/verifier/evidence/scenario-2/
```

**PO / DH Lead:** After Pass stamp merges, Scenario 2 / SC-004 may close. Leave [MOH-264](https://linear.app/momadhoun/issue/MOH-264) In Progress until merge; Verifier does not mark Linear Done or merge.
