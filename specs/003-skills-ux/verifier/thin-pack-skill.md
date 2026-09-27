# Thin-pack skill — pick lock + T032 count measurement (FR-008 / SC-004)

**Status:** Pick locked (T005) · Measurement path documented (T032) · Product Layer B filter in `projectSkillCatalog` · Desktop Scenario 4 / SC-004 Layer C **PASS** (`evidence/scenario-4/`)
**Owners:** DH Verifier (this lock + Scenario 4) · DH Runtime (T006–T007 ship/mount; T032 Pass discovery filter) · DH Client/Web (discovery label) · PO (scope)
**Linear:** T005 [MOH-152](https://linear.app/momadhoun/issue/MOH-152) · T032 [MOH-179](https://linear.app/momadhoun/issue/MOH-179) · Epic [MOH-142](https://linear.app/momadhoun/issue/MOH-142)
**Acceptance slice:** T005 pick · T032 assert Pass environments list exactly one `source=managed` skill `mzm-thin-pack`
**Contract:** [thin-managed-pack.md](../contracts/thin-managed-pack.md)
**Data model:** [data-model.md](../data-model.md) — Skill / Thin managed pack
**Scenario checklist:** [scenario-4-thin-pack.md](./scenario-4-thin-pack.md)
**Non-goals:** [non-goals.md](./non-goals.md)
**Surfaces:** Desktop Host managed-skills mount · `dsh-skill-filesystem` · Desktop Web discovery · Agent Teams `projectSkillCatalog`

## Measurable Done

| Check | Pass bar | Slice |
|-------|----------|-------|
| Id locked | Technical id / directory name = `mzm-thin-pack` | T005 |
| Display locked | Frontmatter `name: mzm-thin-pack`; human-readable discovery label `MzM thin pack` | T005 |
| Body locked | Instructional body contains exact greppable text `Follow the MzM thin-pack playbook for Pass.` | T005 |
| Ship path locked | Preferred path `apps/desktop-host/managed-skills/mzm-thin-pack/SKILL.md` | T005 |
| On-disk thin pack count | Exactly **one** child under `apps/desktop-host/managed-skills/` (`mzm-thin-pack`) | T005 / T006 / T032 Host half |
| Discovery count (Pass env) | Desktop discovery / `remoteView.skills` lists exactly **one** `source=managed` row: `mzm-thin-pack` | T032 product |
| Non-goals | Missing full catalog / learn-from-demo / plugin skills does **not** fail Pass | T033 / SC-004 |

---

## Locked pick (normative for T006+)

| Field | Value |
|-------|-------|
| Technical id / directory name | `mzm-thin-pack` |
| Display `name` (YAML frontmatter) | `mzm-thin-pack` |
| Human-readable discovery label | `MzM thin pack` (via `description` and/or UI title) |
| Instructional body (greppable) | `Follow the MzM thin-pack playbook for Pass.` |
| Ship path (preferred) | `apps/desktop-host/managed-skills/mzm-thin-pack/SKILL.md` |
| Mount | Through `dsh-skill-filesystem` custom/managed root on Desktop Host profile (`apps/desktop-host/`) |
| Count for Pass | Exactly **one** managed skill |

### Relocate rule

If Runtime must move the on-disk root within Host seams, keep technical id `mzm-thin-pack` and update **this file** in the same change. Do not invent a second managed skill for chrome parity.

---

## Requirement (FR-008 / SC-004 / research R1)

From [spec.md](../spec.md), [research.md](../research.md) R1, and the thin-managed-pack contract:

- Ship a **thin managed pack** — exactly one platform-shipped managed skill discoverable in Desktop skills (satisfies ≥1).
- Product **display name** MUST be human-readable in discovery (`MzM thin pack`).
- Pass does **not** require inventory §6 catalog completeness, learn-from-demonstration, or plugin skills.
- Zero managed skills fails FR-008 / SC-001.

---

## T032 — Verifier measurement path (exactly one `source=managed`)

**Pass bar (product):** In a Pass environment, Desktop skills discovery (or Host Team `remoteView.skills` / `listSkills`) MUST list exactly one skill with `source=managed`, and that skill MUST be id `mzm-thin-pack` (display `MzM thin pack`).

**Do not Fail SC-001** solely because other managed rows appear — SC-001 stamps thin-pack discover/load/restart. Exactly-one count is **SC-004 / Scenario 4 / T032**.

### Layer A — On-disk thin pack (Host ship; measured today)

Rerunnable Host guard (no Desktop GUI):

```sh
# Exactly one managed-skills child dir, and it is mzm-thin-pack.
test "$(find apps/desktop-host/managed-skills -mindepth 1 -maxdepth 1 -type d | wc -l)" -eq 1
test -d apps/desktop-host/managed-skills/mzm-thin-pack
test -f apps/desktop-host/managed-skills/mzm-thin-pack/SKILL.md
rg -n 'Follow the MzM thin-pack playbook for Pass\.' apps/desktop-host/managed-skills/mzm-thin-pack/SKILL.md
pnpm exec vitest run apps/desktop-host/tests/managed-skills.spec.ts
```

| Observation | Claim |
|-------------|-------|
| Ship path + greppable body | **measured** — T006 / foundational Pass |
| Vitest mount list/get `mzm-thin-pack` | **measured** — `apps/desktop-host/tests/managed-skills.spec.ts` |
| On-disk child count = 1 | **measured** — same vitest asserts shipped dir is sole managed-skills child (T032 Host guard) |

Layer A proves the **thin pack** is the only Host-shipped managed skill under `managed-skills/`. It does **not** alone prove Desktop discovery `source=managed` count = 1.

### Layer B — Product catalog projection (discovery)

Agent Teams maps Host registry rows onto product `managed` | `user` via `projectSkillCatalog` (`packages/experimental/agent-team/src/projection.ts`):

- id `mzm-thin-pack` → always `managed` + display `MzM thin pack`
- other provider `bundled` skills (office-*, badges) → **omitted** from Pass discovery (remain in `ctx.skills` for model use)
- remaining non-bundled rows → product `user`

Focused Host rehearsal:

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/projection-events.spec.ts -t 'projectSkillCatalog'
pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts -t 'excludes office bundled|projects Host skill catalog'
```

| Observation | Claim |
|-------------|-------|
| Fixture catalogs map thin pack → `managed`, user skill → `user` | **measured** — T015 team.spec |
| Office bundled rows omitted; managed count === 1 | **measured** — T032 Agent Teams tests |

### Layer C — Desktop discovery count (Pass stamp)

**User / Verifier path:**

1. Launch real Desktop (optional GUI for Scenario 4; docs/absence ok if Host metrics suffice).
2. Open skills discovery / library.
3. Count rows with `source=managed` (CDP / DOM / `step-metrics.json` style, or Host `remoteView.skills.filter(s => s.source === 'managed')`).
4. Pass when count === 1 and the sole id is `mzm-thin-pack`.

### Historical gap (SC-001 evidence — closed in product by Layer B filter)

**measured** on Scenario 1 Desktop stamp (`evidence/scenario-1/VERDICT.txt` + `step-metrics.json`, tip `c5742bff46`):

| Field | Value |
|-------|-------|
| `managedCount` | **4** |
| Managed ids | `mzm-thin-pack`, `office-docx`, `office-pptx`, `office-xlsx` |
| Cause (then) | Office skills ship via `dsh-skill-office` as provider `bundled`; projection mapped **all** `bundled` → product `managed` |

**Runtime fix (this PR):** `projectSkillCatalog` omits non-thin-pack `bundled` rows from discovery. Office skills stay in `ctx.skills` for model invocation.

**Verdict for T032 product count:** Layer B/unit path **measured** Pass. Desktop Scenario 4 / Layer C **measured** Pass — `managedCount === 1` (`evidence/scenario-4/`).

**Do not** treat office bundled rows as SC-001 Fail. **Do not** invent a second thin-pack skill to “fix” the count.

| Claim | Tag |
|-------|-----|
| On-disk thin pack = 1 | **measured** (Layer A) |
| SC-001 saw `managedCount=4` (office-*) | **measured** (evidence/scenario-1; historical) |
| Product discovery filter (Layer B) | **measured** — Agent Teams T032 tests |
| Desktop Scenario 4 exactly-one stamp | **measured** Pass — `evidence/scenario-4/` (managedCount===1) |
| Full inventory / learn-from-demo / plugins not required | **measured** via [non-goals.md](./non-goals.md) (docs absence) |

GUI screenshot optional for Scenario 4 (docs/absence). FR-012 remains mandatory for Scenarios 1–3 and 5.

---

## Ownership

| Role | Owns |
|------|------|
| **Runtime** | Ship `SKILL.md` (T006); mount so `ctx.skills` lists `mzm-thin-pack` (T007); Pass discovery filter so only thin-pack is product `managed` (T032) |
| **Client** | Show human-readable `MzM thin pack` in discovery |
| **Verifier** | This pick lock; T032 measurement path; Scenario 4 count + non-goals; FR-012 on GUI scenarios that reference the thin pack |
| **Electron Main** | Lifecycle / Host mailbox only — **no** parallel skill catalog |

---

## Non-goals (this slice)

- Do not expand the pack for inventory §6 parity.
- Do not require learn-from-demonstration or plugin/connector skills ([non-goals.md](./non-goals.md)).
- Do not edit Client WIP or US3 Host WIP in the T032–T034 docs PR — recipe/docs (+ Host on-disk guard) only.
