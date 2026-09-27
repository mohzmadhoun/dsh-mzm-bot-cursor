---
description: "记录持久化类型更改及其兼容性确认。"
kind: persistence-change
---

# 2026-09-27-team-routine-catalog

[English](2026-09-27-team-routine-catalog.md) | 中文

## 概述

新增 Host Routine 目录事件 team/routine，并补齐 team/member 的 skillAttachments、deleted 阶段与预设 avatar 字面量联合类型。

## 目录

- [声明](#declaration)
- [兼容性](#compatibility)
- [验证](#verification)
- [开发备注](#dev-note)

<a id="declaration"></a>
## 声明

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
## 兼容性

既有 team/member 记录仍然有效。skillAttachments 可缺省（无附件）。phase deleted 为 P2 删除引入的 Host 身份墓碑；不懂 deleted 的旧读者若忽略 Team 投影则不会错误回放会话表面。avatar 的 shape/color 在旧日志中可为任意字符串；当前 Host 写入预设字面量 id。旧日志无 team/routine 表示 Routine 目录为空。team/routine 为非表面 Team 日志事件。

<a id="verification"></a>
## 验证

pnpm exec vitest run packages/experimental/agent-team/tests/routine-cron.spec.ts packages/experimental/agent-team/tests/projection-events.spec.ts packages/experimental/agent-team/tests/team.spec.ts -t 'routine|Host Routine|exports Team views|createRoutine'：相关测试通过。

<a id="dev-note"></a>
## 开发备注

无。
