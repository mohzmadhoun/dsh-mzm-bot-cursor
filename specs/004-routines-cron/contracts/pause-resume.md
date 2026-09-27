# Contract: Pause / resume

**Owners:** DH Runtime (Host Routine catalog lifecycle) · DH Client/Web (controls)
**Acceptance:** Spec FR-003, FR-004 · SC-002 · US3 · FR-010/011 visual evidence

## User-visible operations

| Operation | Input (minimum) | Observable result |
|-----------|-----------------|-------------------|
| Pause | Active routine in pane | Status shows paused; no Host wake/fire on subsequent matches while paused |
| Resume | Paused routine | Status shows active/scheduled; eligible to fire again |
| Restart / reload | Prior pause or resume | Last status preserved (Host durable) |

## Host obligations

- Persist `status: active|paused` on `RoutineRecord` in Host catalog; Client must not be sole authority.
- While paused, Host cron evaluator MUST suppress wake for that routine.
- Electron Main MUST NOT store pause flags as durable SoT; IPC MUST NOT carry pause/resume payloads as the data plane (use Host HTTP/WS).

## Verifier rules

| Check | Pass bar |
|-------|----------|
| Pause then resume | SC-002 — UI status + no fire while paused + durable across reload |
| Visual evidence | FR-010/011 — screenshots/recordings of both states committed under `verifier/evidence/` |

## Failures

| Condition | Required behavior |
|-----------|-------------------|
| Pause that only hides UI row | Fail — must suppress Host wake |
| Unit/jsdom-only evidence | GUI scenario Fail |

## Non-goals

Delete-as-pause; confirm card; treating `dsh-schedule` delete as pause.
