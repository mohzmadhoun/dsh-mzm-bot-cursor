# T002 — Host Routine-catalog touch points (Setup inventory)

**Status:** Inventory complete (Setup; no product behavior change in this doc alone)
**Owners:** DH Runtime (author) · DH Verifier (rerun readability) · PO (scope)
**Linear:** [MOH-195](https://linear.app/momadhoun/issue/MOH-195) · Epic [MOH-188](https://linear.app/momadhoun/issue/MOH-188)
**Acceptance slice:** Setup T002 — map Host Routine-catalog seams against [data-model.md](../data-model.md) `RoutineRecord`; note Desktop Host as mount/composition extend point ([research.md](../research.md) R1 / Architect Option 3)
**Branch:** `cursor/p4-setup-verifier-fe1d`
**Surfaces inventoried:** `packages/experimental/agent-team/src/`, `apps/desktop-host/`

## Measurable Done (this doc)

| Check | Pass bar |
|-------|----------|
| Files covered | Agent Teams Host façade + Desktop Host boot/composition listed with current APIs and gaps |
| Gap vs data-model | Every `RoutineRecord` field marked **present** / **mapped** / **absent** |
| Preferred store | Named Host-owned extension point (Agent Teams journal / catalog service) |
| Non-goals honored | No Electron Main routines store; no `dsh-schedule` as SoT; no US1 Client create UI in this inventory |

---

## Data-model target (P4 RoutineRecord)

From [data-model.md](../data-model.md):

| Field | Target | Today (measured on tip `origin/master`) |
|-------|--------|------------------------------------------|
| `routineId` | Branded opaque Host id | **Absent** — no Routine types in Agent Teams |
| `botId` | → Bot / member Session id | **Mapped** — `TeamMemberSnapshot.id` / `SessionId` exists; no routines keyed by it |
| `intent` | Non-empty text | **Absent** |
| `scheduleExpr` | Product cron/shorthand | **Absent** on Host Routine path |
| `status` | `active` \| `paused` | **Absent** |
| `lastRunAt` | Timestamp \| `null` | **Absent** |
| `createdAt` / `updatedAt` | Timestamps | **Absent** for routines |

---

## File-by-file touch map

### `packages/experimental/agent-team/src/types.ts` — Host domain types

| Symbol / area | Role today | P4 note |
|---------------|------------|---------|
| `TeamMemberSnapshot` / `TeamMemberView` | Durable Bot row (displayName, persona, avatar, sectionId, skillAttachments, modelSelection) | **Preferred** attach point for per-bot routine list **or** keep routines in a sibling Host catalog keyed by `botId` — Architect Option 3 allows Host catalog adjacent to Teams |
| `SkillAttachment` / skill Remotes | Precedent for Host-owned ordered associations on the Bot row | Pattern to clone for create/list/pause/resume Remotes — do **not** overload skillAttachments |
| Session event map `team/member` | Lead journal durability for identity/skills | Candidate journal home if routines ride member snapshots; else new `team/routine` (or Host-adjacent) event type |
| No `Routine*` exports | Confirmed absent | T006 defines `RoutineRecord` here or Host-adjacent module named by Runtime |

### `packages/experimental/agent-team/src/{journal,persisted,projection,roster}.ts`

| Concern | Today | P4 implication |
|---------|-------|----------------|
| Journal / projection | Folds `team/member`, tasks, sections, mailbox | Extend fold **or** add routine catalog fold — Client reads Host projection only |
| Roster Remotes | `createBot`, identity, skills, tasks | Add `createRoutine` / `listRoutines` / pause / resume Remotes (T007/T009/US1+) — Electron Main invents none |
| `remoteView` | Projects Team + skills catalog | Project routine summaries into Client-readable view without Main IPC synthesis |

### `packages/experimental/agent-team/src/index.ts` — `TeamService`

| Concern | Today | P4 implication |
|---------|-------|----------------|
| `@Remote(...)` mutations | createBot, rename, persona, avatar, sections, attachSkill, upsertUserSkill, deleteBot, tasks | New Remotes for Routine CRUD/lifecycle (foundation T007/T009) |
| Mailbox `sendMessage` | Peer Host mailbox delivery | **Not** the Routine catalog; may be a **wake** candidate (see [cron-wake-inventory.md](./cron-wake-inventory.md)) |
| `scheduleRecovery` | Agent recovery helper (name collision only) | Unrelated to product Routines / cron |

### `apps/desktop-host/` — Desktop Host process

| Path | Today | P4 gap |
|------|-------|--------|
| `src/index.ts` | Boots `profile: 'desktop'`, mounts Office + managed skills | **No** Routine catalog plugin / scheduler mount |
| `src/managed-skills.ts` | Host-owned skill-filesystem mount | Precedent for Host-plane capability after profile boot |
| `src/update-tasks.ts` | Reads `ctx.jobs` for update-task inspect | Shows `dsh-jobs` already reachable when present — optional fire visibility only (T013) |
| Base desktop profile | Agent Teams composition via shipped desktop profile | Routine service must load on Host process, not Electron Main |

---

## Preferred store candidates

### Preferred — Host Routine catalog service (Agent Teams–adjacent)

| Fact | Detail |
|------|--------|
| Shape | `RoutineRecord[]` keyed/filtered by `botId`; Host journal durability (new event type or Teams extension) |
| Why | Matches research R1 / Architect Option 3; mirrors skills/persona Host SoT; supports pause/resume + lastRunAt without Bot snapshot bloat |
| Next tasks | T006 types · T007 catalog service · T009 HTTP/WS Remotes |

### Alternate — extend `TeamMemberSnapshot` with `routines[]`

| Fact | Detail |
|------|--------|
| Fit | Strong per-bot isolation; restart/reload via existing `team/member` |
| Cost | Large member payloads; fire updates rewrite member rows often |
| Verdict | Acceptable if Runtime prefers snapshot symmetry; document choice in T006/T007 |

### Rejected — Electron Main store / `dsh-schedule` catalog

Violates thin shell (R7) and schedule≠Routines (R2). Guards: T010/T011 + [schedule-not-routines.md](./schedule-not-routines.md).

---

## Gap matrix (data-model → code)

| Data-model field | agent-team types | journal/projection | desktop-host mount |
|------------------|------------------|--------------------|--------------------|
| routineId | Absent | Absent | Absent |
| botId | Member id present | Member fold present | N/A |
| intent / scheduleExpr / status | Absent | Absent | Absent |
| lastRunAt | Absent | Absent | Absent |
| createdAt / updatedAt | Absent (routines) | Absent | Absent |
| Client projection | Absent | Absent | Absent |

---

## Non-goals (this inventory)

- No product Routine types/Remotes claimed complete here (T006+)
- No Client routines pane UI
- No Electron Main IPC channel for routines
- No equating session Schedule overlay with Routines pane

## Rerun (idempotent)

```sh
rg -n 'RoutineRecord|createRoutine|listRoutines' packages/experimental/agent-team/src apps/desktop-host/src || true
# Expect empty until foundation lands.
test -f specs/004-routines-cron/verifier/host-routines-inventory.md
```

**PO / DH Lead:** Inventory only. Next product work is Host foundation T006–T013, then T014 stamp — not US1 yet.
