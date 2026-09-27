# Scenario 3 — Author skill (+ reject empty)

**Status:** Product SC-003 **Pass** stamped 2026-09-27 — tip `4d2eb47840` (#132) · evidence [evidence/scenario-3/VERDICT.txt](./evidence/scenario-3/VERDICT.txt)
**Owners:** DH Verifier (this recipe + Pass stamp) · DH Runtime (Host user-skill persist / reject empty) · DH Client (authoring + discovery surfaces)
**Linear:** [MOH-178](https://linear.app/momadhoun/issue/MOH-178) · Epic [MOH-142](https://linear.app/momadhoun/issue/MOH-142)
**Acceptance slice:** T031 — Verifier Scenario 3 recipe covering SC-003 with mandatory FR-012 desktop evidence
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 3
**Contract:** [../contracts/skill-authoring.md](../contracts/skill-authoring.md)
**Clarify locks:** author save rejects empty name or body with clear reason (lock 1 / FR-013); FR-012 desktop visuals required (lock 6)

## Measurable Done (this recipe)

| Check | Pass bar |
|-------|----------|
| Recipe present | This file documents Steps A–C with Pass/Fail and evidence tags |
| SC coverage | SC-003 — reject empty save; happy-path author (non-empty name + body); appears in discovery |
| FR-012 | Desktop screenshot(s) and/or short screen recording under `verifier/evidence/scenario-3/` — unit/jsdom alone **fails** |
| Product SC stamp | **Pass** — [evidence/scenario-3/VERDICT.txt](./evidence/scenario-3/VERDICT.txt) (FR-012 desktop) |

---

## Scope and prerequisites

| Layer | Required for | Status at recipe authoring |
|-------|--------------|----------------------------|
| Foundational Pass (T014) | Any product SC | **measured:** stamped in [README.md](./README.md#foundational-pass-checklist--recorded) |
| Host `upsertUserSkill` stub + empty reject (T010) | Host validation half | **measured:** foundational checklist item 4; `team.spec.ts` rejects empty author fields |
| User skills root mount (T007) | Host-durable user skill persist | **measured:** Desktop Host mounts user skills root via `dsh-skill-filesystem` |
| US1 discovery surface | Observe authored skill in discovery | **measured:** Client discovery on master (T016–T018 / [#120](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/120)); Scenario 1 [scenario-1-discover-load.md](./scenario-1-discover-load.md) |
| Host user-skill create/update (T027) | Persist non-empty user skills | **measured:** on master (US3 Host); Desktop upsert writes `desktop-user-skills/` |
| Rejected empty not discoverable (T028) | FR-013 catalog half | **measured:** empty reject does not invent catalog row (Client + Host) |
| Client authoring surface (T029) | SC-003 desktop path | **measured:** #132 on master; Desktop create/edit surface |
| Wire authored → discovery + attach (T030) | Discovery + US3 IT attach | **measured:** discovery lists `source=user`; attach available (IT) |

**Desktop prerequisites** (full Scenario 3 Pass): buildable Desktop (`apps/desktop`, `apps/desktop-host`) with P1 create-bot available; skills discovery (US1) openable; in-app authoring surface; real Desktop app (`DISPLAY` when Cloud Agent).

**Host-only rehearsal** (does **not** alone mark SC-003 Done): Agent Teams / skill-filesystem vitest covering `upsertUserSkill` (or equivalent) reject-empty + persist non-empty — proves Host half before Client UI.

---

## Fixtures (deterministic strings)

| Field | Value |
|-------|-------|
| Display name (`displayName`) | `MzM authored skill` |
| Greppable instructional body (`instructionalBody`) | `Follow the MzM authored-skill playbook for Pass.` |
| Source expectation in discovery | User-authored (not `source=managed`; not the thin pack) |
| Empty reject cases | (1) empty `displayName` with non-empty body; (2) non-empty name with empty `instructionalBody` |

Do not reuse thin-pack id/label/body for the authored fixture ([thin-pack-skill.md](./thin-pack-skill.md) stays managed-only).

---

## Step A — Reject empty save (SC-003 reject; FR-013)

**User / Verifier path (desktop):**

1. Launch the real Desktop app (not jsdom).
2. Open the in-app skill-authoring surface (create path).
3. Attempt save with **empty display name** (body may be filled) → save **rejected**; clear user-visible reason; skill **not** listed as saved in discovery.
4. Attempt save with **empty instructional body** (name may be filled) → same reject behavior.
5. Capture FR-012 evidence (reject UI frame required).

**Host observation (when Client authoring UI is not yet available):**

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts
```

Assert Host `upsertUserSkill` (or equivalent) rejects empty `displayName` or empty `instructionalBody` and does not project a saved discoverable skill for those attempts.

| Observation | Pass | Fail |
|-------------|------|------|
| Reject | Empty name **or** empty body blocked with clear user-visible reason | Silent accept; vague error; or incomplete skill listed as saved |
| Catalog | Rejected draft absent from discovery as saved skill | Appears as saved / discoverable |
| Evidence | Desktop screenshot/recording of reject UI | Unit/jsdom-only claim |

**Claim tags:** desktop UI → **measured** (required for SC-003 Done); Host vitest-only → **measured** (Host half) + **inferred** (does not complete SC-003).

---

## Step B — Happy-path author (SC-003 author; FR-006)

**User / Verifier path (desktop):**

1. On the authoring surface, enter fixture `displayName` = `MzM authored skill` and `instructionalBody` containing `Follow the MzM authored-skill playbook for Pass.`
2. Save successfully.
3. Confirm persistence (reopen editor or Host observation shows same values).
4. Capture FR-012 evidence (authoring + saved state).

**Host observation:**

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts
```

Assert non-empty upsert writes Host-durable user skill and catalog projection can list it as user-authored.

| Observation | Pass | Fail |
|-------------|------|------|
| Save | Non-empty name + body persist | Save fails; values lost; Electron Main owns storage |
| Identity | Distinct from managed thin pack | Overwrites or masquerades as `mzm-thin-pack` |
| Evidence | Desktop frame of successful author/save | Unit/jsdom-only claim |

**Product path measured** on tip `4d2eb47840` (T027/T029 landed). Host upsert alone remains supporting when Client UI is unavailable.

---

## Step C — Appears in discovery (SC-003 discovery)

**User / Verifier path (desktop):**

1. Open skills discovery / library (US1 surface).
2. Confirm `MzM authored skill` appears as **user-authored** (alongside managed thin pack, or in a clearly labeled user group).
3. Confirm it is available for the load/attach path (attach itself is Scenario 2 / US2 — not required to complete attach for SC-003 Pass).
4. Capture FR-012 evidence (discovery frame showing authored skill).

| Observation | Pass | Fail |
|-------------|------|------|
| Visibility | Authored skill listed in Desktop discovery with fixture name | Missing; only Host logs / DevTools; or only managed pack shown |
| Labeling | Recognizable as user-authored (not presented as managed thin pack) | Mis-sourced as managed / thin pack |
| Evidence | Desktop screenshot/recording filed | Unit/jsdom-only claim |

**Product discovery half measured** on tip `4d2eb47840` (T028/T030 landed). US1 discovery chrome without user-skill wiring remains insufficient alone.

---

## Supporting observations (US3 independent test; not SC-003 stamp gates)

These match [quickstart.md](../quickstart.md) Scenario 3 steps 3–4 and FR-007. Record when available; **do not** block SC-003 Pass stamp on them alone once Steps A–C + FR-012 hold.

| Check | Pass bar |
|-------|----------|
| Edit + re-save (FR-007) | Updated non-empty name/body replace prior on reopen and in discovery |
| Attach/run like managed | Authored skill load/attach/run follows Scenario 2 Pass rules ([scenario-2-attach-run.md](./scenario-2-attach-run.md)); no LLM reply scoring |

---

## Fail path (record; does not block Pass when Host is healthy)

| Condition | Required behavior |
|-----------|-------------------|
| Empty name or body on save | Reject; clear reason; no durable discoverable skill (FR-013) |
| Host unavailable on save | Clear user-visible failure; no partial silent success |
| Unit/jsdom-only evidence | Scenario 3 **Fail** (FR-012) |
| Electron Main invents user-skill store | Scenario 3 **Fail** (T013 / constitution) |

---

## FR-012 desktop visual evidence (mandatory)

**Rule:** Scenario 3 GUI Pass **requires** desktop screenshot(s) and/or a short screen recording of the **real Desktop app**. Vitest/jsdom alone **fails** this scenario.

**Directory:**

```text
specs/003-skills-ux/verifier/evidence/scenario-3/
```

**Required artifacts (minimum):**

| Artifact | Content |
|----------|---------|
| `01-reject-empty.png` (or `.webp`) | Authoring reject UI for empty name and/or empty body |
| `02-author-save.png` (or recording segment) | Successful save of `MzM authored skill` with fixture body |
| `03-discovery-authored.png` (or recording segment) | Discovery listing the user-authored skill |
| Optional `04-edit-resave.png` | FR-007 edit path (supporting) |
| Optional `scenario-3-walkthrough.mp4` / `.webm` | Short recording covering Steps A–C |
| `VERDICT.txt` | Filled stamp (template below) when product SC is claimed |

Also copy/publish walkthrough copies under `/opt/cursor/artifacts/` when running as Cloud Agent Verifier (standing order 11).

**Placeholder dirs** land in T035; create `evidence/scenario-3/` when filing the first Pass stamp if missing.

---

## Pass stamp template (fill when evidence lands — do not claim now)

```text
Verdict: Pass
Stamp: YYYY-MM-DD · tip <sha> · desktop <build> (DISPLAY=:1)
Linear: MOH-178 · Epic MOH-142
SC-003: Pass — evidence: evidence/scenario-3/{01-reject-empty,02-author-save,03-discovery-authored}.*
FR-012: desktop screenshots/recording present; not unit/jsdom-only
FR-013: empty name/body rejected with clear reason; not listed as saved
Blockers: none
```

**Rule:** Do not mark SC-003 Done in Linear / Spec without a filled stamp that includes FR-012 desktop evidence once Client authoring + discovery wiring exist. Host vitest alone may advance upsert confidence but does **not** close US3 / Scenario 3.

---

## Explicit non-goals

- Host/Client authoring implementation (T027–T030) — out of this Verifier recipe PR
- Product SC-003 Done stamp / desktop Pass media (later Verifier stamp after US3 lands)
- Learn-from-demonstration; plugin-authored skills; detach/delete as Pass gate
- Full managed catalog; rewriting P1/P2 requirements
- Electron Main user-skill store (forbidden; T013)
- Scoring LLM replies for authored-skill attach/run

---

## Traceability

| Artifact | Role |
|----------|------|
| [../quickstart.md](../quickstart.md) Scenario 3 | User-facing outline |
| [../contracts/skill-authoring.md](../contracts/skill-authoring.md) | Contract Pass bars |
| [README.md](./README.md) | Scenario owners map + foundational Pass |
| [scenario-1-discover-load.md](./scenario-1-discover-load.md) | Discovery surface prerequisite |
| [scenario-2-attach-run.md](./scenario-2-attach-run.md) | Attach/run-like-managed supporting path |
| This file | T031 rerunnable Scenario 3 recipe |
| T027–T030 | Host persist/reject + Client authoring + discovery/attach wire |
| T035 | Evidence directory placeholders |
| T037 | Quickstart ↔ recipe cross-links |

## Evidence for PO / DH Lead

**Recipe delivered (T031).** Product SC-003 **Pass** stamped 2026-09-27 on tip `4d2eb47840` (#132) with FR-012 desktop evidence under [evidence/scenario-3/](./evidence/scenario-3/). Leave Linear Done marking to PO after stamp PR merge.
