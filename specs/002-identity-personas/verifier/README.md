# Verifier recipes — Phase 2 Identity / Personas

**Feature:** `specs/002-identity-personas`
**Role:** DH Verifier evidence home. Recipes are rerunnable acceptance scripts/outlines; they do not implement product features.
**Quickstart outline:** [../quickstart.md](../quickstart.md)
**Contracts:** [../contracts/](../contracts/)
**Linear:** Epic [MOH-88](https://linear.app/momadhoun/issue/MOH-88) · T004 [MOH-103](https://linear.app/momadhoun/issue/MOH-103) · T011 [MOH-110](https://linear.app/momadhoun/issue/MOH-110) · T019 [MOH-118](https://linear.app/momadhoun/issue/MOH-118) · T025 [MOH-124](https://linear.app/momadhoun/issue/MOH-124) · T030 [MOH-129](https://linear.app/momadhoun/issue/MOH-129) · T035 [MOH-134](https://linear.app/momadhoun/issue/MOH-134)

## Foundational Pass gate (T011)

**Rule:** Product success criteria **SC-001…SC-008** MUST NOT be marked Done without a recorded foundational Pass (Host identity types + persistence + mutation stubs + projection + instruction-bind doc + no Electron identity bus). Product SC evidence stays under Scenario recipes; this section is the foundation gate only.

| Gate artifact | Location |
|---------------|----------|
| Instruction-bind doc (T009) | [instruction-bind.md](./instruction-bind.md) |
| Foundational Pass checklist (T011) | this README (checklist below) |
| Sidebar store pick (T012) | `sidebar-store.md` (not yet) |
| Non-goals absence checks (T024 / T038 / T040) | `non-goals.md` (not yet) |

### Foundational Pass checklist — recorded

**Verdict:** **Pass** (foundations only)
**Stamp:** 2026-09-27 · tip `origin/master` @ `f8ed2f4fff` (includes merged [#78](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/78) T009 · [#79](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/79) T010 · [#80](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/80) T005–T008)
**Linear:** [MOH-110](https://linear.app/momadhoun/issue/MOH-110) · Epic [MOH-88](https://linear.app/momadhoun/issue/MOH-88)
**Scope lock:** This Pass does **not** mark SC-001…SC-008 Done. Scenario recipes (T019+) and product implementation (T013+) remain open. US1–US5 fan-out may begin after this stamp; T012 still blocks US3 Host section store work.

| # | Foundation | Task | Pass bar | Evidence | Claim |
|---|------------|------|----------|----------|-------|
| 1 | **Types** | T005 | Optional `persona` (`job` / `voice` / `antiJobs`), optional `avatar` (`shape` and/or `color`), `sectionId` (or null/absent ⇒ Unassigned) on Host Bot identity; P1 `modelAssignment` ownership unchanged | **measured:** `packages/experimental/agent-team/src/types.ts` exports `BotPersonaProfile`, `AvatarMarker`, `SidebarSectionId`; `TeamMemberSnapshot` / `TeamMemberView` carry optional `persona` / `avatar` / `sectionId`; merge [#80](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/80) | Pass |
| 2 | **Persistence** | T006 | Extended identity fields Host-durable on Team roster / journal path so restart/reload can retain persona, avatar, displayName, section membership | **measured:** `persisted.ts` / `journal.ts` document Lead `team/member` replay; `projection-events.spec.ts` case `persists and allows post-active Host identity field updates` retains persona/avatar/sectionId across apply; `pnpm exec vitest run packages/experimental/agent-team/tests/{team,projection-events}.spec.ts` → 70 passed | Pass |
| 3 | **Mutation stubs** | T007 | Host request/result types + Remote stubs for rename, persona update, avatar set, section assign/unassign, delete; Electron Main invents no identity records | **measured:** `types.ts` defines `RenameBot*` / `UpdatePersona*` / `SetAvatar*` / `AssignSection*` / `DeleteBot*`; `index.ts` stubs throw `TEAM_NOT_IMPLEMENTED` + Remote `team-rejected`; `team.spec.ts` `exposes Host identity mutation stubs…` asserts all five Remotes reject without mutating create identity | Pass |
| 4 | **Projection** | T008 | Project displayName, avatar marker, antiJobs (via persona), section membership to Client-readable Team/roster views without Electron IPC synthesis | **measured:** `projection.ts` Zod member schema includes `persona` / `avatar` / `sectionId`; `roster.ts` `projectIdentityFields` copies those onto `TeamMemberView`; projection-events identity update case projects renamed displayName + updated persona/avatar/`sectionId: null` | Pass |
| 5 | **Instruction-bind doc** | T009 | Normative Host bind approach for saved non-empty job/voice/antiJobs via persona / system-prompt; Verifier observes wiring only (clarify lock 1; SC-008) | **measured:** [instruction-bind.md](./instruction-bind.md) present (Candidate B primary; empty fields contribute no prose; SC-008 wiring-only bar); merge [#78](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/78). **inferred:** T014 still owns runtime bind implementation | Pass (doc) |
| 6 | **No Electron identity bus** | T010 | Electron Main has no parallel identity/persona/section/delete store or bus | **measured:** `apps/desktop/tests/no-electron-identity-bus.spec.ts` — 3 passed (`pnpm exec vitest run apps/desktop/tests/no-electron-identity-bus.spec.ts`); merge [#79](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/79); forbidden identity channel names and Host mutation API identifiers absent from shell IPC sources | Pass |

**Rerun (idempotent):**

```sh
pnpm exec vitest run apps/desktop/tests/no-electron-identity-bus.spec.ts
pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts packages/experimental/agent-team/tests/projection-events.spec.ts
test -f specs/002-identity-personas/verifier/instruction-bind.md
```

**PO / DH Lead:** Foundations hold on master tip above. Do **not** close product SC Done on this stamp. Next blockers outside this checklist: T012 sidebar-store pick (before US3), then US1+ implementation + Scenario recipes.

## Scenario 1–6 owners map

Mapped to [quickstart.md](../quickstart.md). Owner columns name who owns scripts/evidence for that scenario (not who implements the product feature). Owner labels are **Runtime** / **Client** / **Verifier** / **Docs** per T004.

| Scenario | Quickstart | Recipe path (later tasks) | Primary owners | Acceptance |
|----------|------------|---------------------------|----------------|------------|
| **1** Persona edit + persist + overview anti-jobs | [Scenario 1](../quickstart.md) | [scenario-1-persona-profile.md](./scenario-1-persona-profile.md) (T019) · contract [persona-profile.md](../contracts/persona-profile.md) | **Runtime** + **Client** + **Verifier** | SC-001, SC-002, SC-008 |
| **2** Rename + preset avatar | [Scenario 2](../quickstart.md) | [scenario-2-rename-avatar.md](./scenario-2-rename-avatar.md) (T025) · contract [rename-avatar.md](../contracts/rename-avatar.md) | **Runtime** + **Client** + **Verifier** | SC-003 |
| **3** Sidebar section + Unassigned | [Scenario 3](../quickstart.md) | [scenario-3-sidebar-sections.md](./scenario-3-sidebar-sections.md) (T035) · contract [sidebar-sections.md](../contracts/sidebar-sections.md) | **Runtime** + **Client** + **Verifier** | SC-004 |
| **4** Delete confirm / cancel / confirm | [Scenario 4](../quickstart.md) | [scenario-4-delete-confirm.md](./scenario-4-delete-confirm.md) (T030) · contract [delete-confirm.md](../contracts/delete-confirm.md) | **Runtime** + **Client** + **Verifier** | SC-005 |
| **5** Memory ADR presence (docs) | [Scenario 5](../quickstart.md) | `scenario-5-memory-adr.md` (T037) · contract [memory-layers-adr.md](../contracts/memory-layers-adr.md) | **Docs** + **Verifier** | SC-006 |
| **6** Full Phase 2 replay | [Scenario 6](../quickstart.md) | `scenario-6-full-replay.md` (T039) · all contracts above | **Verifier** | SC-007 (+ composite of 1–5) |

Scenario 1, Scenario 2, Scenario 3, and Scenario 4 recipes are landed ([scenario-1-persona-profile.md](./scenario-1-persona-profile.md), [scenario-2-rename-avatar.md](./scenario-2-rename-avatar.md), [scenario-3-sidebar-sections.md](./scenario-3-sidebar-sections.md), [scenario-4-delete-confirm.md](./scenario-4-delete-confirm.md)). Remaining recipe paths (T037, T039) stay reserved until those tasks land; this README does not create empty stubs.

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
