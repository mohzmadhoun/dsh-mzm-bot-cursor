# Data Model: Phase 6 — Connectors / MCP + event routines + trust

**Feature**: `specs/006-connectors-mcp-events-trust`
**Date**: 2026-09-28
**Source**: [spec.md](./spec.md) · [research.md](./research.md) · clarify locks PR #200 · Bot / Routine from `specs/001`–`005`

Logical entities for plan/tasks. Persistence stays **Host-owned** (Connector catalog + extended Routine catalog + credential store). Exact package homes await Architect (research Options A–E). Extends P1–P5 Bot / Routine — does **not** replace model assignment, persona, skills, cron-only semantics, or memory entities. Does **not** use Electron Main or Client local store as SoT.

---

## ConnectorRecord (Host SoT)

Durable Host domain object for one installed (or installable-bound) MCP/connector.

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `connectorId` | Branded opaque Host id | Required; immutable |
| `catalogId` / `serverName` | Thin-catalog entry id + MCP `serverName` namespace | Required; unique in product scope |
| `displayName` | User-visible label | Required for catalog/install UI |
| `installState` | `available` \| `installing` \| `installed` \| `failed` | Required; failed ≠ Pass |
| `authState` | `none` \| `needs_auth` \| `authenticating` \| `ready` \| `failed` | Required; tool call Pass needs `ready` |
| `transport` | `stdio` \| `streamable-http` (or product subset) | Required when installed |
| `createdAt` / `updatedAt` | Timestamp | Required |

**Relationships:** May bind to one or more Bots for tool availability (product may expose account-wide or per-bot; Pass needs ≥1 bot that can invoke one tool). Backed by MCP registration via `dsh-mcp-client` (research R1). **Not** Electron Main; **not** Client-only.

**Validation:** Install failure MUST surface clear reason and MUST NOT count as Story 1 Pass. Abandoned auth leaves non-ready. Chat-paste of long-lived secrets is not the primary auth path.

---

## ConnectorCatalogEntry (thin managed / fixture)

User-visible installable definition (not necessarily installed).

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `catalogId` | Stable catalog key | Required |
| `displayName` | Label | Required |
| `fixture` | boolean | Verifier fixture entries allowed for Pass |
| `authMode` | `in_app` \| `oauth` \| `none` \| … | Informational; in-app preferred for Pass |

**Validation:** Pass requires any **one** entry completable end-to-end — not a fixed name; not full Grok catalog (FR-017).

---

## ConnectorToolCall (observable outcome)

One invocation of a tool exposed by an authenticated connector.

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `connectorId` | → ConnectorRecord | Required |
| `toolName` | `mcp__<serverName>__<tool>` (or product projection) | Required |
| `outcome` | `success` \| `denied` \| `error` | Required for Pass distinction |
| `visibility` | User-visible success/deny/error indicator | Success required for SC-001; deny for SC-003 |

**Relationships:** Success proves Story 1. Deny proves Story 3 when permission-gated. LLM reply wording not scored (FR-016).

---

## RoutineRecord (extended — Host SoT)

Extends P4 cron `RoutineRecord` with event triggers. Cron rows remain valid.

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `routineId` | Branded opaque Host id | Required; immutable |
| `botId` | → Bot id | Required |
| `intent` | Non-empty text | Required; empty rejects |
| `triggerKind` | `cron` \| `event` | Required; P4 rows = `cron` |
| `scheduleExpr` | Product cron/shorthand | Required when `triggerKind=cron`; absent/ignored for event |
| `eventTrigger` | Pass: `webhook_harness` (Verifier fixture family) | Required when `triggerKind=event`; live families optional beyond Pass |
| `status` | `active` \| `paused` | Required; default `active` |
| `lastRunAt` | Timestamp \| `null` | Updated on fire commit |
| `createdAt` / `updatedAt` | Timestamp | Required |

**Relationships:** Belongs to one Bot. Listed in that bot’s routines pane; event vs cron distinguishable. Stored in Host catalog (prefer Agent Teams `team/routine` extension — Architect confirm). Fire = Host wake applying intent (P4 shape).

**Validation:** Event create with empty intent rejected. Live Slack/GitHub/… not required for Pass. While paused, matching events MUST NOT record fire.

---

## RoutineProjection (Client view — extended)

| Observable | Rules |
|------------|-------|
| Identity | Intent or intent-derived summary |
| Trigger | Cron schedule **or** event-family label (webhook harness) |
| Status | `active` / `paused` |
| Last-run | From `lastRunAt` when present |
| Actions | Create; pause; resume (P4); event create for P6 |

---

## RoutineFire (Host event — shared)

Same Pass meaning as P4: Host wake that starts/continues a bot turn with intent; updates `lastRunAt`. Source may be cron match **or** webhook-harness delivery match. LLM wording not scored.

---

## WebhookHarnessDelivery (Pass ingress)

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `deliveryId` | Opaque / provider id | Required for evidence correlation |
| `family` | `webhook_harness` | Pass lock |
| `matchedRoutineId` | → RoutineRecord \| none | Fire when active match |
| `receivedAt` | Timestamp | Required |

**Validation:** Manual “Run now” without harness delivery is **insufficient** for Story 2 Pass.

---

## PermissionDecision (trust gate)

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `requestId` | Opaque | Required |
| `target` | Connector tool / trust-gated action | Required |
| `decision` | `allow` \| `deny` \| `unavailable` | Deny path required for Pass |
| `source` | `user_deny` \| `standing_deny` \| `policy_never` \| … | At least one deny source proven |

**Relationships:** Prefer `dsh-user-approval` audit/outcome semantics (research R4). Denied action MUST NOT present as success.

---

## CredentialRef / CredentialRecord (Host store)

| Field | Type / notes | Rules |
|-------|--------------|-------|
| Key / record id | `credentialRef` or `credentialKey` (`scope/id`) | Required |
| Value / payload | Secret material | Stored in Host credential seam only |
| Describe | configured / source / writable | Never returns secret value |

**Validation:** Session dumps / exportable session artifacts MUST NOT contain plaintext secrets (FR-007). Env/key files are not product Pass path.

---

## Bot (extended)

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `id` | Opaque Host agent id | Unchanged |
| connectors | Available authenticated tools from Host catalog | ≥0; Pass proves ≥1 tool call |
| routines | Cron **and** event Host rows | Event Pass ≥1 |

---

## State transitions

### Connector

```text
(catalog) available --install--> installing --> installed | failed
installed + needs_auth --auth--> authenticating --> ready | failed | needs_auth (abandoned)
ready --tool call--> success | denied | error
```

### Event routine

```text
(create event) → active
active --pause--> paused
paused --resume--> active
active --harness match--> RoutineFire (lastRunAt); remains active
paused --harness match--> no fire
```

### Permission

```text
(tool gated) --user deny / standing deny--> denied (visible; not success)
(tool gated) --allow--> proceeds (complementary; not required for deny Pass)
```

---

## Non-entities (explicit)

| Name | Why excluded from Pass SoT |
|------|----------------------------|
| Full Grok multi-family connector catalog | Out — thin catalog / one fixture enough |
| Named live event adapters as Pass requirement | Out — harness only |
| Mandatory vault product surface | Out unless in-app cannot auth Pass connector |
| Box / Shell / computer-use | P7 |
| Electron Main connector/event/trust store | Forbidden |
| Session dump as credential store | Forbidden |
| P4 cron-only RoutineRecord without event discriminant | Insufficient for P6 event Pass (must extend, not replace) |
