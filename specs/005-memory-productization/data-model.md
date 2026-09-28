# Data Model: Phase 5 — Memory productization

**Feature**: `specs/005-memory-productization`
**Date**: 2026-09-28
**Source**: [spec.md](./spec.md) · [research.md](./research.md) · ADR `MzM-Docs/adr/agent-vs-user-memory-layers.md` · PO-locked Host Memory catalog Option · Bot from `specs/001`–`004`

Logical entities for plan/tasks. Persistence stays **Host-owned Memory catalog**; this file names fields, relationships, validation, and transitions Verifier can observe. Extends P1–P4 **Bot** — does not replace model assignment, persona, skills, routines, or mailbox entities. Does **not** use chat transcript as curated memory SoT.

---

## MemoryRecord (Host SoT)

Durable Host domain object for one curated memory fact.

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `memoryId` | Branded opaque Host id | Required; immutable |
| `kind` | `profile` \| `log` \| `note` | Required; vocabulary only — not a layer lock |
| `layer` | `agent` \| `user` | Required; ADR scopes |
| `botId` | → Bot id \| `null` / absent | Required when `layer=agent`; absent/null when `layer=user` (account-wide) |
| `content` | Non-empty text | Required on write; empty rejects without write |
| `createdAt` | Timestamp | Required |
| `updatedAt` | Timestamp | Required on mutate (edit optional / not Pass) |

**Relationships:** Agent-scoped rows belong to exactly one Bot. User-scoped rows belong to the account/user and are available across bots. Stored in Host catalog (prefer Agent Teams / Host journal extension — research R1) — **not** Electron Main, **not** Client local store, **not** transcript.

**Validation:** Write rejected if `content` empty after trim (FR-001…003). Kind and layer are independently chosen (FR-017). Transcript lines are not admitted as `MemoryRecord` by chat alone.

---

## MemoryProjection (Client view)

Subset of `MemoryRecord` plus human-readable kind/layer labels for the memory surface. **Derived only from Host** over authenticated HTTP/WS.

| Observable | Rules |
|------------|-------|
| Kind | profile / log / note distinguishable |
| Layer | agent vs user distinguishable |
| Content | Written fact text returned |
| Bot scope | Agent rows shown for owning bot only; user rows visible across bot contexts |
| Actions | Write (kinds); browse/recall after restart (edit/delete optional) |

**Validation:** Chat transcript dump without Host Memory CRUD is **insufficient** for Pass.

---

## MemoryRecallInject (Host model-visible path)

Host makes ≥1 curated `MemoryRecord` available to a subsequent bot turn via context/instruction assembly.

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `memoryId`(s) | → MemoryRecord | ≥1 for Pass |
| `botId` | → Bot receiving the turn | Required |
| `assembledAt` / turn linkage | Session-log reconstructable | Required — model-visible ⟺ logged |
| `visibility` | Verifier-observable inject/apply indicator when present | Surface recall still required separately |

**Relationships:** Assembled from agent-layer rows for that `botId` plus user-layer account rows (product may inject a subset; Pass needs ≥1 curated fact made model-visible). Prefer scoped instruction section sibling to persona-prefix / skill-instructions (research R5). LLM reply wording not scored.

**Validation:** Surface-only browse without this path fails FR-016 / SC-004.

---

## Kind (vocabulary)

| Value | Meaning (product) | Layer lock? |
|-------|-------------------|-------------|
| `profile` | Stable identity fact (timezone, role, preference, …) | **No** — may be agent or user |
| `log` | Chronological notable event | **No** |
| `note` | Freeform durable curated text | **No** |

---

## Layer (ADR)

| Value | Scope | Isolation rule |
|-------|-------|----------------|
| `agent` | One bot | Bot B MUST NOT list bot A’s agent rows as B’s agent memory solely because A saved them |
| `user` | Account / user across bots | Same user row available in bot A and bot B contexts after save and after restart/recall |

---

## Bot (extended)

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `id` | Opaque Host agent id | Unchanged |
| agent memory | Host catalog entries with `layer=agent` and this `botId` | ≥0; Pass proves ≥1 agent-scoped fact |
| user memory (shared) | Host catalog `layer=user` | Shared; Pass proves ≥1 user-scoped fact |

---

## Transcript (non-entity for Pass)

Per-conversation chat history. **Not** a `MemoryRecord`. Must not substitute for curated write/recall Pass.

---

## State transitions

```text
(write non-empty) → MemoryRecord persisted on Host
MemoryRecord --restart/reload--> still present (Host durable)
MemoryRecord --surface browse/recall--> MemoryProjection visible
MemoryRecord --subsequent bot turn--> optional MemoryRecallInject (≥1 required for Pass)
(empty write) → rejected; no row
```

Edit/delete optional (not Pass). Bot-tool write optional (not Pass).

---

## Non-entities (explicit)

- Chat transcript as curated memory SoT
- Electron Main–persisted memory rows
- Client-only memory SoT
- Kind→layer lock tables as Pass requirements
- Bot-tool write records as Pass requirements
- Connector / MCP / event-routine bindings (P6)
- Box/Shell execution artifacts as Pass entities (P7)
- Full Grok memory chrome organization entities beyond ADR
