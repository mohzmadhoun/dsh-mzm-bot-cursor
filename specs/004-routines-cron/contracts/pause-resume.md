# Contract: Pause / resume

**Owners:** DH Runtime (Host schedule lifecycle) · DH Client/Web (controls)
**Acceptance:** Spec FR-003, FR-004 · SC-002 · US3 · FR-010/011 visual evidence

## User-visible operations

| Operation | Input (minimum) | Observable result |
|-----------|-----------------|-------------------|
| Pause | Active routine in pane | Status shows paused; no fire on subsequent matches while paused |
| Resume | Paused routine | Status shows active/scheduled; eligible to fire again |
| Restart / reload | Prior pause or resume | Last status preserved |

## Host obligations

- Persist pause/resume on Host schedule (or Host facade over schedule); Client must not be sole authority.
- While paused, suppress schedule dispatch/fire for that routine.
- Electron Main MUST NOT store pause flags as the durable source of truth.

## Verifier rules

| Check | Pass bar |
|-------|----------|
| Pause then resume | SC-002 — UI status + no fire while paused + durable across reload |
| Visual evidence | FR-010/011 — screenshots/recordings of both states committed under `verifier/evidence/` |

## Failures

| Condition | Required behavior |
|-----------|-------------------|
| Pause that only hides UI row | Fail — must suppress fire |
| Unit/jsdom-only evidence | GUI scenario Fail |

## Non-goals

Delete-as-pause; confirm card; Architect-final API naming (tasks may extend `schedule/change` or Host RPC — ownership stays Host).

## Architect note

Optional confirm: durable `schedule/change` pause/resume ops vs thin Host control plane — Pass cares about behavior, not API brand names.
