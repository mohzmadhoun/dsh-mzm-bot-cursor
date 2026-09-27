# Feature Specification: Phase 2 — Identity / Personas

**Feature Branch**: `cursor/p2-clarify-92fa`

**Spec Directory**: `specs/002-identity-personas`

**Created**: 2026-09-27

**Status**: Clarified

**Input**: User description: "Phase 2 (Identity / personas) Spec Kit specify only: job/voice/anti-jobs; rename/avatar; sidebar sections; delete-confirm; ADR only for agent vs user memory layers (no memory UX). Explicit non-goals: memory productization (P5); skills library (P3). Exit: user can create/rename/delete (with confirm) bots and edit job, voice, anti-jobs, avatar, sidebar section; anti-jobs persist on the profile and appear in bot overview; Verifier re-runs that path. Plan accepted in MzM-Docs/mzm-bot-plan.md §4 P2."

**Program refs**: `MzM-Docs/mzm-bot-plan.md` (P2) · `MzM-Docs/mzm-bot-initial-plan.md` (§2 Agents & identity; §4 Memory layers as ADR context only) · `.specify/memory/constitution.md` v1.0.0 · Linear epic MOH-88 / clarify MOH-92 (project DeepSeek Harness - Cursor) · predecessor feature `specs/001-multi-model-bots` (P1 Done on master)

## Clarifications

### Session 2026-09-27

- Q: Must saved job, voice, and anti-jobs be applied as bot instructions on subsequent turns, or only stored for UI/profile display? → A: Applied as bot instructions for subsequent turns after save; Verifier Pass still measures durable profile + overview visibility, not LLM reply adherence.
- Q: Where must the agent-vs-user memory ADR live so SC-006 / Verifier can locate it? → A: Under `MzM-Docs/adr/` (program ADR tree); filename must identify agent vs user memory layers.
- Q: What avatar capability is required for P2 Pass? → A: Preset visual markers (shape and/or color) sufficient to distinguish bots; arbitrary image-file upload is not required for Pass.
- Q: Must every bot sit in a user-named sidebar section, or may bots remain in an Unassigned/default grouping? → A: Unassigned/default grouping allowed; named sections are optional overlays matching inventory §2.
- Q: After confirmed delete, must P2 also wipe that bot’s chat transcripts and mailbox history for Pass? → A: No — Pass requires removal from sidebar, overview, and section membership only; transcript/mailbox cleanup follows Host/session rules and is not a separate P2 Pass gate.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Edit bot persona (job, voice, anti-jobs) (Priority: P1)

Mohammed opens an existing bot’s identity/profile surface, sets its one job, voice, and explicit anti-jobs, saves, and later sees those fields again—including anti-jobs on the bot overview—without re-entering them.

**Why this priority**: Job / voice / anti-jobs are the core P2 persona culture (“one job, explicit anti-jobs”). Without durable anti-jobs visible on overview, the phase exit fails.

**Independent Test**: Create or select one bot; set job, voice, and at least one anti-job; confirm they persist after leaving and returning to the profile; confirm anti-jobs appear on the bot overview; confirm saved fields are wired as bot instructions for subsequent turns (without requiring LLM reply-adherence proof). Verifier can re-run the documented path.

**Acceptance Scenarios**:

1. **Given** a bot exists from the P1 create path (or a new create in P2), **When** the user edits that bot’s job and voice and saves, **Then** those values are retained on the bot’s profile and are shown again when the user reopens the profile.
2. **Given** a bot exists, **When** the user adds one or more anti-jobs and saves, **Then** those anti-jobs persist on the bot’s profile across app restart (or equivalent session reload used by Verifier).
3. **Given** a bot has saved anti-jobs, **When** the user opens that bot’s overview, **Then** the anti-jobs are visible there without opening a separate advanced editor.
4. **Given** job, voice, and anti-jobs are saved, **When** the user changes any of them and saves again, **Then** the updated values replace the previous ones on both profile and overview (for anti-jobs).
5. **Given** job, voice, and/or anti-jobs are saved on a bot, **When** that bot runs a subsequent user turn, **Then** the saved fields are applied as that bot’s instructions for the turn (Verifier Pass still does not require proving specific LLM reply wording).

---

### User Story 2 - Rename and set avatar (Priority: P1)

Mohammed renames a bot and sets or changes its avatar so the sidebar and overview show the updated identity.

**Why this priority**: Rename and avatar are named P2 In items and part of the Verifier-provable exit path alongside persona fields.

**Independent Test**: Rename one bot and set a preset avatar marker; confirm the new name and avatar appear in sidebar and bot overview after save.

**Acceptance Scenarios**:

1. **Given** a bot with display name N1, **When** the user renames it to N2 and confirms/saves, **Then** sidebar and bot overview show N2 and no longer treat N1 as the current display name.
2. **Given** a bot without a user-chosen avatar (or with a prior avatar), **When** the user sets or changes the avatar to a preset visual marker (shape and/or color) and saves, **Then** the chosen avatar is shown for that bot in sidebar and overview.
3. **Given** a rename or avatar change was saved, **When** the user restarts the app (or Verifier reloads durable state), **Then** the new name and avatar remain.

---

### User Story 3 - Organize bots in sidebar sections (Priority: P2)

Mohammed groups bots into named sidebar sections so a multi-bot team is scannable without a flat undifferentiated list.

**Why this priority**: Sidebar sections are an explicit P2 In item; they support team operability once personas exist, but persona edit and rename/delete are higher for the exit path.

**Independent Test**: Create or rename at least one sidebar section; place a bot into it; confirm the bot appears under that section in the sidebar after reload.

**Acceptance Scenarios**:

1. **Given** at least one bot exists, **When** the user creates a named sidebar section, **Then** the section appears in the sidebar with that name.
2. **Given** a named section and a bot exist, **When** the user assigns the bot to that section, **Then** the bot is listed under that section in the sidebar.
3. **Given** a bot is assigned to a section, **When** the user moves the bot to another section or to the Unassigned/default grouping, **Then** the sidebar reflects the new membership after save.
4. **Given** section membership was saved, **When** the user restarts the app (or Verifier reloads durable state), **Then** section names and bot membership persist.
5. **Given** a bot has never been assigned to a named section, **When** the user views the sidebar, **Then** that bot appears under an Unassigned/default grouping (named sections remain optional).

---

### User Story 4 - Delete bot with confirmation (Priority: P1)

Mohammed permanently deletes a bot only after an explicit confirm step so accidental removal is blocked.

**Why this priority**: Delete-with-confirm is a named P2 In item and part of the phase exit (“create/rename/delete (with confirm)”).

**Independent Test**: Initiate delete on one bot, cancel once to prove non-delete; initiate again, confirm, and prove the bot is gone from sidebar and overview.

**Acceptance Scenarios**:

1. **Given** a bot exists, **When** the user starts delete, **Then** the product requires an explicit confirmation before the bot is removed.
2. **Given** a delete confirmation is showing, **When** the user cancels or dismisses without confirming, **Then** the bot remains and its profile fields are unchanged.
3. **Given** a delete confirmation is showing, **When** the user confirms delete, **Then** the bot is permanently removed from the sidebar, overview, and section membership lists.

---

### User Story 5 - Memory layers ADR only (Priority: P3)

The team records an ADR that distinguishes agent memory from user memory layers so later memory productization (P5) does not require a rewrite—without shipping any memory recall or write UX in P2.

**Why this priority**: Plan locks ADR-only for agent vs user memory; no memory product UX in this phase. Required for seam honesty toward C, not for the interactive exit path.

**Independent Test**: An ADR under `MzM-Docs/adr/` exists whose filename identifies agent vs user memory layers and that names agent-scoped vs user-scoped memory layers and states that P2 ships no memory UX; Verifier checks presence and the stated non-goal, not a recall demo.

**Acceptance Scenarios**:

1. **Given** P2 specify/plan artifacts are accepted, **When** implementers land the memory-layers decision, **Then** an ADR exists under `MzM-Docs/adr/` whose filename identifies agent vs user memory layers and that distinguishes agent memory (per bot) from user memory (shared across bots) at the product/data-model level.
2. **Given** that ADR exists, **When** a user explores the shipped P2 product surfaces, **Then** there is no memory productization UX (no profile/log/note recall product flow required for P2 Pass).

---

### Edge Cases

- What happens when job or voice is left empty? Allowed for P2; anti-jobs may also be empty, but Verifier Pass for the anti-jobs exit requires at least one anti-job set, persisted, and visible on overview in the scripted path. Empty instruction fields simply contribute no instruction text for subsequent turns.
- What happens when the user enters a duplicate bot display name? Allowed; uniqueness is not a P2 exit requirement.
- What happens when the user deletes the last bot in a sidebar section? The section may remain empty; empty-section cleanup is not required for P2 Pass.
- What happens if the user never creates a named sidebar section? Bots remain under Unassigned/default; Verifier Pass for sections still requires creating or using at least one named section and assigning a bot in the scripted path.
- What happens if the user attempts skills library, memory recall/write UX, routines, connectors, or Box/Shell? Those surfaces remain out of scope for this feature; P2 acceptance MUST NOT depend on them.
- What happens if create-bot from P1 is used without filling persona fields? Create still succeeds; persona fields are editable afterward; exit path requires that they *can* be edited and persisted, and once saved they apply as instructions on subsequent turns.
- What happens on delete confirm for a bot that still has mailbox history or chats? Permanent delete removes the bot from identity/sidebar/overview/section membership for Pass; transcript/mailbox cleanup follows Host/session ownership rules, is not a separate P2 Pass gate, and MUST NOT block the confirm/delete UX.
- What happens if the user expects arbitrary image-file avatar upload? Not required for P2 Pass; preset shape and/or color markers fulfill FR-005 / SC-003.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to create bots (P1 create path remains available) and MUST be able to edit each bot’s job, voice, and anti-jobs through a user-visible identity/profile surface.
- **FR-002**: Job, voice, and anti-jobs MUST persist on the bot’s profile across app restart (or the durable reload path Verifier uses).
- **FR-003**: Anti-jobs that are saved on a bot’s profile MUST appear on that bot’s overview without requiring a separate hidden editor for Verifier observation.
- **FR-004**: Users MUST be able to rename a bot; the new display name MUST appear in the sidebar and bot overview after save and MUST persist across restart/reload.
- **FR-005**: Users MUST be able to set or change a bot’s avatar using preset visual markers (shape and/or color) sufficient to distinguish bots; the avatar MUST appear in the sidebar and bot overview after save and MUST persist across restart/reload. Arbitrary image-file upload is NOT required for P2 acceptance.
- **FR-006**: Users MUST be able to create named sidebar sections and assign bots to those sections; bots without a named section MUST appear under an Unassigned/default grouping; section names and membership MUST persist across restart/reload.
- **FR-007**: Users MUST be able to permanently delete a bot only after an explicit confirmation step; canceling confirmation MUST leave the bot intact.
- **FR-008**: After confirmed delete, the bot MUST NOT remain listed in the sidebar, bot overview entry points, or sidebar section membership lists. Transcript/mailbox cleanup MAY follow Host/session rules and is NOT a separate P2 acceptance gate.
- **FR-009**: Phase 2 MUST include an ADR under `MzM-Docs/adr/` that distinguishes agent memory (per-bot) from user memory (shared across bots) as durable layers for later phases; the filename MUST identify agent vs user memory layers.
- **FR-010**: Phase 2 MUST NOT ship memory productization UX (no required profile/log/note authoring or recall product flow for P2 acceptance).
- **FR-011**: Phase 2 MUST NOT require a skills library product surface for acceptance (deferred to P3).
- **FR-012**: DH Verifier MUST be able to re-run a documented path that covers create (or use existing bot), rename, edit job/voice/anti-jobs, set avatar, assign sidebar section, observe anti-jobs on overview, and delete with confirm—and record pass/fail evidence against this spec.
- **FR-013**: Saved job, voice, and anti-jobs MUST be applied as that bot’s instructions on subsequent turns after save. Verifier Pass measures durable profile and overview visibility; it does NOT require proving specific LLM reply adherence to those instructions.

### Out of Scope (explicit non-goals for this feature)

- Memory productization / recall UX (profile / log / note product flows) — deferred to P5; ADR-only in P2
- Skills library UX — deferred to P3
- Full Grok chrome parity (pixel-identical layout, per-assistant notification settings beyond what rename/avatar/persona edit require)
- Arbitrary image-file avatar upload (preset shape/color markers fulfill P2 Pass)
- Speak-as-user on external accounts
- Per-agent computer preview, routines pane, channels, group members in info pane
- Routines (cron or event-driven)
- MCP / connectors
- Box / local Shell / computer-use parity
- Group channels, voice calls, send-on-behalf
- Expanding P1 mailbox, model-assignment, or auth requirements (those remain owned by `specs/001-multi-model-bots`)

### Key Entities

- **Bot**: Persistent agent identity created by the user; has display name, optional avatar, model assignment (from P1), and persona profile fields.
- **Persona profile**: Per-bot job, voice, and anti-jobs; durable with the bot; applied as bot instructions on subsequent turns after save; anti-jobs are visible on bot overview.
- **Job**: Short statement of the bot’s one primary responsibility.
- **Voice**: Guidance for how the bot should speak or present itself.
- **Anti-job**: Explicit responsibility or behavior the bot should not take on; one bot may have zero or more anti-jobs (ordered short text items).
- **Avatar**: User-visible preset visual marker (shape and/or color) for a bot in sidebar and overview; arbitrary image-file upload is out of P2 Pass scope.
- **Sidebar section**: Named grouping that contains zero or more bots in the sidebar; bots without a named section appear under Unassigned/default.
- **Bot overview**: User-visible summary surface for a bot that includes at least identity cues and anti-jobs for P2 Verifier observation.
- **Memory layer (ADR only)**: Conceptual split between agent-scoped memory and user-scoped memory; recorded under `MzM-Docs/adr/`; not a P2 interactive entity.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a Verifier-scripted path, the user creates a bot (or uses an existing one), sets job, voice, and at least one anti-job, and after restart/reload those values remain on the profile.
- **SC-002**: In that same path, anti-jobs are visible on the bot overview without copy-paste or developer tooling.
- **SC-003**: In a Verifier-scripted path, the user renames a bot and sets a preset avatar marker; after restart/reload, sidebar and overview show the new name and avatar.
- **SC-004**: In a Verifier-scripted path, the user creates or uses a named sidebar section, assigns a bot to it, and after restart/reload the bot appears under that section (Unassigned/default remains valid for unassigned bots outside that path).
- **SC-005**: In a Verifier-scripted path, delete requires confirmation; cancel preserves the bot; confirm removes it from sidebar and overview (transcript/mailbox wipe is not required for Pass).
- **SC-006**: An ADR under `MzM-Docs/adr/` distinguishing agent vs user memory layers (filename identifies the topic) is present before Phase 2 product acceptance is Done; no memory product UX is required for Pass.
- **SC-007**: DH Verifier re-runs the documented Phase 2 acceptance path on the real desktop app and records pass/fail evidence against this spec.
- **SC-008**: After persona fields are saved, the product applies them as bot instructions on subsequent turns; Verifier does not gate Pass on proving specific LLM reply wording.

## Assumptions

- Program plan `MzM-Docs/mzm-bot-plan.md` §4 P2 scope is **accepted** for this experiment; P1 wedge A is Done on master (`specs/001-multi-model-bots`).
- Constitution v1.0.0 wedge-first A→C principles bind; this feature is Phase 2 identity/personas only, not north star C and not P3/P5 scope.
- Delivery shell for acceptance remains the project desktop app; this spec states WHAT the user can do, not HOW Host/Client plugins implement persistence.
- Vocabulary defaults for job, voice, and anti-jobs follow the inventory in `MzM-Docs/mzm-bot-initial-plan.md` §2 (“one job, explicit anti-jobs”) without requiring Grok-identical field labels or chrome.
- Avatar means preset shape and/or color markers sufficient to distinguish bots in sidebar/overview; arbitrary image-file upload is out of P2 Pass (locked in Clarifications 2026-09-27).
- Sidebar sections: named groups plus Unassigned/default for unassigned bots (inventory §2); collapse/expand chrome is helpful but not required for P2 Pass.
- Delete is permanent (no archive/hide requirement in P2), matching the inventory delete-with-confirm culture; Pass does not require transcript/mailbox wipe.
- Saved persona fields are applied as bot instructions on subsequent turns; Verifier Pass does not require proving LLM reply adherence (locked in Clarifications 2026-09-27).
- Memory ADR lives under `MzM-Docs/adr/` with a filename that identifies agent vs user memory layers; content is constrained to layer distinction and explicit non-delivery of memory UX in P2; profile/log/note kinds and recall UX wait for P5.
- Linear issues for implementation are created only after Spec Kit `tasks` → `taskstoissues`, hung on project **DeepSeek Harness - Cursor** (never DeepSeek Harness - GrokBot).
- Single primary user for Phase 2 acceptance: Mohammed (founder = customer).

## Traceability (capability → requirement → acceptance)

| Capability | Requirements | Acceptance / Success |
|------------|--------------|----------------------|
| Job / voice edit | FR-001, FR-002, FR-013 | US1 scenarios 1, 4–5; SC-001, SC-008 |
| Anti-jobs persist + overview | FR-002, FR-003, FR-013 | US1 scenarios 2–3, 5; SC-001, SC-002, SC-008 |
| Rename | FR-004 | US2 scenario 1, 3; SC-003 |
| Avatar (preset markers) | FR-005 | US2 scenario 2–3; SC-003 |
| Sidebar sections + Unassigned | FR-006 | US3 scenarios 1–5; SC-004 |
| Delete with confirm | FR-007, FR-008 | US4 scenarios 1–3; SC-005 |
| Memory layers ADR only | FR-009, FR-010 | US5 scenarios 1–2; SC-006 |
| Skills deferred | FR-011 | Out of Scope; edge case |
| Verifier replay | FR-012 | SC-007 |
| Explicit non-goals | Out of Scope section | Edge cases: absent P3/P5 surfaces |

**Intended follow-ons (not this command):** `/speckit-plan` → `/speckit-tasks` → `/speckit-analyze` → `/speckit-taskstoissues` (Linear under DeepSeek Harness - Cursor / MOH-88) → implement → Verifier.
