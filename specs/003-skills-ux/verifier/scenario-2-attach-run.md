# Scenario 2 — Attach / run skill on a bot

**Status:** Recipe delivered — product SC Pass **not** stamped (await Client attach/run UI T023–T025 + FR-012 evidence)
**Owners:** DH Verifier (this recipe + Pass stamp) · DH Runtime (Host attach / persist / instruction bind) · DH Client (per-bot attach + run/active UI)
**Linear:** [MOH-173](https://linear.app/momadhoun/issue/MOH-173) · Epic [MOH-142](https://linear.app/momadhoun/issue/MOH-142)
**Acceptance slice:** T026 — Verifier Scenario 2 recipe covering SC-002, SC-006, SC-007 with mandatory FR-012 desktop evidence
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 2
**Contract:** [../contracts/attach-run.md](../contracts/attach-run.md)
**Instruction bind:** [instruction-bind.md](./instruction-bind.md) (SC-007 wiring-only bar)
**Thin-pack lock:** [thin-pack-skill.md](./thin-pack-skill.md) (`mzm-thin-pack` / `MzM thin pack`)
**Clarify locks:** multi-attach allowed, Pass ≥1 (lock 3); run = dedicated control **or** session apply with UI run/active (lock 4); Verifier measures assembly wiring, **not** LLM reply wording (lock 5); FR-012 desktop visuals required (lock 6)

## Measurable Done (this recipe)

| Check | Pass bar |
|-------|----------|
| Recipe present | This file documents Steps A–D with Pass/Fail and evidence tags |
| SC coverage | SC-002 (attach + run/active + persist); SC-006 (per-bot isolation); SC-007 (instruction assembly wiring; **no** LLM reply scoring) |
| FR-012 | Desktop screenshot(s) and/or short screen recording under `verifier/evidence/scenario-2/` — unit/jsdom alone **fails** |
| Product SC stamp | Deferred until Client attach/run UI (T023–T025) + Verifier desktop evidence land |

---

## Scope and prerequisites

| Layer | Required for | Status at recipe authoring |
|-------|--------------|----------------------------|
| Foundational Pass (T014) | Any product SC | **measured:** stamped in [README.md](./README.md#foundational-pass-checklist--recorded) |
| US1 discover/load path | Skill available to attach | **measured:** Host catalog + Client discovery on master (T015–T018 / [#118](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/118)–[#120](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/120)); Scenario 1 recipe [scenario-1-discover-load.md](./scenario-1-discover-load.md) |
| Host `attachSkill` + persist (T020) | Attach + SC-006 Host half | **measured:** merge [#121](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/121) |
| Host instruction bind (T021) | SC-007 Host half | **measured:** merge [#121](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/121) |
| Host attachment projection (T022) | Client can render per-bot attachments | **measured:** merge [#121](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/121) |
| Client per-bot attach UI (T023) | SC-002 / SC-006 desktop path | **inferred:** open / parallel — do not wait for recipe delivery |
| Client run/active UI (T024) | SC-002 run half | **inferred:** open until Client lands |
| Host-unavailable attach failure (T025) | Fail path (not Pass-only) | **inferred:** open until Client/Host land |

**Desktop prerequisites** (full Scenario 2 Pass): buildable Desktop (`apps/desktop`, `apps/desktop-host`) with P1 create-bot (two bots for SC-006); US1 load path so `mzm-thin-pack` is available to attach; real Desktop app (`DISPLAY` when Cloud Agent).

**Host-only rehearsal** (does **not** alone mark SC-002/006/007 Done): Agent Teams vitest covering `attachSkill`, per-bot isolation, and instruction-body assembly — proves Host half before Client UI.

---

## Fixtures (deterministic strings)

| Field | Value |
|-------|-------|
| Technical id | `mzm-thin-pack` |
| Human-readable label | `MzM thin pack` |
| Greppable instructional body | `Follow the MzM thin-pack playbook for Pass.` |
| Bots | Bot **A** (attach target) and bot **B** (isolation control) |
| Pass attach count | ≥1 attachment on A; multi-attach allowed |

Do not invent a second managed skill for chrome parity ([thin-pack-skill.md](./thin-pack-skill.md)).

---

## Step A — Attach on bot A (SC-002 attach; SC-006 start)

**User / Verifier path (desktop):**

1. Launch the real Desktop app (not jsdom).
2. Ensure `mzm-thin-pack` / MzM thin pack is available to attach (Scenario 1 / US1 path).
3. Select **bot A**; attach the loaded managed skill via that bot’s skills/overview surface.
4. Confirm the skill appears on **bot A’s** skills/overview (not only in the global catalog).
5. Capture FR-012 evidence.

**Host observation (when Client attach UI is not yet available):**

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts
```

Assert Host `attachSkill` (or equivalent) appends to bot A’s `skillAttachments` and projection exposes that attachment for A only.

| Observation | Pass | Fail |
|-------------|------|------|
| Attach visibility | Skill shown on **bot A’s** skills/overview after attach | Missing; or only global catalog shows it (contract Fail SC-002) |
| Surface | Per-bot surface required | Global catalog alone presented as success |
| Evidence | Desktop screenshot/recording filed | Unit/jsdom-only claim |

**Claim tags:** desktop UI → **measured** (required for product SC Done); Host vitest-only → **measured** (Host half) + **inferred** (does not complete SC-002).

---

## Step B — Per-bot isolation (SC-006)

**User / Verifier path (desktop):**

1. With thin pack attached to bot A (Step A).
2. Open **bot B** skills/overview (or equivalent per-bot surface).
3. Confirm the skill is **not** attached on B solely because of A’s attach.
4. Capture FR-012 evidence showing A attached / B not attached.

| Observation | Pass | Fail |
|-------------|------|------|
| Isolation | B does not show A’s attachment solely from A’s attach | Cross-bot leakage; auto-attach all bots |
| Evidence | Desktop frame(s) showing both bots’ surfaces | Claim without visual proof |

**Blocked until T023** for product SC-006 Done on desktop. Host attach isolation vitest is supporting (**measured** Host half; **inferred** for Client surface).

---

## Step C — Run / active + persist (SC-002 run + FR-005)

**User / Verifier path (desktop):**

1. On bot A, run via **dedicated run control** **or** a session turn that applies the attached skill (clarify lock 4 — either path Passes).
2. Confirm run/active UI is observable (control result and/or session-active indication).
3. Restart the desktop app **or** reload durable Host state.
4. Reopen bot A — attachment remains (run history not required).
5. Capture FR-012 evidence (run/active frame **and** post-reload attachment frame required).

| Observation | Pass | Fail |
|-------------|------|------|
| Run/active | Dedicated control **or** session-apply shows run/active UI | No observable run/active; LLM reply text used as Pass gate |
| Persist | Attachment on A remains after restart/reload | Lost; Electron Main invents attachment store |
| Evidence | Run/active + post-reload desktop frames | Claim without visual proof |

**Do not** score LLM assistant reply wording for run Pass (clarify lock 5 / FR-004).

---

## Step D — Instruction assembly wiring (SC-007; no LLM scoring)

**Verifier observation (normative bar from [instruction-bind.md](./instruction-bind.md)):**

1. After attach on bot A, obtain that bot’s Agent instruction / system-prompt assembly (Host `systemPrompt.assemble` / `renderPrompt`, or equivalent Host observation).
2. Assert rendered assembly **contains** the greppable thin-pack body: `Follow the MzM thin-pack playbook for Pass.`
3. Assert bot B assembly does **not** gain that body solely from A’s attach.
4. After cold resume / reload that recreates Agent A, repeat assemble assert.
5. **Do not** assert assistant message text or “skill adherence.”

**Host observation (rehearsal / supporting):**

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts
```

Filter or read cases that bind attached skill instructional bodies into Bot instruction assembly (FR-014 / SC-007).

| Observation | Pass | Fail / out of scope |
|-------------|------|---------------------|
| Wiring | Attached instructional body present in A’s assembly | Missing body; Client catalog row alone; createBot user-prompt-only |
| Per-bot | B’s assembly unchanged solely from A’s attach | Cross-bot leakage |
| Lifetime | Bind holds on subsequent turns and after cold resume | Bind only until first turn / lost on resume |
| Non-observation | — | LLM reply wording, adherence judgment, detach-as-Pass-gate |

Desktop evidence for SC-007 may be a Host/devtools assembly dump attached beside screenshots **or** a screenshot of a Verifier-visible assembly/debug surface when present — still file under `evidence/scenario-2/` and never substitute LLM chat text for the wiring check.

---

## Fail path (record; does not block Pass when Host is healthy)

| Condition | Required behavior |
|-----------|-------------------|
| Attach while Host unavailable | Clear user-visible failure; prior attachments unchanged (T025) |
| Only global catalog shows skill (no per-bot surface) | Scenario 2 **Fail** SC-002 |
| Unit/jsdom-only evidence | Scenario 2 **Fail** (FR-012) |
| LLM reply used as SC-007 Pass | Invalid — wiring-only bar |

---

## FR-012 desktop visual evidence (mandatory)

**Rule:** Scenario 2 GUI Pass **requires** desktop screenshot(s) and/or a short screen recording of the **real Desktop app**. Vitest/jsdom alone **fails** this scenario.

**Directory:**

```text
specs/003-skills-ux/verifier/evidence/scenario-2/
```

**Required artifacts (minimum):**

| Artifact | Content |
|----------|---------|
| `01-attach-bot-a.png` (or `.webp`) | Bot A skills/overview showing attached `MzM thin pack` / `mzm-thin-pack` |
| `02-bot-b-not-attached.png` (or recording segment) | Bot B surface without A’s attachment (SC-006) |
| `03-run-active.png` (or recording segment) | Run/active UI on bot A (control and/or session-active) |
| `04-post-reload-attach.png` (or recording segment) | Bot A still attached after restart/reload |
| Optional `05-instruction-assembly.txt` / screenshot | SC-007 wiring observation (body substring present; not LLM chat) |
| Optional `scenario-2-walkthrough.mp4` / `.webm` | Short recording covering Steps A–C (D may be Host-side) |
| `VERDICT.txt` | Filled stamp (template below) when product SC is claimed |

Also copy/publish walkthrough copies under `/opt/cursor/artifacts/` when running as Cloud Agent Verifier (standing order 11).

**Placeholder dirs** land in T035; create `evidence/scenario-2/` when filing the first Pass stamp if missing.

---

## Pass stamp template (fill when evidence lands — do not claim now)

```text
Verdict: Pass
Stamp: YYYY-MM-DD · tip <sha> · desktop <build> (DISPLAY=:1)
Linear: MOH-173 · Epic MOH-142
SC-002: Pass — evidence: evidence/scenario-2/{01-attach-bot-a,03-run-active,04-post-reload-attach}.*
SC-006: Pass — evidence: evidence/scenario-2/02-bot-b-not-attached.*
SC-007: Pass — wiring only (assembly contains thin-pack body); LLM replies not scored
FR-012: desktop screenshots/recording present; not unit/jsdom-only
Blockers: none
```

**Rule:** Do not mark SC-002 / SC-006 / SC-007 Done in Linear / Spec without a filled stamp that includes FR-012 desktop evidence once Client attach/run UI exists. Host vitest alone may advance attach/bind confidence but does **not** close US2 / Scenario 2.

---

## Explicit non-goals

- Client attach / run/active UI implementation (T023–T025) — out of this Verifier recipe PR; parallel Client work must not be blocked
- Product SC-002 / SC-006 / SC-007 Done stamps / desktop Pass media (later Verifier stamp after Client lands)
- Skill authoring (Scenario 3); discover/load product Pass (Scenario 1)
- Detach-as-Pass-gate; LLM reply-adherence proofs
- Full managed catalog, plugin skills, learn-from-demonstration
- Electron Main attachment store (forbidden; T013)
- Rewriting P2 persona field rules

---

## Traceability

| Artifact | Role |
|----------|------|
| [../quickstart.md](../quickstart.md) Scenario 2 | User-facing outline |
| [../contracts/attach-run.md](../contracts/attach-run.md) | Contract Pass bars |
| [instruction-bind.md](./instruction-bind.md) | SC-007 wiring-only Host approach + observation bar |
| [thin-pack-skill.md](./thin-pack-skill.md) | Locked id / label / body |
| [README.md](./README.md) | Scenario owners map + foundational Pass |
| This file | T026 rerunnable Scenario 2 recipe |
| T020–T022 | Host attach + bind + projection ([#121](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/121)) |
| T023–T025 | Client per-bot attach + run/active + Host-unavailable failure |
| T035 | Evidence directory placeholders |
| T037 | Quickstart ↔ recipe cross-links |

## Evidence for PO / DH Lead

**Recipe delivered (T026).** Product SC Pass **not** stamped. Host attach/bind/projection are on master via [#121](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/121). Full Scenario 2 Done waits on Client attach/run UI (T023–T025, parallel) plus Verifier FR-012 desktop evidence using Steps A–D above. SC-007 remains wiring-only — no LLM reply scoring.
