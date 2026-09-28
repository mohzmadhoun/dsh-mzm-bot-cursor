---
description: "Records a persistence type transition and its compatibility acknowledgement."
kind: persistence-change
---

# 2026-09-28-team-connector-event-routine

English | [中文](2026-09-28-team-connector-event-routine.zh.md)

## Summary

Adds Host Connector catalog event team/connector, additively extends team/routine with optional triggerKind and eventTrigger, and records the existing team/memory root in the persistence history.

## Table of Contents

- [Declaration](#declaration)
- [Compatibility](#compatibility)
- [Verification](#verification)
- [Dev Note](#dev-note)

<a id="declaration"></a>
## Declaration

```yaml persistence-change
schemaVersion: 1
id: 2026-09-28-team-connector-event-routine
baseline: false
changes:
  - root: "event:team/connector"
    previous: null
    after: "e19bad4c9c0e79096cba7ade2b6d4dd86b7081a0b05adc501cb1e0fd3bc2eb9f"
    decision: same-version
  - root: "event:team/memory"
    previous: null
    after: "cd7327796d10f119fb1bf9f89d6bf8ad7968370a4eba70c72fa0ac7dfbab5c89"
    decision: same-version
  - root: "event:team/routine"
    previous: "2026-09-27-team-routine-catalog"
    after: "1505c8194dac217074e43c373afe865b13d674f00fb2058bd0f32aae4a6c5363"
    decision: same-version
```

<a id="compatibility"></a>
## Compatibility

Existing team/routine cron rows remain valid. Absent triggerKind means cron (P4). eventTrigger is optional and present only on event rows. New team/connector events are absent in older logs; absence means an empty Connector catalog. team/memory was already produced by Host Memory catalog writes; this record acknowledges its digest in the persistence history without changing its payload. Connector secrets stay in the Host credential seam and never appear in team/connector payloads. No SessionHeader.version bump.

<a id="verification"></a>
## Verification

pnpm exec vitest run packages/experimental/agent-team/tests/connector-catalog.spec.ts packages/experimental/agent-team/tests/routine-cron.spec.ts packages/experimental/agent-team/tests/projection-events.spec.ts: 32 tests passed. pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts -t 'createRoutine|listRoutinesByBot|pauseRoutine|evaluateDueRoutines|exports Team views': 6 tests passed.

<a id="dev-note"></a>
## Dev Note

None.
