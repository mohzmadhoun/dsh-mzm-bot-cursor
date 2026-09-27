# Feature Specification: Phase 4 — Routines (cron only)

**Feature Branch**: `cursor/p4-specify-3e3a`

**Spec Directory**: `specs/004-routines-cron`

**Created**: 2026-09-27

**Status**: Draft

**Input**: User description: "Phase 4 (Routines — cron only) Spec Kit specify only: create/pause/resume + pane list; Host jobs; cron triggers only. Explicit Out: event listeners (P6); memory recall UX (P5); Box/Shell; MCP/connectors. Exit: cron routine fires and is visible in pane; pause/resume verified; desktop visual evidence for GUI paths (standing orders 11+12). Do not rewrite specs/001–003. Plan accepted in MzM-Docs/mzm-bot-plan.md §4 P4."

**Program refs**: `MzM-Docs/mzm-bot-plan.md` (P4) · `MzM-Docs/living-next-gate.md` · `MzM-Docs/mzm-bot-initial-plan.md` (§5 Routines — **cron only**; ignore event-trigger tables) · `.specify/memory/constitution.md` v1.0.0 · Linear epic [MOH-188](https://linear.app/momadhoun/issue/MOH-188/p4-routines-cron-only) / specify [MOH-189](https://linear.app/momadhoun/issue/MOH-189/p4-spec-kit-specify-routines-cron) (project DeepSeek Harness - Cursor) · predecessors `specs/001-multi-model-bots` (P1 Done) · `specs/002-identity-personas` (P2 Done) · `specs/003-skills-ux` (P3 Done)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a cron routine (Priority: P1)

Mohammed opens the desktop app, creates a new cron-triggered routine for a bot (saved intent/prompt + cron schedule), and sees it listed for that bot—without configuring Slack/GitHub/email or other event listeners.

**Why this priority**: Plan In is create + pane list; exit requires a cron routine that exists and is visible.

**Independent Test**: On the real desktop app, create one cron routine on one bot with a non-empty intent and a valid cron (or product shorthand) schedule; confirm it appears in that bot’s routines pane list. Verifier records desktop screenshot(s) and/or a short screen recording under `verifier/evidence/` and commits those files on the PR branch (standing orders 11+12).

**Acceptance Scenarios**:

1. **Given** the desktop app is running with at least one bot from P1–P3, **When** the user creates a new routine with a non-empty intent/prompt and a cron (or product-supported schedule shorthand) trigger, **Then** the routine is saved and appears in that bot’s routines pane list with a human-readable name or intent summary and an active/scheduled state.
2. **Given** the user is creating a routine, **When** the trigger choices are presented, **Then** only cron/schedule triggers are offered for Phase 4 Pass; event-listener trigger types (Slack, GitHub, email, webhook, etc.) are absent or clearly unavailable and MUST NOT be required for Pass.
3. **Given** a saved cron routine on bot A, **When** the user views bot B (a different bot without that routine), **Then** bot B’s routines pane does not list that routine solely because it was created for A.
4. **Given** Verifier is proving this story, **When** create completes, **Then** Pass evidence includes desktop screenshot(s) and/or a short screen recording of the real app UI, **committed** under `specs/004-routines-cron/verifier/evidence/` and embedded in the GUI PR body (unit/jsdom alone is not sufficient).

---

### User Story 2 - Routines pane list (Priority: P1)

Mohammed opens a bot’s info/routines pane and sees that bot’s cron routines listed with enough state to manage them (at least identity + active vs paused).

**Why this priority**: Plan In explicitly requires pane list; exit requires the fired routine is visible in the pane.

**Independent Test**: With at least one cron routine present, open the routines pane for that bot; confirm the routine is listed with distinguishable identity and schedule/status. Verifier captures and commits desktop visual evidence.

**Acceptance Scenarios**:

1. **Given** at least one cron routine exists for a bot, **When** the user opens that bot’s routines pane (or equivalent info-pane routines section), **Then** each of that bot’s routines is listed with a human-readable identity and a visible active/paused (or equivalent) status.
2. **Given** the routines pane is open, **When** the user leaves and returns (or Verifier reloads durable state), **Then** the same routines remain listed without re-creating them.
3. **Given** Verifier is proving this story, **When** the pane list is shown, **Then** Pass evidence includes desktop screenshot(s) and/or a short screen recording committed under `specs/004-routines-cron/verifier/evidence/` and embedded in the GUI PR body.

---

### User Story 3 - Pause and resume a cron routine (Priority: P1)

Mohammed pauses a running/scheduled cron routine so it stops firing, then resumes it so it can fire again—proving lifecycle control without deleting the routine.

**Why this priority**: Plan In and exit explicitly require pause/resume verified.

**Independent Test**: Pause one listed cron routine; confirm pane shows paused and the routine does not fire while paused; resume; confirm pane shows active/scheduled again. Verifier captures and commits desktop visual evidence for pause and resume.

**Acceptance Scenarios**:

1. **Given** an active cron routine listed in the pane, **When** the user pauses it, **Then** the pane shows paused (or equivalent) status and the routine MUST NOT fire on subsequent cron matches while paused.
2. **Given** a paused cron routine, **When** the user resumes it, **Then** the pane shows active/scheduled status again and the routine is eligible to fire on subsequent cron matches.
3. **Given** pause then resume completed, **When** the user restarts the app (or Verifier reloads durable state), **Then** the last pause/resume state is preserved.
4. **Given** Verifier is proving this story, **When** pause and resume complete, **Then** Pass evidence includes desktop screenshot(s) and/or a short screen recording committed under `specs/004-routines-cron/verifier/evidence/` showing both states on the real desktop app, with PR-body embeds (unit/jsdom alone is not sufficient).

---

### User Story 4 - Cron routine fires (Priority: P1)

Mohammed’s active cron routine fires on schedule while the desktop product is available, and the fire is observable in the routines pane (and/or associated bot activity) so away-work is real, not catalog theater.

**Why this priority**: Plan exit is “cron routine fires and is visible in pane.”

**Independent Test**: Create (or use) an active cron routine with a Verifier-friendly short schedule; wait for at least one fire within the scripted observation window; confirm the pane (or clearly linked bot activity) shows that the routine fired. Verifier captures and commits desktop visual evidence of post-fire visibility.

**Acceptance Scenarios**:

1. **Given** an active cron routine with a schedule that fires within the Verifier observation window, **When** the scheduled time arrives, **Then** the routine fires at least once without the user manually triggering it.
2. **Given** a fire has occurred, **When** the user views the routines pane (or the product’s linked fire/activity indication for that routine), **Then** the fire is visible as having occurred (e.g. last-run / run indicator / activity entry tied to that routine)—listing the routine alone without fire evidence is insufficient for Pass.
3. **Given** the same routine is paused, **When** a cron match that would have fired occurs, **Then** no fire is recorded for that paused interval (ties to Story 3).
4. **Given** Verifier is proving this story, **When** fire visibility is shown, **Then** Pass evidence includes desktop screenshot(s) and/or a short screen recording committed under `specs/004-routines-cron/verifier/evidence/` and embedded in the GUI PR body.

---

### Edge Cases

- What happens if intent/prompt is empty on create? Save MUST be rejected with a clear user-visible reason; incomplete routines MUST NOT appear as saved listed routines.
- What happens if the cron/schedule expression is invalid or unsupported? Save MUST be rejected with a clear user-visible reason.
- What happens if the user expects Slack/GitHub/email/webhook/Linear/etc. event triggers? Out of scope for P4 (P6); MUST NOT be required for Pass; absence does not fail Pass.
- What happens if the user expects memory recall UX while configuring routines? Out of scope (P5); not required for Pass.
- What happens if the user expects Box/Shell or computer-use from a routine run? Out of scope (P7); Pass measures schedule fire + pane visibility, not box tool execution.
- What happens if the user expects MCP/connectors from a routine? Out of scope (P6); not required for Pass.
- What happens if create/change shows a confirm step? Allowed; Pass measures successful create + list, not confirm-card chrome parity.
- What happens if delete routine UX exists? Helpful but **not** required for Phase 4 Pass; Pass measures create, list, pause/resume, and fire visibility.
- What happens if Verifier only has unit/jsdom evidence for GUI stories? **Fail** for those scenarios — desktop screenshots and/or short screen recordings are mandatory (standing order 11), and those files MUST be committed under `verifier/evidence/` with PR embeds (standing order 12).
- What happens if create-bot / persona / skills paths from P1–P3 are used? Those remain available; this feature MUST NOT rewrite `specs/001-multi-model-bots`, `specs/002-identity-personas`, or `specs/003-skills-ux`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to create a cron-triggered routine for a specific bot with a non-empty intent/prompt and a valid product-supported cron or schedule shorthand; create MUST reject empty intent or invalid/unsupported schedule with a clear user-visible reason.
- **FR-002**: Created routines MUST appear in that bot’s routines pane list (per-bot; not a global-only catalog) with human-readable identity and visible active/paused (or equivalent) status.
- **FR-003**: Users MUST be able to pause an active cron routine so it does not fire on subsequent cron matches while paused; paused status MUST be visible in the pane and MUST persist across app restart (or Verifier durable reload).
- **FR-004**: Users MUST be able to resume a paused cron routine so it becomes eligible to fire again; resumed status MUST be visible in the pane and MUST persist across app restart (or Verifier durable reload).
- **FR-005**: An active cron routine MUST fire on schedule without a manual user trigger; after fire, the routines pane (or clearly linked per-routine activity) MUST show that a fire occurred.
- **FR-006**: Phase 4 MUST support cron/schedule triggers only for Pass; event-listener trigger types (Slack, GitHub, Origin, Teams, Linear, Sentry, PagerDuty, email, webhook, listener groups, etc.) MUST NOT be required for acceptance.
- **FR-007**: Routine scheduling and execution ownership MUST remain Host-side job/schedule capability; the desktop pane MUST project that Host-owned routine state (no parallel Electron-only routines bus as the source of truth). Exact plugin seams are chosen during plan with Architect (hint: Host jobs/schedule; pane is a projection).
- **FR-008**: Phase 4 MUST NOT require memory recall UX (P5), Box/Shell/computer-use parity (P7), or MCP/connectors (P6) for acceptance.
- **FR-009**: DH Verifier MUST be able to re-run a documented path that covers create, pane list, pause/resume, and cron fire visibility—and record pass/fail evidence against this spec.
- **FR-010**: For every GUI acceptance scenario in this feature (Stories 1–4 and the corresponding success criteria), Verifier Pass MUST include real desktop-app visual evidence: screenshots and/or short screen recordings (**standing order 11**). Unit tests or jsdom-only runs MUST NOT alone constitute Pass for those GUI scenarios.
- **FR-011**: GUI Pass evidence MUST be **committed** under `specs/004-routines-cron/verifier/evidence/<slice>/` on the PR branch and **embedded** in the GUI PR body via HTML `<img>` / `<video controls>` tags using absolute `/opt/cursor/artifacts/…` paths (**standing order 12**). Cursor agent artifact page links alone MUST NOT satisfy Pass. Docs/absence-only checks (non-goals) may skip embeds.

### Out of Scope (explicit non-goals for this feature)

- Event-triggered routines / listeners (Slack, GitHub, Origin, Teams, Linear, Sentry, PagerDuty, email, webhook, groups) — **P6**
- Memory productization / recall UX — **P5**
- Box / local Shell / computer-use parity — **P7**
- MCP / connectors / 1Password-class vault UX — **P6**
- Group channels, voice calls, send-on-behalf
- Pixel Grok chrome parity for routines UI
- Auto-delete PR babysit routines / event-driven lifecycle policies (inventory event behaviors)
- Expanding or rewriting P1 mailbox/model/auth, P2 persona/sidebar/delete, or P3 skills requirements (`specs/001-multi-model-bots`, `specs/002-identity-personas`, `specs/003-skills-ux` remain authoritative for those phases)
- Delete-routine UX as a Pass gate (may ship; not required for P4 exit)

### Key Entities

- **Routine**: Saved intent/prompt plus a trigger; in Phase 4 the trigger is cron/schedule only; owned per bot; listed in that bot’s routines pane.
- **Cron / schedule trigger**: Time-based schedule (5-field cron and/or product shorthands such as `@hourly` / `@daily` / `@every …` as the product supports); timezone defaults documented under Assumptions.
- **Routines pane**: User-visible list/section on the bot info surface showing that bot’s routines and active/paused (and fire/visibility) state.
- **Pause / resume**: Lifecycle controls that disable or re-enable firing without deleting the routine; durable across restart.
- **Routine fire**: One scheduled execution of an active routine’s intent; observable in the pane or linked activity without requiring Box/MCP outcomes for Pass.
- **Host-owned routine state**: Authoritative scheduled-job state maintained by the Host; the desktop pane projects it (seam detail deferred to plan/Architect).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a Verifier-scripted desktop path, the user creates at least one cron routine on one bot; it appears in that bot’s routines pane; create with empty intent or invalid schedule is rejected with a clear reason. Desktop screenshot(s) and/or short screen recording are filed and **committed** under `verifier/evidence/` with PR embeds (standing orders 11+12).
- **SC-002**: In a Verifier-scripted desktop path, the user pauses then resumes a cron routine; pane status updates accordingly; paused intervals do not fire; state survives restart/reload. Desktop visual evidence is committed under `verifier/evidence/` with PR embeds.
- **SC-003**: In a Verifier-scripted desktop path, an active cron routine fires at least once within the observation window without a manual trigger, and the pane (or linked activity) shows the fire. Desktop visual evidence is committed under `verifier/evidence/` with PR embeds.
- **SC-004**: Phase 4 Pass does not require event listeners, memory recall UX, Box/Shell, or MCP/connectors; Verifier non-goals checks confirm those absences are acceptable.
- **SC-005**: DH Verifier re-runs the documented Phase 4 acceptance path on the real desktop app and records pass/fail evidence against this spec, including FR-010/FR-011 visual evidence for all GUI scenarios.
- **SC-006**: Routines are per-bot: Verifier observes that creating a routine on bot A does not by itself list that routine on bot B’s pane.

## Assumptions

- Program plan `MzM-Docs/mzm-bot-plan.md` §4 P4 scope is **accepted**; P1–P3 are Done on master (`specs/001-multi-model-bots`, `specs/002-identity-personas`, `specs/003-skills-ux`).
- Constitution v1.0.0 wedge-first A→C principles bind; this feature is Phase 4 cron routines only, not north star C and not P5–P7 scope.
- Delivery shell for acceptance remains the project desktop app; this spec states WHAT the user can do, not HOW Host/Client plugins implement persistence or scheduling internals.
- Inventory `MzM-Docs/mzm-bot-initial-plan.md` §5 informs vocabulary (routine = intent + trigger; cron shorthands; confirm-on-create as product guidance) but event-trigger tables and event lifecycle policies are **ignored** for this feature.
- Default schedule timezone for Pass is the user’s local/product timezone (inventory default Cairo for Mohammed); optional pinned timezone is nice-to-have, not a Pass gate.
- Verifier uses the shortest product-supported recurring schedule that can fire inside the scripted observation window (inventory guidance: `@every` minimum 5 minutes unless product allows shorter for test). Exact Verifier schedule is chosen at recipe authoring.
- “Fire visibility” means a user-visible last-run / run indicator / activity entry tied to that routine; proving specific LLM reply wording or external side effects is **not** required for Pass.
- Confirm card on create/change is optional UX; Pass does not require Grok confirm-card parity.
- Delete routine is optional UX, not a Pass gate.
- Plan-time seam hint (not a user-facing requirement rewrite): Host `dsh-jobs` / `dsh-schedule` ownership; pane projects Host state; no Electron parallel routines bus as source of truth — Architect locks at `/speckit-plan`.
- Standing order 11: GUI Verifier Pass requires real desktop screenshots and/or short screen recordings—not unit/jsdom alone (FR-010).
- Standing order 12: those artifacts MUST be committed under `verifier/evidence/` and embedded in the GUI PR body via ManagePullRequest absolute `/opt/cursor/artifacts/…` paths (FR-011).
- Linear issues for implementation are created only after Spec Kit `tasks` → `taskstoissues`, hung on project **DeepSeek Harness - Cursor** under epic MOH-188 (never DeepSeek Harness - GrokBot). This specify step does not invent implement tickets.
- Single primary user for Phase 4 acceptance: Mohammed (founder = customer).

## Traceability (capability → requirement → acceptance)

| Capability | Requirements | Acceptance / Success |
|------------|--------------|----------------------|
| Create cron routine | FR-001, FR-006 | US1 scenarios 1–3; SC-001, SC-006 |
| Pane list | FR-002 | US2 scenarios 1–2; SC-001 |
| Pause / resume | FR-003, FR-004 | US3 scenarios 1–3; SC-002 |
| Cron fire + visibility | FR-005 | US4 scenarios 1–3; SC-003 |
| Host-owned schedule; pane projection | FR-007 | Assumptions / plan hint; US2 |
| Non-goals (events / memory / box / MCP) | FR-006, FR-008; Out of Scope | US1 scenario 2; SC-004; edge cases |
| Verifier replay + desktop visual (SO 11) | FR-009, FR-010 | US1–4 evidence clauses; SC-001–SC-003, SC-005 |
| Committed evidence + PR embeds (SO 12) | FR-011 | US1–4 evidence clauses; SC-001–SC-003, SC-005 |

**Intended follow-ons (held until Verifier Pass on specify):** `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-analyze` → `/speckit-taskstoissues` (Linear under DeepSeek Harness - Cursor / MOH-188) → implement → Verifier. PO marks Linear Done only after Verifier Pass.
