# Data Model: Phase 3 — Skills UX

**Feature**: `specs/003-skills-ux`
**Date**: 2026-09-27
**Source**: [spec.md](./spec.md) Key Entities · [research.md](./research.md) · Bot from `specs/001-multi-model-bots` / `specs/002-identity-personas`

Logical entities for plan/tasks. Persistence stays Host-owned; this file names fields, relationships, validation, and transitions Verifier can observe. Extends P1/P2 **Bot** — does not replace model assignment, persona profile, or mailbox entities.

---

## Skill

Reusable instructional playbook (managed or user-authored).

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `id` | Opaque Host skill id | Required; immutable |
| `displayName` | Non-empty string | Required when saved; human-readable in discovery |
| `instructionalBody` | Non-empty text | Required when saved (FR-006/013) |
| `source` | `managed` \| `user` | Managed = thin pack; user = authored |
| `description` | Optional short text | Shown in discovery if product displays it |

**Relationships:** May be attached to zero or more Bots via Skill attachment. Appears in Skills discovery/library.

**Validation:** User-authored save rejected if `displayName` or `instructionalBody` empty (FR-013). Managed skill for Pass: exactly one with `source=managed` in thin pack (R1).

---

## Thin managed pack

Logical set of platform-shipped managed skills for P3.

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `managedSkills` | List of Skill with `source=managed` | **Exactly one** required for Verifier Pass |

**Relationships:** Contained skills appear in discovery without user authoring.

**Validation:** Absence of inventory §6 extras does not fail Pass (FR-008 / SC-004).

---

## Skill attachment

Association of one Skill to one Bot.

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `botId` | → Bot id | Required |
| `skillId` | → Skill id | Required |
| `attachedAt` | Timestamp (optional observability) | Not required for Pass |

**Relationships:** Many attachments per Bot allowed; same Skill may attach to multiple Bots independently. Visible on that Bot’s skills/overview surface (global catalog alone insufficient).

**Validation:** Attach requires a load-available Skill. After attach, Skill `instructionalBody` participates in that Bot’s instruction assembly (FR-014).

**Instruction projection (observability for SC-007):** Host instruction assembly for the Bot MUST include instructional text of each attached Skill (or structured equivalents). Verifier does not score LLM replies.

---

## Bot (extended)

P1/P2 Bot extended with skill attachments.

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `id` | Opaque Host agent id | Unchanged |
| `displayName` / persona / avatar / section | P2 fields | Unchanged ownership |
| `skillAttachments` | Ordered list of Skill attachment | ≥0; Pass proves ≥1 on scripted bot |

**Relationships:** Owns attachments; does not own Skill definitions (catalog is shared).

---

## Skills discovery / library (view)

User-visible list/browse surface (logical view).

| Observable | Rules |
|------------|-------|
| Managed skills | Thin pack (exactly one for Pass) listed |
| User-authored skills | All saved user skills listed (or labeled group) |
| Load / available-to-attach | Selecting a skill for attach satisfies load (FR-002) |

---

## Skill authoring (transient + durable)

| State | Rules |
|-------|-------|
| Draft | Name/body may be incomplete; not yet discoverable as saved |
| Save rejected | Empty name or body → clear user-visible reason; no durable Skill row |
| Saved | Non-empty name+body; appears in discovery; editable |

---

## Skill run / active (observability)

Transient or session-projected UI state (not necessarily a durable history store).

| Observable | Rules |
|------------|-------|
| Run control result and/or session-active indicator | Shown on bot skills surface for Pass (FR-004) |
| Run history | Not required beyond attachment still present after restart (US2) |

---

## State transitions (summary)

```text
[Managed skill shipped] → listed in discovery → available-to-attach (load)
[Author draft] → (non-empty save) → user Skill → discovery → available-to-attach
               ↘ (empty save) → rejected (no Skill)
[Available Skill] + [Bot] → attach → Skill attachment → instruction bind on subsequent turns
[Attached] → run control OR session apply → UI run/active (Pass)
[Attached] → restart/reload → attachment remains
```

---

## Out of model (P3)

Plugin skills; learn-from-demonstration artifacts; full managed catalog rows; detach-as-required entity; memory/routines/MCP entities.
