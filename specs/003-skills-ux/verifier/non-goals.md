# Phase 3 Verifier — explicit non-goals (SC-004)

**Owners:** DH Verifier (absence checks) · DH Runtime (thin pack only) · DH Client (no Pass dependency on out-of-scope surfaces) · PO (scope)
**Status:** Recipe delivered (T033) — absence checks documented; product SC-004 stamp via [scenario-4-thin-pack.md](./scenario-4-thin-pack.md)
**Linear:** T033 [MOH-180](https://linear.app/momadhoun/issue/MOH-180) · T038 polish [MOH-185](https://linear.app/momadhoun/issue/MOH-185) · Epic [MOH-142](https://linear.app/momadhoun/issue/MOH-142)
**Acceptance:** Spec FR-009 · FR-010 · SC-004 · Out of Scope · [quickstart.md](../quickstart.md) Scenario 4
**Contract:** [thin-managed-pack.md](../contracts/thin-managed-pack.md)
**Thin-pack measurement:** [thin-pack-skill.md](./thin-pack-skill.md)

## Global Pass / Fail (T033)

**Pass** when every checklist row below holds and no Scenario 1–5 (SC-001…SC-007) recipe **requires** an Out of Scope surface to Pass.

**Fail** T033 (and reopen the owning FR / Scenario) if any of:

- A Phase 3 product Scenario Pass begins requiring full inventory §6 / site-playbook catalog completeness
- A Phase 3 product Scenario Pass begins requiring learn-from-demonstration (screen-recording → skill)
- A Phase 3 product Scenario Pass begins requiring plugin/connector-provided skills (P6)
- Scenario 4 / SC-004 treats absence of those surfaces as Fail

GUI screenshot optional for this docs/absence recipe (FR-012 mandatory only for GUI Scenarios 1–3 and 5).

## Absence checklist

| Non-goal | Pass bar (must **not** be required) | Status |
|----------|-------------------------------------|--------|
| Full inventory §6 / site-playbook catalog | Thin pack alone satisfies FR-008 / ≥1 managed; missing inventory extras does not Fail | **measured** — docs; see [Full managed catalog](#full-managed-catalog-fr-008--sc-004) |
| Learn-from-demonstration | No screen-recording → skill path required for Pass (FR-009) | **measured** — docs; see [Learn-from-demonstration](#learn-from-demonstration-fr-009) |
| Plugin / connector skills | No plugin-provided skills required for Pass (FR-010; P6) | **measured** — docs; see [Plugin / connector skills](#plugin--connector-skills-fr-010) |

T038 re-validates the wider Out-of-Scope set (memory UX, routines, MCP, Box/Shell, detach-as-Pass-gate) against this file after story recipes land. This T033 slice locks the three SC-004 / US4 absences.

---

## Full managed catalog (FR-008 / SC-004)

**Acceptance:** FR-008 · SC-004 · research R1 · [thin-managed-pack.md](../contracts/thin-managed-pack.md)

Phase 3 Pass MUST NOT require full managed catalog parity with inventory §6 or complete site-playbook sets. Exactly one managed thin-pack skill (`mzm-thin-pack`) satisfies the ≥1 managed bar.

| Observation | Pass | Fail |
|-------------|------|------|
| Scenario Pass criteria | Thin pack present; inventory extras absent ok | Failing Pass solely because inventory §6 / site playbooks are missing |
| Discovery UI | May show Host-shipped tooling (e.g. office bundled) without making full-catalog completeness a Pass gate | Requiring every inventory §6 row for Done |

**Claim:** **measured** — recipes + contract omit full-catalog completeness; [thin-pack-skill.md](./thin-pack-skill.md) locks pack membership to one id. Office `bundled→managed` rows on Desktop are a **count** concern for T032 Layer C, not a mandate to ship inventory §6.

**Rerun (spot-check — no Pass dependency on inventory catalog theater):**

```sh
# Expect no Scenario Pass criterion that names inventory §6 completeness as required.
! rg -n -i 'inventory.?§6.*(required|must)|full managed catalog.*(required|must).*Pass' \
  specs/003-skills-ux/verifier/scenario-*.md \
  specs/003-skills-ux/verifier/README.md
```

---

## Learn-from-demonstration (FR-009)

**Acceptance:** FR-009 · SC-004 · Spec Out of Scope · research R9

Phase 3 Pass MUST NOT require learn-from-demonstration (screen-recording → skill).

| Observation | Pass | Fail |
|-------------|------|------|
| Authoring path | US3 text authoring (non-empty name + body) alone | Requiring record-demo / screen-capture → skill for SC-003 / SC-004 |
| Client / Host sources | No learn-from-demo product control as Pass gate | Scenario Pass blocked on missing demo-to-skill UX |

**Spot-check:**

```sh
! rg -n -i 'learn.?from.?demo|screen.?recording.?→.?skill|demo.?to.?skill|record.?demo.?skill' \
  packages/experimental/client-ui-agent-team/src \
  apps/desktop/src apps/desktop-host/src \
  --glob '!**/node_modules/**' --glob '!**/lib/**' --glob '!**/tests/**' --glob '!**/README*.md'
```

**Claim:** **measured** when the command finds no product Pass-path hits (infrastructure docs/comments elsewhere do not Fail). Presence of harness recording tools alone does not Fail FR-009 — Fail only if a Scenario **requires** learn-from-demo UX.

---

## Plugin / connector skills (FR-010)

**Acceptance:** FR-010 · SC-004 · Spec Out of Scope (P6 deferral) · research R9

Phase 3 Pass MUST NOT require plugin/connector-provided skills.

| Observation | Pass | Fail |
|-------------|------|------|
| Catalog sources for Pass | `managed` thin pack + optional `user` authored skills | Requiring plugin/MCP connector skill rows for Done |
| Desktop composition | May omit plugin skill mounts | Scenario Pass blocked on missing plugin skills |

**Spot-check:**

```sh
# Match product UX phrases only — not Cordis `ctx.plugin(...)` mounts.
! rg -n -i 'plugin skills?|connector skills?|mcp skill catalog|plugin/connector' \
  packages/experimental/client-ui-agent-team/src \
  apps/desktop/src apps/desktop-host/src \
  --glob '!**/node_modules/**' --glob '!**/lib/**' --glob '!**/tests/**' --glob '!**/README*.md'
```

**Claim:** **measured** when no product Pass-path hits. Harness `dsh-mcp*` / plugin packages and Cordis `ctx.plugin(...)` mounts may exist as infrastructure (**inferred** — presence alone does not Fail FR-010).

---

## Traceability

| Artifact | Role |
|----------|------|
| [../contracts/thin-managed-pack.md](../contracts/thin-managed-pack.md) | Contract non-goals |
| [thin-pack-skill.md](./thin-pack-skill.md) | Pack membership + T032 count measurement |
| [scenario-4-thin-pack.md](./scenario-4-thin-pack.md) | SC-004 checklist stub |
| [../spec.md](../spec.md) Out of Scope · FR-009 · FR-010 · SC-004 | Normative non-goals |
| T038 | Polish re-validation of wider Out-of-Scope set |
