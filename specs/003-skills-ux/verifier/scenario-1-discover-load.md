# Scenario 1 — Discover / load managed skill

**Status:** Recipe delivered — product SC Pass **not** stamped (await US1 Client discovery + FR-012 evidence)
**Owners:** DH Verifier (this recipe + Pass stamp) · DH Runtime (Host catalog / thin pack) · DH Client (discovery / load UI)
**Linear:** [MOH-166](https://linear.app/momadhoun/issue/MOH-166) · Epic [MOH-142](https://linear.app/momadhoun/issue/MOH-142)
**Acceptance slice:** T019 — Verifier Scenario 1 recipe covering SC-001 with mandatory FR-012 desktop evidence
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 1
**Contract:** [../contracts/discover-load.md](../contracts/discover-load.md)
**Thin-pack lock:** [thin-pack-skill.md](./thin-pack-skill.md) (`mzm-thin-pack` / `MzM thin pack`)
**Clarify locks:** load = available-to-attach (lock 2); FR-012 desktop visuals required (lock 6)

## Measurable Done (this recipe)

| Check | Pass bar |
|-------|----------|
| Recipe present | This file documents Steps A–C with Pass/Fail and evidence tags |
| SC coverage | SC-001 — discover thin-pack managed skill, make available to attach, survive leave/return + restart/reload |
| FR-012 | Desktop screenshot(s) and/or short screen recording under `verifier/evidence/scenario-1/` — unit/jsdom alone **fails** |
| Product SC stamp | Deferred until Client discovery/load (T015–T018) + Verifier desktop evidence land |

---

## Scope and prerequisites

| Layer | Required for | Status at recipe authoring |
|-------|--------------|----------------------------|
| Foundational Pass (T014) | Any product SC | **measured:** stamped in [README.md](./README.md#foundational-pass-checklist--recorded) |
| Thin-pack ship + mount (T006/T007) | Host catalog half of SC-001 | **measured:** `mzm-thin-pack` on Desktop Host; merge [#115](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/115) |
| Catalog projection (T011) | Host→Client catalog path | **measured:** `remoteView.skills` / `listSkillCatalog`; merge [#115](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/115) |
| Host catalog returns thin pack (T015) | Product discovery data path | **inferred:** open until Runtime lands |
| Client discovery/library (T016) | SC-001 desktop path | **inferred:** open until Client lands |
| Load = available-to-attach (T017) | SC-001 load half | **inferred:** open until Client lands |
| Host-unavailable failure UI (T018) | Fail path (not Pass-only) | **inferred:** open until Client/Host land |

**Desktop prerequisites** (full Scenario 1 Pass): buildable Desktop (`apps/desktop`, `apps/desktop-host`) with P1 create-bot available; ability to open skills discovery/library on the real Desktop app (`DISPLAY` when Cloud Agent).

**Host-only rehearsal** (does **not** alone mark SC-001 Done): managed-skills mount vitest + catalog projection — proves Host list/get of `mzm-thin-pack` before Client UI.

---

## Fixtures (deterministic strings)

| Field | Value |
|-------|-------|
| Technical id | `mzm-thin-pack` |
| Human-readable discovery label | `MzM thin pack` |
| Greppable instructional body | `Follow the MzM thin-pack playbook for Pass.` |
| Managed count for Pass | Exactly **one** `source=managed` skill |

Do not invent a second managed skill for chrome parity ([thin-pack-skill.md](./thin-pack-skill.md)).

---

## Step A — Discover thin-pack managed skill (SC-001 discover)

**User / Verifier path (desktop):**

1. Launch the real Desktop app (not jsdom).
2. Open skills discovery / library surface.
3. Confirm the thin-pack managed skill is listed with human-readable name **`MzM thin pack`** (id `mzm-thin-pack` may also appear).
4. Confirm discovery shows **exactly one** managed skill for Pass environments (not a full inventory dump — SC-004 bounds apply later in Scenario 4).
5. Capture FR-012 evidence (see Evidence section).

**Host observation (when Client UI is not yet available):**

```sh
pnpm exec vitest run apps/desktop-host/tests/managed-skills.spec.ts
test -f apps/desktop-host/managed-skills/mzm-thin-pack/SKILL.md
rg -n 'Follow the MzM thin-pack playbook for Pass\.' apps/desktop-host/managed-skills/mzm-thin-pack/SKILL.md
```

Assert `ctx.skills.list()` / `get('mzm-thin-pack')` (or Host Team `remoteView.skills`) includes the thin pack with managed mapping.

| Observation | Pass | Fail |
|-------------|------|------|
| Visibility | Managed thin pack visible in Desktop discovery with human-readable name | Missing, wrong id/label, or only in Host logs / DevTools |
| Count | Exactly one managed skill for Pass | Zero, or full-catalog theater required for Pass |
| Evidence | Desktop screenshot/recording filed | Unit/jsdom-only claim |

**Claim tags:** desktop UI → **measured** (required for SC-001 Done); Host vitest-only → **measured** (Host half) + **inferred** (does not complete SC-001).

---

## Step B — Load = available to attach (SC-001 load; clarify lock 2)

**User / Verifier path (desktop):**

1. From discovery (Step A), make `mzm-thin-pack` / MzM thin pack **available to attach**.
2. Confirm no separate multi-step “load wizard” ritual is required — select / make-available is enough (FR-002).
3. Confirm the skill is ready to enter the attach flow (attach UI itself is Scenario 2 / US2 — not required to complete attach for Scenario 1 Pass).
4. Capture FR-012 evidence showing available-to-attach state.

| Observation | Pass | Fail |
|-------------|------|------|
| Load | Skill becomes available to attach from discovery | Silent no-op, or mandatory multi-step load ritual |
| Clarity | User can tell the skill is attach-ready | Ambiguous empty state presented as success |

**Blocked until T016/T017** for product SC-001 Done. Host catalog presence alone is supporting (**inferred** for load UI).

---

## Step C — Survive leave/return + restart/reload (SC-001 durability)

**User / Verifier path (desktop):**

1. With thin pack discovered and available to attach (Steps A–B).
2. Leave discovery and return — managed skill still listed and available.
3. Restart the desktop app **or** reload durable Host state.
4. Reopen discovery — `mzm-thin-pack` / MzM thin pack still listed and available to attach.
5. Capture FR-012 evidence (post-reload frame required).

**Host observation:**

```sh
pnpm exec vitest run apps/desktop-host/tests/managed-skills.spec.ts
```

Managed ship path + filesystem mount should retain `mzm-thin-pack` across process restart (on-disk managed root). User-authored skills are out of Scenario 1 Pass scope (Scenario 3).

| Observation | Pass | Fail |
|-------------|------|------|
| Leave/return | Still listed / available | Disappears until reinstall ritual |
| Restart/reload | Still listed / available from Host-durable / shipped path | Lost; Electron Main invents catalog |
| Evidence | Post-reload desktop screenshot/recording | Claim without visual proof |

---

## Fail path (record; does not block Pass when Host is healthy)

| Condition | Required behavior |
|-----------|-------------------|
| Host catalog unavailable | Clear user-visible failure; **no** silent empty “success” (T018) |
| Unit/jsdom-only evidence | Scenario 1 **Fail** (FR-012) |

---

## FR-012 desktop visual evidence (mandatory)

**Rule:** Scenario 1 GUI Pass **requires** desktop screenshot(s) and/or a short screen recording of the **real Desktop app**. Vitest/jsdom alone **fails** this scenario.

**Directory:**

```text
specs/003-skills-ux/verifier/evidence/scenario-1/
```

**Required artifacts (minimum):**

| Artifact | Content |
|----------|---------|
| `01-discovery-thin-pack.png` (or `.webp`) | Discovery/library showing `MzM thin pack` / `mzm-thin-pack` |
| `02-available-to-attach.png` (or recording segment) | Skill in available-to-attach / load-complete state |
| `03-post-reload.png` (or recording segment) | Same after leave/return **or** app restart/reload |
| Optional `scenario-1-walkthrough.mp4` / `.webm` | Short recording covering Steps A–C |
| `VERDICT.txt` | Filled stamp (template below) when product SC is claimed |

Also copy/publish walkthrough copies under `/opt/cursor/artifacts/` when running as Cloud Agent Verifier (standing order 11).

**Placeholder dirs** land in T035; create `evidence/scenario-1/` when filing the first Pass stamp if missing.

---

## Pass stamp template (fill when evidence lands — do not claim now)

```text
Verdict: Pass
Stamp: YYYY-MM-DD · tip <sha> · desktop <build> (DISPLAY=:1)
Linear: MOH-166 · Epic MOH-142
SC-001: Pass — evidence: evidence/scenario-1/{01-discovery-thin-pack,02-available-to-attach,03-post-reload}.*
FR-012: desktop screenshots/recording present; not unit/jsdom-only
Blockers: none
```

**Rule:** Do not mark SC-001 Done in Linear / Spec without a filled stamp that includes FR-012 desktop evidence once Client discovery/load exists. Host vitest alone may advance catalog confidence but does **not** close US1 / Scenario 1.

---

## Explicit non-goals

- Client discovery / load UI implementation (T015–T018) — out of this Verifier recipe PR
- Attach / run / instruction-bind product Pass (Scenario 2; T020+)
- Skill authoring (Scenario 3)
- Full managed catalog, plugin skills, learn-from-demonstration
- Electron Main skill catalog store (forbidden; T013)
- Product SC-001…SC-007 Done stamps

---

## Traceability

| Artifact | Role |
|----------|------|
| [../quickstart.md](../quickstart.md) Scenario 1 | User-facing outline |
| [../contracts/discover-load.md](../contracts/discover-load.md) | Contract Pass bars |
| [thin-pack-skill.md](./thin-pack-skill.md) | Locked id / label / body |
| [README.md](./README.md) | Scenario owners map + foundational Pass |
| This file | T019 rerunnable Scenario 1 recipe |
| T015–T018 | Host catalog return + Client discovery/load + failure UI |
| T035 | Evidence directory placeholders |
| T037 | Quickstart ↔ recipe cross-links |

## Evidence for PO / DH Lead

**Recipe delivered (T019).** Product SC Pass **not** stamped. Host thin-pack ship/mount + catalog projection are on master via [#115](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/115) / foundational [#116](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/116). Full Scenario 1 Done waits on US1 Client discovery/load (T015–T018) plus Verifier FR-012 desktop evidence using Steps A–C above.
