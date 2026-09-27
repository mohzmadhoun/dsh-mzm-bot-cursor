# Quickstart: Phase 2 — Identity / Personas validation guide

**Feature**: `specs/002-identity-personas`
**Date**: 2026-09-27
**Purpose:** Runnable validation scenarios for Verifier / implementers. Not an implementation guide.

Prerequisites and expected outcomes reference [contracts/](./contracts/) and [data-model.md](./data-model.md).
Verifier recipes home: [verifier/README.md](./verifier/README.md).

---

## Prerequisites

1. Desktop app buildable (`apps/desktop`, `apps/desktop-host`) with P1 wedge available (create bot + model assignment).
2. Ability to create or select at least one bot.
3. Spec artifacts: [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md).
4. For SC-006: ability to inspect repo docs under `MzM-Docs/adr/` after the ADR commit lands.
5. Foundational Pass (T011) stamped in [verifier/README.md](./verifier/README.md) before Scenarios 1–6 count toward phase Done.

---

## Scenario → Verifier recipe checklist (T042)

Each quickstart scenario MUST cite a Verifier recipe. Spec validates links and step coverage only; implementers / Verifier execute the recipes.

| Scenario | Recipe | Quickstart cites recipe | Recipe cites quickstart | Notes |
|----------|--------|-------------------------|-------------------------|-------|
| **1** Persona edit + persist + overview anti-jobs | [verifier/scenario-1-persona-profile.md](./verifier/scenario-1-persona-profile.md) | Yes | Yes | SC-001/002/008 · T019 |
| **2** Rename + preset avatar | [verifier/scenario-2-rename-avatar.md](./verifier/scenario-2-rename-avatar.md) | Yes | Yes | SC-003 · T025 |
| **3** Sidebar section + Unassigned | [verifier/scenario-3-sidebar-sections.md](./verifier/scenario-3-sidebar-sections.md) | Yes | Yes | SC-004 · T035 |
| **4** Delete confirm / cancel / confirm | [verifier/scenario-4-delete-confirm.md](./verifier/scenario-4-delete-confirm.md) | Yes | Yes | SC-005 · T030 |
| **5** Memory ADR presence (docs) | [verifier/scenario-5-memory-adr.md](./verifier/scenario-5-memory-adr.md) | Yes | Yes | SC-006 · T037; ADR path Spec T036 |
| **6** Full Phase 2 replay | [verifier/scenario-6-full-replay.md](./verifier/scenario-6-full-replay.md) | Yes | Yes | SC-007 · T039; foundational Pass required first |

Owners map: [verifier/README.md](./verifier/README.md#scenario-16-owners-map).
Non-goals absence checks: [verifier/non-goals.md](./verifier/non-goals.md) (T024/T038/T040 asserted).

**T042 validation (2026-09-27):** Scenarios 1–6 quickstart steps cite landed Verifier recipes (no Spec-owned recipe content gaps). Scenario 6 landed via #99 (T039); non-goals completed via T040.

---

## Scenario 1 — Persona profile (job / voice / anti-jobs)

**Contract:** [contracts/persona-profile.md](./contracts/persona-profile.md)
**Recipe:** [verifier/scenario-1-persona-profile.md](./verifier/scenario-1-persona-profile.md)

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

**Contract:** [contracts/rename-avatar.md](./contracts/rename-avatar.md)
**Recipe:** [verifier/scenario-2-rename-avatar.md](./verifier/scenario-2-rename-avatar.md)

1. Rename bot N1 → N2; save.
2. Set or change avatar to a preset shape and/or color marker; save.
3. Confirm sidebar and overview show N2 and the chosen marker.
4. Restart/reload — name and avatar remain.

**Expected:** SC-003 Pass. Image-file upload not required.

---

## Scenario 3 — Sidebar sections

**Contract:** [contracts/sidebar-sections.md](./contracts/sidebar-sections.md)
**Recipe:** [verifier/scenario-3-sidebar-sections.md](./verifier/scenario-3-sidebar-sections.md)

1. Confirm bots without named assignment appear under Unassigned/default.
2. Create a named section; assign a bot to it.
3. Move the bot to another section or back to Unassigned; sidebar reflects membership.
4. Restart/reload — section names and membership persist.

**Expected:** SC-004 Pass.

---

## Scenario 4 — Delete with confirmation

**Contract:** [contracts/delete-confirm.md](./contracts/delete-confirm.md)
**Recipe:** [verifier/scenario-4-delete-confirm.md](./verifier/scenario-4-delete-confirm.md)

1. Start delete → confirmation required.
2. Cancel/dismiss → bot and profile unchanged.
3. Start delete again → confirm → bot gone from sidebar, overview entry points, and section membership.
4. Do **not** fail Pass solely because transcripts/mailbox history remain per Host rules.

**Expected:** SC-005 Pass.

---

## Scenario 5 — Memory layers ADR (docs-only)

**Contract:** [contracts/memory-layers-adr.md](./contracts/memory-layers-adr.md)
**Recipe:** [verifier/scenario-5-memory-adr.md](./verifier/scenario-5-memory-adr.md)

1. Locate ADR under `MzM-Docs/adr/` whose filename identifies agent vs user memory layers.
2. Confirm ADR distinguishes agent-scoped vs user-scoped memory and states no P2 memory product UX.
3. Spot-check shipped P2 surfaces — no profile/log/note recall product flow required.

**Expected:** SC-006 Pass.

---

## Scenario 6 — Full Phase 2 replay

**Owners:** DH Verifier
**Acceptance:** SC-007
**Recipe:** [verifier/scenario-6-full-replay.md](./verifier/scenario-6-full-replay.md) (requires foundational Pass + Scenarios 1–5 observations)

Run Scenarios 1–5 (or a single scripted path covering the same observations) on the real desktop app and record pass/fail evidence against [spec.md](./spec.md).

**Expected:** SC-007 Pass.

---

## Non-goals (must not appear in Pass criteria)

- Skills library UX (P3)
- Memory productization / recall UX (P5)
- Arbitrary image-file avatar upload
- Transcript/mailbox wipe as a Pass gate
- P1 topology/mailbox/auth re-litigation
- Grok chrome parity

See [verifier/non-goals.md](./verifier/non-goals.md).
