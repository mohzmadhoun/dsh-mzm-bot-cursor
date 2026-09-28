# T002 — Host Connector-catalog + MCP bind touch points (Setup inventory)

**Status:** Inventory complete (Setup; no product behavior change)
**Owners:** DH Runtime (author) · DH Verifier (rerun readability) · PO (scope)
**Linear:** **Blocked** — track via PR only (project `DeepSeek Harness - Cursor` / `P-MOH-2`; no invented issue ids)
**Acceptance slice:** Setup T002 — map Agent Teams Host + `dsh-mcp-client` + Desktop Host seams against [data-model.md](../data-model.md) `ConnectorRecord` / `ConnectorCatalogEntry` (research R1 / Architect Path A Option A)
**Branch:** `cursor/p6-setup-t001-t006-fe1d`
**Surfaces inventoried:** `packages/experimental/agent-team/src/{types,journal,persisted,projection,index}.ts`, `packages/mcp/mcp-client/src/`, `apps/desktop-host/`

## Measurable Done (this doc)

| Check | Pass bar |
|-------|----------|
| Files covered | Agent Teams Host façade + mcp-client bridge + Desktop Host boot listed with current APIs and gaps |
| Gap vs data-model | Every `ConnectorRecord` / `ConnectorCatalogEntry` field marked **absent** / **mapped** / **present** |
| Preferred store | Named Host-owned Lead journal extend point (`team/connector` sibling to `team/routine` / `team/memory`) |
| MCP bind | `dsh-mcp-client` named as substrate; product catalog bind **absent** today |
| Non-goals honored | No Electron Main connector store; no `ConnectorRecord` type edits; no T007+ catalog service in this PR |

---

## Data-model target (P6 ConnectorRecord / ConnectorCatalogEntry)

From [data-model.md](../data-model.md):

| Field | Target | Today (measured on tip `origin/master` @ `ff149f38d1`) |
|-------|--------|----------------------------------------------------------|
| `connectorId` | Branded opaque Host id | **Absent** — no Connector types in Agent Teams |
| `catalogId` / `serverName` | Thin-catalog key + MCP namespace | **Mapped** — `dsh-mcp-client` `Config.serverName` exists; no product catalog row |
| `displayName` | User-visible label | **Absent** for connectors |
| `installState` | `available` \| `installing` \| `installed` \| `failed` | **Absent** |
| `authState` | `none` \| `needs_auth` \| `authenticating` \| `ready` \| `failed` | **Absent** |
| `transport` | `stdio` \| `streamable-http` | **Mapped** — mcp-client `Config.transport` only (cordis.yml instance, not catalog) |
| `createdAt` / `updatedAt` | Timestamps | **Absent** for connectors |
| `ConnectorCatalogEntry.fixture` / `authMode` | Thin catalog / Verifier fixture metadata | **Absent** — no thin catalog surface |

**Related (not ConnectorRecord):** MCP tools may already appear when `mcp-client` is composed in other profiles; Desktop profile currently **excludes** bare `@deepseek-ai/dsh-mcp-client` rows (`apps/desktop/tests/profile-mcp.spec.ts`). Product install/auth UX is still required for Pass (research R1).

---

## File-by-file touch map

### `packages/experimental/agent-team/src/types.ts` — Host domain types

| Symbol / area | Role today | P6 note |
|---------------|------------|---------|
| `RoutineRecord` / `MemoryRecord` + journal events | Closest **sibling catalog** patterns: branded id, timestamps, Lead-journal SoT | **Clone shape** for `ConnectorRecord` / `ConnectorProjection` — do **not** overload routines or memory |
| `TeamMemberSnapshot` / `TeamMemberView` | Durable Bot row | Connector tools may bind to ≥1 bot for Pass; do **not** stuff connector arrays onto the member snapshot as primary SoT |
| `TeamView` | Projects members, sections, skills, routines, memories | Add connector summaries **or** dedicated list Remotes in T012 — never Electron-synthesized |
| Session event map | `team/member`, `team/section`, `team/routine`, `team/memory`, … | **No** `team/connector` yet — T007/T009 add |
| No `Connector*` exports | Confirmed absent | T007 defines `ConnectorRecord` (+ branded `ConnectorId`) here or Host-adjacent module named by Runtime |

### `packages/experimental/agent-team/src/journal.ts` — Lead-log transaction owner

| Concern | Today | P6 implication |
|---------|-------|----------------|
| `MutableTeamEventType` | Includes `team/routine`, `team/memory`, … | Extend with `team/connector` (or equivalent) once types exist |
| `appendAndFlush` / `transact` / `state` | Field-agnostic; projection owns validation | Connector install/auth writes append validated payloads then flush — journal stays SoT path (research R1) |
| Authority | Exact live Lead Session only | Matches no-Electron connector bus (research R6) |

### `packages/experimental/agent-team/src/persisted.ts` — restart/reload helper

| Concern | Today | P6 implication |
|---------|-------|----------------|
| Role | Child Session log recovery; Lead replay of member/section/routine/memory | Connector durability is Lead projection replay of `team/connector*` — helper stays child-log oriented |
| Gap | No connector-specific API | None required for catalog SoT if rows live on Lead journal |

### `packages/experimental/agent-team/src/projection.ts` — durable decode + fold

| Concern | Today | P6 implication |
|---------|-------|----------------|
| `TeamState` | `members`, `sections`, `routines`, `memories`, … | Add `connectors: ConnectorRecord[]` (and optional thin-catalog cache) |
| Event fold | Closed `TeamEventType` switch | New `team/connector` case: upsert by `connectorId`; enforce install/auth state machines |
| Projectors | `projectRoutines`, `projectMemories`, … | Add `projectConnectors` / catalog list for Client (T012) |
| Zod schemas | Per-event strict schemas | New schema for ConnectorRecord payloads (T007/T009) |

### `packages/experimental/agent-team/src/index.ts` — `TeamService` façade + Remotes

| Concern | Today | P6 implication |
|---------|-------|----------------|
| `@Remote(...)` mutations | createBot, identity, skills, routines, memory, tasks, … | New Remotes for connector catalog/list/install/auth (T009/T012 / US1) — Electron Main invents none |
| `@Remote('view')` | Roster + sections + skills + routines + memories | Optional connector summaries on view **or** dedicated list Remotes |
| MCP / credentials | Not referenced | Catalog ready-state binds mcp-client + credential seam (T010/T011) — not in this Setup PR |
| Mailbox / transcript | Peer messaging + Session surface | **Not** Connector catalog |

### `packages/mcp/mcp-client/src/` — MCP tool substrate (research R1 / R2)

| Path / symbol | Role today | P6 note |
|---------------|------------|---------|
| `index.ts` `apply` / `Config` | Namespace plugin: one instance → one MCP server; `stdio` or `streamable-http`; tools on `ctx.tools` as `mcp__<serverName>__<tool>` | **Substrate for Pass** — product catalog MUST bind ready connectors into this registration model (T010) |
| `tools.ts` `publicToolName` / `syncTools` | Server-qualified public names + tool sync | Verifier observes successful tool call via outcome indicator — not LLM wording (FR-016) |
| `connection.ts` / `transport.ts` | Reconnect + transport | Fixture may use either transport; inventory does not pick |
| Composition today | Base bundle mounts `dsh-mcp-resources`; Desktop profile does **not** ship bare mcp-client product catalog | Thin Verifier fixture under agent-team **or** desktop test fixture (Architect Path A Q5) |

### `apps/desktop-host/` — Desktop Host process

| Path | Today | P6 gap |
|------|-------|--------|
| `src/index.ts` | Boots `profile: 'desktop'`; mounts Office + managed skills; lifecycle IPC to Electron | **No** Connector catalog plugin beyond Agent Teams composition already on desktop profile |
| `src/managed-skills.ts` | Host-owned skill-filesystem mount | Precedent for Host-plane capability after profile boot — connectors stay in Agent Teams journal + mcp-client bind, not a parallel Main store |
| `src/update-tasks.ts` | `ctx.jobs` inspect for update tasks | Unrelated to connector catalog |
| Base desktop profile | Agent Teams via `agent-team-profile` patch | Connector service loads with Agent Teams on Host process, not Electron Main |

---

## Preferred store candidates

### Preferred — Lead journal `team/connector` + mcp-client bind (Architect Path A)

| Fact | Detail |
|------|--------|
| Shape | `ConnectorRecord[]` on `TeamState`; event `team/connector` `{ version, teamId, connector: ConnectorRecord }`; thin catalog entries as Host-owned definitions (fixture allowed) |
| MCP bind | When `authState=ready`, register tools via `dsh-mcp-client` (dynamic instance or Host-owned bridge) under `serverName` |
| Why | Matches research R1 Option A; mirrors P4/P5 Host SoT; supports restart via projection; keeps secrets off Main |
| Next tasks | T007 types · T009 catalog service + journal/projection fold · T010 mcp bind · T011 credentials · T012 Remotes |

### Alternate — Host-adjacent service outside Agent Teams journal

| Fact | Detail |
|------|--------|
| Fit | Allowed only if MCP lifecycle cannot live cleanly in Agent Teams (research R1) |
| Verdict | **Defer** — default remains Agent Teams journal |

### Rejected — Electron Main store / Client-only / cordis.yml-only SoT / mcp-client alone without catalog

Violates thin shell (R6), Client-not-SoT, and FR-001 install surface. Guards: T013/T014 (out of this Setup PR).

---

## Gap matrix (data-model → code)

| Data-model field | types | journal event | projection fold | Remote mutate/list | mcp-client bind | Client-visible view |
|------------------|-------|---------------|-----------------|--------------------|-----------------|---------------------|
| `connectorId` | No | No | No | No | N/A | No |
| `catalogId` / `serverName` | No | No | No | No | Config only | No |
| `displayName` | No | No | No | No | No | No |
| `installState` | No | No | No | No | No | No |
| `authState` | No | No | No | No | No | No |
| `transport` | No | No | No | No | Config only | No |
| `createdAt` / `updatedAt` | No | No | No | No | No | No |
| CatalogEntry `fixture` / `authMode` | No | No | No | No | No | No |

---

## Extend-point sketch (non-normative; T007–T012 decide)

```text
Client/Web ──Remote installConnector / authConnector / listConnectors──► TeamService
                                                                              │
                                                                              ├─ validate catalogId + states
                                                                              ├─ brand connectorId; set timestamps
                                                                              ├─ TeamJournal.appendAndFlush('team/connector', …)
                                                                              └─ when ready → mcp-client tools on ctx.tools
                                                                                   └─ projection → agentTeams/view or list Remotes
```

**Locked:** Host Connector catalog SoT + `dsh-mcp-client` bind. Pass connector = any one thin-catalog / Verifier fixture (FR-017). Do not reopen Electron Main bus or Client-only SoT.

**Foundational follow-ons (out of this Setup PR):** T007 types → T009 catalog + journal → T010 MCP bind → T011 credentials → T012 Remotes → US1.

---

## Explicit non-touch (Setup)

- `apps/desktop` Electron Main / preload — no connector store (T013/T014 later)
- Client UI packages — consumers of Host projection only (US1+)
- Event harness — [event-harness-inventory.md](./event-harness-inventory.md) (T003)
- Credentials / trust — [credentials-trust-inventory.md](./credentials-trust-inventory.md) (T004)
- Seam locks — [connector-event-trust-seam-locks.md](./connector-event-trust-seam-locks.md) (T005)

---

## Evidence for Verifier / PO

Inventory is source-derived from `packages/experimental/agent-team/src/{types,journal,persisted,projection,index}.ts`, `packages/mcp/mcp-client/src/`, and `apps/desktop-host/` on branch tip vs [data-model.md](../data-model.md). No behavior tests required for Setup T002; foundational catalog work begins at T007.
