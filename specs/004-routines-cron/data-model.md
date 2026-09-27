# Data Model: Phase 4 — Routines (cron only)

**Feature**: `specs/004-routines-cron`
**Date**: 2026-09-27
**Source**: [spec.md](./spec.md) · [research.md](./research.md) · **DH Architect MOH-191** (`RoutineRecord` / projection / fire) · Bot from `specs/001`–`003`

Logical entities for plan/tasks. Persistence stays **Host-owned Routine catalog**; this file names fields, relationships, validation, and transitions Verifier can observe. Extends P1–P3 **Bot** — does not replace model assignment, persona, skills, or mailbox entities. Does **not** use `dsh-schedule` session reminder records as Routines SoT.

---

## RoutineRecord (Host SoT)

Durable Host domain object for one bot’s cron routine.

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `routineId` | Branded opaque Host id | Required; immutable |
| `botId` | → Bot id | Required; per-bot isolation (SC-006) |
| `intent` | Non-empty text | Required on create; identity MAY derive from this (no separate displayName required) |
| `scheduleExpr` | Product-supported cron/shorthand | Required; invalid/unsupported rejected; may include 5-field cron |
| `status` | `active` \| `paused` | Required; default `active` on create |
| `lastRunAt` | Timestamp \| `null` | Optional until first fire; updated on fire commit |
| `createdAt` | Timestamp | Required |
| `updatedAt` | Timestamp | Required on mutate |

**Relationships:** Belongs to exactly one Bot. Listed in that bot’s routines pane only. Stored in Host catalog (Agent Teams / Host journal extension pattern) — **not** Electron Main, **not** Client local store, **not** `dsh-schedule` session catalog.

**Validation:** Create rejected if `intent` empty or `scheduleExpr` invalid/unsupported (FR-001). Event-listener trigger types not admitted in P4.

---

## RoutineProjection (Client view)

Subset of `RoutineRecord` plus human-readable schedule/status for the pane. **Derived only from Host** over authenticated HTTP/WS.

| Observable | Rules |
|------------|-------|
| Identity | Intent or intent-derived summary |
| Schedule | Human-readable form of `scheduleExpr` |
| Status | `active` / `paused` |
| Last-run | From `lastRunAt` when present |
| Actions | Create; pause; resume (edit/delete/confirm optional) |

**Validation:** Header-only `ui-schedule` session reminder catalog without Host Routine CRUD is **insufficient** for Pass.

---

## RoutineFire (Host event)

Scheduled Host wake that starts/continues a bot turn with the routine intent.

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `routineId` | → RoutineRecord | Required |
| `botId` | → Bot | Required |
| `firedAt` | Timestamp | Required when fire committed |
| `visibility` | Pane last-run / linked activity | Required for Pass after ≥1 fire |

**Relationships:** Updates `RoutineRecord.lastRunAt` after fire commit. Optional `ctx.jobs` entry may exist for in-flight visibility only — jobs are **not** the durable fire log SoT. LLM reply adherence and Box/MCP outcomes not required for Pass.

**Validation:** While `status=paused`, no new fire recorded for matches in that interval (FR-003 / US4).

---

## Schedule expression (cron only)

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `scheduleExpr` | 5-field cron and/or product shorthands (`@every 5m`, `@hourly`, …) | Must be product-supported on Host scheduler |
| `timeZone` | Optional IANA / product local | Default user/product local; pinned TZ nice-to-have, not Pass |

**Validation:** Host product scheduler evaluates expressions. Do **not** require `dsh-schedule`’s interval-only model as the Routines expression language.

---

## Bot (extended)

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `id` | Opaque Host agent id | Unchanged |
| routines | Host catalog entries with this `botId` | ≥0; Pass proves ≥1 create + lifecycle on scripted bot |

---

## State transitions

```text
(create) → active
active --pause--> paused
paused --resume--> active
active --cron match--> RoutineFire (lastRunAt update); remains active
paused --cron match--> no fire
```

Delete optional (not Pass). Edit optional (not Pass).

---

## Non-entities (explicit)

- `dsh-schedule` `ScheduleRecord` as Routines SoT (session reminders only)
- Event-listener trigger configs (P6)
- Memory recall records (P5)
- Box/Shell execution artifacts as Pass entities (P7)
- MCP connector bindings (P6)
- `dsh-jobs` Job records as Routine catalog SoT (optional in-flight visibility only)
- Electron Main–persisted routine rows
