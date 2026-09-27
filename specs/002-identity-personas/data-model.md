# Data Model: Phase 2 — Identity / Personas

**Feature**: `specs/002-identity-personas`
**Date**: 2026-09-27
**Source**: [spec.md](./spec.md) Key Entities · [research.md](./research.md) · predecessor Bot in `specs/001-multi-model-bots/data-model.md`

Logical entities for plan/tasks. Persistence stays Host-owned; this file names fields, relationships, validation, and transitions Verifier can observe. Extends P1 **Bot** — does not replace P1 model assignment or mailbox entities.

---

## Bot (extended)

User-created agent identity from P1, extended with persona and presentation fields.

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `id` | Opaque Host agent/teammate id | Required; immutable |
| `displayName` | Non-empty string | Required; user-renamable (FR-004); duplicates allowed |
| `modelAssignment` | P1 Model assignment | Unchanged ownership; not a P2 acceptance surface |
| `persona` | → **Persona profile** | Optional at create; editable afterward |
| `avatar` | → **Avatar marker** | Optional; preset marker when set (FR-005) |
| `sectionId` | → **Sidebar section** id or null | `null` / absent ⇒ Unassigned/default (FR-006) |

**Relationships:** Owns Persona profile; may belong to zero or one named Sidebar section (else Unassigned); appears on Bot overview; removable via Delete confirmation.

**Validation:** Create still requires P1 minimum (`displayName` + model). Persona fields may be empty. Once saved, non-empty persona fields MUST apply as instructions on subsequent turns (FR-013).

---

## Persona profile

Per-bot job, voice, and anti-jobs.

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `job` | Short text (may be empty) | Primary responsibility statement |
| `voice` | Short text (may be empty) | How the bot should speak / present |
| `antiJobs` | Ordered list of short text items (≥0) | Explicit anti-responsibilities; Verifier scripted path requires ≥1 for SC-001/002 |

**Relationships:** 1:1 with Bot. Projected to Bot overview (anti-jobs at minimum). Composed into bot instructions after save (R2).

**Validation:** Empty job/voice/antiJobs allowed for product use; empty fields contribute no instruction text. Updates replace prior values on profile and overview.

**Instruction projection (observability for SC-008):** After save, Host instruction assembly for that bot MUST include the saved non-empty job, voice, and anti-job texts (or structured equivalents). Verifier does not score LLM replies.

---

## Avatar marker

Preset visual identity cue.

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `shape` | Enum / id from fixed preset set (optional if color-only) | Sufficient with color to distinguish bots |
| `color` | Enum / id from fixed preset set (optional if shape-only) | Sufficient with shape to distinguish bots |

**Relationships:** 1:0..1 with Bot; shown in sidebar and overview.

**Validation:** At least one of shape or color required when user sets an avatar for Pass. Image file / URL upload **not** in P2 model for Pass.

---

## Sidebar section

Named grouping in the bot sidebar.

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `id` | Opaque Host id | Required for named sections |
| `name` | Non-empty string | User-visible section title |
| `botIds` | Ordered list of Bot ids | Membership; a bot appears in at most one named section |

**Special grouping:** **Unassigned/default** — not necessarily a stored section row; bots with no `sectionId` appear here.

**Relationships:** Contains zero or more Bots. Empty named sections may remain after deletes.

**Validation:** Creating a named section requires a name. Assign/move/unassign updates membership durably (FR-006).

---

## Bot overview

User-visible summary surface for one Bot (logical view, not a separate durable store).

| Observable | Rules |
|------------|-------|
| Display name | Current `displayName` |
| Avatar marker | Current avatar when set |
| Anti-jobs | Saved `antiJobs` visible without a separate advanced-only editor (FR-003) |

**Relationships:** Read-model over Bot + Persona profile (+ avatar).

---

## Delete confirmation

Transient UI/control state for destructive remove (not durable).

| State | Rules |
|-------|-------|
| `idle` | Bot intact |
| `pending-confirm` | Delete initiated; bot still intact; confirm or cancel required |
| `cancelled` | Returns to idle; profile unchanged |
| `deleted` | Bot absent from sidebar, overview entry points, and section membership (FR-008) |

**Transitions:**

```text
idle → pending-confirm → cancelled → idle
                      ↘ deleted (identity removal for Pass)
```

Transcript/mailbox cleanup is out of band for P2 Pass.

---

## Memory layer (ADR only — not a P2 interactive entity)

Conceptual split recorded in docs; no product fields in P2 UI.

| Layer | Scope | P2 delivery |
|-------|-------|-------------|
| Agent memory | Per bot | Named in ADR only |
| User memory | Shared across bots | Named in ADR only |

**Artifact:** File under `MzM-Docs/adr/` whose filename identifies agent vs user memory layers (see [contracts/memory-layers-adr.md](./contracts/memory-layers-adr.md)).

---

## Explicit non-entities for P2

Do **not** introduce product entities for: skills library, memory profile/log/note records, routines, connectors, image-upload avatars, group channels.
