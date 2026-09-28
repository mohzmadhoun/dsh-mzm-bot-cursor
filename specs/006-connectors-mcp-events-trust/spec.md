# Feature Specification: Phase 6 — Connectors / MCP + event routines + trust

**Feature Branch**: `cursor/p6-specify-fe1d`

**Spec Directory**: `specs/006-connectors-mcp-events-trust`

**Created**: 2026-09-28

**Status**: Draft

**Input**: User description: "Phase 6 (Connectors / MCP + event routines + trust productization) Spec Kit specify only: MCP/connectors; event-triggered routines; richer trust/permissions productization; 1Password-class credential UX if needed. Explicit Out: Box/computer parity (P7); do not rewrite specs/001–005. Exit: one connector install→auth→successful tool call; one event-triggered routine E2E; one denied-permission path; secrets absent from session dumps; SO 11+12 for GUI. Linear free-issue limit blocked — track via PR only; no invented ticket numbers; no Linear comments. Plan accepted in MzM-Docs/mzm-bot-plan.md §4 P6."

**Program refs**: `MzM-Docs/mzm-bot-plan.md` (P6) · `MzM-Docs/living-next-gate.md` (P6 kick held; Lead-owned) · `MzM-Docs/mzm-bot-initial-plan.md` (§5 event triggers; §9 Connectors/MCP; §13 Security & trust; §5 auth — 1Password/connectors wait for P6) · `.specify/memory/constitution.md` v1.0.0 · predecessors `specs/001-multi-model-bots` (P1 Done) · `specs/002-identity-personas` (P2 Done) · `specs/003-skills-ux` (P3 Done) · `specs/004-routines-cron` (P4 Done; cron only) · `specs/005-memory-productization` (P5 Done) · Linear project DeepSeek Harness - Cursor (`P-MOH-2`) — **no P6 epic/issues in this specify PR** (workspace free-issue limit)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Install, authenticate, and call a connector tool (Priority: P1)

Mohammed installs one MCP/connector from the product’s connector surface, completes authentication, and sees a successful tool call for that connector on a bot—proving connectors are real, not catalog theater.

**Why this priority**: Plan exit requires one connector path: install → auth → successful tool call.

**Independent Test**: On the real desktop app, install one connector from the available catalog (or Verifier-documented fixture connector), complete auth so the connector is ready, invoke one tool exposed by that connector, and confirm a successful tool-call outcome is user-visible. Verifier records desktop screenshot(s) and/or a short screen recording under `verifier/evidence/` and commits those files on the GUI PR branch (standing orders 11+12).

**Acceptance Scenarios**:

1. **Given** the desktop app is running with at least one bot from prior phases, **When** the user installs one connector from the product connector catalog (or the Verifier-documented Pass connector), **Then** the connector appears as installed and is not merely listed as unavailable catalog text.
2. **Given** an installed connector that needs authentication, **When** the user completes the product auth flow (in-app secure credential path and/or connector OAuth/connect card as offered), **Then** the connector reaches a ready/authenticated state without requiring the user to paste secrets into chat.
3. **Given** an authenticated connector, **When** the user (or Verifier-scripted bot turn) invokes one tool from that connector, **Then** a successful tool-call outcome is observable in the product (result or success indicator tied to that tool); proving specific LLM reply wording is NOT required.
4. **Given** Verifier is proving this story, **When** install→auth→tool-call completes, **Then** Pass evidence includes desktop screenshot(s) and/or a short screen recording of the real app UI, **committed** under `specs/006-connectors-mcp-events-trust/verifier/evidence/` and embedded in the GUI PR body (unit/jsdom alone is not sufficient).

---

### User Story 2 - Create and fire an event-triggered routine (Priority: P1)

Mohammed creates a routine whose trigger is an external **event** (not cron), and the routine fires end-to-end when that event occurs—extending P4 cron routines without rewriting them.

**Why this priority**: Plan exit requires one event-triggered routine fire E2E; P4 explicitly deferred event listeners to P6.

**Independent Test**: Create one event-triggered routine with a non-empty intent on one bot using a product-supported event trigger type chosen for Pass ([NEEDS CLARIFICATION: which single event-trigger family is required for Verifier Pass — webhook test harness, or a named live family such as Slack/GitHub/Linear/email?]); deliver one matching event (or Verifier-simulated event on the documented harness); confirm the routine fires and a last-run / fire indicator is visible. Verifier captures and commits desktop visual evidence.

**Acceptance Scenarios**:

1. **Given** the desktop app is running with at least one bot, **When** the user creates a routine with a non-empty intent and an event (non-cron) trigger of the Pass-chosen type, **Then** the routine is saved and appears in that bot’s routines pane (or equivalent) distinguishable from cron-only routines by trigger type or equivalent clear labeling.
2. **Given** an active event-triggered routine, **When** a matching event is delivered via the documented Pass path, **Then** the routine fires at least once without the user manually starting the bot turn (Host applies the intent as a bot wake/turn); proving specific LLM reply wording or external side effects beyond the fire is NOT required.
3. **Given** a fire has occurred, **When** the user views the routines pane (or linked fire/activity indication), **Then** a last-run / fire indicator tied to that routine is visible—listing the routine alone without fire evidence is insufficient for Pass.
4. **Given** the same routine is paused (P4 pause/resume remains available), **When** a matching event that would have fired occurs, **Then** no fire is recorded for that paused interval.
5. **Given** Verifier is proving this story, **When** event create + fire visibility is shown, **Then** Pass evidence includes desktop screenshot(s) and/or a short screen recording committed under `specs/006-connectors-mcp-events-trust/verifier/evidence/` and embedded in the GUI PR body.

---

### User Story 3 - Denied-permission path (Priority: P1)

Mohammed (or Verifier) exercises one trust/permissions path where a connector tool or trust-gated connector action is **denied**, and the denial is user-visible—proving richer trust productization beyond the P1 trust floor.

**Why this priority**: Plan exit requires one denied-permission path proven; trust without a deny path is theater.

**Independent Test**: With a connector available, trigger one permission/trust gate that results in an explicit deny (user denies an approval card, or a standing deny/block rule applies); confirm the tool/action does not proceed as allowed and the denial is observable. Verifier captures and commits desktop visual evidence.

**Acceptance Scenarios**:

1. **Given** a connector tool or trust-gated connector action that requires user permission (or is covered by a deny/block rule), **When** the user denies the approval (or the deny rule matches), **Then** the product does NOT treat the action as successfully permitted/executed, and a clear user-visible denial/blocked state is shown.
2. **Given** a denial occurred, **When** the user reviews the chat/activity or permission surface, **Then** the denial remains distinguishable from a successful tool call (no ambiguous “success” for the denied action).
3. **Given** Verifier is proving this story, **When** denial is shown, **Then** Pass evidence includes desktop screenshot(s) and/or a short screen recording committed under `specs/006-connectors-mcp-events-trust/verifier/evidence/` and embedded in the GUI PR body.

---

### User Story 4 - Secrets stay out of session dumps (Priority: P1)

Mohammed authenticates a connector (or stores a connector credential) and Verifier inspects session dumps / exportable session artifacts to confirm secrets are absent—honoring P1 auth lock and P6 credential UX.

**Why this priority**: Plan exit requires secrets absent from session dumps; connector auth must not regress the P1 trust floor.

**Independent Test**: After Story 1 auth (or an equivalent credential save for the Pass connector), export or dump the session log/artifacts via the Verifier-documented path; confirm connector tokens/passwords/API keys are not present in plaintext in those dumps. Desktop visual evidence is required only for the user-visible auth step; dump inspection may be log/artifact evidence (non-GUI) and still committed under `verifier/evidence/`.

**Acceptance Scenarios**:

1. **Given** a connector was authenticated with a secret or token, **When** Verifier inspects session dumps / exportable session artifacts for that session, **Then** the secret/token/password/API key material is absent from those dumps (not present as plaintext recoverable credential values).
2. **Given** the user is authenticating, **When** the product collects credentials, **Then** the user is NOT instructed to paste long-lived secrets into chat as the primary auth path.
3. **Given** Verifier is proving this story, **When** dump inspection completes, **Then** Pass evidence includes the documented dump-inspection result committed under `specs/006-connectors-mcp-events-trust/verifier/evidence/`; GUI auth steps still follow SO 11+12 when shown in the desktop UI.

---

### User Story 5 - Credential UX sufficient for connector auth (Priority: P2)

Mohammed completes connector authentication using the product’s credential UX—primary in-app secure store path, with 1Password-class (or equivalent vault) UX only if needed for the Pass connector—so P6 does not leave connector auth as env-var theater.

**Why this priority**: Plan In includes “1Password-class credential UX if needed”; P1 locked in-app as primary and deferred vault/connectors to P6.

**Independent Test**: Complete Story 1 auth via the documented credential UX; if the Pass connector cannot authenticate via in-app secure store alone, the product MUST offer a vault/connector-class credential path sufficient for that auth. Verifier captures and commits desktop visual evidence of the auth surface used.

**Acceptance Scenarios**:

1. **Given** the user authenticates the Pass connector, **When** credentials are required, **Then** the product offers a user-visible credential UX that does not rely on renderer-held secrets or chat-pasted tokens as the Pass path.
2. **Given** in-app secure store is sufficient for the Pass connector, **When** auth completes, **Then** a separate 1Password/vault product surface is NOT required for Pass.
3. **Given** in-app secure store is insufficient for the Pass connector ([NEEDS CLARIFICATION: is a 1Password-class vault UX required as a Pass gate for P6, or only when the chosen Pass connector cannot complete auth via in-app store?]), **When** auth is attempted, **Then** the product provides a vault/connector-class credential path that enables Story 1 success, or Pass selects a connector that authenticates via the locked in-app primary path.
4. **Given** Verifier is proving this story, **When** the auth surface is shown, **Then** Pass evidence includes desktop screenshot(s) and/or a short screen recording committed under `verifier/evidence/` with PR embeds when the surface is GUI.

---

### Edge Cases

- What happens if connector install fails (network, catalog miss, corrupt package)? User MUST see a clear failure reason; a failed install MUST NOT count as Pass for Story 1.
- What happens if auth is abandoned mid-flow? Connector MUST remain in a non-ready / needs-auth state; successful tool call MUST NOT be claimed.
- What happens if the user expects the full Grok connector catalog (every Linear/GitHub/Gmail/Slack/Drive/calendar connector)? Full catalog parity is **not** required for Pass; one Pass connector path is enough ([NEEDS CLARIFICATION: must Pass use a fixed named connector, or is any one connector from a thin managed catalog acceptable?]).
- What happens if the user expects Box / local Shell / computer-use from connector or routine runs? Out of scope (P7); not required for Pass.
- What happens if the user expects cron-only routine behavior from P4? Cron paths remain available and MUST NOT be rewritten; P6 adds event triggers without invalidating `specs/004-routines-cron`.
- What happens if Verifier only has unit/jsdom evidence for GUI stories? **Fail** for those scenarios — desktop screenshots and/or short screen recordings are mandatory (standing order 11), and those files MUST be committed under `verifier/evidence/` with PR embeds (standing order 12).
- What happens if create-bot / persona / skills / cron / memory paths from P1–P5 are used? Those remain available; this feature MUST NOT rewrite `specs/001-multi-model-bots`, `specs/002-identity-personas`, `specs/003-skills-ux`, `specs/004-routines-cron`, or `specs/005-memory-productization`.
- What happens if send-on-behalf, group channels, voice, or draft-first Slack/email chrome are expected? Explicitly OUT until a later named phase; not required for Pass.
- What happens if a denied permission is later retried with approval? Allowed complementary UX; Pass requires only one proven deny path.
- What happens if secrets appear only in Host secure store / OS keychain and not in session dumps? Compliant — Pass measures absence from session dumps, not absence of secure storage.
- What happens if event fire occurs only via manual “Run now” without an event? Insufficient for Pass — Story 2 requires an event-driven fire.
- What happens if Linear issues cannot be created due to workspace free-issue limit? Spec Kit artifacts and PR tracking remain valid; DO NOT invent ticket numbers; taskstoissues waits until Linear capacity exists.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to install at least one MCP/connector from a user-visible product connector surface (catalog or equivalent).
- **FR-002**: Users MUST be able to authenticate an installed connector so it reaches a ready state without pasting long-lived secrets into chat as the primary path.
- **FR-003**: Users MUST be able to complete at least one successful tool call from an authenticated connector with a user-visible success outcome (LLM reply wording not scored).
- **FR-004**: Users MUST be able to create an event-triggered (non-cron) routine with a non-empty intent for a bot; empty intent MUST be rejected with a clear user-visible reason.
- **FR-005**: An active event-triggered routine MUST fire end-to-end when a matching event is delivered via the documented Pass path, with a visible last-run / fire indicator; pause MUST suppress fire for matching events while paused.
- **FR-006**: Phase 6 MUST provide one Verifier-observable denied-permission path for a connector tool or trust-gated connector action (user deny or standing deny/block), with clear user-visible denial distinct from success.
- **FR-007**: Connector secrets, tokens, passwords, and API keys MUST be absent from session dumps / exportable session artifacts (plaintext credential values MUST NOT appear).
- **FR-008**: Credential UX for connector auth MUST keep secrets off the renderer as durable storage and MUST honor the P1 in-app primary auth lock; env/key files remain dev/CI only and MUST NOT be the product Pass path.
- **FR-009**: 1Password-class (or equivalent vault) credential UX is in scope **if needed** for connector auth that cannot complete via in-app secure store; it is NOT automatically a Pass gate when in-app auth suffices for the Pass connector (subject to clarify on FR vault requirement).
- **FR-010**: Phase 6 MUST NOT require Box / local Shell / computer-use parity (P7) for acceptance.
- **FR-011**: Phase 6 MUST NOT rewrite or expand P1–P5 requirements; `specs/001`–`005` remain authoritative for those phases. Cron routine create/list/pause/resume/fire from P4 remain available.
- **FR-012**: Phase 6 MUST NOT require full Grok connector-catalog parity, send-on-behalf, group channels, voice, or pixel Grok chrome for acceptance.
- **FR-013**: DH Verifier MUST be able to re-run a documented path covering: connector install→auth→successful tool call; one event-triggered routine E2E fire; one denied-permission path; secrets-absent dump check—and record pass/fail evidence against this spec.
- **FR-014**: For every GUI acceptance scenario in this feature (Stories 1–3, Story 5 GUI surfaces, and corresponding success criteria), Verifier Pass MUST include real desktop-app visual evidence: screenshots and/or short screen recordings (**standing order 11**). Unit tests or jsdom-only runs MUST NOT alone constitute Pass for those GUI scenarios.
- **FR-015**: GUI Pass evidence MUST be **committed** under `specs/006-connectors-mcp-events-trust/verifier/evidence/<slice>/` on the PR branch and **embedded** in the GUI PR body via HTML `<img>` / `<video controls>` tags using absolute `/opt/cursor/artifacts/…` paths (**standing order 12**). Cursor agent artifact page links alone MUST NOT satisfy Pass. Docs/absence-only and dump-inspection checks may skip GUI embeds when no GUI is shown.
- **FR-016**: Proving specific LLM reply wording beyond tool-call success / routine fire visibility is NOT required for Pass.
- **FR-017**: The Pass connector MAY be any one connector from a thin managed catalog OR a Verifier fixture connector, unless clarify locks a named connector; full multi-family catalog is NOT required.
- **FR-018**: Event-trigger Pass MUST use exactly one product-supported event-trigger family for the scripted path; shipping every inventory event type (Slack, GitHub, Origin, Teams, Linear, Sentry, PagerDuty, email, webhook, group) is NOT required for Pass.

### Out of Scope (explicit non-goals for this feature)

- Box / local Shell / computer-use parity — **P7**
- Full Grok connector catalog parity across all inventory families
- Send-on-behalf, group channels, voice calls, draft-first external messaging chrome
- Rewriting or expanding P1–P5 (`specs/001-multi-model-bots` … `specs/005-memory-productization` remain authoritative)
- Replacing P4 cron routines (event triggers are additive)
- Env/key-file auth as the product Pass path (dev/CI only)
- Inventing Linear epic/issue numbers while workspace free-issue limit blocks creation
- Spec Kit clarify / plan / tasks / implement artifacts in this specify change (held for later gates)

### Key Entities

- **Connector / MCP server**: Installable authenticated tool provider; exposes tools a bot can call after auth; has install and ready/needs-auth (or equivalent) states.
- **Connector catalog**: User-visible set of installable connectors; Phase 6 Pass needs a thin/managed set sufficient for one Pass path, not full Grok parity.
- **Connector tool call**: One invocation of a tool exposed by an authenticated connector with a success or failure outcome visible to the user/Verifier.
- **Event-triggered routine**: Saved intent/prompt + non-cron event trigger; fires when a matching event arrives; listed alongside (but distinguishable from) cron routines from P4.
- **Event trigger**: Product-supported external or harness event type that wakes a routine (inventory examples: Slack, GitHub, webhook, etc.); Pass uses one family.
- **Permission / trust gate**: User-visible approval or standing allow/deny control that can permit or deny a connector tool or trust-gated connector action.
- **Denied-permission outcome**: Explicit user-visible deny/block distinct from successful execution.
- **Credential / secret**: Token, password, API key, or equivalent used for connector auth; stored via secure product credential UX; MUST NOT appear in session dumps.
- **Session dump**: Exportable session log / artifact set Verifier inspects for plaintext secrets.
- **Credential UX**: User-visible path to supply connector credentials (in-app secure store primary; vault/1Password-class only if needed).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a Verifier-scripted desktop path, the user installs one connector, completes auth to ready, and completes one successful connector tool call; LLM wording is not scored. Desktop screenshot(s) and/or short screen recording are filed and **committed** under `verifier/evidence/` with PR embeds (standing orders 11+12).
- **SC-002**: In a Verifier-scripted desktop path, the user creates one event-triggered routine and it fires end-to-end on a matching event with a visible last-run / fire indicator; paused routines do not fire. Desktop visual evidence is committed under `verifier/evidence/` with PR embeds.
- **SC-003**: In a Verifier-scripted desktop path, one connector tool or trust-gated connector action is denied and the denial is user-visible and distinct from success. Desktop visual evidence is committed under `verifier/evidence/` with PR embeds.
- **SC-004**: After connector auth, Verifier dump inspection shows connector secrets/tokens/passwords/API keys are absent from session dumps / exportable session artifacts; evidence committed under `verifier/evidence/`.
- **SC-005**: Phase 6 Pass does not require Box/Shell (P7), full connector-catalog parity, send-on-behalf/group/voice, or rewriting P1–P5; Verifier non-goals checks confirm those absences are acceptable.
- **SC-006**: DH Verifier re-runs the documented Phase 6 acceptance path on the real desktop app and records pass/fail evidence against this spec, including FR-014/FR-015 visual evidence for all GUI scenarios.
- **SC-007**: Credential UX for the Pass connector keeps secrets off chat-paste and off renderer durable storage; 1Password-class vault is required for Pass only when clarify locks it or when in-app auth cannot complete the Pass connector.
- **SC-008**: Cron routines from P4 remain usable; Verifier does not fail Pass solely because event triggers are additive to cron.

## Assumptions

- Program plan `MzM-Docs/mzm-bot-plan.md` §4 P6 scope is **accepted**; P1–P5 are Done on master (`specs/001`–`005`).
- Constitution v1.0.0 wedge-first A→C principles bind; this feature is Phase 6 connectors/events/trust only, not north star C and not P7 scope.
- Delivery shell for acceptance remains the project desktop app; this spec states WHAT the user can do, not HOW Host/Client plugins implement MCP, event bus, or credential internals (seam detail deferred to plan/Architect).
- Inventory `MzM-Docs/mzm-bot-initial-plan.md` §5 / §9 / §13 supplies vocabulary (MCP install/auth/tool call; event trigger families; auto-review / credentials / untrusted fences) without requiring Grok-identical chrome or full family coverage.
- P1 auth primary remains **in-app** (Electron main → OS secure store / Host credential seam); env/keys = dev/CI only; 1Password/connector vault waits for P6 **if needed**.
- P1 trust floor remains in force (isolated agent scopes, Host mailbox only, sessions are not credential dumps) and P6 productizes richer trust/permissions around connectors without replacing that floor.
- **Draft default — Pass connector**: any one connector from a thin managed catalog (or Verifier fixture) is enough unless clarify locks a named connector (FR-017).
- **Draft default — Event family**: one event-trigger family is enough for Pass; full inventory matrix is not required (FR-018). Preferred default for cheapest Verifier harness is **webhook**, pending clarify.
- **Draft default — Vault UX**: not required for Pass when in-app auth completes the Pass connector; required only if Pass connector cannot authenticate that way (FR-009) — pending clarify lock.
- Standing order 11: GUI Verifier Pass requires real desktop screenshots and/or short screen recordings—not unit/jsdom alone (FR-014). Specify does **not** capture media.
- Standing order 12: those artifacts MUST be committed under `verifier/evidence/` and embedded in the GUI PR body via ManagePullRequest absolute `/opt/cursor/artifacts/…` paths (FR-015).
- Linear: workspace free-issue limit blocks new issues; this specify PR MUST NOT invent ticket numbers and MUST NOT comment on Linear. `taskstoissues` is deferred until capacity exists. Track progress via PR only.
- Single primary user for Phase 6 acceptance: Mohammed (founder = customer).
- Living gate / plan file updates are owned by DH Lead / PO on a separate branch; this specify change owns only `specs/006-connectors-mcp-events-trust/` (+ local kit feature pointer). Do not edit `MzM-Docs/mzm-bot-plan.md` or `MzM-Docs/living-next-gate.md` in this PR.

## Traceability (capability → requirement → acceptance)

| Capability | Requirements | Acceptance / Success |
|------------|--------------|----------------------|
| Connector install | FR-001 | US1; SC-001 |
| Connector auth | FR-002, FR-008, FR-009 | US1, US5; SC-001, SC-007 |
| Successful connector tool call | FR-003, FR-016 | US1; SC-001 |
| Event-triggered routine create | FR-004, FR-018 | US2; SC-002 |
| Event routine E2E fire + pause suppress | FR-005 | US2; SC-002, SC-008 |
| Denied-permission path | FR-006 | US3; SC-003 |
| Secrets absent from session dumps | FR-007 | US4; SC-004 |
| Non-goals (P7 / full catalog / P1–P5 rewrite) | FR-010, FR-011, FR-012 | SC-005; edge cases |
| Thin catalog / one event family | FR-017, FR-018 | SC-001, SC-002; Assumptions |
| Verifier replay + desktop visual (SO 11) | FR-013, FR-014 | US1–3, US5 evidence; SC-001–SC-003, SC-006 |
| Committed evidence + PR embeds (SO 12) | FR-015 | US1–3, US5 evidence; SC-001–SC-003, SC-006 |

**Intended follow-ons (after PO/Lead accept this draft):** `/speckit-clarify` (resolve NEEDS CLARIFICATION) → `/speckit-plan` → `/speckit-tasks` → `/speckit-analyze` → `/speckit-taskstoissues` **when Linear capacity exists** (project DeepSeek Harness - Cursor; never DeepSeek Harness - GrokBot) → implement → Verifier. Until Linear unblocks, track via PR only; do not invent issue ids.
