# Scenario 4 — Thin pack / non-goals (checklist stub)

**Status:** Product SC-004 **PASS** stamped — evidence `verifier/evidence/scenario-4/` (T032 Layer C managedCount===1 + T033 non-goals green)
**Owners:** DH Verifier (this checklist + Pass stamp) · DH Runtime (thin pack / Pass-environment count) · PO (scope)
**Linear:** T034 [MOH-181](https://linear.app/momadhoun/issue/MOH-181) · T032 [MOH-179](https://linear.app/momadhoun/issue/MOH-179) · T033 [MOH-180](https://linear.app/momadhoun/issue/MOH-180) · Epic [MOH-142](https://linear.app/momadhoun/issue/MOH-142)
**Acceptance slice:** T034 — Verifier Scenario 4 checklist linking thin-pack count + non-goals
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 4
**Contract:** [../contracts/thin-managed-pack.md](../contracts/thin-managed-pack.md)
**Thin-pack measurement:** [thin-pack-skill.md](./thin-pack-skill.md)
**Non-goals recipe:** [non-goals.md](./non-goals.md)
**FR-012:** GUI screenshot **optional** (docs/absence scenario)

## Measurable Done (this stub)

| Check | Pass bar |
|-------|----------|
| Stub present | This file links thin-pack count + non-goals with Pass/Fail rows |
| SC coverage | SC-004 — single thin-pack managed skill; absences do not Fail |
| Product SC stamp | **PASS** — `evidence/scenario-4/VERDICT.txt` (tip ≥ 43fb328e56) |

---

## Scope and prerequisites

| Layer | Required for | Status at stub authoring |
|-------|--------------|--------------------------|
| Foundational Pass (T014) | Any product SC | **measured:** [README.md](./README.md#foundational-pass-checklist--recorded) |
| Thin-pack ship + mount (T006/T007) | Managed skill present | **measured:** `mzm-thin-pack` on Desktop Host |
| T032 measurement doc + Host on-disk guard | Count path defined | **measured:** [thin-pack-skill.md](./thin-pack-skill.md) Layer A |
| T032 product discovery count = 1 | SC-004 count half | **measured** Pass — Desktop Layer C `managedCount=1` (`evidence/scenario-4/`) |
| T033 non-goals recipe | Absence half | **measured:** [non-goals.md](./non-goals.md) delivered |

---

## Checklist

### A — Thin-pack count ([thin-pack-skill.md](./thin-pack-skill.md))

| # | Check | Pass | Fail | Claim at stub |
|---|-------|------|------|---------------|
| A1 | On-disk `apps/desktop-host/managed-skills/` has exactly one child: `mzm-thin-pack` | Sole dir + greppable `SKILL.md` | Zero or extra managed-skills dirs | **measured** (Host guard / vitest) |
| A2 | Discovery / catalog lists `mzm-thin-pack` with display `MzM thin pack` and `source=managed` | Thin pack visible | Missing / wrong id or label | **measured** (SC-001 + T015) |
| A3 | Pass environment lists **exactly one** `source=managed` skill | Count === 1 and id is `mzm-thin-pack` | Count 0, or count > 1 without Runtime Pass-env closure | **measured** Pass — `managedCount=1` (`evidence/scenario-4/step-metrics.json`) |

**Rerun A1:**

```sh
pnpm exec vitest run apps/desktop-host/tests/managed-skills.spec.ts
test "$(find apps/desktop-host/managed-skills -mindepth 1 -maxdepth 1 -type d | wc -l)" -eq 1
```

**Rerun A2–A3 (when Desktop available):** open skills discovery; count `source=managed` rows; or read CDP/`step-metrics.json` style metrics as in Scenario 1 evidence.

### B — Non-goals ([non-goals.md](./non-goals.md))

| # | Check | Pass | Fail | Claim at stub |
|---|-------|------|------|---------------|
| B1 | Full inventory §6 / site-playbook completeness **not** required | Absence does not Fail | Scenario Pass blocked on missing catalog theater | **measured** (docs) |
| B2 | Learn-from-demonstration **not** required | Absence does not Fail | Scenario Pass blocked on demo→skill UX | **measured** (docs + spot-check) |
| B3 | Plugin / connector skills **not** required | Absence does not Fail | Scenario Pass blocked on plugin skills | **measured** (docs + spot-check) |

---

## Evidence (optional GUI)

Files under `verifier/evidence/non-goals/` land with T035 placeholders. For this docs/absence scenario:

| Artifact | When required |
|----------|---------------|
| `VERDICT.txt` | When stamping product SC-004 Pass |
| Screenshot of discovery showing sole managed thin pack | Optional; preferred once Layer C is green |
| `measured-checks.txt` from non-goals spot-checks | Optional supporting |

Unit/jsdom alone may support Host A1; it does **not** replace Layer C when claiming desktop discovery count.

---

## Product SC stamp template (fill when A3 + B green)

```text
Verdict: Pass|Fail|Blocked
Stamp: YYYY-MM-DD · tip <sha>
Linear: MOH-181 · Epic MOH-142
SC-004: …
Blockers: …

Acceptance (Scenario 4 / SC-004)
--------------------------------
[ ] A1 — On-disk thin pack count = 1
[ ] A2 — mzm-thin-pack visible as managed
[ ] A3 — Exactly one source=managed in Pass environment
[ ] B1 — Full catalog not required
[ ] B2 — Learn-from-demo not required
[ ] B3 — Plugin skills not required
```

---

## Explicit non-goals (this stub)

- Do not stamp SC-001…SC-003 / SC-005–SC-007 here
- Do not require FR-012 desktop media for Scenario 4 Pass
- Do not edit Client WIP or US3 Host product WIP in the docs PR that lands this stub
