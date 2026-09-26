# Contract: Bot create + per-bot model assignment

**Owners:** DH Runtime (Host) · DH Client/Web under Electron (UI)
**Acceptance:** Spec FR-001, FR-002, FR-003, FR-007, FR-011 · SC-001, SC-002 · US1

## User-visible operations

| Operation | Input (minimum) | Observable result |
|-----------|-----------------|-------------------|
| Create bot | `displayName`, model/provider assignment | New Bot retained with that assignment |
| Assign / bind model | Existing Bot + `ModelSelection` | Subsequent chats use that bot’s assignment only |
| Multi-model session | ≥2 Bots with distinct configured assignments | Session completes without leaving app for another model stack |

## Host obligations

- Persist Bot identity + one `ModelSelection` per Bot for P1.
- Isolate scopes so Bot A does not share Bot B’s tool privilege by default.
- Team/teammate spawn (or equivalent Host create) MUST accept per-bot LLM route (`agentOptions` / `installModelSelection`) — Architect runtime gap.
- Electron Main MUST NOT invent bot records or route models.

## Verifier rule for “different”

Any two distinct configured `(provider, model)` assignments available in the verification environment. No fixed marketing catalog.

## Failures

| Condition | Required behavior |
|-----------|-------------------|
| Missing credential for assigned provider | Direct user to in-app credential entry (see credentials contract) |
| Only one model configured | Bots may still be created; Verifier cannot Pass SC-001/002 until second distinct assignment exists |

## Non-goals

Personas, avatars, sidebar sections, delete-confirm, CreateAgent-from-peer.
