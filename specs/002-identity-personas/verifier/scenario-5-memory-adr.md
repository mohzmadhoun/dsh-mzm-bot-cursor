# Scenario 5 — Memory layers ADR (docs-only)

**Status:** Recipe ready (rerunnable outline; **no** product SC Pass stamped here)
**Owners:** DH Verifier (this recipe + Pass stamp) · DH Spec / Docs (ADR file — T036)
**Linear:** [MOH-136](https://linear.app/momadhoun/issue/MOH-136) · Epic [MOH-88](https://linear.app/momadhoun/issue/MOH-88)
**Acceptance slice:** T037 — Verifier Scenario 5 recipe covering SC-006 (file presence + non-goal statement; **no** recall demo)
**Companion:** T038 — memory product UX absence in [non-goals.md](./non-goals.md)
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 5
**Contract:** [../contracts/memory-layers-adr.md](../contracts/memory-layers-adr.md)
**Clarify lock 2:** Memory ADR under `MzM-Docs/adr/`; filename identifies agent vs user memory layers
**ADR ownership:** Spec owns **T036** / [MOH-135](https://linear.app/momadhoun/issue/MOH-135). This recipe does **not** create, edit, or land the ADR file.

## Measurable Done (this recipe)

| Check | Pass bar |
|-------|----------|
| Recipe present | This file documents Steps A–B with Pass/Fail and evidence tags |
| SC coverage | SC-006 ADR presence under `MzM-Docs/adr/` + no memory product UX required for Pass |
| Non-observation | **Do not** require a memory recall/write demo for Pass |
| Product SC stamp | Deferred until Spec T036 ADR lands on master and Verifier re-runs Steps A–B |

---

## Scope and prerequisites

| Layer | Required for | Status at recipe authoring |
|-------|--------------|----------------------------|
| Foundational Pass (T011) | Any product SC | **measured:** stamped in [README.md](./README.md#foundational-pass-checklist--recorded) |
| Memory layers ADR (T036) | SC-006 presence half | **inferred:** Spec-owned; recommended path `MzM-Docs/adr/agent-vs-user-memory-layers.md` — **not** created by this Verifier PR |
| Memory UX absence (T038) | SC-006 non-goal half | **measured:** asserted in [non-goals.md](./non-goals.md) (this PR) |
| Scenario 5 recipe (T037) | Rerunnable docs checks | **measured:** this file |

**Docs prerequisites** (full Scenario 5 / SC-006 Pass): ADR committed under `MzM-Docs/adr/` with an identifying filename; content meets the contract minimum; shipped P2 surfaces still omit memory productization UX.

**Recipe-only delivery** (this PR): documents how to Pass SC-006 once T036 lands; does **not** alone mark SC-006 Done.

---

## Step A — ADR file presence + content (FR-009 / SC-006)

**Verifier path (repo docs — no desktop app required):**

1. Locate an ADR under `MzM-Docs/adr/` whose **filename identifies agent vs user memory layers** (recommended: `agent-vs-user-memory-layers.md`).
2. Confirm content distinguishes **agent memory** (per bot) from **user memory** (shared across bots) at the product/data-model level.
3. Confirm content states Phase 2 ships **no** memory product UX.
4. Do **not** run a recall/write demo; presence + stated non-goal are the Pass bars.

**Idempotent presence probe** (after T036 merges):

```sh
# Filename must identify agent vs user memory layers (contract recommendation shown).
test -f MzM-Docs/adr/agent-vs-user-memory-layers.md \
  || ls MzM-Docs/adr/*memory* 2>/dev/null | head -5
```

| Observation | Pass | Fail / Blocked |
|-------------|------|----------------|
| Path | File under `MzM-Docs/adr/` | Missing directory or no ADR |
| Filename | Identifies agent vs user memory layers | Generic / unrelated name that does not identify the topic |
| Content | Names agent-scoped vs user-scoped layers | Omits either layer |
| Non-delivery statement | States no P2 memory product UX | Silent on UX deferral / implies P2 ships memory UX |
| Recall demo | Not required | Requiring demo as Pass gate → Fail process |

**Claim tags:** After T036 on master → **measured** via `test -f` + content read. Before T036 lands → **Blocked** for SC-006 Done (recipe may still ship).

---

## Step B — No memory product UX required (FR-010 / SC-006)

**Verifier path (spot-check — complements [non-goals.md](./non-goals.md)):**

1. Confirm [non-goals.md](./non-goals.md) Memory product UX row is asserted (not deferred) for FR-010.
2. Spot-check shipped P2 Team/identity Client surfaces (`packages/experimental/client-ui-agent-team`) — no profile/log/note authoring or recall **product** flow required for Pass.
3. Do **not** Fail Pass solely because DSH chat session-reference `recall` nodes exist (harness context projection ≠ P5 memory productization).

| Observation | Pass | Fail / out of scope |
|-------------|------|---------------------|
| Pass criteria | Memory product UX absent from SC-006 / Phase 2 Pass bars | Treating memory recall/write UX as required for Done |
| Team identity UI | No memory profile/log/note product controls as Pass gate | Requiring such UX for P2 Pass |
| ADR vs product | ADR may name deferred P5 kinds | Shipping those kinds as P2 product entities |

**Claim tags:** Non-goals assertion + Team UI grep → **measured** (this PR). Full SC-006 Done still needs Step A after T036.

---

## Pass stamp template (fill when evidence lands)

```text
Verdict: Pass | Fail | Blocked
Stamp: YYYY-MM-DD · tip <sha> · ADR path <MzM-Docs/adr/…>
Linear: MOH-136 · Epic MOH-88 · ADR task MOH-135 (T036)
SC-006: Pass|Fail|Blocked — evidence: <ADR path + content excerpt refs>
Filename identifies agent vs user layers: Pass|Fail
Agent vs user distinction: Pass|Fail
States no P2 memory UX: Pass|Fail
Memory product UX required for Pass: No (FR-010) — evidence: non-goals.md + spot-check
Recall demo: N/A (not a Pass gate)
Blockers: <T036 ADR not on master | ADR content gap | other>
```

**Rule:** Do not mark SC-006 Done in Linear / Spec without a filled stamp that includes (1) ADR path under `MzM-Docs/adr/` with identifying filename, (2) agent vs user distinction + no-P2-UX statement, and (3) confirmation that memory product UX is not a Pass requirement. This recipe alone does **not** close US5.

---

## Explicit non-goals

- Creating or editing `MzM-Docs/adr/**` (T036 / Spec — out of this Verifier PR)
- Memory stores, recall tools, or write UX implementation
- Profile / log / note product kinds beyond naming them as deferred to P5 in the ADR
- Skills library (P3)
- Interactive MVP persona / rename / avatar / sections / delete as Pass gates for this scenario
- Treating harness session-reference `recall` UI as P5 memory productization

---

## Traceability

| Artifact | Role |
|----------|------|
| [../quickstart.md](../quickstart.md) Scenario 5 | User-facing outline |
| [../contracts/memory-layers-adr.md](../contracts/memory-layers-adr.md) | Contract Pass bars |
| [README.md](./README.md) | Scenario owners map + foundational Pass |
| [non-goals.md](./non-goals.md) | Memory product UX absence (T038) |
| This file | T037 rerunnable Scenario 5 recipe |
| T036 / [MOH-135](https://linear.app/momadhoun/issue/MOH-135) | Spec ADR land (blocker for SC-006 Done) |
| T038 / [MOH-137](https://linear.app/momadhoun/issue/MOH-137) | Non-goals memory UX row |
| T040 / [MOH-139](https://linear.app/momadhoun/issue/MOH-139) | Remaining non-goal rows asserted (skills, wipe, P1 re-litigation, Grok chrome) |

## Evidence for PO / DH Lead

**Recipe delivered (T037) + memory UX absence asserted (T038).** Product SC-006 Pass **not** stamped. ADR file is Spec-owned (T036 / MOH-135) and intentionally absent from this PR. Full Scenario 5 Done waits on T036 merge, then Verifier re-run of Steps A–B using the stamp template above.
