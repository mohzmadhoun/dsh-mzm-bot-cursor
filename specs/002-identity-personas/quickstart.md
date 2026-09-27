# Quickstart: Phase 2 — Identity / Personas validation guide

**Feature**: `specs/002-identity-personas`
**Date**: 2026-09-27
**Purpose:** Runnable validation scenarios for Verifier / implementers. Not an implementation guide.

Prerequisites and expected outcomes reference [contracts/](./contracts/) and [data-model.md](./data-model.md).
Verifier recipe files are created during implement / Verifier workstreams (not by `/speckit-plan`).

---

## Prerequisites

1. Desktop app buildable (`apps/desktop`, `apps/desktop-host`) with P1 wedge available (create bot + model assignment).
2. Ability to create or select at least one bot.
3. Spec artifacts: [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md).
4. For SC-006: ability to inspect repo docs under `MzM-Docs/adr/` after the ADR commit lands.

---

## Scenario checklist (map to Verifier recipes at implement)

| Scenario | Contracts | Success criteria |
|----------|-----------|------------------|
| **1** Persona edit + persist + overview anti-jobs | [persona-profile.md](./contracts/persona-profile.md) | SC-001, SC-002, SC-008 |
| **2** Rename + preset avatar | [rename-avatar.md](./contracts/rename-avatar.md) | SC-003 |
| **3** Sidebar section + Unassigned | [sidebar-sections.md](./contracts/sidebar-sections.md) | SC-004 |
| **4** Delete confirm / cancel / confirm | [delete-confirm.md](./contracts/delete-confirm.md) | SC-005 |
| **5** Memory ADR presence (docs) | [memory-layers-adr.md](./contracts/memory-layers-adr.md) | SC-006 |
| **6** Full Phase 2 replay | all of the above | SC-007 (+ composite of 1–5) |

---

## Scenario 1 — Persona profile (job / voice / anti-jobs)

**Contract:** [persona-profile.md](./contracts/persona-profile.md)

1. Create a bot (P1 path) or select an existing one.
2. Open identity/profile; set job, voice, and ≥1 anti-job; save.
3. Leave and reopen profile — values remain.
4. Open bot overview — anti-jobs visible without a hidden editor.
5. Restart app or reload durable Host state — values still present.
6. Change job/voice/anti-jobs; save — updates replace prior values on profile and overview.
7. Observe instruction wiring for a subsequent turn (prompt/instruction assembly includes saved non-empty fields). Do **not** require matching LLM reply text.

**Expected:** SC-001, SC-002, SC-008 Pass evidence.

---

## Scenario 2 — Rename + preset avatar

**Contract:** [rename-avatar.md](./contracts/rename-avatar.md)

1. Rename bot N1 → N2; save.
2. Set or change avatar to a preset shape and/or color marker; save.
3. Confirm sidebar and overview show N2 and the chosen marker.
4. Restart/reload — name and avatar remain.

**Expected:** SC-003 Pass. Image-file upload not required.

---

## Scenario 3 — Sidebar sections

**Contract:** [sidebar-sections.md](./contracts/sidebar-sections.md)

1. Confirm bots without named assignment appear under Unassigned/default.
2. Create a named section; assign a bot to it.
3. Move the bot to another section or back to Unassigned; sidebar reflects membership.
4. Restart/reload — section names and membership persist.

**Expected:** SC-004 Pass.

---

## Scenario 4 — Delete with confirmation

**Contract:** [delete-confirm.md](./contracts/delete-confirm.md)

1. Start delete → confirmation required.
2. Cancel/dismiss → bot and profile unchanged.
3. Start delete again → confirm → bot gone from sidebar, overview entry points, and section membership.
4. Do **not** fail Pass solely because transcripts/mailbox history remain per Host rules.

**Expected:** SC-005 Pass.

---

## Scenario 5 — Memory layers ADR (docs-only)

**Contract:** [memory-layers-adr.md](./contracts/memory-layers-adr.md)

1. Locate ADR under `MzM-Docs/adr/` whose filename identifies agent vs user memory layers.
2. Confirm ADR distinguishes agent-scoped vs user-scoped memory and states no P2 memory product UX.
3. Spot-check shipped P2 surfaces — no profile/log/note recall product flow required.

**Expected:** SC-006 Pass.

---

## Scenario 6 — Full Phase 2 replay

**Owners:** DH Verifier

Run Scenarios 1–5 (or a single scripted path covering the same observations) on the real desktop app and record pass/fail evidence against [spec.md](./spec.md).

**Expected:** SC-007 Pass.

---

## Non-goals (must not appear in Pass criteria)

- Skills library UX (P3)
- Memory productization / recall UX (P5)
- Arbitrary image-file avatar upload
- Transcript/mailbox wipe as a Pass gate
- P1 topology/mailbox/auth re-litigation
