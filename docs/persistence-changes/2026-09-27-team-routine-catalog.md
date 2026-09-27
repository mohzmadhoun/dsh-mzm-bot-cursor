---
description: "Records a persistence type transition and its compatibility acknowledgement."
kind: persistence-change
---

# 2026-09-27-team-routine-catalog

English | [中文](2026-09-27-team-routine-catalog.zh.md)

## Summary

Adds Host Routine catalog event team/routine and catches up team/member with skillAttachments, deleted phase, and preset avatar literal unions.

## Table of Contents

- [Declaration](#declaration)
- [Compatibility](#compatibility)
- [Verification](#verification)
- [Dev Note](#dev-note)

<a id="declaration"></a>
## Declaration

```yaml persistence-change
schemaVersion: 1
id: 2026-09-27-team-routine-catalog
baseline: false
changes:
  - root: "event:team/member"
    previous: "2026-09-27-team-member-identity"
    after: "e9f01bc311604c323255f5cfcec5b2b83b5eea0521f98a71785df64f4d9854f9"
    decision: same-version
  - root: "event:team/routine"
    previous: null
    after: "2a9151020dfe7e5872665d3c4df6abdcb098c82803367efe52590e408f1a8a7e"
    decision: same-version
```

<a id="compatibility"></a>
## Compatibility

Existing team/member records remain valid. skillAttachments may be absent (no attachments). phase deleted is a Host identity tombstone added by P2 delete; older readers that do not model deleted still retain the row as an unknown phase only if they ignore Team projection — current Agent Teams projection understands deleted. avatar shape/color may be any string in older logs; current Host writes preset literal ids. New team/routine events are absent in older logs; absence means an empty Routine catalog. team/routine is non-surface (Team journal only).

<a id="verification"></a>
## Verification

pnpm exec vitest run packages/experimental/agent-team/tests/routine-cron.spec.ts packages/experimental/agent-team/tests/projection-events.spec.ts packages/experimental/agent-team/tests/team.spec.ts -t 'routine|Host Routine|exports Team views|createRoutine': focused tests passed.

<a id="dev-note"></a>
## Dev Note

None.
