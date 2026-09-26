# Data Model: Phase 1 Wedge A — Multi-Model Bots

**Feature**: `specs/001-multi-model-bots`
**Date**: 2026-09-26
**Source**: [spec.md](./spec.md) Key Entities · [architecture.md](./architecture.md) data shapes · [research.md](./research.md)

Logical entities for plan/tasks. Persistence mechanisms stay Host-owned; this file names fields, relationships, validation, and transitions Verifier can observe.

---

## Bot

User-created agent identity for Phase 1.

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `id` | Opaque Host agent/teammate id (branded at Host boundary) | Required; immutable after create for P1 acceptance |
| `displayName` | Non-empty string | Required at create (FR-001); basic create minimum |
| `modelAssignment` | → **Model assignment** | Exactly one for P1 (FR-002) |
| `scope` | Host agent scope | Isolates model assignment; MUST NOT inherit another bot’s tool privilege by default (FR-011) |

**Relationships:** Belongs to one Work session / Team context; may send/receive **Host mailbox messages**; owns **Chat turns**.

**Validation:** Create requires `displayName` + model/provider assignment. Same model on two bots is allowed (edge case).

---

## Model assignment

Binding of one Bot to one configured model/provider route.

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `provider` | Configured provider id string | Required; must resolve via stored credential path when calling |
| `model` | Model id string for that provider | Required |
| `reasoningEffort` | Optional provider-specific effort | Optional |

**Relationships:** 1:1 with Bot for P1. Resolved through Host `installModelSelection` / `agentOptions` (architecture).

**Validation:** For Verifier SC-001/SC-002 Pass, environment MUST expose ≥2 **distinct** `(provider, model)` assignments across bots under test. Catalog is configuration, not a fixed marketing list.

---

## Provider credential

Secret material authorizing provider calls.

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `ref` | `CredentialRef` (non-secret handle) | What UI and settings may show |
| `provider` | Provider this credential authorizes | Required |
| `secret` | Secret value in Host store only (`dsh-credentials-local`) | MUST NOT appear in renderer, session dumps, or transcript exports (FR-008, SC-006) |
| `source` | `in-app` \| `env-or-keyfile` | Product primary = `in-app` via Models UI; env/keyfile = dev/CI only (FR-009) |

**Relationships:** Referenced by Model assignment / llm adapter resolve; never embedded in Chat turn content.

**State:** missing → prompt in-app entry; invalid/revoked → clear failure + re-entry offer; no silent steal of another bot’s credential (edge case).

---

## Host mailbox message

Async 1:1 peer message delivered only through Host mailbox/inbox (Agent Teams).

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `id` | Durable Host message id | Required |
| `fromBotId` | Sender Bot | Required |
| `toBotId` | Recipient Bot | Required; 1:1 only (no group in P1) |
| `body` | Message payload visible to recipient / user | Required |
| `createdAt` | Timestamp | Required |
| `deliveryState` | `queued` \| `delivered` \| `acted` \| `visible-pending` | User MUST see handoff if recipient does not act (FR-005) |
| `source` | Host mailbox / team-message provenance | MUST NOT be Electron IPC |

**Relationships:** From Bot A → Bot B; may trigger recipient Chat turn or remain visible pending.

**Transitions:**

```text
queued → delivered → acted
                 ↘ visible-pending (user-observable; no copy-paste required)
```

---

## Chat turn

User-visible conversation unit for a bot’s work.

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `id` | Session/turn id | Required |
| `botId` | Owning Bot | Required |
| `progressUpdates` | ≥0 in-flight updates from Host streams | SC-004 requires ≥1 before completion on scripted path |
| `finalResult` | Completed assistant / handoff result | Required when work completes (FR-006) |
| `linkedMailboxMessageId` | Optional | Set when turn is attributable to a mailbox message |

**Relationships:** Belongs to Work session; may be caused by user prompt or mailbox message.

---

## Work session

Contiguous desktop use where the user operates ≥2 bots toward a real task.

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `id` | Session / Lead context id | Required |
| `bots` | ≥1 Bot; Verifier Pass needs ≥2 with distinct model assignments | SC-001/002 |
| `startedAt` / `completedAt` | Timestamps | TTFT measured from first launch to first completed multi-model team session (SC-001) |

---

## Shell↔Host control event (topology gate)

Not a product entity; Verifier handshake observation.

| Event | Payload facts | Forbidden |
|-------|---------------|-----------|
| `ready` | `url: string`, optional `injections` | Chat/mailbox payloads on IPC |
| `fatal` | Failure signal | — |
| `shutdown-complete` | Ordered stop | — |
| `update-tasks` | Lifecycle only | Application messaging |

Document origin after ready: `dsh-app://` main frame. Data plane: authenticated HTTP/WS to reported URL ([architecture.md](./architecture.md) Verifier criteria; PO lock — not framed pipes).

---

## Out of model (explicit P1 non-entities)

Personas, skills library records, routines, memory notes product UX, MCP connector installs, Box/Shell backends, group channels, framed-pipe app I/O — absent from this feature’s acceptance model.
