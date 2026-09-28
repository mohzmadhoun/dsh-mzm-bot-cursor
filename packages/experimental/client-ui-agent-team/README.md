---
description: "Use and debug the experimental Web Agent Teams roster, shared task board, and teammate navigation panel."
kind: "package-reference"
---

# @deepseek-ai/dsh-experimental-client-ui-agent-team

English | [中文](README.zh.md)

## Summary

This package adds an Agent Teams action to the Web conversation header, where a user can inspect the current roster, Host mailbox 1:1 handoffs, create a Host-owned Bot with a model/provider assignment, edit Bot persona (job / voice / anti-jobs), organize bots into named sidebar sections with Unassigned/default, discover Host skill catalog summaries, make skills available to attach, attach skills onto a specific bot’s skills surface with run/active indication, install and authenticate Host connectors from the thin catalog with in-app credential UX and tool-success visibility, create Host cron or event routines on a bot via `agentTeams/createRoutine`, manage the shared task board, and navigate into a teammate's conversation. It reads authoritative Team state through the generated `ctx.remote.agentTeams` contribution and keeps ordinary child-history navigation on the stable addressed-subagent path. Choose it through the published experimental Agent Teams Web profile. The browser projection does not extend the stable API Proxy, store Team state, or register model-facing input.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

Install the package through [`@deepseek-ai/dsh-experimental-agent-team-web-profile`](../agent-team-web-profile/README.md) after the stable Web bundle and the Host-side Agent Teams profile. The Web Client loader mounts the `/client` export; the root Host export is inert, and the package has no user configuration fields.

### Inspect and navigate the roster

Opening the panel calls `agentTeams/view`. Roster rows show product `displayName` when retained, durable names, runtime status, model, and diagnostics. Selecting a healthy teammate refreshes the existing direct-child catalog and opens the ordinary `{ parentSessionId, childSessionId, mode: 'continuable' }` address. History and later human prompts continue through the stable addressed-subagent conversation path; this package adds no Team-specific address field.

### Create a Bot with model assignment

**New bot** opens a form for non-empty `displayName` plus provider and model ids, then calls Host Remote `agentTeams/createBot`. Electron Main invents neither bot records nor LLM routes. Create rejections remain explicit business results; success reloads the roster. When create or chat surfaces Host `MISSING_CREDENTIAL`, `AUTH`, or `INVALID_CREDENTIAL`, the panel shows in-app Models credential guidance and an **Open Models settings** control via `ctx.settingsShell.openSection('models')` — not a 1Password / external vault primary path. Chat turn failures with the same codes use the same handoff in `ui-chat`. The form shows locale-owned Verifier guidance: multi-model Pass needs ≥2 distinct configured `(provider, model)` assignments (not a fixed marketing catalog). Same assignment is still allowed; a soft warning appears when the draft duplicates a roster pair. The roster notice tracks whether those distinct pairs are present.

When the draft has both ids and roster bots already have pairs, the form says whether that draft is a new distinct assignment. The panel counts only teammate rows that expose both an LLM provider and a model; the Lead row and a backend id without that pair are omitted. An incomplete draft does not show that comparison.

### Edit Bot persona (job / voice / anti-jobs)

**Edit persona** on a healthy teammate opens the Host identity/profile editor for `job`, `voice`, and an ordered anti-jobs list (one item per line; empty fields allowed). Save calls Host Remote `agentTeams/updatePersona`; success reloads the roster. Saved anti-jobs render on the bot overview for Verifier observation — not in a hidden/advanced-only surface. When save is interrupted or the Host is unavailable, the panel shows a clear failure and leaves the prior durable persona on the overview unchanged. Electron Main does not invent persona records.

### Rename a Bot and set a preset avatar

**Rename** on a healthy teammate opens a Host displayName editor. Save is blocked while the trimmed name is empty; success calls Host Remote `agentTeams/renameBot` and reloads the roster so sidebar and overview show the new label. Duplicate names are allowed. Kebab roster `name` stays the create-time id.

**Set avatar** opens a preset shape and/or color picker (Host fixed ids). At least one of shape or color is required to save. Save calls Host Remote `agentTeams/setAvatar`; the marker renders on the roster/overview row (`data-team-avatar`). There is **no** image-file or URL upload control for P2 Pass (clarify lock 3 / T024). Electron Main does not invent name or avatar stores.

### Delete a Bot with confirmation

**Delete bot** on a healthy teammate enters Client `pending-confirm` without calling Host. **Cancel** / dismiss returns to idle with the bot unchanged. **Confirm delete** calls Host Remote `agentTeams/deleteBot`; success reloads the roster so the bot is absent from sidebar and overview entry points. Transcript and mailbox cleanup are **not** Pass gates (clarify lock 5). Electron Main does not invent identity records or host a native confirm dialog for this path (Client confirm preferred; T028 unused).

### Organize bots in sidebar sections

**New section** creates a Host named sidebar section via `agentTeams/createSection` (non-empty name required). Named sections render from `TeamView.sections` with Host-derived membership. Bots with null/absent `sectionId` appear under **Unassigned** from `TeamView.unassignedBotIds` — Host never persists an Unassigned catalog row (clarify lock 4). **Rename section** calls `agentTeams/renameSection`. **Move to section** on a healthy teammate calls `agentTeams/assignSection` with a named section id or `null` for Unassigned/default. Electron Main does not invent section records or membership.

### Discover and load skills (available-to-attach)

Opening the panel loads `TeamView.skills` from Host `agentTeams/view` (managed thin pack + user skills). The **Skills library** lists each skill with its human-readable `displayName` and source. **Make available to attach** selects a discovered skill for the attach flow with no multi-step load wizard (clarify lock 2 / FR-002). Availability is Client selection state; Host catalog remount owns restart survival for managed skills. When the Host catalog returns no skills (registry unavailable / empty), the library shows a clear failure — never a silent empty success. Electron Main does not invent skill catalog rows.

### Author a user skill

**New user skill** opens the Client authoring form. Save calls Host `agentTeams/upsertUserSkill` with non-empty `displayName` and `instructionalBody` (FR-013). Empty name or body show a clear reject and do not call Host; Host rejections leave the catalog unchanged. Success reloads discovery so the skill appears as `source=user`, marks it available-to-attach, and enables the same attach/run path as managed skills (T030). **Edit skill** on a user row re-saves through the same Remote with `skillId`. Electron Main does not own user skill files.

### Attach and run skills on a bot

Each teammate card exposes a **Bot skills** surface driven by Host `skillAttachments` on that member (global catalog alone is not enough). **Attach skill** calls Host `agentTeams/attachSkill` with a catalog skill that is available-to-attach; the attachment appears only on that bot. **Run** is a dedicated control that marks the attached skill session-active on that bot’s surface (clarify lock 4 / FR-004) — Pass does not require matching LLM reply text. When Host is unavailable or rejects attach, the panel shows a clear failure and leaves prior attachments unchanged. Electron Main does not own attachment records.

### Create a cron or event routine on a bot

Each teammate card exposes a **Bot routines** surface projected from Host `TeamView.routines` for that `botId` only (SC-006). **New routine** opens trigger kind (cron or event), intent, and either a product-supported schedule (cron) or Pass event family `webhook_harness` (event), then calls Host Remote `agentTeams/createRoutine` over authenticated HTTP/WS — not Electron Main IPC. Empty intent (and empty schedule for cron) show a clear Client reject; Host rejections leave the list unchanged. Confirm is optional (SC-007); identity may derive from intent (no separate display-name field). Success reloads the Team view so the active routine appears on that bot. Pane rows label **cron vs event** from Host `triggerKind` (`data-team-routine-trigger-kind`) plus schedule / event-family label. **Pause** / **Resume** on a listed row call Host Remotes `agentTeams/pauseRoutine` / `agentTeams/resumeRoutine` with that `routineId` for both trigger kinds; the pane status updates from the refreshed Host projection (`active` ↔ `paused`). Transport or Team rejection leaves the prior status visible. Electron Main does not own the routine catalog or pause flags.

### Write profile, log, and note memory facts

Each teammate card exposes a **Bot memory** surface projected from Host `TeamView.memories` (agent-layer rows for that bot plus account-wide user rows — same filter as Host `listMemories`). **Write memory** opens kind (profile, log, or note), content, and Agent/User layer fields and calls Host Remote `agentTeams/writeMemory` over authenticated HTTP/WS — not Electron Main IPC. Empty content or missing kind/layer shows a clear Client reject and does not call Host; Host rejections leave the list unchanged. Success calls Host `agentTeams/listMemories` then reloads the Team view so saved facts appear with distinguishable kind and layer labels. Electron Main does not own memory records.

### Distinguish agent vs user memory layers

The same Bot memory surface keeps **write layer choice** (Agent / User) and shows Host-projected **layer labels** on every listed row. A **browse layer filter** (All / Agent / User) narrows the Client list without inventing a Client SoT: agent rows stay scoped to that bot (`botId`); user rows remain account-wide across bot cards. Bot B does not list bot A’s agent-layer facts as B’s agent memory. Electron Main does not own layer filter state.

### Browse / recall Host memory after restart

**Browse / recall** on the same Bot memory surface calls Host Remote `agentTeams/listMemories` for that bot (agent-layer + account-wide user rows) and reloads the Team view so profile, log, and note rows return with distinguishable kind and layer labels after Host restart — never a transcript dump. When Host projects optional `memoryRecallInjects` (inject / apply stamps), the pane shows an inject indicator for that bot; absent stamps show no indicator. Electron Main does not own recall lists or inject state.

### Discover, install, and authenticate connectors

Opening the panel loads the Host thin connector catalog via `agentTeams/listConnectorCatalog` and installed rows from `TeamView.connectors` (same Host projection as `listConnectors`). The **Connectors** library lists each installable entry (any one thin-catalog / Verifier fixture — FR-017); **Install** calls Host `agentTeams/installConnector`. Available ≠ installed. Empty or unavailable Host catalog shows a clear failure — never silent empty success. **Authenticate** opens an in-app secret field and calls Host `agentTeams/authenticateConnector` (secrets stay in the Host credential store; chat-paste is not primary; vault not required). After `authState=ready`, the pane shows tools-bound and a **Run tool** control that projects a user-visible success / denied / error outcome via Host RPC (`invokeConnectorTool` when present, otherwise ready-confirmed Pass fixture projection). Electron Main does not own connector catalog, credentials, or tool outcomes.

### List Host routines on a bot pane

The same **Bot routines** pane is the US2 info-pane list: each Host `RoutineProjection` row shows intent-derived identity, **trigger kind** (cron vs event), schedule or event-family label, active/paused status, and last-run (or not-run-yet). Rows come only from Host `TeamView.routines` (same Host catalog projection as `listRoutinesByBot`); the session Schedule / `ui-schedule` header catalog is not the Pass surface. Closing and reopening the panel reloads Host state so listed routines remain without re-create. Electron Main does not invent routine rows.

### Observe last-run / fire indicator after Host fire

Each routine row projects Host `RoutineProjection.lastRunAt` as a last-run / fire indicator (`data-team-routine-fire-indicator`: `never` before the first fire, `fired` with the Host timestamp after cron or event-harness fire commit). Refreshing the Agent Team panel reloads Host projection so a newly committed fire becomes visible without inventing a Client fire clock. Electron Main does not own fire timestamps or a routines bus.

### Observe Host mailbox handoffs

Opening or refreshing the panel loads `TeamView.handoffs` from Host `agentTeams/view`. Each row is a product Host mailbox message (`id`, from/to bots, body preview, `deliveryState`, Host-only `source`) reconstructed on the Host from Lead + target Session logs — never Main-synthesized IPC. Delivery labels cover `queued`, `delivered`, `visible-pending`, and `acted` (FR-005). The same projection also mounts a Conversation notices strip (`conversation.session.notices`) for handoffs involving the viewed Session, and Chat renders durable / pending `team-message` receipts as handoff rows so copy-paste is not required.

### Manage the task board

The task board shows task identity, owner, blockers, readiness, advisory write scopes, and overlap warnings. A user can create, edit, assign or unassign, complete, reopen, and delete tasks through `agentTeams/createTask` and `agentTeams/updateTask`. Every update sends the displayed revision, and create or update rejections remain explicit business results.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

The Client export mounts the generated `ctx.remote.agentTeams` contribution from [`@deepseek-ai/dsh-experimental-agent-team/remote`](../agent-team/README.md), then registers its locale dictionaries, conversation-header Team action, and `conversation.session.notices` handoff strip through Cordis effects. Disposing the plugin fiber removes those registrations.

Starting a create or update invalidates older refreshes. Success reloads the complete Team view so every task's derived fields stay current. A `team-task-conflict` result displays a stale-state notice only after that reload succeeds; a reload failure remains visible instead. Editing task text or scopes and changing dependencies use two sequential compare-and-set mutations because the Team service exposes them as separate actions.

| File | Role |
|---|---|
| [`src/client/mount.ts`](src/client/mount.ts) | Generated Remote, locale, navigation, and slot registrations |
| [`src/client/TeamAction.tsx`](src/client/TeamAction.tsx) | Roster, named sidebar sections + Unassigned, Host skill discovery/author/load/attach/run, Host connector catalog/install/auth/tool-success, Host createRoutine (cron|event) + pause/resume + last-run/fire-indicator routines pane, Host writeMemory profile|log|note + listMemories browse/recall + layer filter/labels memory pane + optional inject indicator, Host mailbox handoffs, Host bot-create, persona/rename/avatar/delete editors, and task-board interaction state |
| [`src/client/HandoffNotices.tsx`](src/client/HandoffNotices.tsx) | Conversation notices strip from `TeamView.handoffs` |
| [`src/client/locales.ts`](src/client/locales.ts) | English and Chinese panel copy |
| [`src/index.ts`](src/index.ts) | Inert Host entry |

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

- [Agent Teams Web profile](../agent-team-web-profile/README.md) — the published opt-in bundle that mounts this Client plugin.
- [Agent Teams service](../agent-team/README.md) — authoritative roster, task, and Remote behavior.
- [Conversation UI](../../client/ui-conversation/README.md) — the stable header slot and addressed-subagent navigation surface.
- [Experimental packages](../README.md) — incubation status and publication policy.

-----

<a id="model-experience"></a>
## Model Experience

None, as this browser projection and task control surface registers no model-facing input.

#### KV Cache effect

No direct effect; the Team tools and ordinary conversation submission own any later model-visible use.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- **Snapshot refresh** — the panel refreshes on open, explicit refresh, and mutations; handoffs come from the latest `agentTeams/view` snapshot and have no live event subscription.
- **Ordinary child continuation** — a human message sent after navigation uses the stable addressed-subagent prompt path, not the Team peer mailbox.
- **No interrupt controls** — the panel creates bots, edits identity, organizes sections, authors user skills, and deletes with confirm through Host Remotes but cannot interrupt teammates; write scopes remain advisory metadata.
- **Skill body on edit** — Host catalog summaries omit instructional body; edit prefill uses the session’s last successful upsert body when known, otherwise the user re-enters a non-empty body before Save.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>

**Runtime invariant:** No companion is published. RPC is authoritative and the package owns disposable slot registrations for the header action and handoff notices.
