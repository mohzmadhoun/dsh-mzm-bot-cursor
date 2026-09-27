---
description: "记录持久化类型更改及其兼容性确认。"
kind: persistence-change
---

# 2026-09-27-team-member-identity

[English](2026-09-27-team-member-identity.md) | 中文

## 概述

在持久 team/member 快照上增加可选 Host Bot 身份字段：persona、avatar 与 sectionId。

## 目录

- [声明](#declaration)
- [兼容性](#compatibility)
- [验证](#verification)
- [开发备注](#dev-note)

<a id="declaration"></a>
## 声明

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
## 兼容性

既有 team/member 记录仍然有效。新增的可选 persona、avatar 与 sectionId 可以缺省；缺省表示无 persona／avatar，以及 Unassigned／default 分区成员关系。displayName 与 modelSelection 仍为可选且保持 P1 语义；modelSelection 在首次写入后仍不可变。active 之后的 active→active 快照只可更新可变身份字段。

<a id="verification"></a>
## 验证

pnpm exec vitest run packages/experimental/agent-team/tests/：103 个测试通过，含投影身份转换与 Host 身份 mutation stub Remote。

<a id="dev-note"></a>
## 开发备注

无。
