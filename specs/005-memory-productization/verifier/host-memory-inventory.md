# T002 — Host Memory-catalog touch points (Setup inventory)

**Status:** Inventory complete (Setup; no product behavior change)
**Owners:** DH Runtime (author) · DH Verifier (rerun readability) · PO (scope)
**Linear:** [MOH-239](https://linear.app/momadhoun/issue/MOH-239) · Epic [MOH-228](https://linear.app/momadhoun/issue/MOH-228)
**Acceptance slice:** Setup T002 — map Agent Teams Host + Desktop Host seams against [data-model.md](../data-model.md) `MemoryRecord`; prefer Lead journal path (`team/memory` or split agent/user) ([research.md](../research.md) R1 / PO-locked Host Memory catalog Option)
**Branch:** `cursor/p5-setup-runtime-t002-t003-fe1d`
**Surfaces inventoried:** `packages/experimental/agent-team/src/{types,journal,persisted,projection,index}.ts`, `apps/desktop-host/`

## Measurable Done (this doc)

| Check | Pass bar |
|-------|----------|
| Files covered | All five Agent Teams task paths + Desktop Host boot listed with current APIs and gaps |
| Gap vs data-model | Every `MemoryRecord` field marked **absent** / **mapped** / **present** with the owning type |
| Preferred store | Named Host-owned Lead journal extend point (`team/memory` sibling to `team/routine`) |
| Non-goals honored | No Electron Main memory store; no `MemoryRecord` type edits; no T006+ catalog service in this PR |

---

## Data-model target (P5 MemoryRecord)

From [data-model.md](../data-model.md):

| Field | Target | Today (measured on tip `origin/master`) |
|-------|--------|------------------------------------------|
| `memoryId` | Branded opaque Host id | **Absent** — no Memory types in Agent Teams |
| `kind` | `profile` \| `log` \| `note` | **Absent** |
| `layer` | `agent` \| `user` | **Absent** |
| `botId` | → Bot id when `layer=agent`; null/absent when `layer=user` | **Mapped** — `TeamMemberSnapshot.id` / `SessionId` exists; no memory rows keyed by it |
| `content` | Non-empty trimmed text | **Absent** |
| `createdAt` / `updatedAt` | Timestamps | **Absent** for memory |

**Related (not MemoryRecord):** Chat transcript / Session surface events exist and MUST NOT substitute for curated catalog rows (research R6).

---

## File-by-file touch map

### `packages/experimental/agent-team/src/types.ts` — Host domain types

| Symbol / area | Role today | P5 note |
|---------------|------------|---------|
| `RoutineRecord` / `RoutineProjection` + `team/routine` | Closest **sibling catalog** pattern: branded id, `botId`, content fields, timestamps, Lead-journal event | **Clone shape** for `MemoryRecord` / `MemoryProjection` — do **not** overload routines |
| `TeamMemberSnapshot` / `TeamMemberView` | Durable Bot row (persona, avatar, sectionId, skillAttachments, modelSelection) | Agent-layer rows **reference** `botId` = member id; do **not** stuff memory arrays onto the member snapshot (catalog height + user-layer scope) |
| `SkillAttachment` | Ordered per-bot associations on the member row | Precedent for Host-owned associations — memory is a **catalog**, not an attachment list |
| `TeamView` | Projects members, sections, handoffs, skills, **routines** | Add `memories` (or filtered list Remotes) in T008 — never Electron-synthesized |
| Session event map | `team/member`, `team/section`, `team/routine`, `team/task`, `team/message/*` | **No** `team/memory` (or split) yet — T006/T007 add |
| No `Memory*` exports | Confirmed absent | T006 defines `MemoryRecord` (+ branded `MemoryId`) here or Host-adjacent module named by Runtime |

### `packages/experimental/agent-team/src/journal.ts` — Lead-log transaction owner

| Concern | Today | P5 implication |
|---------|-------|----------------|
| `MutableTeamEventType` | `team/member` \| `task` \| `section` \| `routine` \| `message/*` | Extend with `team/memory` (or split agent/user) once types exist |
| `appendAndFlush` / `transact` / `state` | Field-agnostic; projection owns validation | Memory writes append validated payloads then flush — journal stays SoT path (research R1) |
| Authority | Exact live Lead Session only | Matches no-Electron memory bus (research R7) |

### `packages/experimental/agent-team/src/persisted.ts` — restart/reload helper

| Concern | Today | P5 implication |
|---------|-------|----------------|
| Role | Opens child Session logs for teammate recovery; documents Lead replay of member/section/routine | Memory durability is Lead projection replay of `team/memory*` — this helper stays child-log oriented; update file header when memory events land |
| Gap | No memory-specific API | None required for catalog SoT if rows live on Lead journal |

### `packages/experimental/agent-team/src/projection.ts` — durable decode + fold

| Concern | Today | P5 implication |
|---------|-------|----------------|
| `TeamState` | `members`, `sections`, `routines`, tasks, messages | Add `memories: MemoryRecord[]` (or split maps) |
| Event fold | Closed `TeamEventType` switch | New `team/memory` case: upsert by `memoryId`; reject empty `content`; enforce layer/`botId` rules (agent requires botId; user null/absent) |
| Projectors | `projectRoutines`, `projectSkillCatalog`, sidebar | Add `projectMemories(state, { botId? })` — agent rows filtered by bot; user rows always included for account browse (FR-007 / US5) |
| Zod schemas | Per-event strict schemas | New schema for MemoryRecord payloads (T006–T007) |

### `packages/experimental/agent-team/src/index.ts` — `TeamService` façade + Remotes

| Concern | Today | P5 implication |
|---------|-------|----------------|
| `@Remote(...)` mutations | createBot, identity, skills, routines, tasks, … | New Remotes for memory write/list/browse (T007/T008 / US1+) — Electron Main invents none |
| `@Remote('view')` | Roster + sections + skills + routines | Optional memory summaries on view **or** dedicated list Remotes (T008 chooses; Client must not persist SoT) |
| `agent/created` binds | model-selection, persona, skill-instructions | Inject bind is **T003 / T009 / T014** — not catalog SoT; listed here only as adjacent hook |
| Mailbox / transcript | Peer messaging + Session surface | **Not** Memory catalog (research R6) |

### `apps/desktop-host/` — Desktop Host process

| Path | Today | P5 gap |
|------|-------|--------|
| `src/index.ts` | Boots `profile: 'desktop'`; mounts Office + managed skills; lifecycle IPC to Electron | **No** Memory catalog plugin beyond Agent Teams composition already on desktop profile |
| `src/managed-skills.ts` | Host-owned skill-filesystem mount | Precedent for Host-plane capability after profile boot — memory stays in Agent Teams journal, not a parallel filesystem SoT |
| `src/update-tasks.ts` | `ctx.jobs` inspect for update tasks | Unrelated to curated memory |
| Base desktop profile | Agent Teams via `agent-team-profile` patch (`@deepseek-ai/dsh-experimental-agent-team`) | Memory service loads with Agent Teams on Host process, not Electron Main |

---

## Preferred store candidates

### Preferred — Lead journal `team/memory` (sibling to `team/routine`)

| Fact | Detail |
|------|--------|
| Shape | `MemoryRecord[]` on `TeamState`; event `team/memory` `{ version, teamId, memory: MemoryRecord }` |
| Layer keying | `layer=agent` ⇒ required `botId`; `layer=user` ⇒ `botId` null/absent (account-wide within Lead/Host catalog — research R2) |
| Why | Matches research R1 / PO-locked Option; mirrors P4 routines Host SoT; supports restart via projection; kinds×layers orthogonal (R3) without member-snapshot bloat |
| Next tasks | T006 types · T007 catalog service + journal/projection fold · T008 HTTP/WS Remotes |

### Alternate — split `team/agent-memory` + `team/user-memory`

| Fact | Detail |
|------|--------|
| Fit | Explicit ADR layer separation in the event discriminant |
| Cost | Two folds, two schemas; same logical catalog |
| Verdict | Acceptable if Runtime prefers louder layer isolation; document choice in T006/T007 — default remains single `team/memory` + `layer` field |

### Alternate — extend `TeamMemberSnapshot` with `memories[]`

| Fact | Detail |
|------|--------|
| Fit | Strong for **agent-layer only** |
| Cost | Cannot hold honest user-layer account rows without inventing a fake member or duplicating rows; large member payloads |
| Verdict | **Reject** as primary SoT (research R2 user layer) |

### Rejected — Electron Main store / Client-only / transcript SoT

Violates thin shell (R7), Client-not-SoT, and transcript≠memory (R6). Guards: T010/T011/T012 (out of this Setup PR).

---

## Gap matrix (data-model → code)

| Data-model field | types | journal event | projection fold | Remote mutate/list | Client-visible view |
|------------------|-------|---------------|-----------------|--------------------|---------------------|
| `memoryId` | No | No | No | No | No |
| `kind` | No | No | No | No | No |
| `layer` | No | No | No | No | No |
| `botId` (agent) | Mapped via member id | No | No | No | No |
| `botId` (user null) | N/A | No | No | No | No |
| `content` | No | No | No | No | No |
| `createdAt` / `updatedAt` | No | No | No | No | No |

---

## Extend-point sketch (non-normative; T006–T008 decide)

```text
Client/Web ──Remote writeMemory / listMemories──► TeamService
                                                      │
                                                      ├─ validate kind × layer × content (empty reject)
                                                      ├─ brand memoryId; set createdAt/updatedAt
                                                      └─ TeamJournal.appendAndFlush('team/memory', …)
                                                           └─ projection upsert → agentTeams/view or list Remotes
```

**Locked:** Host Memory catalog SoT on Agent Teams / Host journal. Do not reopen Electron Main bus, transcript-as-catalog, or kind→layer locks.

**Foundational follow-ons (out of this Setup PR):** T006 types → T007 catalog + journal → T008 Remotes → US1–US3 writes.

---

## Explicit non-touch (Setup)

- `apps/desktop` Electron Main / preload — no memory store (T010/T011 later)
- Client UI packages — consumers of Host projection only (US1+)
- Model-visible inject — [memory-inject-inventory.md](./memory-inject-inventory.md) (T003)
- Seam locks doc — T004 (`memory-seam-locks.md`); Verifier README — T005

---

## Evidence for Verifier / PO

Inventory is source-derived from `packages/experimental/agent-team/src/{types,journal,persisted,projection,index}.ts` and `apps/desktop-host/` on branch tip vs [data-model.md](../data-model.md). No behavior tests required for Setup T002; foundational catalog work begins at T006.
