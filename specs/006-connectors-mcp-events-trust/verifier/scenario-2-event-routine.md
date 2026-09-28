# Scenario 2 — Event-triggered routine E2E

**Status:** Recipe drafted — product SC Pass **not** stamped (FR-014/015 evidence pending US2 Host/Client Desktop path + Desktop run)
**Owners:** DH Verifier (this recipe + Pass stamp) · DH Runtime (Host event create / webhook-harness wake / pause suppress) · DH Client (event-routine create + pane labeling + last-run / pause-resume)
**Linear:** [MOH-323](https://linear.app/momadhoun/issue/MOH-323/t025-us2-verifier-scenario-2-event-routine-recipe) · Epic [MOH-281](https://linear.app/momadhoun/issue/MOH-281/p6-connectors-mcp-events-trust)
**Acceptance slice:** T025 — Verifier Scenario 2 recipe covering SC-002 (create + harness fire + last-run + pause suppress) and SC-008 (cron still usable) with mandatory FR-014/015 (standing orders **11** + **12**) desktop evidence under `verifier/evidence/scenario-2/`
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 2
**Contract:** [../contracts/event-routine.md](../contracts/event-routine.md)
**Architect locks:** Additive `triggerKind=event` + `eventTrigger=webhook_harness` (R3 / FR-018); B1 webhook ingress → match → wake **existing** bot (not new-Session Pass); Pass family = webhook harness / Verifier fixture only — live Slack/GitHub/Linear/email **not** required; pause suppresses fire; cron remains (SC-008); no Electron Main event SoT (R6 / R9)

## Measurable Done (this recipe)

| Check | Pass bar |
|-------|----------|
| Recipe present | This file documents Steps A–E with Pass/Fail and evidence tags |
| SC coverage | SC-002 create + harness fire + last-run + pause suppress · SC-008 cron still usable · FR-004 empty-intent reject · FR-018 harness Pass family |
| FR-014 (SO 11) | Desktop screenshot(s) and/or short screen recording of the **real Desktop app** under `verifier/evidence/scenario-2/` — unit/jsdom alone **fails** |
| FR-015 (SO 12) | Evidence **committed** on the PR branch under that path **and** embedded in the GUI PR body via absolute `/opt/cursor/artifacts/…` `<img>` / `<video controls>` — artifact page links alone **fail** |
| Product SC stamp | **Deferred** — fill `evidence/scenario-2/VERDICT.txt` only after Desktop FR-014/015 media lands |

---

## Scope and prerequisites

| Layer | Required for | Status at recipe authoring |
|-------|--------------|----------------------------|
| Foundational Pass (T016) | Any product SC | **measured:** stamped in [README.md](./README.md#foundational-pass-checklist--recorded) · tip `origin/master` @ `7d71b5f0ee` (#208) |
| Additive event RoutineRecord (T008) | FR-004 Host create vocabulary | **measured:** `triggerKind` / `eventTrigger` + cron due skips event ([#208](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/208)) |
| Host Remotes create/list (T012) | Event create over Host HTTP/WS | **measured:** `remoteCreateRoutine` + `listRoutinesByBot` ([#208](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/208)) |
| B1 harness Pass path doc (T015) | FR-018 Verifier delivery shape | **measured:** [webhook-harness-b1.md](./webhook-harness-b1.md) |
| Electron no-bus (T013/T014) | Seam honesty | **measured:** [#206](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/206) |
| US2 Host event create (T022) | SC-002 create + empty-intent reject | **inferred:** open — foundation create path exists; product polish may still land |
| US2 Host harness wake + pause suppress (T023) | SC-002 fire + last-run + pause | **inferred:** open until Runtime lands B1 wake glue |
| Client event-routine UI (T024) | SC-002 desktop create / pane / last-run / pause | **inferred:** open until Client lands |

**Desktop prerequisites** (full Scenario 2 Pass): buildable Desktop (`apps/desktop`, `apps/desktop-host`) with ≥1 bot from prior phases; routines pane with event vs cron labeling, last-run / fire indicator, and pause/resume; Host webhook-harness delivery path documented in [webhook-harness-b1.md](./webhook-harness-b1.md); `DISPLAY` when Cloud Agent (`DISPLAY=:1`, `DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop`).

**Host-only rehearsal** (does **not** alone mark SC-002 Done): Agent Teams vitest below — proves additive event create + empty-intent reject + cron still due before Client UI / harness wake.

---

## Fixtures (deterministic strings)

Pass event family = **webhook harness / Verifier fixture** only (FR-018). Default Host Pass create:

| Field | Value |
|-------|-------|
| `triggerKind` | `event` |
| `eventTrigger` | `webhook_harness` |
| `intent` | non-empty (example: `Handle webhook harness`) |
| `scheduleLabel` (projection) | `Webhook harness` (or locale-equivalent clear event label) |
| Cron contrast row | `triggerKind=cron` + `@every 5m` (or any valid P4 schedule) — required for SC-008 |

Do **not** require named live Slack/GitHub/Linear/email adapters for Pass. Manual “Run now” alone is **insufficient** for SC-002 — harness delivery required.

---

## Step A — Create event routine (SC-002 create · FR-004 · FR-018)

**User / Verifier path (desktop):**

1. Launch the real Desktop app (not jsdom): `DISPLAY=:1 DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop`.
2. Open the bot **routines** surface (create / pane — not chat-paste alone).
3. Create a routine with **non-empty** intent and **webhook-harness / Verifier-fixture** event trigger (`triggerKind=event`, not cron).
4. Confirm a durable event row is user-visible and labeled as event / webhook harness (or equivalent).
5. Attempt empty / whitespace-only intent → clear reject; no Pass success row (FR-004).
6. Capture FR-014/015 evidence (see Evidence section).

**Host observation (when Client UI / wake is not yet available):**

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/connector-catalog.spec.ts -t 'T008/T012: createRoutine event'
```

Assert `createRoutine` with `triggerKind=event` + `eventTrigger=webhook_harness` + non-empty intent persists an active Host row (`scheduleLabel: Webhook harness`, `lastRunAt: null`). Assert missing `eventTrigger` and empty/whitespace intent reject with `TEAM_INVALID_ARGUMENT` and no Pass success row.

| Observation | Pass | Fail |
|-------------|------|------|
| Create | Durable event routine visible on Desktop pane (or Host list for Host-only rehearsal) | Cron-only create presented as event Pass; silent no-op |
| Empty intent | Clear reject; no Pass row | Accepted empty intent; silent skip |
| Any-one family | Completes with webhook harness / Verifier fixture | Pass gated on a live Slack/GitHub/Linear/email family |
| Evidence | Desktop screenshot/recording filed + committed + PR-embedded | Unit/jsdom-only claim |

**Claim tags:** desktop UI → **measured** (required for SC-002 Done); Host vitest-only → **measured** (Host create half) + **inferred** (does not complete SC-002).

---

## Step B — Event vs cron distinguishable in pane (SC-002 pane · SC-008 labeling)

**User / Verifier path (desktop):**

1. With the event routine from Step A present, ensure ≥1 **cron** routine also exists on the same bot (create via P4 path if needed).
2. Confirm the pane (or equivalent) shows **both** and that event vs cron are **distinguishable** by trigger type / schedule label (not identical chrome).
3. Capture FR-014/015 evidence of the labeled pane.

**Host observation:**

Same vitest as Step A — assert `listRoutinesByBot` returns both `cron` and `event` rows; chron due helper selects only the cron row at due time.

| Observation | Pass | Fail |
|-------------|------|------|
| Labeling | User-visible event vs cron distinction | Both rows look identical with no trigger cue |
| Additive | Cron row still listed after event create | Event create replaces or hides cron |

---

## Step C — Harness delivery fires + last-run visible (SC-002 fire · FR-005 · FR-018)

**User / Verifier path (desktop):**

1. With an **active** event routine (Step A), deliver **one** matching event via the documented webhook-harness / Verifier fixture path ([webhook-harness-b1.md](./webhook-harness-b1.md)) — **not** manual “Run now” alone.
2. Observe Host wake applying intent to the **existing** bot (P4 fire shape); do **not** score LLM wording.
3. Confirm a user-visible **last-run / fire** indicator updates (`lastRunAt` set or equivalent fired cue).
4. Capture FR-014/015 evidence of pre-fire (never / null) and post-fire (fired / timestamp) states when practical.

**Host observation (after T023 lands):**

Focused Host vitest covering harness match → wake + `lastRunAt` update (Owner Runtime). Until T023 exists, Host create/list vitest alone is **not** fire proof.

| Observation | Pass | Fail |
|-------------|------|------|
| Fire | Harness delivery produces wake + visible last-run / fire indicator | Manual “Run now” only; new-Session webhook Pass claimed as SC-002 |
| Existing bot | Wake applies intent to existing bot | Pass requires create-new-Session default |
| LLM | Wording not scored | Pass requires particular assistant prose |
| Evidence | Desktop frame of last-run / fire (GUI Pass) | Host log only presented as GUI Pass |

**Claim tags:** desktop UI + harness delivery → **measured** (required for SC-002 Done).

---

## Step D — Pause suppresses matching fire (SC-002 pause · FR-005)

**User / Verifier path (desktop):**

1. Pause the event routine from Step A (P4 pause control / Host `status=paused`).
2. Deliver a matching harness event again.
3. Confirm **no** fire for that paused interval (last-run unchanged; no new fire indicator).
4. Optionally resume and confirm harness fire works again (supporting; not required beyond pause suppress for SC-002).
5. Capture FR-014/015 evidence of paused state and no-fire observation.

**Host observation (after T023 lands):**

Assert paused event rows are ineligible for harness wake; matching delivery does not advance `lastRunAt`.

| Observation | Pass | Fail |
|-------------|------|------|
| Suppress | Matching delivery while paused does not fire | Fire recorded while paused |
| Evidence | Desktop paused + no-fire frame (GUI Pass) | Claim Pass without pause interval observation |

---

## Step E — Cron still usable (SC-008)

**User / Verifier path (desktop):**

1. Confirm a P4-style **cron** routine remains creatable / listable / pauseable on the same bot after event routines exist.
2. Do **not** rewrite or break `specs/004` cron Pass surface.
3. Capture FR-014/015 evidence that cron remains visible / usable (may share Step B pane frame).

**Host observation:**

Same Step A vitest — `routinesDueForWake` still returns the cron row at due time; event row is not cron-due.

| Observation | Pass | Fail |
|-------------|------|------|
| Cron additive | Cron still works beside event | Event path replaces / breaks cron due or pane |
| Specs/004 | No product rewrite of P4 contracts required for Pass | Pass claimed by deleting cron |

---

## Fail path (record; does not block recipe delivery)

| Condition | Required behavior |
|-----------|-------------------|
| Host event create unavailable | Clear user-visible failure; **no** silent empty “success” |
| Unit/jsdom-only evidence | Scenario 2 GUI **Fail** (FR-014 / SO 11) |
| Evidence not committed / not PR-embedded | GUI **Fail** (FR-015 / SO 12) |
| Pass claimed via Electron Main event / webhook bus | **Fail** (T013/T014 / R6) |
| Pass requires live Slack/GitHub/Linear/email family | **Fail** (FR-018) |
| Fire only via manual “Run now” | **Fail** (SC-002 / contract rule 4) |
| New-Session webhook default claimed as Pass fire | **Fail** (B1 / FR-018) |
| Empty intent accepted as Pass create | **Fail** (FR-004) |
| Cron broken / replaced by event-only path | **Fail** (SC-008 / FR-011) |

---

## FR-014 / FR-015 desktop visual evidence (mandatory — SO 11 + 12)

**Standing order 11 (FR-014):** Scenario 2 GUI Pass **requires** desktop screenshot(s) and/or a short screen recording of the **real Desktop app**. Vitest/jsdom alone **fails**.

**Standing order 12 (FR-015):** Those artifacts MUST be **committed** under `specs/006-connectors-mcp-events-trust/verifier/evidence/scenario-2/` on the PR branch **and** embedded in the GUI PR body via HTML `<img>` / `<video controls>` using absolute `/opt/cursor/artifacts/…` paths. Cursor agent artifact page links alone MUST NOT satisfy Pass.

**Directory:**

```text
specs/006-connectors-mcp-events-trust/verifier/evidence/scenario-2/
```

**Required artifacts (minimum):**

| Artifact | Content |
|----------|---------|
| `01-event-routine-created.png` (or `.webp`) | Routines pane after event create — durable event row + clear event/harness label |
| `02-harness-fired-last-run.png` (or recording segment) | After harness delivery — last-run / fire indicator visible |
| `03-paused-no-fire.png` (or recording segment) | Paused event routine + matching delivery produced **no** new fire |
| Optional `00-create-form.png` | Event-routine create surface before save |
| Optional `04-cron-still-usable.png` | Cron row still visible / usable beside event (SC-008); may merge with `01-…` |
| Optional `scenario-2-event-routine-walkthrough.mp4` / `.webm` | Short recording covering Steps A–D |
| `VERDICT.txt` | Filled stamp (template below) when product SC is claimed |

Also copy/publish walkthrough copies under `/opt/cursor/artifacts/` when running as Cloud Agent Verifier (SO 11). Placeholder README: [evidence/scenario-2/README.md](./evidence/scenario-2/README.md).

---

## Pass stamp template (fill when evidence lands — do not claim now)

```text
Verdict: Pass
Stamp: YYYY-MM-DD · tip <sha> · desktop <build> (DISPLAY=:1)
Linear: MOH-323 · Epic MOH-281
SC-002: Pass — evidence: evidence/scenario-2/{01-event-routine-created,02-harness-fired-last-run,03-paused-no-fire}.*
SC-008: Pass — cron still usable beside event (additive)
FR-004: Pass — empty intent rejected with clear reason
FR-018: Pass — webhook harness / Verifier fixture (not live family)
FR-014: desktop screenshots/recording present; not unit/jsdom-only (SO 11)
FR-015: media committed under verifier/evidence/scenario-2/ + PR embeds via /opt/cursor/artifacts/… (SO 12)
Blockers: none
```

**Rule:** Do not mark SC-002 / SC-008 Done in Linear / Spec without a filled stamp that includes FR-014/015 desktop evidence once Client event-routine UI + Host harness wake exist. Host vitest alone may advance create confidence but does **not** close US2 / Scenario 2. Leave [MOH-323](https://linear.app/momadhoun/issue/MOH-323/t025-us2-verifier-scenario-2-event-routine-recipe) **In Progress** until PO merges GUI evidence + SO12 embeds — Verifier does **not** mark Linear Done on recipe-only delivery.

---

## Explicit non-goals

- Client event-routine UI implementation (T024) — out of this Verifier recipe PR
- Host harness wake / pause-suppress product code (T022–T023) — out of this PR
- Connector install→auth→tool (Scenario 1 / US1)
- Denied permission path (Scenario 3 / US3)
- Session-dump secrets inspection (Scenario 4 / US4)
- Live Slack/GitHub/Linear/email event adapters (P7 / non-goal)
- Electron Main event / webhook / credential-value bus (forbidden; T013/T014)
- Product SC-001…SC-008 Done stamps on this docs-only delivery

---

## Traceability

| Artifact | Role |
|----------|------|
| [../quickstart.md](../quickstart.md) Scenario 2 | User-facing outline |
| [../contracts/event-routine.md](../contracts/event-routine.md) | Contract Pass bars |
| [../spec.md](../spec.md) FR-004/005/014/015/018 · SC-002/008 | Normative requirements |
| [README.md](./README.md) | Scenario owners map + foundational Pass + FR-014/015 mandate |
| [webhook-harness-b1.md](./webhook-harness-b1.md) | B1 Pass delivery path (T015) |
| [event-harness-inventory.md](./event-harness-inventory.md) | Setup inventory (T003) |
| [connector-event-trust-seam-locks.md](./connector-event-trust-seam-locks.md) | Architect Path A locks |
| This file | T025 rerunnable Scenario 2 event-routine recipe |
| T022–T024 | Host event create / harness wake + Client pane UI |
| T034 | Broader evidence directory packaging |

## Evidence for PO / DH Lead

**Recipe delivered (T025).** Product SC Pass **not** stamped. Host foundation (additive event create / list / B1 doc) is on master via [#208](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/208) / foundational T016. Full Scenario 2 Done waits on US2 Host/Client Desktop path (T022–T024) plus Verifier FR-014/015 desktop evidence using Steps A–D above. Placeholders under [evidence/scenario-2/](./evidence/scenario-2/) require SO 11+12 media before GUI Pass.
