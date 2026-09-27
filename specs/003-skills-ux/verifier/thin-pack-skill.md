# T005 — Thin-pack skill pick (FR-008 / SC-004)

**Status:** Pick locked (Setup doc; no Host product skill file in this PR)
**Owners:** DH Verifier (this lock + Scenario 4) · DH Runtime (T006–T007 ship/mount) · DH Client/Web (discovery label) · PO (scope)
**Linear:** [MOH-152](https://linear.app/momadhoun/issue/MOH-152) · Epic [MOH-142](https://linear.app/momadhoun/issue/MOH-142)
**Acceptance slice:** T005 — record thin-pack skill pick for research R1 / FR-008
**Contract:** [thin-managed-pack.md](../contracts/thin-managed-pack.md)
**Data model:** [data-model.md](../data-model.md) — Skill / Thin managed pack
**Surfaces:** Desktop Host managed-skills mount · `dsh-skill-filesystem` · Desktop Web discovery

## Measurable Done (this doc)

| Check | Pass bar |
|-------|----------|
| Id locked | Technical id / directory name = `mzm-thin-pack` |
| Display locked | Frontmatter `name: mzm-thin-pack`; human-readable discovery label `MzM thin pack` |
| Body locked | Instructional body contains exact greppable text `Follow the MzM thin-pack playbook for Pass.` |
| Ship path locked | Preferred path `apps/desktop-host/managed-skills/mzm-thin-pack/SKILL.md` |
| Count | Exactly **one** managed skill for Pass (research R1) |
| Non-goals | No SKILL.md product file in this PR; T006 owns ship |

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

## Verifier measurement (Scenario 4 / T032–T034)

| Check | Pass bar |
|-------|----------|
| Thin pack present | Discovery lists managed skill id `mzm-thin-pack` / label containing `MzM thin pack` |
| Count | Exactly one `source=managed` skill in Pass environments |
| Greppable body | Shipped `SKILL.md` contains `Follow the MzM thin-pack playbook for Pass.` |
| Non-goals | Missing full catalog / learn-from-demo / plugin skills does **not** fail Pass |

GUI screenshot optional for Scenario 4 (docs/absence). FR-012 remains mandatory for Scenarios 1–3 and 5.

---

## Ownership

| Role | Owns |
|------|------|
| **Runtime** | Ship `SKILL.md` (T006); mount so `ctx.skills` lists `mzm-thin-pack` (T007) |
| **Client** | Show human-readable `MzM thin pack` in discovery |
| **Verifier** | This pick lock; Scenario 4 count + non-goals; FR-012 on GUI scenarios that reference the thin pack |
| **Electron Main** | Lifecycle / Host mailbox only — **no** parallel skill catalog |

---

## Non-goals (this PR)

- Do not create `apps/desktop-host/managed-skills/mzm-thin-pack/SKILL.md` here (T006).
- Do not mount filesystem providers or edit Host cordis product profiles here (T007).
- Do not expand the pack for inventory §6 parity.
