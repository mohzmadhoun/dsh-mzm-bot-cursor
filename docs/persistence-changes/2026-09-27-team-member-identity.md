---
description: "Records a persistence type transition and its compatibility acknowledgement."
kind: persistence-change
---

# 2026-09-27-team-member-identity

English | [中文](2026-09-27-team-member-identity.zh.md)

## Summary

Adds optional Host Bot identity fields on durable team/member snapshots: persona, avatar, and sectionId.

## Table of Contents

- [Declaration](#declaration)
- [Compatibility](#compatibility)
- [Verification](#verification)
- [Dev Note](#dev-note)

<a id="declaration"></a>
## Declaration

```yaml persistence-change
schemaVersion: 1
id: 2026-09-27-team-member-identity
baseline: false
changes:
  - root: "event:team/member"
    previous: "2026-09-11-initial"
    after: "23816d42f6bc3bec5b35499d6d6219a204362a4afe71997e9af82706acdddb73"
    decision: same-version
```

<a id="compatibility"></a>
## Compatibility

Existing team/member records remain valid. New optional persona, avatar, and sectionId fields may be absent; absence means no persona/avatar and Unassigned/default section membership. displayName and modelSelection stay optional with unchanged P1 semantics; modelSelection remains immutable after first write. Post-active active→active snapshots may update mutable identity fields only.

<a id="verification"></a>
## Verification

pnpm exec vitest run packages/experimental/agent-team/tests/: 103 tests passed, including projection identity transitions and Host identity mutation stub Remotes.

<a id="dev-note"></a>
## Dev Note

None.
