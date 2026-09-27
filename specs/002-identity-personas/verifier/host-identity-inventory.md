# T002 — Host bot-identity touch points (Setup inventory)

**Status:** Inventory complete (Setup; no product behavior change)
**Owners:** DH Runtime (author) · DH Verifier (rerun readability) · PO (scope)
**Linear:** [MOH-101](https://linear.app/momadhoun/issue/MOH-101) · Epic [MOH-88](https://linear.app/momadhoun/issue/MOH-88)
**Acceptance slice:** Setup T002 — map Agent Teams Host seams against [data-model.md](../data-model.md) Bot extensions (`persona`, `avatar`, `sectionId`); note P1 `createBot` as the extend point ([research.md](../research.md) R7)
**Branch:** `cursor/p2-t002-t003-inventory-92fa`
**Surfaces inventoried:** `packages/experimental/agent-team/src/{types,roster,index,projection,journal}.ts`

## Measurable Done (this doc)

| Check | Pass bar |
|-------|----------|
| Files covered | All five task paths listed with current identity fields and mutation APIs |
| Gap vs data-model | Every Bot extension field (`persona`, `avatar`, `sectionId`) marked **absent** / **present** with the owning type |
| Extend point | P1 `TeamService.createBot` named as product create entry; mutation surface beyond create called out as missing |
| Non-goals honored | No Electron Main identity store proposed; no T005 type edits in this PR |

---

## Data-model target (P2 Bot extension)

From [data-model.md](../data-model.md):

| Field | Target | P1 today |
|-------|--------|----------|
| `id` | Opaque Host agent/teammate id | `TeamMemberSnapshot.id` / `CreateBotResult.id` (`SessionId`) |
| `displayName` | Non-empty; user-renamable (FR-004) | Present; create-time only; projection treats as **immutable** after first `team/member` |
| `modelAssignment` | P1 ownership unchanged | `modelSelection` on snapshot + `installModelSelection` bind |
| `persona` | `{ job, voice, antiJobs }` optional | **Absent** |
| `avatar` | Preset `{ shape?, color? }` optional | **Absent** |
| `sectionId` | Sidebar section id or null/absent ⇒ Unassigned | **Absent** |

---

## File-by-file touch map

### `types.ts` — public identities and create surface

| Symbol | Role today | P2 gap |
|--------|------------|--------|
| `TeamMemberSnapshot` | Durable Lead-log member row: `id`, `name`, `description`, optional `displayName` / `modelSelection`, `provider`, `context`, `phase`, optional `error` | Add optional `persona`, `avatar`, `sectionId` (T005). Decide which of `displayName` / new fields stay identity-immutable vs post-create mutable |
| `TeamMemberView` | Runtime roster row for Client/tools: projects `displayName`, LLM route | Project persona anti-jobs / avatar / section membership for overview + sidebar (T008 / T015 / T022 / T033) |
| `CreateBotInput` / `CreateBotRequest` / `CreateBotResult` | Product create: **required** `displayName` + `modelSelection` only | **Extend point (R7).** Keep P1 minimum. Optional persona/avatar at create is allowed later but not required for Pass; add separate mutation request types (T007) for rename / persona / avatar / section / delete |
| `SpawnTeammateRequest` | Model-tool + Host spawn: optional `displayName`, `agentOptions` | Do not overload model-tool spawn with product persona UX; Host mutations own P2 fields |
| Remote mutation types | `CreateBotMutationResult` only for bots | No rename / updatePersona / setAvatar / assignSection / deleteBot result types yet (T007) |
| `SessionEventMap['team/member']` | Whole `TeamMemberSnapshot` on Lead log (`version: 2`) | Persistence vehicle for extended snapshot (T006); may need transition rules beyond provisioning (see projection) |

### `roster.ts` — create + list; no post-active identity mutate

| API / path | Behavior | P2 note |
|------------|----------|---------|
| `TeamRoster.spawn` | Writes `provisioning` then `active`/`failed` `team/member` snapshots; copies `displayName` / `modelSelection` from request | Create path that `createBot` calls; identity fields only set at spawn |
| `TeamRoster.list` | Lead pseudo-row + teammate rows; forwards `displayName` | Extend projection mapping when views grow |
| `resolveActiveMember` / `interrupt` / `stopTeammates` | Lifecycle by durable **name**, not displayName | Rename must not change kebab `name` (roster id); only `displayName` (FR-004) |
| Post-active update / delete | **None** | T013/T020/T021/T026 need new roster (or service) mutations that append updated snapshots or tombstones |

### `index.ts` — product façade + Remote + live bind hook

| API / path | Behavior | P2 note |
|------------|----------|---------|
| `TeamService.createBot` | Lead-only; validates displayName + modelSelection; derives kebab `name`; spawns with `agentOptions`; returns Host Bot | **Primary extend point (research R7).** P1 create path remains. Do not invent Electron Main records |
| `@Remote('createBot')` | Client create via Typert | Sibling Remotes for P2 mutations land here (T007) |
| `@Remote('view')` | Roster + tasks + handoffs | Client identity/overview reads extend via projection (T008) |
| `agent/created` → `bindTeammateModelSelection` | Live Agent gets `installModelSelection` from durable snapshot | Parallel pattern for instruction bind (see [instruction-bind-inventory.md](./instruction-bind-inventory.md)); not an identity-field store |
| Delete / rename / persona APIs | **Absent** | Foundational + US tasks |

### `projection.ts` — durable decode + identity immutability gate

| Concern | Today | P2 implication |
|---------|-------|----------------|
| `teamMemberSnapshotSchema` | Zod for current snapshot fields only | Extend schema for `persona` / `avatar` / `sectionId` (T005–T006) |
| Identity immutability | After first row, rejects changes to `name`, `provider`, `context`, `displayName`, `modelSelection` | **Rename (FR-004) requires relaxing `displayName` immutability.** Keep `modelSelection` ownership immutable for P1. New persona/avatar/sectionId fields must be **mutable** after active |
| Phase transitions | Only `provisioning` → `active` \| `failed`; no further `team/member` edges | Post-active profile updates need an explicit rule: allow `active` → `active` (mutable fields only) and/or a dedicated event. Implementers must not silently widen without updating this gate (T006) |
| `TeamMemberView` / Client | Via roster `list` + Remote `view` | Overview anti-jobs + avatar + section membership projection (T008+) |

### `journal.ts` — Lead-log transaction owner

| Concern | Today | P2 implication |
|---------|-------|----------------|
| `state` / `transact` / `appendAndFlush` | Serializes Lead Session `team/*` appends; no field semantics | Identity mutations persist by appending validated `team/member` (or successor) payloads; journal stays field-agnostic |
| Authority | Exact live Lead Session only | Matches research R1 (Host-owned; no Electron identity bus) |

---

## Gap matrix (data-model → code)

| Data-model field | types | roster write | Remote/service mutate | projection schema | Client-visible view |
|------------------|-------|--------------|----------------------|-------------------|---------------------|
| `displayName` | Yes (create) | Spawn only | Create only | Present; **immutable** | Yes |
| `modelSelection` | Yes | Spawn only | Create only | Present; immutable (keep) | Yes |
| `persona` | No | No | No | No | No |
| `avatar` | No | No | No | No | No |
| `sectionId` | No | No | No | No | No |

---

## P1 `createBot` as extend point (R7)

```text
Client/Web ──Remote createBot──► TeamService.createBot
                                      │
                                      ├─ validate displayName + modelSelection
                                      ├─ teammateNameFromDisplayName → durable kebab name
                                      └─ TeamRoster.spawn (team/member provisioning→active)
                                           └─ agent/created → bindTeammateModelSelection
```

**Locked:** P1 create path stays available; persona may be empty at create and edited afterward. Do not reopen mailbox / model-assignment / auth / topology contracts except by reference.

**Foundational follow-ons (out of this Setup PR):** T005 types → T006 persist + projection transitions → T007 mutation Remotes → T008 projection to Client.

---

## Explicit non-touch (Setup)

- `apps/desktop` Electron Main / preload — no identity store (T010 later)
- Client UI packages — inventoried only as consumers of Host projection
- Instruction assembly — [instruction-bind-inventory.md](./instruction-bind-inventory.md) (T003)

---

## Evidence for Verifier / PO

Inventory is source-derived from `packages/experimental/agent-team/src/` on branch tip vs [data-model.md](../data-model.md). No behavior tests required for Setup T002; foundational work begins at T005.
