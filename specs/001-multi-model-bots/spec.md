# Feature Specification: Phase 1 Wedge A — Multi-Model Bots

**Feature Branch**: `cursor/p1-specify-92fa`

**Spec Directory**: `specs/001-multi-model-bots`

**Created**: 2026-09-26

**Status**: Draft

**Input**: User description: "Phase 1 (wedge A) Spec Kit specify only: per-bot models, basic bot create, Host mailbox async 1:1, chat progress + final delivery, usable Electron UI, in-app auth. Explicit non-goals: Box/Shell, MCP, personas, skills UX, routines, memory productization, pixel Grok chrome. Plan accepted; auth primary = in-app."

**Program refs**: `MzM-Docs/mzm-bot-plan.md` (P1) · `docs/designs/mzbot-wedge-to-grok-like.md` · `.specify/memory/constitution.md` v1.0.0 · Linear epic MOH-37 (project DeepSeek Harness - Cursor)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create bots with different models (Priority: P1)

Mohammed opens the desktop app, stores provider credentials in-app, creates at least two bots, and assigns each bot a different model/provider. He starts a work session and completes a real task without leaving the app to use another model stack.

**Why this priority**: Per-bot multi-model is the measured wedge pain (model lock / Alt-Tab). Without it, Phase 1 fails its product goal.

**Independent Test**: On a clean machine with valid provider credentials available, create ≥2 bots with distinct models and complete one multi-model work session entirely inside the app. Verifier can re-run the documented path.

**Acceptance Scenarios**:

1. **Given** the desktop app is installed and the user has not yet stored credentials, **When** the user completes in-app credential entry for the providers they need, **Then** credentials are accepted for use by bots and are not shown as session transcript content.
2. **Given** at least two distinct model/providers are available via stored credentials, **When** the user creates bot A with model/provider X and bot B with model/provider Y (X ≠ Y), **Then** each bot retains and uses its own assigned model/provider for subsequent chats.
3. **Given** bots A and B exist with different models, **When** the user runs a real work session that needs both models, **Then** the session completes without the user opening a second product solely to reach another model.
4. **Given** a documented clean-machine setup path, **When** the user follows that path from install through first multi-model team session, **Then** time-to-first such session is under 30 minutes (recorded for Verifier).

---

### User Story 2 - Async 1:1 bot-to-bot handoff (Priority: P1)

During a session, one bot sends a message to another bot. The recipient either acts on the message or the user can see the handoff clearly—no copy-paste between apps or bots.

**Why this priority**: Basic bot-to-bot messaging is the second wedge pillar; without visible handoff or recipient action, the multi-bot team does not beat Alt-Tab orchestration.

**Independent Test**: With ≥2 bots present, trigger one async 1:1 message from bot A to bot B and confirm either B acts or the handoff is visible to the user in-app.

**Acceptance Scenarios**:

1. **Given** bots A and B exist, **When** bot A sends an async 1:1 message to bot B, **Then** the message is delivered through the Host mailbox/inbox path (not a parallel Electron-only bus) and appears as a durable handoff the user can observe.
2. **Given** bot B has received a mailbox message from bot A, **When** bot B is able to act, **Then** bot B performs a visible follow-up action attributable to that message; **Otherwise** the user still sees the pending/received handoff without needing copy-paste.
3. **Given** an in-flight 1:1 handoff, **When** the user inspects chat for the involved bots, **Then** progress updates for the handoff work are visible and a final result for the handoff path is delivered when work completes.

---

### User Story 3 - Usable desktop session UI (Priority: P2)

Mohammed can create bots, assign models, chat, see progress and final results, and observe 1:1 handoffs in one desktop window good enough for a real work session—not Grok chrome parity.

**Why this priority**: The wedge must be operable in-product; UI polish beyond operability is deferred.

**Independent Test**: Complete Stories 1–2 using only the shipped desktop UI (no developer tooling required for the happy path).

**Acceptance Scenarios**:

1. **Given** the desktop app is running, **When** the user creates a bot and assigns a model, **Then** the UI exposes those actions without requiring config-file editing for the happy path.
2. **Given** an active chat with a bot, **When** the bot is working, **Then** the user sees progress updates; **When** work finishes, **Then** the user sees a final result delivery in chat.
3. **Given** a 1:1 mailbox handoff occurred, **When** the user views the relevant chat surfaces, **Then** the handoff or recipient action is understandable without leaving the app.

---

### User Story 4 - In-app auth for providers (Priority: P2)

Mohammed enters and stores provider credentials inside the app (primary path). Secrets stay off the renderer trust surface and out of session dumps. Env/key files remain allowed for dev/CI only, not as the product primary path.

**Why this priority**: Auth was the pre-specify ship/no-ship lock; without in-app primary, Verifier cannot treat the wedge as shippable for Mohammed's daily use.

**Independent Test**: Store credentials via in-app flow; confirm a bot can use them; confirm a session export/dump review does not contain those secret values.

**Acceptance Scenarios**:

1. **Given** no credential is stored for a needed provider, **When** the user attempts to use a bot that requires it, **Then** the app directs the user to the in-app credential entry path (not to a 1Password connector product flow).
2. **Given** the user saves a credential in-app, **When** a bot later calls that provider, **Then** the call authenticates successfully using the stored credential.
3. **Given** credentials were stored in-app, **When** the user (or Verifier) inspects session dumps / transcript exports for that session, **Then** raw credential secrets are absent.

---

### Edge Cases

- What happens when the user tries to create a second bot with the same model as the first? Allowed; wedge requires that different models *can* be assigned, not that every pair must differ.
- What happens when a provider credential is missing, invalid, or revoked mid-session? User sees a clear failure; in-app re-entry is offered; no silent fallback to another bot's credentials.
- What happens when bot B is unavailable or does not act on a mailbox message? Handoff remains visible; user is not forced to copy-paste; no group-channel escalation (out of scope).
- What happens when only one provider is configured? User can still create bots, but cannot satisfy the ≥2-distinct-models exit until a second distinct model/provider is available.
- What happens if the user attempts Box/Shell, MCP, persona editing, skills library, routines, or memory product UX? Those surfaces are absent or non-goals for this feature; no P1 acceptance depends on them.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to create bots through a user-initiated basic create flow in the desktop app (minimum: identity name + model/provider assignment).
- **FR-002**: Each bot MUST retain its own model/provider assignment independently of other bots.
- **FR-003**: Users MUST be able to run a session with at least two bots that use different models/providers without leaving the app for model reasons.
- **FR-004**: Bots MUST exchange async 1:1 messages via the Host mailbox/inbox only; the product MUST NOT introduce a parallel Electron messaging bus for this feature.
- **FR-005**: For a 1:1 mailbox message, the recipient MUST either act in a user-visible way or leave a user-visible handoff; copy-paste MUST NOT be required for the happy path.
- **FR-006**: Chat MUST show progress updates while work is in flight and MUST deliver a final result when work completes (no requirement for richer chat chrome beyond progress + final).
- **FR-007**: The desktop UI MUST support create-bot, assign-model, chat, progress/final delivery, and observe-handoff for a real work session without requiring developer tooling on the happy path.
- **FR-008**: Provider credential entry and storage primary path MUST be in-app; secrets MUST NOT be exposed in the renderer trust surface or in session dumps/transcript exports.
- **FR-009**: Env/key-file credentials MAY work for development and CI only; they MUST NOT be the documented primary product auth path for Phase 1.
- **FR-010**: Phase 1 Host capability for this feature MUST be chat-oriented (sessions, model/provider use, tool registry without local Shell/Box backends). Local Shell/Box backends MUST NOT be required for Phase 1 acceptance.
- **FR-011**: Agent scopes MUST isolate per-bot model assignment and MUST NOT share another bot's tool privilege by default.
- **FR-012**: Tools available in Phase 1 MUST NOT be able to send/post externally as part of this feature's acceptance surface (trust floor).

### Out of Scope (explicit non-goals for this feature)

- Box / local Shell backends and computer-use parity
- MCP / connector productization (including 1Password connector vault)
- Personas / job / voice / anti-jobs product UX (deferred to later phase)
- Skills library UX
- Routines (cron or event-driven)
- Memory productization / recall UX
- Pixel-perfect Grok chrome parity
- Group channels, voice, send-on-behalf, user machines
- CreateAgent-from-peer
- Chat chrome beyond progress updates + final result delivery

### Key Entities

- **Bot**: User-created agent identity with a display name and a single assigned model/provider for Phase 1.
- **Model assignment**: Binding of one bot to one model/provider configuration available to the user.
- **Provider credential**: Secret material authorizing calls to a model provider; stored via in-app primary path; never a session-dump field.
- **Host mailbox message**: Async 1:1 message from one bot to another delivered through the Host mailbox/inbox.
- **Chat turn**: User-visible conversation unit showing progress updates and a final result for a bot's work.
- **Work session**: Contiguous use of the desktop app in which the user operates ≥2 bots to complete a real task.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a clean machine following the documented path, time from first launch to first completed multi-model team session (≥2 bots, different models) is under 30 minutes, and the path is recorded for Verifier replay.
- **SC-002**: Mohammed (or Verifier acting as him) completes one real work session with ≥2 differently modeled bots without opening another product solely for model access.
- **SC-003**: In a Verifier-scripted path, one bot sends an async 1:1 mailbox message to another and either the recipient acts or the handoff is visible in the desktop UI without copy-paste.
- **SC-004**: For a scripted chat, the user observes at least one progress update before completion and a final result after completion.
- **SC-005**: DH Verifier re-runs the documented Phase 1 acceptance path on the real desktop app and records pass/fail evidence against this spec.
- **SC-006**: Session dump / transcript export review for a scripted authenticated session contains no raw provider credential secrets.

## Assumptions

- Program plan `MzM-Docs/mzm-bot-plan.md` P1 scope is **accepted** for this experiment; auth primary is **in-app** (Mohammed ship/no-ship 2026-09-25).
- Constitution v1.0.0 wedge-first A→C principles bind; this feature is Phase 1 wedge A only, not north star C.
- Delivery shell for acceptance is the project desktop app (Electron packaging accepted by constitution/plan); this spec states WHAT the user can do, not HOW Shell↔Host is implemented.
- Shell↔Host topology entry gate (bundled-Node Desktop Host child + framed pipes + Node IPC lifecycle-only + `dsh-app://`, framing handshake Verifier pass) is a **plan/implement entry gate** owned with Architect/Electron/Runtime/Verifier; it does not expand product scope beyond this WHAT.
- "Different models" means distinct model/provider assignments the user can configure (e.g. two different providers, or two different models); exact catalog of providers is configuration, not a fixed marketing list in this spec.
- Basic bot create does not require personas, avatars, sidebar sections, or delete-confirm flows (those are later-phase).
- Linear issues for implementation are created only after Spec Kit `tasks` → `taskstoissues`, hung on project **DeepSeek Harness - Cursor** (never DeepSeek Harness - GrokBot).
- Single primary user for Phase 1 acceptance: Mohammed (founder = customer).

## Traceability (capability → requirement → acceptance)

| Capability | Requirements | Acceptance / Success |
|------------|--------------|----------------------|
| Per-bot model/provider | FR-002, FR-003, FR-011 | US1 scenarios 2–3; SC-001, SC-002 |
| Basic bot create | FR-001, FR-007 | US1 scenario 2; US3 scenario 1 |
| Host mailbox async 1:1 | FR-004, FR-005 | US2 scenarios 1–2; SC-003 |
| Chat progress + final delivery | FR-006 | US2 scenario 3; US3 scenario 2; SC-004 |
| Usable desktop UI | FR-007 | US3 scenarios 1–3; SC-005 |
| In-app auth + trust floor | FR-008, FR-009, FR-010, FR-012 | US4 scenarios 1–3; SC-006 |
| Explicit non-goals | Out of Scope section | Edge case: absent surfaces |

**Intended follow-ons (not this command):** `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-analyze` → `/speckit-taskstoissues` (Linear under DeepSeek Harness - Cursor / MOH-37) → implement → Verifier.
