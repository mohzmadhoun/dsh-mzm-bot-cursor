# Data Model: Phase 4 — Routines (cron only)

**Feature**: `specs/004-routines-cron`
**Date**: 2026-09-27
**Source**: [spec.md](./spec.md) Key Entities · [research.md](./research.md) · Bot from `specs/001`–`003`

Logical entities for plan/tasks. Persistence stays Host-owned (`dsh-schedule`); this file names fields, relationships, validation, and transitions Verifier can observe. Extends P1–P3 **Bot** — does not replace model assignment, persona, skills, or mailbox entities.

---

## Routine

Saved intent/prompt plus a cron/schedule trigger for one bot. Maps to a Host schedule record (intent ≈ schedule prompt; trigger ≈ product-supported selector).

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `id` | Opaque Host routine/schedule id | Required; immutable |
| `botId` | → Bot id (via bot↔session binding) | Required; per-bot isolation (SC-006) |
| `intent` | Non-empty text | Required on create; identity MAY derive from this (no separate displayName required) |
| `schedule` | Product-supported cron/shorthand/interval | Required; invalid/unsupported rejected |
| `status` | `active` \| `paused` | Required; default `active` on create |
| `lastRunAt` | Optional timestamp / indicator | Set/updated on fire for pane visibility; absence before first fire OK |

**Relationships:** Belongs to exactly one Bot’s Host session scope. Listed in that bot’s routines pane only.

**Validation:** Create rejected if `intent` empty or `schedule` invalid/unsupported (FR-001). Event-listener trigger types not admitted in P4.

---

## Schedule trigger (cron only)

Time-based trigger for a Routine.

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `kind` | `interval` \| `at` \| `cron` (as product supports) | P4 Pass requires at least recurring interval ≥5 minutes |
| `expression` | e.g. `@every 5m`, 5-field cron, absolute time | Must be product-supported |
| `timeZone` | Optional IANA / product local | Default user/product local; pinned TZ nice-to-have, not Pass |

**Validation:** Unsupported expressions fail create with clear user-visible reason. Sub-5-minute intervals not required for Pass (clarify).

---

## Routine fire (observability)

One scheduled Host wake applying the routine intent.

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `routineId` | → Routine id | Required |
| `firedAt` | Timestamp | Required when fire recorded |
| `visibility` | Pane last-run / linked activity | Required for Pass after ≥1 fire |

**Relationships:** Updates Routine `lastRunAt` / fire indicator. Does not require LLM reply text or Box/MCP outcomes.

**Validation:** While `status=paused`, no new fire recorded for matches in that interval (FR-003 / US4).

---

## Bot (extended)

P1–P3 Bot extended with routines scope.

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `id` | Opaque Host agent id | Unchanged |
| `routines` | List of Routine for this bot | ≥0; Pass proves ≥1 create + lifecycle on scripted bot |

**Relationships:** Owns routine associations via Host session binding; does not store routines in Electron Main.

---

## Routines pane (view)

User-visible list/section on the bot info surface (logical view).

| Observable | Rules |
|------------|-------|
| Listed routines | All routines for selected bot; identity = intent or intent-derived |
| Status | `active` / `paused` visible |
| Last-run / fire | Visible after fire (SC-003) |
| Actions | Create; pause; resume (edit/delete/confirm optional) |

**Validation:** Projection of Host state only. Header-only `ui-schedule` catalog without create/pause/resume is insufficient for Pass (research R7).

---

## State transitions

```text
(create) → active
active --pause--> paused
paused --resume--> active
active --schedule match--> fire (lastRunAt update); remains active
paused --schedule match--> no fire
```

Delete optional (not Pass). Edit optional (not Pass).

---

## Non-entities (explicit)

- Event-listener trigger configs (P6)
- Memory recall records (P5)
- Box/Shell execution artifacts as Pass entities (P7)
- MCP connector bindings (P6)
- `dsh-jobs` Job records as Routine SoT (research R6)
