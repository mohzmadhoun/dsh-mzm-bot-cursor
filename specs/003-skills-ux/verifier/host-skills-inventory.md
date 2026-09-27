# T002 — Host skill-catalog touch points (Setup inventory)

**Status:** Inventory complete (Setup; no product behavior change in this doc alone)
**Owners:** DH Runtime (author) · DH Verifier (rerun readability) · PO (scope)
**Linear:** [MOH-149](https://linear.app/momadhoun/issue/MOH-149) · Epic [MOH-142](https://linear.app/momadhoun/issue/MOH-142)
**Acceptance slice:** Setup T002 — map Host skill-catalog seams against [data-model.md](../data-model.md) Skill / Thin managed pack; note Desktop Host mount as the ship/mount extend point ([research.md](../research.md) R1/R2)
**Branch:** `cursor/p3-foundation-host-fe1d`
**Surfaces inventoried:** `packages/skill/skill/src/`, `packages/skill/skill-filesystem/src/`, `packages/skill/tool-skill/src/`, `apps/desktop-host/`

## Measurable Done (this doc)

| Check | Pass bar |
|-------|----------|
| Files covered | All four task surfaces listed with current catalog APIs and mounts |
| Gap vs data-model | Skill `id` / `displayName` / `instructionalBody` / `source` marked **present** / **mapped** / **absent** |
| Thin pack ship | Preferred path `apps/desktop-host/managed-skills/mzm-thin-pack/SKILL.md` named; Host mount gap called out |
| Non-goals honored | No Electron Main skill catalog; no US1 Client discovery UI in this inventory |

---

## Data-model target (P3 Skill / thin pack)

From [data-model.md](../data-model.md):

| Field | Target | Today |
|-------|--------|-------|
| `id` | Opaque Host skill id | Filesystem / registry **name** (kebab) wins as addressable id |
| `displayName` | Non-empty human label | Frontmatter `name` + `description`; product display may use description / UI title (`MzM thin pack`) |
| `instructionalBody` | Non-empty Markdown body | `SkillDefinition.content` after frontmatter strip |
| `source` | `managed` \| `user` | Provider `SkillSource` buckets (`bundled` / `custom` / `user-dsh` / …) — **product mapping absent** until Agent Teams projection |
| Thin pack | Exactly one `source=managed` | **Absent** on Desktop Host until T006/T007 |

---

## File-by-file touch map

### `packages/skill/skill/src/index.ts` — registry Service Definition

| Symbol | Role today | P3 note |
|--------|------------|---------|
| `SkillSource` | Provider origin labels (`project-dsh`, `custom`, `bundled`, `user-dsh`, …) | Map to product `managed` \| `user` at Agent Teams / Client projection — do not renumber registry ranks |
| `SkillSummary` / `SkillDefinition` | `name`, `description`, `content`, `source`, `provider`, optional `path` / `resourceBase` | Catalog list + load body for attach/bind; `name` is the greppable skill id |
| `ctx.skills.list` / `get` / `register` / `registerProvider` | Merge providers by rank; scoped layers | Host product catalog reads `list()`; Electron Main must not duplicate |
| `BUNDLED_SKILL_RANK` | Packaged / explicit bundled root rank | Prefer `bundledSkillDir` for shipped thin pack (T007) |

### `packages/skill/skill-filesystem/src/index.ts` — filesystem provider

| Concern | Today | P3 implication |
|---------|-------|----------------|
| `customSkillDirs` | Extra roots, `source: custom`, rank 300 | Candidate for Host-durable **user** skills root |
| `bundledSkillDir` | Explicit or `DSH_BUNDLED_SKILL_DIR`, `source: bundled` | Candidate for **managed** thin-pack directory |
| Default user roots | `$DSH_HOME/skills`, `~/.agents/skills` when `includeDefaultRoots` | Alternate user root; Desktop may pin an explicit user dir instead |
| Discovery | Directory `…/<id>/SKILL.md` or flat `…/<id>.md` + YAML frontmatter | Ship thin pack as directory bundle (tasks lock) |
| Watch / dispose | Chokidar (+ poll options); missing roots tolerated | Restart/reload retains managed presence via on-disk ship path |

### `packages/skill/tool-skill/src/index.ts` — model-facing loader + session catalog

| Concern | Today | P3 implication |
|---------|-------|----------------|
| `skill` tool + durable `skill-catalog` source | Model-invocable catalog / load | Product discovery UI is **not** this tool surface; may still publish session catalog for agents |
| Depends on `ctx.skills` | Lists winning summaries | Web/Desktop presets mount `tool-skill`; Host registry stays global |

### `apps/desktop-host/` — Desktop Host process

| Path | Today | P3 gap |
|------|-------|--------|
| `src/index.ts` | Boots `profile: 'desktop'` then mounts Office composition | **No** managed-skills / skill-filesystem mount for thin pack |
| `src/office.ts` | Registers Office skills via `@deepseek-ai/dsh-skill-office` | Precedent for Host-owned skill mount after profile boot |
| `managed-skills/` | **Absent** (pre-T006) | Preferred ship root for `mzm-thin-pack` |
| Base/Web cordis | Host `skill-filesystem` **disabled** in web-app patch; presets own local discovery | Desktop Host must mount a Host-plane provider (T007) so `ctx.skills` lists thin pack without Electron IPC |

---

## Gap matrix (data-model → code)

| Data-model field | skill registry | skill-filesystem | tool-skill | desktop-host mount |
|------------------|----------------|------------------|------------|--------------------|
| Skill id (`name`) | Yes | Yes (frontmatter) | Catalog entries by name | Missing thin-pack dir |
| displayName | description / name only | description frontmatter | Catalog description | Product `MzM thin pack` label not wired |
| instructionalBody | `content` on get | SKILL.md body | Loader loads body | Missing ship body |
| source managed/user | Provider labels only | bundled/custom/user-* | Forwards source | No managed mount |
| Thin pack count = 1 | N/A | N/A | N/A | Zero until T006/T007 |

---

## Preferred Host mount path (R1 / R2)

```text
apps/desktop-host/managed-skills/mzm-thin-pack/SKILL.md
        │
        ▼
Desktop Host boot (src/index.ts)
        │  ctx.plugin(desktop-managed-skills)
        ▼
dsh-skill-filesystem  { bundledSkillDir: managed-skills/, customSkillDirs: [userRoot] }
        │
        ▼
ctx.skills.list() includes name=mzm-thin-pack  (product source → managed)
```

**Locked:** Exactly one managed skill id `mzm-thin-pack` for Pass. Electron Main invents neither catalog nor attachment records.

**Foundational follow-ons:** T006 ship SKILL.md → T007 mount → T008–T011 attachment types/persist/mutations/projection → T012 instruction-bind doc. Electron T013 stays out of Runtime.

---

## Explicit non-touch (Setup)

- `apps/desktop` Electron Main / preload — no skills bus (T013 / Electron)
- Client discovery UI — US1 (T016+)
- Full inventory §6 catalog / plugin skills / learn-from-demo — non-goals

---

## Evidence for Verifier / PO

Inventory is source-derived from skill packages + Desktop Host on branch tip vs [data-model.md](../data-model.md). No behavior tests required for Setup T002 alone; ship/mount begin at T006/T007.
