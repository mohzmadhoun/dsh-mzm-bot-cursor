# Verifier recipes — Phase 3 Skills UX

**Feature:** `specs/003-skills-ux`
**Role:** DH Verifier evidence home. Recipes are rerunnable acceptance scripts/outlines; they do not implement product features.
**Quickstart outline:** [../quickstart.md](../quickstart.md)
**Contracts:** [../contracts/](../contracts/) — start at [contracts/README.md](../contracts/README.md)
**Thin-pack pick:** [thin-pack-skill.md](./thin-pack-skill.md) (T005)
**Linear:** Epic [MOH-142](https://linear.app/momadhoun/issue/MOH-142) · T001 [MOH-148](https://linear.app/momadhoun/issue/MOH-148) · T004 [MOH-151](https://linear.app/momadhoun/issue/MOH-151) · T005 [MOH-152](https://linear.app/momadhoun/issue/MOH-152) · T014 [MOH-161](https://linear.app/momadhoun/issue/MOH-161)

## Foundational Pass gate (T014)

**Rule:** Product success criteria **SC-001…SC-007** MUST NOT be marked Done without a recorded foundational Pass (thin-pack ship + mount + attachment types/persistence + mutation stubs + projection + instruction-bind doc + no Electron skills bus). Product SC evidence stays under Scenario recipes; this section is the foundation gate only.

| Gate artifact | Location |
|---------------|----------|
| Thin-pack skill pick (T005) | [thin-pack-skill.md](./thin-pack-skill.md) |
| Host skills inventory (T002) | [host-skills-inventory.md](./host-skills-inventory.md) |
| Attachment/bind inventory (T003) | [attachment-bind-inventory.md](./attachment-bind-inventory.md) |
| Instruction-bind doc (T012) | [instruction-bind.md](./instruction-bind.md) |
| Foundational Pass checklist (T014) | this README (checklist below) |
| Non-goals absence checks (T033) | `non-goals.md` (not yet) |

### Foundational Pass checklist — recorded

**Verdict:** **Pass** (foundations only)
**Stamp:** 2026-09-27 · tip `origin/master` @ `9d43f91bb9` (includes merged [#113](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/113) T013 · [#115](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/115) T002–T012 · [#114](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/114) T001/T004/T005)
**Linear:** [MOH-161](https://linear.app/momadhoun/issue/MOH-161) · Epic [MOH-142](https://linear.app/momadhoun/issue/MOH-142)
**Scope lock:** This Pass does **not** mark SC-001…SC-007 Done. Scenario recipes (T019+) and product US1–US4 implementation (T015+) remain open. US fan-out may begin after this stamp; live instruction bind remains T021.

| # | Foundation | Task | Pass bar | Evidence | Claim |
|---|------------|------|----------|----------|-------|
| 1 | **Thin-pack ship** | T006 | Exactly one managed skill at `apps/desktop-host/managed-skills/mzm-thin-pack/SKILL.md` with frontmatter `name: mzm-thin-pack`, description including `MzM thin pack`, instructional body containing `Follow the MzM thin-pack playbook for Pass.` | **measured:** shipped path present; body greps playbook line; only one managed-skills child dir; pick locked in [thin-pack-skill.md](./thin-pack-skill.md); merge [#115](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/115) | Pass |
| 2 | **Mount** | T007 | Desktop Host mounts managed + Host-durable user skills roots via `dsh-skill-filesystem` so `ctx.skills` lists `mzm-thin-pack` | **measured:** `apps/desktop-host/src/managed-skills.ts` + Host `index.ts` plugin; `apps/desktop-host/tests/managed-skills.spec.ts` asserts list/get + greppable body (`pnpm exec vitest run apps/desktop-host/tests/managed-skills.spec.ts`) | Pass |
| 3 | **Attachment types + persistence** | T008–T009 | Host Bot `skillAttachments` ordered `{ botId, skillId }[]`; Host-durable via Team roster / journal so restart/reload retains attachments | **measured:** `packages/experimental/agent-team/src/types.ts` exports `SkillAttachment`; snapshot/view/roster carry `skillAttachments`; journal/persisted path documents identity mutations including skills; merge [#115](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/115) | Pass |
| 4 | **Mutation stubs / Remotes** | T010 | Host attach + user-skill upsert with non-empty `displayName` / `instructionalBody` validation; Electron Main invents no skill/attachment records | **measured:** `@Remote('attachSkill')` + `@Remote('upsertUserSkill')` on `TeamService`; `team.spec.ts` `persists attachSkill…` retains attachments + rejects empty author fields | Pass |
| 5 | **Projection** | T011 | Project skill catalog summaries + per-bot `skillAttachments` to Client-readable Team view without Electron IPC synthesis | **measured:** `remoteView` returns `skills` via `listSkillCatalog` (`bundled`/`mzm-thin-pack` → `managed`); member views carry `skillAttachments`; same focused team.spec case | Pass |
| 6 | **Instruction-bind doc** | T012 | Normative Host bind approach for attached skill instructional bodies; Verifier observes wiring only (clarify lock 5; SC-007) | **measured:** [instruction-bind.md](./instruction-bind.md) present (Candidate B primary; empty/missing bodies contribute no prose; SC-007 wiring-only bar). **inferred:** T021 still owns runtime bind implementation | Pass (doc) |
| 7 | **No Electron skills bus** | T013 | Electron Main has no parallel skill-catalog / attachment / authoring store or bus | **measured:** `apps/desktop/tests/no-electron-skills-bus.spec.ts` — passed (`pnpm exec vitest run apps/desktop/tests/no-electron-skills-bus.spec.ts`); merge [#113](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/113); absence documented in `apps/desktop/src/ipc.ts` / `host-protocol.ts` | Pass |

**Rerun (idempotent):**

```sh
pnpm exec vitest run apps/desktop-host/tests/managed-skills.spec.ts apps/desktop/tests/no-electron-skills-bus.spec.ts
pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts -t 'persists attachSkill'
test -f apps/desktop-host/managed-skills/mzm-thin-pack/SKILL.md
test -f specs/003-skills-ux/verifier/instruction-bind.md
rg -n 'Follow the MzM thin-pack playbook for Pass\.' apps/desktop-host/managed-skills/mzm-thin-pack/SKILL.md
```

**PO / DH Lead:** Foundations hold on master tip above. Do **not** close product SC Done on this stamp. Next: US1 discover/load (T015+) + Scenario 1 recipe (T019); live instruction bind is T021.

## FR-012 / standing order 11 — desktop visual evidence (mandatory)

**Rule:** Every **GUI** acceptance scenario (US1–US3 / SC-001…SC-003 / SC-005 full replay) requires **desktop screenshot(s) and/or a short screen recording** of the real Desktop app under `specs/003-skills-ux/verifier/evidence/`. Unit/jsdom alone **fails** those scenarios. Scenario 4 (thin pack / non-goals) is docs/absence — GUI screenshot optional.

Evidence layout (placeholders land in T035):

```text
specs/003-skills-ux/verifier/evidence/
├── scenario-1/   # screenshots / recording + VERDICT.txt
├── scenario-2/
├── scenario-3/
├── non-goals/    # SC-004 measured checks
└── scenario-5/   # full replay
```

## Scenario 1–5 owners map

Mapped to [quickstart.md](../quickstart.md). Owner columns name who owns scripts/evidence for that scenario (not who implements the product feature). Owner labels are **Runtime** / **Client** / **Verifier** per T004.

| Scenario | Quickstart | Recipe path (later tasks) | Primary owners | Acceptance | FR-012 |
|----------|------------|---------------------------|----------------|------------|--------|
| **1** Discover / load managed skill | [Scenario 1](../quickstart.md) | `scenario-1-discover-load.md` (T019) · contract [discover-load.md](../contracts/discover-load.md) | **Runtime** + **Client** + **Verifier** | SC-001 | **Required** |
| **2** Attach / run on a bot | [Scenario 2](../quickstart.md) | `scenario-2-attach-run.md` (T026) · contract [attach-run.md](../contracts/attach-run.md) | **Runtime** + **Client** + **Verifier** | SC-002, SC-006, SC-007 | **Required** |
| **3** Author skill (+ reject empty) | [Scenario 3](../quickstart.md) | `scenario-3-skill-authoring.md` (T031) · contract [skill-authoring.md](../contracts/skill-authoring.md) | **Runtime** + **Client** + **Verifier** | SC-003 | **Required** |
| **4** Thin pack / non-goals | [Scenario 4](../quickstart.md) | `scenario-4-thin-pack.md` (T034) · contract [thin-managed-pack.md](../contracts/thin-managed-pack.md) · pick [thin-pack-skill.md](./thin-pack-skill.md) | **Runtime** + **Verifier** | SC-004 | Docs/absence ok |
| **5** Full Phase 3 replay | [Scenario 5](../quickstart.md) | `scenario-5-full-replay.md` (T036) · all contracts above | **Verifier** | SC-005 (+ composite of 1–3) | **Required** |

Recipe markdown files listed above are **paths reserved for later tasks** (T019, T026, T031, T034, T036). This README does not create empty stubs; links resolve once those tasks land.

## Owner roles (T004)

| Owner | Owns for Verifier evidence |
|-------|----------------------------|
| **Runtime** | Host-durable skill catalog / thin pack, attach persistence across restart/reload, instruction assembly observability (SC-007 wiring only — not LLM reply wording) |
| **Client** | Discovery / authoring / per-bot attach / run-active surfaces users hit on Desktop Web |
| **Verifier** | Rerunnable recipes, pass/fail stamps, FR-012 desktop screenshots/recordings, Scenario 5 composite replay on the real desktop app |

## Clarify locks (honor in every recipe)

1. Author save rejects empty display name or instructional body with a clear user-visible reason (FR-013).
2. Load = making a discovered skill available to attach; no separate multi-step load ritual (FR-002).
3. Multi-attach per bot allowed; Pass proves ≥1 attachment.
4. Run = dedicated run control OR session application with UI run/active; **do not** score LLM reply wording.
5. Attached skill instructional content applies as bot instructions on subsequent turns; Verifier measures UI + assembly wiring, not LLM adherence (FR-014 / SC-007).
6. FR-012 desktop visual evidence required for all GUI scenarios (US1–US3 / SC-001…003/005).

## Fan-out policy

- Foundational Pass (T014) must hold before Scenarios 1–5 evidence counts toward phase Done (checklist recorded above).
- US1–US4 Verifier recipes may expand now that shared Host skills foundations (T006–T014) hold; product SC still needs Scenario evidence.
- Scenario 5 requires Scenarios 1–3 (or equivalent observations) plus foundational Pass.
- Quickstart non-goals MUST NOT appear in Pass criteria ([quickstart.md](../quickstart.md) Scenario 4).
- Thin-pack id is locked as `mzm-thin-pack` in [thin-pack-skill.md](./thin-pack-skill.md); relocate only with an update to that file in the same change.
