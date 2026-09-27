---
description: "记录持久化类型更改及其兼容性确认。"
kind: persistence-change
---

# 2026-09-27-team-section-catalog

[English](2026-09-27-team-section-catalog.md) | 中文

## 概述

新增 team/section Lead journal 事件，用于具名侧边栏 section 目录行（id + 非空 name）。

## 目录

- [声明](#declaration)
- [兼容性](#compatibility)
- [验证](#verification)
- [开发备注](#dev-note)

<a id="declaration"></a>
## 声明

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
## 兼容性

不含 team/section 的既有 Team 日志仍然有效。新目录行是增量字段。membership 仍在 team/member.sectionId；null／缺省 sectionId 表示 Unassigned／default，且无 Unassigned 目录行（clarify lock 4）。create／rename 拒绝空 section 名。

<a id="verification"></a>
## 验证

pnpm exec vitest run packages/experimental/agent-team/tests/ packages/experimental/client-ui-agent-team/tests/handoff-notices.client.spec.tsx packages/experimental/client-ui-agent-team/tests/team-action.client.spec.tsx：168 个测试通过。

<a id="dev-note"></a>
## 开发备注

无。
