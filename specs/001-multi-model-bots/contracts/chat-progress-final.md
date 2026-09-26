# Contract: Chat progress + final delivery

**Owners:** DH Runtime (session/agent streams) · DH Client/Web (render)
**Acceptance:** Spec FR-006 · SC-004 · US2 scenario 3 · US3 scenario 2

## Obligations

| Phase | User-visible requirement |
|-------|--------------------------|
| In flight | ≥1 progress update before completion on Verifier-scripted path |
| Complete | Final result delivered in chat for that turn/path |
| Handoff-linked | When work is caused by mailbox message, progress/final attributable to that path |

## Sources

- Progress: Host session/agent stream events while turn open.
- Final: Durable turn completion / assistant (or handoff) result in session log.
- Shell MUST NOT synthesize a parallel progress protocol.

## Non-goals

Richer chat chrome beyond progress + final; pixel Grok parity; new chat wire protocol.
