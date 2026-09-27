# Contract: Delete bot with confirmation

**Owners:** DH Runtime (Host) · DH Client/Web under Electron (UI)
**Acceptance:** Spec FR-007, FR-008 · SC-005 · US4

## User-visible operations

| Operation | Input (minimum) | Observable result |
|-----------|-----------------|-------------------|
| Start delete | Existing Bot | Explicit confirmation required before removal |
| Cancel / dismiss confirm | Pending confirmation | Bot and profile unchanged |
| Confirm delete | Pending confirmation | Bot removed from sidebar, overview entry points, and section membership |

## Host obligations

- Perform permanent identity removal from roster/sidebar/overview/section membership on confirm.
- Transcript/mailbox cleanup MAY follow Host/session rules and MUST NOT block confirm/delete UX or Pass.
- Electron Main MUST NOT silently delete without the product confirm step.

## Verifier rules

| Check | Pass bar |
|-------|----------|
| Confirm required | Delete cannot complete without explicit confirm |
| Cancel safe | Cancel leaves bot intact |
| Identity removal | SC-005 — absent from sidebar and overview after confirm |
| Transcript/mailbox | **Not** a separate Pass gate |

## Failures

| Condition | Required behavior |
|-----------|-------------------|
| Confirm UI dismissed | No delete |
| Host delete fails mid-flight | Clear failure; bot remains listed until successful removal |

## Non-goals

Archive/hide; soft-delete recovery UX; mandatory transcript wipe for Pass; group-channel member cleanup.
