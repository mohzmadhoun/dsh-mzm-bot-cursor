# Contract: Host mailbox async 1:1

**Owners:** DH Runtime (Host Agent Teams mailbox) · DH Client/Web (observe)
**Acceptance:** Spec FR-004, FR-005 · SC-003 · US2
**Forbidden:** Parallel Electron messaging bus for this feature

## Operation

Bot A sends async 1:1 message to Bot B.

| Step | Required |
|------|----------|
| Send | Message enters Host mailbox/inbox path (Agent Teams Lead-log mailbox → target inbox) |
| Deliver | Durable handoff user can observe in desktop UI |
| Act or show | Recipient performs visible follow-up attributable to message **or** pending/received handoff remains visible |
| Copy-paste | MUST NOT be required for happy path |

## Observability

- Chat surfaces for involved bots show handoff progress updates when work is in flight and final result when that path completes (ties to chat contract).
- Projections come from Host session/RPC — not Main-synthesized IPC payloads.

## Negative contract

| Attempt | Expected |
|---------|----------|
| Implement bot↔bot via Electron IPC | Rejected by architecture tests/docs; handshake negative criterion |
| Group channel / broadcast | Out of scope; not required for Pass |

## Non-goals

Group channels, voice, send-on-behalf, CreateAgent-from-peer, task-board productization.
