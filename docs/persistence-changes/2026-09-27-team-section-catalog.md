---
description: "Records a persistence type transition and its compatibility acknowledgement."
kind: persistence-change
---

# 2026-09-27-team-section-catalog

English | [中文](2026-09-27-team-section-catalog.zh.md)

## Summary

Adds team/section Lead journal events for named sidebar section catalog rows (id + non-empty name).

## Table of Contents

- [Declaration](#declaration)
- [Compatibility](#compatibility)
- [Verification](#verification)
- [Dev Note](#dev-note)

<a id="declaration"></a>
## Declaration

```yaml persistence-change
schemaVersion: 1
id: 2026-09-27-team-section-catalog
baseline: false
changes:
  - root: "event:team/section"
    previous: null
    after: "27206cbd5061857f14b7a386b1a5ed746f948fb9c112fcaeb9a708755609a2eb"
    decision: same-version
```

<a id="compatibility"></a>
## Compatibility

Existing Team logs without team/section remain valid. New catalog rows are additive. Membership stays on team/member.sectionId; null/absent sectionId means Unassigned/default with no Unassigned catalog row (clarify lock 4). Empty section names are rejected on create/rename.

<a id="verification"></a>
## Verification

pnpm exec vitest run packages/experimental/agent-team/tests/ packages/experimental/client-ui-agent-team/tests/handoff-notices.client.spec.tsx packages/experimental/client-ui-agent-team/tests/team-action.client.spec.tsx: 168 tests passed.

<a id="dev-note"></a>
## Dev Note

None.
