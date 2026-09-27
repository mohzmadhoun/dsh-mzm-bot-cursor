# Phase 3 Verifier — explicit non-goals (SC-004)

**Owners:** DH Verifier (absence checks) · DH Runtime (thin pack only) · DH Client (no Pass dependency on out-of-scope surfaces) · PO (scope)
**Status:** Complete — T033 SC-004 rows + T038 Out-of-Scope re-validation asserted (docs-only; product SC-004 stamp still via [scenario-4-thin-pack.md](./scenario-4-thin-pack.md))
**Linear:** T033 [MOH-180](https://linear.app/momadhoun/issue/MOH-180) · T038 [MOH-185](https://linear.app/momadhoun/issue/MOH-185) · Epic [MOH-142](https://linear.app/momadhoun/issue/MOH-142)
**Acceptance:** Spec FR-009 · FR-010 · SC-004 · Out of Scope · [quickstart.md](../quickstart.md) Scenario 4
**Contract:** [thin-managed-pack.md](../contracts/thin-managed-pack.md)
**Thin-pack measurement:** [thin-pack-skill.md](./thin-pack-skill.md)
**Evidence home:** [evidence/non-goals/](./evidence/non-goals/) (T035)

## Global Pass / Fail (T033 + T038)

**Pass** when every checklist row below holds and no Scenario 1–5 (SC-001…SC-007) recipe **requires** an Out of Scope surface to Pass.

**Fail** T033/T038 (and reopen the owning FR / Scenario) if any of:

- A Phase 3 product Scenario Pass begins requiring full inventory §6 / site-playbook catalog completeness
- A Phase 3 product Scenario Pass begins requiring learn-from-demonstration (screen-recording → skill)
- A Phase 3 product Scenario Pass begins requiring plugin/connector-provided skills (P6)
- A Phase 3 product Scenario Pass begins requiring memory UX, routines, MCP vault UX, Box/Shell/computer-use parity, or detach/delete skill UX as a Pass gate
- Scenario 4 / SC-004 treats absence of those surfaces as Fail

GUI screenshot optional for this docs/absence recipe (FR-012 mandatory only for GUI Scenarios 1–3 and 5).

## Absence checklist

| Non-goal | Pass bar (must **not** be required) | Status |
|----------|-------------------------------------|--------|
| Full inventory §6 / site-playbook catalog | Thin pack alone satisfies FR-008 / ≥1 managed; missing inventory extras does not Fail | **measured** — T033; see [Full managed catalog](#full-managed-catalog-fr-008--sc-004) |
| Learn-from-demonstration | No screen-recording → skill path required for Pass (FR-009) | **measured** — T033; see [Learn-from-demonstration](#learn-from-demonstration-fr-009) |
| Plugin / connector skills | No plugin-provided skills required for Pass (FR-010; P6) | **measured** — T033; see [Plugin / connector skills](#plugin--connector-skills-fr-010) |
| Memory product UX (P5) | No memory profile/log/note/recall product flow required for P3 Pass | **measured** — T038; see [Memory product UX (T038)](#memory-product-ux-t038) |
| Routines (P4/P6) | No cron / event-driven routine UX required for Pass | **measured** — T038; see [Routines (T038)](#routines-t038) |
| MCP / connectors / vault UX (P6) | No MCP skill catalog or 1Password-class vault UX required for Pass | **measured** — T038; see [MCP / vault UX (T038)](#mcp--vault-ux-t038) |
| Box / Shell / computer-use (P7) | No Box/local Shell/computer-use parity required for Pass | **measured** — T038; see [Box / Shell / computer-use (T038)](#box--shell--computer-use-t038) |
| Detach as Pass gate | Detach/delete skill UX may ship; not required for P3 exit | **measured** — T038; see [Detach as Pass gate (T038)](#detach-as-pass-gate-t038) |

T033 locked the three SC-004 / US4 absences. T038 re-validates the wider Out-of-Scope set after story recipes land.

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

## Memory product UX (T038)

**Acceptance:** Spec Out of Scope · P5 deferral · [../spec.md](../spec.md)

Phase 3 Pass MUST NOT require memory productization / recall UX.

| Observation | Pass | Fail |
|-------------|------|------|
| Scenario Pass criteria | Skills discover/attach/author alone | Requiring memory profile/log/note/recall product flow for Done |
| Client / Host sources | No memory product control as P3 Pass gate | Scenario Pass blocked on missing memory UX |

**Spot-check:**

```sh
# Expect no P3 Scenario Pass criterion that requires memory product UX.
! rg -n -i 'memory (profile|log|note|recall).*(required|must).*Pass|Pass.*(memory (profile|UX|recall))' \
  specs/003-skills-ux/verifier/scenario-*.md \
  specs/003-skills-ux/verifier/README.md
```

**Claim:** **measured** — Scenario 1–5 recipes omit memory UX as a Pass gate (P2 owns ADR-only memory for that phase; P5 owns productization).

---

## Routines (T038)

**Acceptance:** Spec Out of Scope · P4/P6 deferral

Phase 3 Pass MUST NOT require routines cron or event-driven skill/routine UX.

| Observation | Pass | Fail |
|-------------|------|------|
| Scenario Pass criteria | Manual discover/attach/author/run path | Requiring cron/event routine scheduling for Done |

**Spot-check:**

```sh
! rg -n -i 'routine.*(required|must).*Pass|cron.*(required|must).*Pass' \
  specs/003-skills-ux/verifier/scenario-*.md \
  specs/003-skills-ux/verifier/README.md
```

**Claim:** **measured** — no Scenario recipe requires routines for Pass.

---

## MCP / vault UX (T038)

**Acceptance:** Spec Out of Scope · P6 deferral · FR-010 adjacency

Phase 3 Pass MUST NOT require MCP / connectors / 1Password-class vault UX.

| Observation | Pass | Fail |
|-------------|------|------|
| Catalog sources for Pass | Managed thin pack + optional user skills | Requiring MCP connector skill rows or vault UX for Done |
| Harness MCP packages | May exist as infrastructure | Scenario Pass blocked on missing MCP/vault product UX |

**Spot-check:**

```sh
# Product UX phrases only — not harness dsh-mcp package names in infra.
! rg -n -i 'mcp skill catalog|1password|vault UX|mcp connector.*(required|must)' \
  packages/experimental/client-ui-agent-team/src \
  apps/desktop/src apps/desktop-host/src \
  --glob '!**/node_modules/**' --glob '!**/lib/**' --glob '!**/tests/**' --glob '!**/README*.md'
```

**Claim:** **measured** when no product Pass-path hits. Harness MCP packages alone do not Fail (**inferred**).

---

## Box / Shell / computer-use (T038)

**Acceptance:** Spec Out of Scope · P7 deferral

Phase 3 Pass MUST NOT require Box / local Shell / computer-use parity.

| Observation | Pass | Fail |
|-------------|------|------|
| Scenario Pass criteria | Skills UX on Desktop without Box/Shell/CU demos | Requiring Box/Shell/computer-use for Done |

**Spot-check:**

```sh
! rg -n -i 'box.*(required|must).*Pass|computer.?use.*(required|must).*Pass|local shell.*(required|must).*Pass' \
  specs/003-skills-ux/verifier/scenario-*.md \
  specs/003-skills-ux/verifier/README.md
```

**Claim:** **measured** — Scenario recipes do not gate Pass on Box/Shell/computer-use.

---

## Detach as Pass gate (T038)

**Acceptance:** Spec Out of Scope (“Detach/delete skill UX as a Pass gate (may ship; not required for P3 exit)”)

Phase 3 Pass MUST NOT require detach/delete skill UX.

| Observation | Pass | Fail |
|-------------|------|------|
| Attach Pass (SC-002) | Attach + run/active + persist | Failing Pass solely because detach UI is missing |
| Author / discovery | Create/edit/list paths | Requiring delete-skill confirmation as Done gate |

**Spot-check:**

```sh
# Detach may be documented as optional; Fail only if a Scenario requires it for Pass.
! rg -n -i 'detach.*(required|must).*Pass|Pass.*(requires|requires?).*detach' \
  specs/003-skills-ux/verifier/scenario-*.md \
  specs/003-skills-ux/verifier/README.md
```

**Claim:** **measured** — Scenario 2 Pass is attach/run/persist; detach is explicitly not a Pass gate.

---

## Traceability

| Artifact | Role |
|----------|------|
| [../contracts/thin-managed-pack.md](../contracts/thin-managed-pack.md) | Contract non-goals |
| [thin-pack-skill.md](./thin-pack-skill.md) | Pack membership + T032 count measurement |
| [scenario-4-thin-pack.md](./scenario-4-thin-pack.md) | SC-004 checklist stub |
| [scenario-5-full-replay.md](./scenario-5-full-replay.md) | SC-005 composite (must keep non-goals green) |
| [evidence/non-goals/](./evidence/non-goals/) | Measured-check home (T035) |
| [../spec.md](../spec.md) Out of Scope · FR-009 · FR-010 · SC-004 | Normative non-goals |
| T033 / T038 | SC-004 absences + wider Out-of-Scope re-validation |
