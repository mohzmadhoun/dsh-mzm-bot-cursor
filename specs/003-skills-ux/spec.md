# Feature Specification: Phase 3 — Skills UX

**Feature Branch**: `cursor/p3-specify-fe1d`

**Spec Directory**: `specs/003-skills-ux`

**Created**: 2026-09-27

**Status**: Draft

**Input**: User description: "Phase 3 (Skills UX) Spec Kit specify only: load/discover + authoring; thin managed pack (not every playbook). Explicit non-goals: full managed skill catalog parity; learn-from-demonstration. Exit: user can attach/run a skill on a bot; Verifier covers load + one authoring path. GUI acceptance must require desktop screenshots/recordings (standing order 11). Do not rewrite specs/001 or specs/002. Plan accepted in MzM-Docs/mzm-bot-plan.md §4 P3."

**Program refs**: `MzM-Docs/mzm-bot-plan.md` (P3) · `MzM-Docs/living-next-gate.md` · `MzM-Docs/mzm-bot-initial-plan.md` (§6 Skills as inventory context) · `.specify/memory/constitution.md` v1.0.0 · Linear epic MOH-142 / specify MOH-143 (project DeepSeek Harness - Cursor) · predecessors `specs/001-multi-model-bots` (P1 Done) · `specs/002-identity-personas` (P2 Done)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Discover and load skills (Priority: P1)

Mohammed opens the desktop app, finds available skills (thin managed pack plus any user-authored skills), and loads one so it is ready to attach or run on a bot—without hunting through developer tooling or a full Grok-sized catalog.

**Why this priority**: Plan exit requires Verifier coverage of **load**; discover/load is the prerequisite for attach/run.

**Independent Test**: On the real desktop app, open the skills discovery surface, locate at least one managed skill from the thin pack and (if present) one user skill, load a skill, and confirm it appears as available. Verifier records desktop screenshot(s) and/or a short screen recording under `verifier/evidence/` for this path.

**Acceptance Scenarios**:

1. **Given** the desktop app is running with at least one bot from P1/P2, **When** the user opens the skills discovery/library surface, **Then** at least one skill from the thin managed pack is listed with a human-readable name (and short description if the product shows one).
2. **Given** a listed managed skill, **When** the user loads that skill, **Then** the skill becomes available for attach/run on a bot and remains listed as loaded/available after leaving and returning to the surface (or after restart/reload used by Verifier).
3. **Given** the user has previously authored a skill (Story 3), **When** the user opens skills discovery, **Then** that user-authored skill appears alongside managed skills (or in a clearly labeled user group) without requiring a separate developer path.
4. **Given** Verifier is proving this story, **When** the load path completes, **Then** Pass evidence includes desktop screenshot(s) and/or a short screen recording of the real app UI under `specs/003-skills-ux/verifier/evidence/` (unit/jsdom alone is not sufficient).

---

### User Story 2 - Attach and run a skill on a bot (Priority: P1)

Mohammed attaches a loaded skill to a specific bot and runs it so that bot uses the skill in a session—proving skills are per-bot and actionable, not catalog theater.

**Why this priority**: Plan exit is explicitly “user can attach/run a skill on a bot.”

**Independent Test**: Attach one loaded skill to one bot; run that skill with that bot in a session (or trigger the product’s run action); confirm the skill is shown as attached to that bot and that run/use is observable in the desktop UI. Verifier captures desktop visual evidence.

**Acceptance Scenarios**:

1. **Given** a bot and a loaded skill exist, **When** the user attaches the skill to that bot and saves/confirms, **Then** the bot’s identity/overview (or equivalent skills-on-bot surface) shows that skill as attached.
2. **Given** a skill is attached to bot A, **When** the user views bot B (a different bot without that attachment), **Then** bot B does not show that skill as attached solely because it was attached to A.
3. **Given** a skill is attached to a bot, **When** the user runs that skill on that bot (product run action and/or a session turn that applies the attached skill), **Then** the desktop UI shows that the skill was run or is active for that bot (not merely listed in a global catalog).
4. **Given** an attach and a run completed, **When** the user restarts the app (or Verifier reloads durable state), **Then** the attachment remains; run history beyond “attachment still present” is not required for Pass.
5. **Given** Verifier is proving this story, **When** attach and run complete, **Then** Pass evidence includes desktop screenshot(s) and/or a short screen recording under `specs/003-skills-ux/verifier/evidence/` showing attach and run on the real desktop app (unit/jsdom alone is not sufficient).

---

### User Story 3 - Author a reusable skill (Priority: P1)

Mohammed creates (or edits) a reusable skill through one in-app authoring path, saves it, and later finds it in discovery so he can attach/run it like a managed skill.

**Why this priority**: Plan In includes authoring; plan exit requires Verifier coverage of **one authoring path**.

**Independent Test**: Create a new user skill with a name and instructional body via the in-app authoring surface; save; confirm it appears in discovery and can be loaded. Verifier captures desktop visual evidence of the authoring path.

**Acceptance Scenarios**:

1. **Given** the desktop app is running, **When** the user opens the skill-authoring surface and creates a new skill with a display name and instructional content, then saves, **Then** the skill is persisted and appears in skills discovery as a user-authored skill.
2. **Given** a saved user-authored skill, **When** the user edits its name or instructional content and saves again, **Then** the updated values replace the previous ones on subsequent open and in discovery.
3. **Given** a saved user-authored skill, **When** the user loads and attaches it to a bot (Stories 1–2), **Then** attach/run behave the same as for a managed skill for Pass purposes.
4. **Given** Verifier is proving this story, **When** the authoring path completes, **Then** Pass evidence includes desktop screenshot(s) and/or a short screen recording under `specs/003-skills-ux/verifier/evidence/` of the real authoring UI (unit/jsdom alone is not sufficient).

---

### User Story 4 - Thin managed pack (not full catalog) (Priority: P2)

The product ships a **thin** managed skill pack—enough to demonstrate discoverability and attach/run—without claiming or requiring full Grok managed-catalog parity (no exhaustive site-playbook inventory).

**Why this priority**: Plan In is “thin managed pack”; Out is “full managed skill catalog parity.” This story bounds scope so Verifier Pass does not demand catalog completeness.

**Independent Test**: Count or list managed skills exposed in discovery; confirm at least one managed skill exists for Stories 1–2; confirm Pass does **not** require the full inventory §6 managed list or site-playbook set.

**Acceptance Scenarios**:

1. **Given** a clean install (or Verifier environment with shipped pack), **When** the user opens skills discovery, **Then** the managed skills shown are a thin pack (at least one managed skill; not required to match the full inventory managed list).
2. **Given** inventory skills such as large site-playbook sets or learn-from-demonstration, **When** Phase 3 product acceptance is evaluated, **Then** absence of those skills from the thin pack does **not** fail Pass.

---

### Edge Cases

- What happens if no user-authored skills exist yet? Discovery still shows the thin managed pack; Story 3 remains independently testable by authoring one.
- What happens if the user attaches the same skill to multiple bots? Allowed; each attachment is per-bot; Verifier Pass requires proving at least one bot attachment.
- What happens if the user tries to detach a skill? Detach is helpful but **not** required for Phase 3 Pass; Pass measures attach + run + load + one authoring path.
- What happens if instructional content is left empty on author? Save MAY be rejected with a clear user-visible reason, or empty content MAY be allowed; Verifier Pass for authoring requires a non-empty name and non-empty instructional body in the scripted path.
- What happens if the user expects learn-from-demonstration (screen-recording → skill)? Out of scope for P3; MUST NOT be required for Pass.
- What happens if the user expects the full managed catalog (all inventory §6 skills / all site playbooks)? Out of scope; thin pack only.
- What happens if the user expects plugin/connector-provided skills? Deferred with connectors/MCP (P6); not required for P3 Pass.
- What happens if create-bot / persona / mailbox paths from P1/P2 are used? Those remain available; this feature MUST NOT rewrite `specs/001-multi-model-bots` or `specs/002-identity-personas`; P3 acceptance does not re-litigate P1/P2 exits.
- What happens if Verifier only has unit/jsdom evidence for GUI stories? **Fail** for those scenarios — desktop screenshots and/or short screen recordings are mandatory for Stories 1–3 Pass.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to discover available skills in a user-visible skills surface in the desktop app, including at least the thin managed pack and any user-authored skills.
- **FR-002**: Users MUST be able to load a discovered skill so it becomes available to attach or run on a bot; loaded availability MUST persist across app restart (or the durable reload path Verifier uses).
- **FR-003**: Users MUST be able to attach a loaded skill to a specific bot; the attachment MUST be visible on that bot’s skills/overview surface and MUST NOT automatically attach to other bots.
- **FR-004**: Users MUST be able to run an attached skill on that bot such that the desktop UI shows the skill as run or active for that bot (product run action and/or session application of the attached skill).
- **FR-005**: Skill attachments MUST persist across app restart (or Verifier durable reload).
- **FR-006**: Users MUST be able to author a new reusable skill through one in-app authoring path (display name + instructional content) and save it so it appears in discovery.
- **FR-007**: Users MUST be able to edit and re-save a user-authored skill’s name and instructional content; updates MUST replace prior values.
- **FR-008**: Phase 3 MUST ship a thin managed skill pack with at least one managed skill discoverable for Verifier Pass; Phase 3 MUST NOT require full managed catalog parity with inventory §6 or site-playbook completeness.
- **FR-009**: Phase 3 MUST NOT require learn-from-demonstration (screen-recording → skill) for acceptance.
- **FR-010**: Phase 3 MUST NOT require plugin/connector-provided skills for acceptance (deferred with P6).
- **FR-011**: DH Verifier MUST be able to re-run a documented path that covers discover/load, attach/run on a bot, and one authoring path—and record pass/fail evidence against this spec.
- **FR-012**: For every GUI acceptance scenario in this feature (Stories 1–3 and the corresponding success criteria), Verifier Pass MUST include real desktop-app visual evidence: screenshots and/or short screen recordings stored under `specs/003-skills-ux/verifier/evidence/` (and may also be mirrored under `/opt/cursor/artifacts/`). Unit tests or jsdom-only runs MUST NOT alone constitute Pass for those GUI scenarios.

### Out of Scope (explicit non-goals for this feature)

- Full managed skill catalog parity (complete inventory §6 / all site playbooks)
- Learn-from-demonstration (teach/screen-recording → skill)
- Plugin / connector / marketplace skill sources (P6)
- Memory productization / recall UX (P5)
- Routines cron or event-driven (P4/P6)
- MCP / connectors / 1Password-class vault UX (P6)
- Box / local Shell / computer-use parity (P7)
- Group channels, voice calls, send-on-behalf
- Pixel Grok chrome parity for skills UI
- Expanding or rewriting P1 mailbox/model/auth or P2 persona/sidebar/delete requirements (`specs/001-multi-model-bots`, `specs/002-identity-personas` remain authoritative for those phases)
- Detach/delete skill UX as a Pass gate (may ship; not required for P3 exit)

### Key Entities

- **Skill**: A reusable instructional playbook the user can discover, load, attach to a bot, and run; has a display name and instructional content.
- **Managed skill**: Platform-shipped skill in the thin managed pack; not user-authored.
- **User-authored skill**: Skill created or edited by the user via the in-app authoring path.
- **Thin managed pack**: Small curated set of managed skills (at least one) shipped for P3; explicitly not full catalog parity.
- **Skill attachment**: Association of one skill to one bot; durable; visible on that bot’s skills/overview surface.
- **Skill run**: User-visible application or execution of an attached skill on a bot (run action and/or session application), observable in the desktop UI.
- **Skills discovery/library surface**: User-visible list or browse UI for managed and user skills.
- **Skill authoring surface**: User-visible create/edit UI for user-authored skills (one path required for Pass).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a Verifier-scripted desktop path, the user discovers and loads at least one managed skill from the thin pack; after restart/reload the skill remains available. Desktop screenshot(s) and/or short screen recording are filed under `verifier/evidence/`.
- **SC-002**: In a Verifier-scripted desktop path, the user attaches a loaded skill to one bot and runs it on that bot; the UI shows attachment and run/active state; attachment survives restart/reload. Desktop screenshot(s) and/or short screen recording are filed under `verifier/evidence/`.
- **SC-003**: In a Verifier-scripted desktop path, the user authors a new skill (non-empty name + instructional body), saves it, and sees it in discovery; authoring evidence includes desktop screenshot(s) and/or short screen recording under `verifier/evidence/`.
- **SC-004**: Phase 3 Pass does not require full managed catalog parity or learn-from-demonstration; Verifier non-goals checks confirm those absences are acceptable.
- **SC-005**: DH Verifier re-runs the documented Phase 3 acceptance path on the real desktop app and records pass/fail evidence against this spec, including FR-012 visual evidence for all GUI scenarios.
- **SC-006**: Attach is per-bot: Verifier observes that attaching a skill to bot A does not by itself mark the same skill attached on bot B.

## Assumptions

- Program plan `MzM-Docs/mzm-bot-plan.md` §4 P3 scope is **accepted**; P1 and P2 are Done on master (`specs/001-multi-model-bots`, `specs/002-identity-personas`).
- Constitution v1.0.0 wedge-first A→C principles bind; this feature is Phase 3 Skills UX only, not north star C and not P4–P7 scope.
- Delivery shell for acceptance remains the project desktop app; this spec states WHAT the user can do, not HOW Host/Client plugins implement skill storage or model injection.
- Inventory `MzM-Docs/mzm-bot-initial-plan.md` §6 informs vocabulary (managed / user / plugin sources; skill-authoring vs learn-from-demonstration) but does **not** require shipping the full managed list in P3.
- “Thin managed pack” means ≥1 shipped managed skill for Pass; exact pack membership is chosen during plan/implement with Architect and is not a specify blocker.
- “Run” means a user-visible run/active indication for an attached skill on a bot; proving specific LLM reply wording that quotes the skill text is **not** required for Pass (mirrors P2 instruction-adherence stance).
- Detach/delete of skills or attachments is optional UX, not a Pass gate.
- Plugin skills wait for P6; user + thin managed sources are sufficient for P3.
- Standing order 11 / DH Spec agent rule: GUI Verifier Pass requires real desktop screenshots and/or short screen recordings—not unit/jsdom alone.
- Linear issues for implementation are created only after Spec Kit `tasks` → `taskstoissues`, hung on project **DeepSeek Harness - Cursor** under epic MOH-142 (never DeepSeek Harness - GrokBot). PO creates/links epic children; this specify step does not invent implement tickets.
- Single primary user for Phase 3 acceptance: Mohammed (founder = customer).
- No clarify session yet — Verifier gates this specify draft before `/speckit-clarify`.

## Traceability (capability → requirement → acceptance)

| Capability | Requirements | Acceptance / Success |
|------------|--------------|----------------------|
| Discover / load | FR-001, FR-002 | US1 scenarios 1–3; SC-001 |
| Attach skill to bot | FR-003, FR-005 | US2 scenarios 1–2, 4; SC-002, SC-006 |
| Run skill on bot | FR-004 | US2 scenario 3; SC-002 |
| Author skill | FR-006, FR-007 | US3 scenarios 1–3; SC-003 |
| Thin managed pack | FR-008 | US4 scenarios 1–2; SC-004 |
| Non-goals (full catalog / learn-from-demo / plugin) | FR-009, FR-010; Out of Scope | US4; SC-004; edge cases |
| Verifier replay + desktop visual evidence | FR-011, FR-012 | US1–3 scenario evidence clauses; SC-001–SC-003, SC-005 |

**Intended follow-ons (held until Verifier Pass on specify):** `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-analyze` → `/speckit-taskstoissues` (Linear under DeepSeek Harness - Cursor / MOH-142) → implement → Verifier.
