---
description: "Use and debug the experimental Web Agent Teams roster, shared task board, and teammate navigation panel."
kind: "package-reference"
---

# @deepseek-ai/dsh-experimental-client-ui-agent-team

English | [中文](README.zh.md)

## Summary

This package adds an Agent Teams action to the Web conversation header, where a user can inspect the current roster, Host mailbox 1:1 handoffs, create a Host-owned Bot with a model/provider assignment, manage the shared task board, and navigate into a teammate's conversation. It reads authoritative Team state through the generated `ctx.remote.agentTeams` contribution and keeps ordinary child-history navigation on the stable addressed-subagent path. Choose it through the published experimental Agent Teams Web profile. The browser projection does not extend the stable API Proxy, store Team state, or register model-facing input.

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
| [`src/client/TeamAction.tsx`](src/client/TeamAction.tsx) | Roster, Host mailbox handoffs, Host bot-create, and task-board interaction state |
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
- **No rename/delete/interrupt controls** — the panel creates bots through Host `createBot` but cannot rename, delete, or interrupt teammates; write scopes remain advisory metadata.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>

**Runtime invariant:** No companion is published. RPC is authoritative and the package owns disposable slot registrations for the header action and handoff notices.
