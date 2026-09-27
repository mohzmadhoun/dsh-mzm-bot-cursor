# Verifier recipes — Phase 2 Identity / Personas

**Feature:** `specs/002-identity-personas`
**Role:** DH Verifier evidence home. Recipes are rerunnable acceptance scripts/outlines; they do not implement product features.
**Quickstart outline:** [../quickstart.md](../quickstart.md)
**Contracts:** [../contracts/](../contracts/)
**Linear:** Epic [MOH-88](https://linear.app/momadhoun/issue/MOH-88) · T004 [MOH-103](https://linear.app/momadhoun/issue/MOH-103)

## Foundational Pass gate (T011)

**Rule:** Product success criteria **SC-001…SC-008** MUST NOT be marked Done without a recorded foundational Pass (Host identity types + persistence + mutation stubs + projection + instruction-bind doc + no Electron identity bus). Checklist lands in this README under T011; product SC evidence stays under Scenario recipes.

| Gate artifact | Location (when present) |
|---------------|-------------------------|
| Instruction-bind doc (T009) | [instruction-bind.md](./instruction-bind.md) |
| Sidebar store pick (T012) | `sidebar-store.md` |
| Non-goals absence checks (T024 / T038 / T040) | `non-goals.md` |
| Foundational Pass checklist (T011) | this README (section added by T011) |

## Scenario 1–6 owners map

Mapped to [quickstart.md](../quickstart.md). Owner columns name who owns scripts/evidence for that scenario (not who implements the product feature). Owner labels are **Runtime** / **Client** / **Verifier** / **Docs** per T004.

| Scenario | Quickstart | Recipe path (later tasks) | Primary owners | Acceptance |
|----------|------------|---------------------------|----------------|------------|
| **1** Persona edit + persist + overview anti-jobs | [Scenario 1](../quickstart.md) | `scenario-1-persona-profile.md` (T019) · contract [persona-profile.md](../contracts/persona-profile.md) | **Runtime** + **Client** + **Verifier** | SC-001, SC-002, SC-008 |
| **2** Rename + preset avatar | [Scenario 2](../quickstart.md) | `scenario-2-rename-avatar.md` (T025) · contract [rename-avatar.md](../contracts/rename-avatar.md) | **Runtime** + **Client** + **Verifier** | SC-003 |
| **3** Sidebar section + Unassigned | [Scenario 3](../quickstart.md) | `scenario-3-sidebar-sections.md` (T035) · contract [sidebar-sections.md](../contracts/sidebar-sections.md) | **Runtime** + **Client** + **Verifier** | SC-004 |
| **4** Delete confirm / cancel / confirm | [Scenario 4](../quickstart.md) | `scenario-4-delete-confirm.md` (T030) · contract [delete-confirm.md](../contracts/delete-confirm.md) | **Runtime** + **Client** + **Verifier** | SC-005 |
| **5** Memory ADR presence (docs) | [Scenario 5](../quickstart.md) | `scenario-5-memory-adr.md` (T037) · contract [memory-layers-adr.md](../contracts/memory-layers-adr.md) | **Docs** + **Verifier** | SC-006 |
| **6** Full Phase 2 replay | [Scenario 6](../quickstart.md) | `scenario-6-full-replay.md` (T039) · all contracts above | **Verifier** | SC-007 (+ composite of 1–5) |

Recipe markdown files listed above are **paths reserved for later tasks** (T019, T025, T030, T035, T037, T039). This README does not create empty stubs; links resolve once those tasks land.

## Owner roles (T004)

| Owner | Owns for Verifier evidence |
|-------|----------------------------|
| **Runtime** | Host-durable identity mutations, persistence across restart/reload, instruction assembly observability (SC-008 wiring only — not LLM reply wording) |
| **Client** | Profile / overview / sidebar / delete-confirm surfaces users hit on Desktop Web |
| **Docs** | ADR file under `MzM-Docs/adr/` for Scenario 5 / SC-006 |
| **Verifier** | Rerunnable recipes, pass/fail stamps, Scenario 6 composite replay on the real desktop app |

## Clarify locks (honor in every recipe)

1. Saved job/voice/anti-jobs apply as bot instructions after save; Verifier does **not** gate LLM reply adherence (SC-008 wiring only).
2. Memory ADR under `MzM-Docs/adr/`; filename identifies agent vs user memory layers.
3. Avatar Pass = preset shape and/or color markers; no image-file upload for Pass.
4. Unassigned/default grouping allowed; named sections optional overlays.
5. Delete Pass = removal from sidebar/overview/section membership only; no transcript/mailbox wipe gate.

## Fan-out policy

- Foundational Pass (T011) must hold before Scenarios 1–6 evidence counts toward phase Done.
- Do not expand US1–US5 Verifier recipes until shared Host identity foundations (T005–T011) land.
- Scenario 6 requires Scenarios 1–5 (or equivalent observations) plus foundational Pass.
- Quickstart non-goals MUST NOT appear in Pass criteria ([quickstart.md](../quickstart.md#non-goals-must-not-appear-in-pass-criteria)).
