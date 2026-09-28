# Contract: Write profile / log / note

**Owners:** DH Runtime (Desktop Host Memory catalog) · DH Client/Web under Electron (UI)
**Acceptance:** Spec FR-001, FR-002, FR-003, FR-004, FR-015 · SC-001, SC-002, SC-003, SC-009 · US1–US3 · FR-011/012 visual evidence

## User-visible operations

| Operation | Input (minimum) | Observable result |
|-----------|-----------------|-------------------|
| Open memory write / surface | Desktop app; bot or account context | Surface ready to write curated memory (not chat-only) |
| Write profile | Non-empty content (+ layer choice per product UI) | `MemoryRecord` kind=`profile` on Host; visible as saved |
| Write log | Non-empty content (+ layer) | `MemoryRecord` kind=`log` on Host; visible as saved |
| Write note | Non-empty content (+ layer) | `MemoryRecord` kind=`note` on Host; visible as saved |
| Reject empty write | Empty/whitespace content | Clear user-visible reason; no saved listed fact |
| Leave / return (no restart) | Prior save | Same facts still present without re-entry |

## Host obligations

- Persist `MemoryRecord` in **Host Memory catalog** (prefer Agent Teams / Host journal extension — research R1).
- Project saved facts to Client over **authenticated Host HTTP/WS** Remotes.
- Electron Main MUST NOT own the durable store; Node IPC MUST NOT carry memory-write / memory-catalog payloads.
- Empty content MUST reject without writing.
- Bot-initiated tool write is **optional** and MUST NOT be required for Pass.

## Verifier rules

| Check | Pass bar |
|-------|----------|
| Profile write | SC-001 — ≥1 non-empty profile visible as curated |
| Log write | SC-002 |
| Note write | SC-003 |
| Bot-tool absence | SC-009 — must not fail Pass |
| Visual evidence | FR-011/012 — desktop media committed under `verifier/evidence/` |

## Failures

| Condition | Required behavior |
|-----------|-------------------|
| Host catalog unavailable | Clear user-visible failure; no silent empty “success” |
| Write only as unrecalled chat line | Fail — curated catalog write required |
| Unit/jsdom-only evidence | GUI scenario Fail |

## Non-goals

Bot-tool write as Pass; edit/delete as Pass; Electron Main memory bus; treating transcript as write success.
