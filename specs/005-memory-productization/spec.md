# Feature Specification: Phase 5 — Memory productization

**Feature Branch**: `cursor/p5-specify-fe1d`

**Spec Directory**: `specs/005-memory-productization`

**Created**: 2026-09-28

**Status**: Draft

**Input**: User description: "Phase 5 (Memory productization) Spec Kit specify only: profile / log / note + recall UX; honor agent vs user memory layers from P2 ADR (no UX shipped then). Explicit Out: full Grok memory chrome parity beyond agreed ADR; P6 connectors/event routines; P7 Box/Shell; do not rewrite specs/001–004. Exit: write profile/log/note fact → restart app/session → recall returns it; Verifier scripted path documented; for GUI paths require standing orders 11+12 desktop screenshots/recordings committed under verifier/evidence and PR embeds (state in acceptance — do not capture media in specify). Plan accepted in MzM-Docs/mzm-bot-plan.md §4 P5."

**Program refs**: `MzM-Docs/mzm-bot-plan.md` (P5) · `MzM-Docs/mzm-bot-initial-plan.md` (§4 Memory — layers, profile/log/note kinds, recall) · `MzM-Docs/adr/agent-vs-user-memory-layers.md` (P2 Accepted; layers only) · `.specify/memory/constitution.md` v1.0.0 · Linear epic [MOH-228](https://linear.app/momadhoun/issue/MOH-228/p5-memory-productization) / specify [MOH-229](https://linear.app/momadhoun/issue/MOH-229/p5-spec-kit-specify-memory-productization) (project DeepSeek Harness - Cursor) · predecessors `specs/001-multi-model-bots` (P1 Done) · `specs/002-identity-personas` (P2 Done; ADR only for memory) · `specs/003-skills-ux` (P3 Done) · `specs/004-routines-cron` (P4 Done)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Write a profile memory fact (Priority: P1)

Mohammed records a durable **profile** fact (stable identity fact such as timezone, role, or preference) through the product’s memory write surface so it is saved as curated memory—not only as chat transcript.

**Why this priority**: Plan In names profile as a first memory kind; exit requires a written profile fact that survives restart and can be recalled.

**Independent Test**: On the real desktop app, write one non-empty profile fact; leave the write surface; confirm the fact is listed or otherwise observable as saved profile memory before restart. Verifier records desktop screenshot(s) and/or a short screen recording under `verifier/evidence/` and commits those files on the GUI PR branch (standing orders 11+12).

**Acceptance Scenarios**:

1. **Given** the desktop app is running with at least one bot from prior phases, **When** the user writes a non-empty profile fact and saves, **Then** the product stores that fact as curated profile memory (not merely as an unrecalled chat line) and shows it as saved on a user-visible memory surface.
2. **Given** a profile fact was saved, **When** the user opens the memory surface again without restarting, **Then** the same profile fact is still present without re-entry.
3. **Given** Verifier is proving this story, **When** write completes, **Then** Pass evidence includes desktop screenshot(s) and/or a short screen recording of the real app UI, **committed** under `specs/005-memory-productization/verifier/evidence/` and embedded in the GUI PR body (unit/jsdom alone is not sufficient).

---

### User Story 2 - Write a log memory fact (Priority: P1)

Mohammed records a durable **log** fact (a chronological notable event) through the product’s memory write surface so it is saved as curated memory.

**Why this priority**: Plan In names log as a required kind; exit requires a written log fact that survives restart and can be recalled.

**Independent Test**: Write one non-empty log fact; confirm it is observable as saved log memory. Verifier captures and commits desktop visual evidence.

**Acceptance Scenarios**:

1. **Given** the desktop app is running, **When** the user writes a non-empty log fact and saves, **Then** the product stores that fact as curated log memory and shows it as saved on a user-visible memory surface.
2. **Given** a log fact was saved, **When** the user returns to the memory surface without restarting, **Then** the same log fact remains present.
3. **Given** Verifier is proving this story, **When** write completes, **Then** Pass evidence includes desktop screenshot(s) and/or a short screen recording committed under `specs/005-memory-productization/verifier/evidence/` and embedded in the GUI PR body.

---

### User Story 3 - Write a note memory fact (Priority: P1)

Mohammed records a durable **note** (freeform text the product should keep) through the product’s memory write surface so it is saved as curated memory.

**Why this priority**: Plan In names note as a required kind; exit requires a written note fact that survives restart and can be recalled.

**Independent Test**: Write one non-empty note; confirm it is observable as saved note memory. Verifier captures and commits desktop visual evidence.

**Acceptance Scenarios**:

1. **Given** the desktop app is running, **When** the user writes a non-empty note and saves, **Then** the product stores that note as curated note memory and shows it as saved on a user-visible memory surface.
2. **Given** a note was saved, **When** the user returns to the memory surface without restarting, **Then** the same note remains present.
3. **Given** Verifier is proving this story, **When** write completes, **Then** Pass evidence includes desktop screenshot(s) and/or a short screen recording committed under `specs/005-memory-productization/verifier/evidence/` and embedded in the GUI PR body.

---

### User Story 4 - Recall after restart (Priority: P1)

Mohammed restarts the app (or Verifier reloads durable session state) and uses the product’s **recall** path so each previously written profile, log, and note fact is returned—proving durability and recall UX, not transcript-only memory.

**Why this priority**: Plan exit is “write → restart → recall returns it”; this is the Verifier-provable phase gate.

**Independent Test**: After Stories 1–3 facts exist, restart the desktop app (or Verifier durable reload); invoke the documented recall path; confirm each of the three written facts is returned with its kind distinguishable. Verifier captures and commits desktop visual evidence of post-restart recall.

**Acceptance Scenarios**:

1. **Given** at least one profile, one log, and one note fact were saved, **When** the user restarts the app (or Verifier reloads durable state) and opens the recall / memory surface, **Then** each of those three facts is returned without re-entering them.
2. **Given** recalled facts are shown, **When** the user inspects kinds, **Then** profile, log, and note remain distinguishable (kind label or equivalent clear grouping).
3. **Given** Verifier is proving this story, **When** post-restart recall is shown, **Then** Pass evidence includes desktop screenshot(s) and/or a short screen recording committed under `specs/005-memory-productization/verifier/evidence/` and embedded in the GUI PR body; proving specific LLM reply wording beyond the returned fact content is NOT required.

---

### User Story 5 - Honor agent vs user memory layers (Priority: P1)

Mohammed can store and recall memory that respects the P2 ADR split: **agent memory** (scoped to one bot) vs **user memory** (shared across bots)—so P5 productization does not collapse layers into one undifferentiated store.

**Why this priority**: Plan and ADR require layer honesty; without a Verifier-visible layer split, P5 would violate the accepted ADR and force a rewrite later.

**Independent Test**: Write one agent-scoped fact on bot A and one user-scoped fact; confirm bot B does not see bot A’s agent-scoped fact as its own, while the user-scoped fact remains available across bots after restart/recall. Verifier captures and commits desktop visual evidence for the layer distinction.

**Acceptance Scenarios**:

1. **Given** bots A and B exist, **When** the user saves an agent-scoped memory fact on bot A, **Then** that fact is owned by bot A’s agent memory and is NOT listed as bot B’s agent memory solely because it was saved on A.
2. **Given** a user-scoped memory fact was saved, **When** the user views memory in the context of bot A and bot B (or the shared user-memory surface), **Then** the same user-scoped fact is available in both contexts after save and after restart/recall.
3. **Given** Verifier is proving this story, **When** layer distinction is shown, **Then** Pass evidence includes desktop screenshot(s) and/or a short screen recording committed under `specs/005-memory-productization/verifier/evidence/` and embedded in the GUI PR body.
4. **Given** P5 ships, **When** implementers map stores and UX, **Then** they MUST honor `MzM-Docs/adr/agent-vs-user-memory-layers.md` without requiring a layer-model rewrite; transcript remains conversation-scoped and MUST NOT substitute for curated agent or user memory.

---

### Edge Cases

- What happens if profile, log, or note content is empty on write? Save MUST be rejected with a clear user-visible reason; empty facts MUST NOT appear as saved recalled memories.
- What happens if the user expects full Grok memory chrome (pixel-identical panels, advanced filters, bulk import/export, Grok-only organization chrome)? Out of scope beyond agreed ADR; absence does not fail Pass.
- What happens if the user expects connectors, MCP, or event-triggered routines while using memory? Out of scope (P6); not required for Pass.
- What happens if the user expects Box / Shell / computer-use from memory flows? Out of scope (P7); not required for Pass.
- What happens if write occurs only as chat text with no curated memory save? Insufficient for Pass — curated profile/log/note write + durable recall are required.
- What happens if recall dumps the entire transcript instead of curated kinds? Insufficient for Pass — recalled items MUST be curated profile/log/note facts with distinguishable kinds.
- What happens if Verifier only has unit/jsdom evidence for GUI stories? **Fail** for those scenarios — desktop screenshots and/or short screen recordings are mandatory (standing order 11), and those files MUST be committed under `verifier/evidence/` with PR embeds (standing order 12).
- What happens if create-bot / persona / skills / cron-routine paths from P1–P4 are used? Those remain available; this feature MUST NOT rewrite `specs/001-multi-model-bots`, `specs/002-identity-personas`, `specs/003-skills-ux`, or `specs/004-routines-cron`.
- What happens if bot-initiated (tool) write also exists? Allowed as complementary; Phase 5 Pass still requires a user-visible write + recall path Verifier can script on the desktop app.
- What happens if edit/delete of existing memory items exists? Helpful but **not** required for Phase 5 Pass; Pass measures write, layer split, restart durability, and recall return.
- What happens if semantic/fuzzy recall ranking differs from exact list browse? Pass requires that the written fact content is returned after restart via the documented recall path; ranking quality beyond that is not a Pass gate.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to write a non-empty **profile** memory fact through a user-visible product surface; empty profile writes MUST be rejected with a clear user-visible reason.
- **FR-002**: Users MUST be able to write a non-empty **log** memory fact through a user-visible product surface; empty log writes MUST be rejected with a clear user-visible reason.
- **FR-003**: Users MUST be able to write a non-empty **note** memory fact through a user-visible product surface; empty note writes MUST be rejected with a clear user-visible reason.
- **FR-004**: Saved profile, log, and note facts MUST persist across app restart (or the durable reload path Verifier uses).
- **FR-005**: Users MUST be able to **recall** previously saved profile, log, and note facts after restart via a documented product recall path; each recalled item MUST remain distinguishable by kind (profile vs log vs note).
- **FR-006**: Phase 5 MUST honor agent vs user memory layers per `MzM-Docs/adr/agent-vs-user-memory-layers.md`: agent-scoped memory is per bot; user-scoped memory is shared across bots; transcript MUST NOT substitute for either curated layer.
- **FR-007**: Phase 5 MUST provide a Verifier-observable demonstration that at least one agent-scoped fact stays per-bot and at least one user-scoped fact remains available across bots after save and after restart/recall.
- **FR-008**: Phase 5 MUST NOT require full Grok memory chrome parity beyond the agreed ADR for acceptance.
- **FR-009**: Phase 5 MUST NOT require connectors/MCP, event-triggered routines (P6), or Box/Shell/computer-use (P7) for acceptance.
- **FR-010**: DH Verifier MUST be able to re-run a documented path that covers write profile, write log, write note, restart/reload, recall of all three facts, and agent-vs-user layer distinction—and record pass/fail evidence against this spec.
- **FR-011**: For every GUI acceptance scenario in this feature (Stories 1–5 and the corresponding success criteria), Verifier Pass MUST include real desktop-app visual evidence: screenshots and/or short screen recordings (**standing order 11**). Unit tests or jsdom-only runs MUST NOT alone constitute Pass for those GUI scenarios.
- **FR-012**: GUI Pass evidence MUST be **committed** under `specs/005-memory-productization/verifier/evidence/<slice>/` on the PR branch and **embedded** in the GUI PR body via HTML `<img>` / `<video controls>` tags using absolute `/opt/cursor/artifacts/…` paths (**standing order 12**). Cursor agent artifact page links alone MUST NOT satisfy Pass. Docs/absence-only checks (non-goals) may skip embeds.
- **FR-013**: Edit and delete of existing memory items are optional UX and MUST NOT be required for Phase 5 Pass.
- **FR-014**: Proving specific LLM reply wording beyond returned fact content is NOT required for Pass; Pass measures durable curated write + recall return of the written content.

### Out of Scope (explicit non-goals for this feature)

- Full Grok memory chrome parity beyond agreed ADR (pixel-identical layout, advanced Grok-only memory organization chrome, bulk import/export as Pass gates)
- Connectors / MCP / event-triggered routines / rich trust productization — **P6**
- Box / local Shell / computer-use parity — **P7**
- Rewriting or expanding P1–P4 requirements (`specs/001-multi-model-bots`, `specs/002-identity-personas`, `specs/003-skills-ux`, `specs/004-routines-cron` remain authoritative for those phases)
- Group channels, voice calls, send-on-behalf
- Treating raw chat transcript as a substitute for curated profile/log/note memory
- Edit/delete memory UX as a Pass gate (may ship; not required for P5 exit)
- Semantic ranking quality beyond “written fact is returned” as a Pass gate
- Spec Kit clarify / plan / tasks / implement artifacts in this specify PR (held for later gates)

### Key Entities

- **Profile fact**: Stable curated identity fact (timezone, role, preference, or equivalent); one of three product vocabulary kinds.
- **Log fact**: Chronological notable event stored as curated memory; distinguishable from profile and note.
- **Note**: Freeform durable curated text the product should keep; distinguishable from profile and log.
- **Recall**: Product path that returns previously saved curated memory facts after restart; may be a memory surface browse and/or an explicit recall action; Verifier must observe returned fact content.
- **Agent memory**: Curated memory scoped to one bot (per ADR); not shared as that bot’s private facts to other bots.
- **User memory**: Curated memory shared across bots for the account/user (per ADR).
- **Transcript**: Per-conversation chat history; not curated memory and not a Pass substitute for profile/log/note.
- **Memory surface**: User-visible product UI where writes and/or recalled facts are shown for Verifier observation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a Verifier-scripted desktop path, the user writes at least one non-empty profile fact; it is visible as saved curated memory; empty profile write is rejected with a clear reason. Desktop screenshot(s) and/or short screen recording are filed and **committed** under `verifier/evidence/` with PR embeds (standing orders 11+12).
- **SC-002**: In a Verifier-scripted desktop path, the user writes at least one non-empty log fact; it is visible as saved curated memory; empty log write is rejected with a clear reason. Desktop visual evidence is committed under `verifier/evidence/` with PR embeds.
- **SC-003**: In a Verifier-scripted desktop path, the user writes at least one non-empty note; it is visible as saved curated memory; empty note write is rejected with a clear reason. Desktop visual evidence is committed under `verifier/evidence/` with PR embeds.
- **SC-004**: After restart (or Verifier durable reload), the documented recall path returns the same profile, log, and note facts written in SC-001–SC-003 with kinds distinguishable; LLM reply wording beyond fact content is not scored. Desktop visual evidence is committed under `verifier/evidence/` with PR embeds.
- **SC-005**: Verifier observes agent vs user layer behavior: an agent-scoped fact on bot A does not appear as bot B’s agent memory; a user-scoped fact remains available across bots after save and after restart/recall. Desktop visual evidence is committed under `verifier/evidence/` with PR embeds.
- **SC-006**: Phase 5 Pass does not require full Grok memory chrome parity beyond the ADR, connectors/MCP/event routines (P6), or Box/Shell (P7); Verifier non-goals checks confirm those absences are acceptable.
- **SC-007**: DH Verifier re-runs the documented Phase 5 acceptance path on the real desktop app and records pass/fail evidence against this spec, including FR-011/FR-012 visual evidence for all GUI scenarios.
- **SC-008**: Edit/delete memory UX is not a Pass gate; Verifier does not fail Pass solely because edit or delete UX is absent.

## Assumptions

- Program plan `MzM-Docs/mzm-bot-plan.md` §4 P5 scope is **accepted**; P1–P4 are Done on master (`specs/001`–`004`).
- Constitution v1.0.0 wedge-first A→C principles bind; this feature is Phase 5 memory productization only, not north star C and not P6–P7 scope.
- Delivery shell for acceptance remains the project desktop app; this spec states WHAT the user can do, not HOW Host/Client plugins implement persistence or recall internals (seam detail deferred to plan/Architect).
- Inventory `MzM-Docs/mzm-bot-initial-plan.md` §4 supplies vocabulary (profile / log / note; agent vs user layers; recall pulls relevant curated memory) without requiring Grok-identical chrome.
- P2 ADR `MzM-Docs/adr/agent-vs-user-memory-layers.md` remains binding for layer split; P5 ships the deferred product UX and MUST NOT rewrite the layer model.
- **Default for Pass authoring**: a user-visible write path is required for Verifier scripting; bot-initiated tool writes may also exist but are not sufficient alone for P5 Pass.
- **Default for recall Pass**: a user-visible recall/memory surface that returns the written fact content after restart is required; asking a bot to “remember” with only LLM paraphrase and no curated return is insufficient.
- **Default for kinds×layers**: profile/log/note are vocabulary kinds that MAY exist on either layer; Pass requires at least one agent-scoped and one user-scoped fact in the scripted path, plus all three kinds written and recalled (kinds and layers are orthogonal).
- Standing order 11: GUI Verifier Pass requires real desktop screenshots and/or short screen recordings—not unit/jsdom alone (FR-011). Specify does **not** capture media.
- Standing order 12: those artifacts MUST be committed under `verifier/evidence/` and embedded in the GUI PR body via ManagePullRequest absolute `/opt/cursor/artifacts/…` paths (FR-012).
- Linear issues for implementation are created only after Spec Kit `tasks` → `taskstoissues`, hung on project **DeepSeek Harness - Cursor** under epic MOH-228 (never DeepSeek Harness - GrokBot). This specify step does not invent implement tickets.
- Single primary user for Phase 5 acceptance: Mohammed (founder = customer).
- Living gate / plan file updates are owned by DH Lead / PO on a separate branch; this specify change owns only `specs/005-memory-productization/` (+ local kit feature pointer).

## Open questions (for `/speckit-clarify` — not blocking this draft)

1. Must Pass prove bot-initiated (tool) write in addition to the user-visible write path, or is user-visible write + recall enough?
2. Is recall Pass satisfied by browsing a memory surface alone, or must Verifier also prove in-turn model-visible recall of a curated fact?
3. Should any kind be layer-locked by default (e.g. profile → user memory only), or remain fully orthogonal as assumed above?

## Traceability (capability → requirement → acceptance)

| Capability | Requirements | Acceptance / Success |
|------------|--------------|----------------------|
| Write profile | FR-001, FR-004 | US1; SC-001, SC-004 |
| Write log | FR-002, FR-004 | US2; SC-002, SC-004 |
| Write note | FR-003, FR-004 | US3; SC-003, SC-004 |
| Recall after restart | FR-005, FR-014 | US4; SC-004 |
| Agent vs user layers | FR-006, FR-007 | US5; SC-005 |
| Non-goals (Grok chrome / P6 / P7) | FR-008, FR-009; Out of Scope | SC-006; edge cases |
| Edit/delete optional | FR-013 | SC-008; edge cases |
| Verifier replay + desktop visual (SO 11) | FR-010, FR-011 | US1–5 evidence clauses; SC-001–SC-005, SC-007 |
| Committed evidence + PR embeds (SO 12) | FR-012 | US1–5 evidence clauses; SC-001–SC-005, SC-007 |

**Intended follow-ons (held until Verifier Pass on specify):** `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-analyze` → `/speckit-taskstoissues` (Linear under DeepSeek Harness - Cursor / MOH-228) → implement → Verifier. PO marks Linear Done only after Verifier Pass.
