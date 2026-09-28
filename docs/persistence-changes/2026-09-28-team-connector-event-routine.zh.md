---
description: "记录持久化类型更改及其兼容性确认。"
kind: persistence-change
---

# 2026-09-28-team-connector-event-routine

[English](2026-09-28-team-connector-event-routine.md) | 中文

## 概述

新增 Host Connector 目录事件 team/connector，以可选的 triggerKind 与 eventTrigger 增量扩展 team/routine，并将既有的 team/memory 根写入持久化历史。

## 目录

- [声明](#declaration)
- [兼容性](#compatibility)
- [验证](#verification)
- [开发备注](#dev-note)

<a id="declaration"></a>
## 声明

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
## 兼容性

既有 team/routine cron 行仍然有效。缺失 triggerKind 视为 cron（P4）。eventTrigger 为可选，仅出现在事件行。较旧日志中没有 team/connector 事件；缺失表示空 Connector 目录。team/memory 已由 Host Memory 目录写入产生；本记录在持久化历史中确认其摘要，不改变其载荷。Connector 密钥留在 Host 凭据缝，从不出现在 team/connector 载荷中。不提升 SessionHeader.version。

<a id="verification"></a>
## 验证

pnpm exec vitest run packages/experimental/agent-team/tests/connector-catalog.spec.ts packages/experimental/agent-team/tests/routine-cron.spec.ts packages/experimental/agent-team/tests/projection-events.spec.ts：32 个测试通过。pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts -t 'createRoutine|listRoutinesByBot|pauseRoutine|evaluateDueRoutines|exports Team views'：6 个测试通过。

<a id="dev-note"></a>
## 开发备注

无。
