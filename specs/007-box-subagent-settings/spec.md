# Feature Specification: Phase 7 — Computer / box + subagent parity + settings chrome

**Feature Branch**: `cursor/p7-clarify-dc28`

**Spec Directory**: `specs/007-box-subagent-settings`

**Created**: 2026-09-28

**Status**: Clarified

**Input**: User description: "Phase 7 (Computer / box + subagent parity + settings chrome) Spec Kit specify only: Box/Shell backends; computerUse-class subagents; settings/chrome polish toward Grok-easy (settings rows required for those daily paths). Explicit Out: Verifier-as-a-feature; voice; draft-first send-on-behalf; group channels; user machines; learn-from-demo; billing chrome; full skill pack; pixel Grok. Exit: one local Shell/box tool path proven; one computerUse-class subagent path proven; settings rows for those paths present (chrome polish ≠ Verifier substitute). SO 11+12 for GUI. Do not rewrite specs/001–006. Linear: epic MOH-350 / specify MOH-351 on DeepSeek Harness - Cursor (P-MOH-2) only. Plan accepted in MzM-Docs/mzm-bot-plan.md §4 P7."

**Program refs**: `MzM-Docs/mzm-bot-plan.md` (P7) · `MzM-Docs/living-next-gate.md` (Lead-owned; do not edit in this PR) · `MzM-Docs/mzm-bot-initial-plan.md` (§7 Computer / box; §11 Subagents computerUse; settings anchors for computer paths) · `.specify/memory/constitution.md` v1.0.0 · predecessors `specs/001-multi-model-bots` … `specs/006-connectors-mcp-events-trust` (P1–P6 Done; do not rewrite) · Linear epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350/p7-computer-box-subagent-parity-settings-chrome) · specify [MOH-351](https://linear.app/momadhoun/issue/MOH-351/p7-spec-kit-specify-computer-box-subagent-parity-settings-chrome) · clarify [MOH-352](https://linear.app/momadhoun/issue/MOH-352/p7-spec-kit-clarify-007-box-subagent-settings) · project DeepSeek Harness - Cursor (`P-MOH-2`)

## Clarifications

### Session 2026-09-28

- Q: What product settings section and row labels MUST appear for the Shell/box and computerUse-class daily paths? → A: Global Settings → **Computer** section; rows (or clearly labeled control groups) labeled **Shell** and **Computer use** (locale-owned English dictionary strings for Verifier Pass).
- Q: Must Pass computerUse-class include a live interactive browser step, or is a screenshot-only observation enough? → A: Screenshot-only is enough — at least one user-visible screenshot (or equivalent GUI observation artifact) plus parent handoff; live interactive browser click/type is NOT required for Pass.
- Q: What readiness copy is required when the box/computer backend is still starting? → A: Any clear not-ready / starting state distinguishable from ready; exact marketing string NOT scored.
- Q: Where do those daily-path settings live — global Settings or per-agent gear alone? → A: Global Settings → **Computer** section (per-agent gear alone is NOT sufficient for Pass).
- Q: What Verifier evidence slice directory names MUST Pass use under `verifier/evidence/`? → A: `shell-box/`, `computer-use/`, `settings/`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Prove one local Shell / box tool path (Priority: P1)

Mohammed uses the desktop app so a bot runs at least one local Shell (or equivalent box shell) tool against the product’s shared box/computer backend and sees a successful, user-visible outcome—proving Box/Shell is real, not catalog theater.

**Why this priority**: Plan exit requires one local Shell/box tool path proven; without it Phase 7 fails its computer/box slice.

**Independent Test**: On the real desktop app with at least one bot from prior phases and a ready local Shell/box backend (or Verifier-documented fixture), trigger one Shell/box tool invocation (command or equivalent shell tool) that completes successfully with a user-visible success outcome tied to that tool. Verifier records desktop screenshot(s) and/or a short screen recording under `verifier/evidence/shell-box/` and commits those files on the GUI PR branch (standing orders 11+12). Proving specific LLM reply wording is NOT required.

**Acceptance Scenarios**:

1. **Given** the desktop app is running with at least one bot and a local Shell/box backend that is available or can be started via the product’s documented Pass path, **When** the user (or Verifier-scripted bot turn) invokes one Shell/box tool against that backend, **Then** a successful tool-call outcome is observable in the product (result or success indicator tied to that tool)—not merely a settings toggle or catalog label.
2. **Given** the Shell/box backend is still starting or unavailable, **When** the user attempts the Pass tool path, **Then** the product shows a clear not-ready / starting / failure state distinguishable from ready (exact marketing string NOT scored) and MUST NOT count that attempt as Pass for this story.
3. **Given** Verifier is proving this story, **When** the successful Shell/box tool path completes, **Then** Pass evidence includes desktop screenshot(s) and/or a short screen recording of the real app UI, **committed** under `specs/007-box-subagent-settings/verifier/evidence/shell-box/` and embedded in the GUI PR body (unit/jsdom alone is not sufficient).

---

### User Story 2 - Prove one computerUse-class subagent path (Priority: P1)

Mohammed delegates (or Verifier scripts) one computerUse-class subagent path that drives the box desktop/browser GUI via at least one screenshot (or equivalent GUI observation) and returns a parent-visible outcome—proving subagent parity for GUI computer work without requiring every inventory subagent or a live interactive browser step.

**Why this priority**: Plan exit requires one computerUse-class subagent path proven; Shell alone does not cover GUI computer use.

**Independent Test**: On the real desktop app, start one computerUse-class subagent (product name may be the DSH equivalent of Grok `computerUse`) against the box/computer backend such that at least one user-visible screenshot or equivalent GUI observation artifact is shown, and the parent bot/session shows a completed or clearly progressed handoff. A live interactive browser click/type step is NOT required for Pass. Verifier captures and commits desktop visual evidence under `verifier/evidence/computer-use/`. Full executor/video/CloudAgent parity is NOT required for Pass.

**Acceptance Scenarios**:

1. **Given** a ready box/computer backend and at least one parent bot, **When** the user (or Verifier-scripted path) starts one computerUse-class subagent for a GUI/desktop/browser observation task on that box, **Then** the product shows the subagent is active or has produced at least one user-visible screenshot (or equivalent GUI observation artifact)—listing a subagent type in docs alone is insufficient; live interactive browser click/type is NOT required for Pass.
2. **Given** that computerUse-class path has run, **When** the user views the parent chat/session, **Then** a handoff or result indicator tied to that subagent path is visible (specific LLM wording not scored).
3. **Given** Verifier is proving this story, **When** the computerUse-class path is shown, **Then** Pass evidence includes desktop screenshot(s) and/or a short screen recording committed under `specs/007-box-subagent-settings/verifier/evidence/computer-use/` and embedded in the GUI PR body.

---

### User Story 3 - Settings rows for Shell/box and computerUse daily paths (Priority: P1)

Mohammed opens global product Settings → **Computer** and finds the **Shell** and **Computer use** settings rows required for the daily Shell/box and computerUse-class paths—chrome polish toward Grok-easy for those paths only, not full pixel Grok settings parity.

**Why this priority**: Plan exit requires settings rows for those paths present; chrome polish is part of the exit but is NOT a substitute for Stories 1–2 Verifier paths.

**Independent Test**: Open the desktop app global Settings → **Computer** section and confirm user-visible settings rows labeled **Shell** and **Computer use** (locale-owned English dictionary strings) that govern or expose the daily paths used in Stories 1–2. Verifier captures and commits desktop visual evidence under `verifier/evidence/settings/`. Presence of settings rows alone MUST NOT satisfy Stories 1–2. Per-agent gear alone is NOT sufficient for Pass.

**Acceptance Scenarios**:

1. **Given** the desktop app is running, **When** the user opens global Settings → **Computer**, **Then** a settings row (or clearly labeled control group) labeled **Shell** for the Shell/box daily path is visible and reachable without leaving the app.
2. **Given** the same **Computer** settings section, **When** the user looks for computerUse-class daily-path controls, **Then** a settings row (or clearly labeled control group) labeled **Computer use** is visible—full Grok settings catalog / billing / voice / machine rows are NOT required.
3. **Given** settings rows are present, **When** Verifier scores Phase 7 Pass, **Then** Stories 1 and 2 MUST still pass independently; settings chrome MUST NOT substitute for proven Shell/box or computerUse tool paths.
4. **Given** Verifier is proving this story, **When** the settings rows are shown, **Then** Pass evidence includes desktop screenshot(s) and/or a short screen recording committed under `specs/007-box-subagent-settings/verifier/evidence/settings/` and embedded in the GUI PR body.

---

### Edge Cases

- What happens if the box/computer backend is still pulling an image or booting? User MUST see a clear starting / not-ready state distinguishable from ready (exact marketing string NOT scored); Pass MUST wait for a successful Shell/box tool outcome after ready (or Fail with documented not-ready evidence—not silent skip).
- What happens if only unit/jsdom evidence exists for GUI stories? **Fail** for those scenarios — desktop screenshots and/or short screen recordings are mandatory (standing order 11), and those files MUST be committed under `verifier/evidence/{shell-box|computer-use|settings}/` with PR embeds (standing order 12).
- What happens if settings rows exist but no Shell/box tool and no computerUse-class path succeed? **Fail** Phase 7 — chrome polish ≠ Verifier substitute (FR-005).
- What happens if the user expects full Grok computer chrome (Update/Reset computer two-click flows, box-doctor, every inventory surface)? Not required for Pass; simplest path that proves Stories 1–3 is enough.
- What happens if the user expects user-machine targeting (ListMachines, CopyToBox/CopyFromBox, local-execution on the user’s PC)? Explicitly OUT of Phase 7; not required for Pass.
- What happens if the user expects voice, draft-first send-on-behalf, group channels, learn-from-demo, billing chrome, full skill pack, or pixel Grok? Explicitly OUT until a later named phase; not required for Pass.
- What happens if Verifier is treated as a Phase 7 product feature to build? Out of scope — Verifier already gates every phase; this feature MUST NOT invent Verifier-as-a-feature work.
- What happens if P1–P6 paths (bots, personas, skills, cron, memory, connectors/events/trust) are used? Those remain available; this feature MUST NOT rewrite `specs/001`–`006`.
- What happens if multiple Shell backends exist (local Docker vs brokered remote box)? Pass needs **one** local Shell/box tool path; shipping every backend topology is NOT required for Pass (simplest Verifier-reachable local path preferred).
- What happens if computerUse-class is named differently on DSH than Grok `computerUse`? Pass measures the capability class (box desktop/browser GUI subagent) and the Settings row label **Computer use**; the subagent runtime product string need not equal Grok `computerUse`.
- What happens if Story 2 produces only a parent text claim with no GUI artifact? Insufficient for Pass — at least one user-visible screenshot or equivalent GUI observation artifact is required; interactive browser click/type alone without such an artifact is also insufficient.
- What happens if Settings rows appear only under per-agent gear? Insufficient for Pass — global Settings → **Computer** with **Shell** and **Computer use** rows is required (FR-016).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to complete at least one successful local Shell/box tool invocation against the product’s box/computer backend with a user-visible success outcome (LLM reply wording not scored).
- **FR-002**: The product MUST expose a box/computer backend usable for the Pass Shell/box path; if the backend is not ready, the product MUST show a clear not-ready / starting / failure state distinguishable from ready rather than silent success (exact marketing string NOT scored).
- **FR-003**: Users MUST be able to run at least one computerUse-class subagent path that produces at least one user-visible screenshot (or equivalent GUI observation artifact) plus a parent-visible handoff/result indicator; a live interactive browser click/type step is NOT required for Pass.
- **FR-004**: Phase 7 MUST provide user-visible settings rows (or clearly labeled control groups) labeled **Shell** and **Computer use** under global Settings → **Computer** for the daily Shell/box and computerUse-class paths (locale-owned English dictionary strings).
- **FR-005**: Settings/chrome polish for those paths MUST NOT substitute for FR-001 or FR-003 Verifier proofs (chrome polish ≠ Verifier substitute).
- **FR-006**: Phase 7 MUST NOT require user-machine targeting, CopyToBox/CopyFromBox to user PCs, or local-execution-on-user-machine for acceptance.
- **FR-007**: Phase 7 MUST NOT require voice, draft-first send-on-behalf, group channels, learn-from-demo, billing chrome, full skill pack, or pixel Grok chrome for acceptance.
- **FR-008**: Phase 7 MUST NOT treat “build Verifier” as a product feature; Verifier remains the acceptance gate for every phase.
- **FR-009**: Phase 7 MUST NOT rewrite or expand P1–P6 requirements; `specs/001`–`006` remain authoritative for those phases.
- **FR-010**: Full Grok computer settings parity (every Update/Reset/box-doctor/inventory row) is NOT required; only the **Shell** and **Computer use** rows under Settings → **Computer** are required for Pass.
- **FR-011**: Shipping every box backend topology (e.g. brokered remote plus local) is NOT required; one Verifier-reachable local Shell/box path is enough for Pass.
- **FR-012**: DH Verifier MUST be able to re-run a documented path covering: one local Shell/box tool success; one computerUse-class subagent path (screenshot-only minimum); settings rows for those paths—and record pass/fail evidence against this spec.
- **FR-013**: For every GUI acceptance scenario in this feature (Stories 1–3 and corresponding success criteria), Verifier Pass MUST include real desktop-app visual evidence: screenshots and/or short screen recordings (**standing order 11**). Unit tests or jsdom-only runs MUST NOT alone constitute Pass for those GUI scenarios.
- **FR-014**: GUI Pass evidence MUST be **committed** under `specs/007-box-subagent-settings/verifier/evidence/{shell-box|computer-use|settings}/` on the PR branch and **embedded** in the GUI PR body via HTML `<img>` / `<video controls>` tags using absolute `/opt/cursor/artifacts/…` paths (**standing order 12**). Cursor agent artifact page links alone MUST NOT satisfy Pass. Docs/absence-only checks may skip GUI embeds when no GUI is shown.
- **FR-015**: Proving specific LLM reply wording beyond tool success / subagent handoff visibility is NOT required for Pass.
- **FR-016**: The Pass settings surface MUST be global Settings → **Computer**; per-agent gear alone MUST NOT satisfy FR-004 / Story 3.

### Out of Scope (explicit non-goals for this feature)

- Verifier-as-a-feature (Verifier already gates every phase)
- Voice calls / voice chrome
- Draft-first send-on-behalf
- Group channels
- User machines (ListMachines, machine-targeted Shell/Read, CopyToBox/CopyFromBox to user PC, local-execution-on-user-machine)
- Learn-from-demo
- Billing chrome
- Full skill pack
- Pixel Grok / full Grok computer settings catalog parity
- Rewriting or expanding P1–P6 (`specs/001`–`006` remain authoritative)
- Spec Kit plan / tasks / implement artifacts in this clarify change (held for later gates)
- Every box backend topology beyond one Pass-reachable local Shell/box path
- Full inventory subagent set (executor / video / CloudAgent) beyond one computerUse-class path
- Live interactive browser click/type as a Pass gate (screenshot-only observation is enough)

### Key Entities

- **Box / computer backend**: Shared Linux (or equivalent) computer environment used by agents for Shell and GUI computer work; distinct from the user’s personal machine.
- **Shell / box tool**: A tool invocation that runs a command (or equivalent shell operation) on the box/computer backend and returns a success or failure outcome visible to the user/Verifier.
- **computerUse-class subagent**: A specialized worker that drives box desktop/browser GUI observation (screenshot minimum) on behalf of a parent bot; product naming may differ from Grok `computerUse` as long as the capability class matches and Settings exposes a **Computer use** row.
- **Parent handoff / result indicator**: User-visible signal in the parent chat/session that the computerUse-class path progressed or completed.
- **Settings row (daily path)**: User-visible **Shell** or **Computer use** control (or labeled control group) under global Settings → **Computer**—not full settings catalog parity and not per-agent gear alone.
- **Verifier evidence slice**: Committed screenshot/recording (and optional logs) under `verifier/evidence/{shell-box|computer-use|settings}/` proving a GUI acceptance scenario.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a Verifier-scripted desktop path, the user (or scripted bot) completes one successful local Shell/box tool invocation with a user-visible success outcome; LLM wording is not scored. Desktop screenshot(s) and/or short screen recording are filed and **committed** under `verifier/evidence/shell-box/` with PR embeds (standing orders 11+12).
- **SC-002**: In a Verifier-scripted desktop path, one computerUse-class subagent path produces at least one user-visible screenshot (or equivalent GUI observation artifact) and a parent-visible handoff/result indicator; live interactive browser click/type is NOT required. Desktop visual evidence is committed under `verifier/evidence/computer-use/` with PR embeds.
- **SC-003**: In a Verifier-scripted desktop path, global Settings → **Computer** shows rows (or clearly labeled control groups) labeled **Shell** and **Computer use**. Desktop visual evidence is committed under `verifier/evidence/settings/` with PR embeds.
- **SC-004**: Phase 7 Pass fails if only settings chrome is present without SC-001 and SC-002 (chrome polish ≠ Verifier substitute).
- **SC-005**: Phase 7 Pass does not require user machines, voice, draft-first send-on-behalf, group channels, learn-from-demo, billing chrome, full skill pack, pixel Grok, Verifier-as-a-feature, interactive-browser-as-Pass-gate, or rewriting P1–P6; Verifier non-goals checks confirm those absences are acceptable.
- **SC-006**: DH Verifier re-runs the documented Phase 7 acceptance path on the real desktop app and records pass/fail evidence against this spec, including FR-013/FR-014 visual evidence for all GUI scenarios.

## Assumptions

- Program plan `MzM-Docs/mzm-bot-plan.md` §4 P7 scope is **accepted**; P1–P6 are Done on master (`specs/001`–`006`).
- Constitution v1.0.0 wedge-first A→C principles bind; this feature is Phase 7 computer/box + computerUse-class subagent + settings rows only, not north star C and not program-Out inventory items.
- Delivery shell for acceptance remains the project desktop app; this spec states WHAT the user can do, not HOW Host/Client plugins implement box backends, Shell tools, or subagent orchestration (seam detail deferred to plan/Architect).
- Inventory `MzM-Docs/mzm-bot-initial-plan.md` §7 / §11 supplies vocabulary (shared box, Shell, computerUse, settings anchors) without requiring Grok-identical chrome or full surface coverage.
- **Locked — Pass Shell/box path**: one Verifier-reachable **local** Shell/box tool success is enough; brokered remote box topologies beyond that path are optional for Pass (FR-011).
- **Locked — computerUse-class**: capability class = box desktop/browser GUI subagent; exact runtime product string need not equal Grok `computerUse` (FR-003).
- **Locked — computerUse Pass minimum**: screenshot-only (or equivalent GUI observation) + parent handoff; live interactive browser click/type NOT required (FR-003).
- **Locked — settings labels**: global Settings → **Computer**; rows **Shell** and **Computer use** (FR-004, FR-016).
- **Locked — settings scope**: only those daily-path rows; Update/Reset/box-doctor/full catalog optional beyond Pass (FR-004, FR-010).
- **Locked — readiness copy**: clear not-ready / starting state distinguishable from ready; exact marketing string NOT scored (FR-002).
- **Locked — evidence slices**: `verifier/evidence/shell-box/`, `computer-use/`, `settings/` (FR-014).
- **Locked — user machines**: OUT for Phase 7 (FR-006).
- Standing order 11: GUI Verifier Pass requires real desktop screenshots and/or short screen recordings—not unit/jsdom alone (FR-013). Clarify does **not** capture media.
- Standing order 12: those artifacts MUST be committed under the named evidence slices and embedded in the GUI PR body via ManagePullRequest absolute `/opt/cursor/artifacts/…` paths (FR-014).
- Tracker: Linear project DeepSeek Harness - Cursor (`P-MOH-2`) only — never DeepSeek Harness - GrokBot. Epic MOH-350 / specify MOH-351 / clarify MOH-352 are the P7 tracker homes; further Linear children come from Spec Kit tasks via `taskstoissues` after tasks (constitution §II).
- Single primary user for Phase 7 acceptance: Mohammed (founder = customer).
- Living gate / plan file updates are owned by DH Lead / PO on a separate ownership line; this clarify change owns only `specs/007-box-subagent-settings/` (+ local kit feature pointer). Do not edit `MzM-Docs/mzm-bot-plan.md` or `MzM-Docs/living-next-gate.md` in this PR.

## Traceability (capability → requirement → acceptance)

| Capability | Requirements | Acceptance / Success |
|------------|--------------|----------------------|
| Local Shell/box tool path | FR-001, FR-002, FR-011, FR-015 | US1; SC-001 |
| computerUse-class subagent path (screenshot-only min) | FR-003, FR-015 | US2; SC-002 |
| Settings rows (Computer / Shell / Computer use) | FR-004, FR-005, FR-010, FR-016 | US3; SC-003, SC-004 |
| Non-goals (user machines / voice / … / P1–P6 rewrite / Verifier-as-feature / interactive-browser Pass) | FR-006, FR-007, FR-008, FR-009 | SC-005; edge cases |
| Verifier replay + desktop visual (SO 11) | FR-012, FR-013 | US1–3 evidence; SC-001–SC-003, SC-006 |
| Committed evidence + PR embeds (SO 12) | FR-014 | US1–3 evidence; SC-001–SC-003, SC-006 |

**Intended follow-ons (after PO accepts this clarify):** `/speckit-plan` → `/speckit-tasks` → `/speckit-analyze` → `/speckit-taskstoissues` on DeepSeek Harness - Cursor (never GrokBot) → implement → Verifier. This spawn stops at clarify Done.
