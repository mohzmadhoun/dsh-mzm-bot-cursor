---
description: "使用并排查实验性 Web Agent Teams roster、共享任务板与 teammate 导航面板。"
kind: "package-reference"
---

# @deepseek-ai/dsh-experimental-client-ui-agent-team

[English](README.md) | 中文

## 概述

本包向 Web 会话页头添加 Agent Teams action，让用户检查当前 roster、Host mailbox 1:1 handoff、用 displayName 与 model/provider 赋值创建 Host 持有的 Bot、编辑 Bot persona（职责／语气／反职责）、用具名侧栏分组与未分组／默认组织 Bot、发现 Host 技能目录摘要并设为可挂载、管理共享任务板并导航到 teammate 会话。它通过生成的 `ctx.remote.agentTeams` contribution 读取权威 Team 状态，并让普通 child history 导航继续使用稳定的 addressed-subagent 路径。通过公开发布的实验性 Agent Teams Web profile 选择本包。这个浏览器 projection 不扩展稳定 API Proxy、不存储 Team 状态，也不注册面向模型的输入。

## 目录

- [使用本包](#use-this-package)
- [理解实现](#understand-the-implementation)
- [进一步探索](#further-exploration)
- [模型体验](#model-experience)
- [已知限制与延期工作](#known-limitations-and-deferred-work)
- [开发备注](#dev-note)

-----

<a id="use-this-package"></a>
## 使用本包

在稳定 Web bundle 与 Host-side Agent Teams profile 之后，通过 [`@deepseek-ai/dsh-experimental-agent-team-web-profile`](../agent-team-web-profile/README.zh.md) 安装本包。Web Client loader 挂载 `/client` export；root Host export 不执行行为，本包也没有用户配置字段。

### 检查并导航 roster

打开 panel 会调用 `agentTeams/view`。Roster row 在 Host 保留了产品 `displayName` 时优先展示它，并显示持久 name、运行时 status、model 与 diagnostics。选择健康 teammate 时，系统刷新既有直接 child catalog，并打开普通的 `{ parentSessionId, childSessionId, mode: 'continuable' }` address。History 与后续人类提示词继续使用稳定 addressed-subagent 会话路径；本包不会添加 Team 专用 address 字段。

### 创建带 model 赋值的 Bot

**新建 Bot** 打开表单，要求非空 `displayName` 以及 provider 与 model id，然后调用 Host Remote `agentTeams/createBot`。Electron Main 不得发明 bot 记录或 LLM 路由。Create rejection 保留为显式 business result；成功后会重新加载 roster。当 create 或 chat 表面出现 Host `MISSING_CREDENTIAL`、`AUTH` 或 `INVALID_CREDENTIAL` 时，面板展示应用内 Models 凭据引导，并通过 `ctx.settingsShell.openSection('models')` 提供**打开模型设置**控件——不以 1Password / 外部保险库为主路径。相同 code 的 chat 轮次失败在 `ui-chat` 使用相同交接。表单展示 locale 持有的 Verifier 说明：多模型 Pass 需要环境中至少两个不同的已配置 `(provider, model)` 赋值（不是固定营销目录）。同赋值仍可创建；草稿与 roster 已有赋值重复时显示软提示。Roster 提示跟踪这些不同赋值是否已就绪。

当草稿同时有两个 id，且 roster 上的 Bot 已有赋值时，表单会说明该草稿是否为新的不同赋值。面板只统计同时暴露 LLM provider 与 model 的 teammate 行；Lead 行以及没有该配对的后端 id 不计入。不完整草稿不显示该比较。

### 编辑 Bot 身份（职责／语气／反职责）

健康 teammate 上的**编辑身份**打开 Host 身份／profile 编辑器，可改 `job`、`voice` 与有序 anti-jobs 列表（每行一项；空字段允许）。保存调用 Host Remote `agentTeams/updatePersona`；成功后重新加载 roster。已保存的 anti-jobs 直接显示在 bot overview 上供 Verifier 观察——不藏在隐藏／仅高级编辑器里。保存中断或 Host 不可用时，面板显示明确失败，overview 上先前持久 persona 保持不变。Electron Main 不得发明 persona 记录。

### 重命名 Bot 并设置预设头像

健康 teammate 上的**重命名**打开 Host `displayName` 编辑器。修剪后为空时阻止保存；成功则调用 Host Remote `agentTeams/renameBot` 并重新加载 roster，使侧栏与 overview 显示新标签。允许重名。Kebab roster `name` 仍为创建时的 id。

**设置头像**打开预设形状和／或颜色选择器（Host 固定 id）。保存时至少需要形状或颜色之一。保存调用 Host Remote `agentTeams/setAvatar`；标记渲染在 roster／overview 行（`data-team-avatar`）。P2 Pass **不**提供图片文件或 URL 上传控件（clarify lock 3 / T024）。Electron Main 不得发明名称或头像存储。

### 带确认的删除 Bot

健康 teammate 上的**删除 Bot**进入 Client `pending-confirm`，此时不调用 Host。**取消**／关闭确认返回 idle，Bot 保持不变。**确认删除**调用 Host Remote `agentTeams/deleteBot`；成功后重新加载 roster，Bot 从侧栏与 overview 入口消失。会话记录与 mailbox 清理**不是** Pass 条件（clarify lock 5）。Electron Main 不得发明身份记录，也不为本路径托管原生确认对话框（优先 Client 确认；T028 未使用）。

### 用侧栏分组组织 Bot

**新建分组**通过 `agentTeams/createSection` 创建 Host 具名侧栏分组（名称必填非空）。具名分组来自 `TeamView.sections` 及其 Host 派生 membership。`sectionId` 为 null／缺省的 Bot 出现在来自 `TeamView.unassignedBotIds` 的**未分组**下——Host 永不持久化未分组目录行（clarify lock 4）。**重命名分组**调用 `agentTeams/renameSection`。健康 teammate 上的**移至分组**调用 `agentTeams/assignSection`，传入具名分组 id 或 `null` 表示未分组／默认。Electron Main 不得发明分组记录或归属。

### 发现并加载技能（可挂载）

打开 panel 时从 Host `agentTeams/view` 加载 `TeamView.skills`（管理精简包 + 用户技能）。**技能库**列出每项技能的可读 `displayName` 与来源。**设为可挂载**将已发现技能选入挂载流程，无需多步加载向导（clarify lock 2／FR-002）。可挂载是 Client 选择状态；管理技能跨重启的存活由 Host 目录重新挂载负责。当 Host 目录返回空列表（注册表不可用／空）时，技能库显示明确失败——绝不当作空列表成功。Electron Main 不得发明技能目录行。

### 观察 Host mailbox handoff

打开或刷新 panel 时，从 Host `agentTeams/view` 加载 `TeamView.handoffs`。每一行都是产品侧 Host mailbox 消息（`id`、收发 Bot、正文预览、`deliveryState`、仅 Host 的 `source`），由 Host 根据 Lead 与目标 Session 日志重建——绝非 Main 合成的 IPC。投递标签覆盖 `queued`、`delivered`、`visible-pending` 与 `acted`（FR-005）。同一投影还会在 Conversation notices 条（`conversation.session.notices`）中挂载涉及当前 Session 的 handoff；Chat 将持久化 / pending 的 `team-message` 回执渲染为交接行，因此不需要复制粘贴。

### 管理任务板

任务板展示 task identity、owner、blocker、readiness、提示性 write scope 与重叠 warning。用户可以通过 `agentTeams/createTask` 与 `agentTeams/updateTask` 创建、编辑、分配或取消分配、完成、重开和删除任务。每次 update 都发送当前显示的 revision，create 或 update rejection 都保留为显式 business result。

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现细节——点击展开</summary>

Client export 挂载来自 [`@deepseek-ai/dsh-experimental-agent-team/remote`](../agent-team/README.zh.md) 的生成的 `ctx.remote.agentTeams` contribution，然后通过 Cordis effect 注册 locale dictionary、conversation-header Team action，以及 `conversation.session.notices` handoff 条。Dispose plugin fiber 会移除这些 registration。

开始 create 或 update 会让更早的 refresh 失效。成功后会重新读取完整 Team view，使每个 task 的派生字段保持最新。`team-task-conflict` 结果仅在重新读取成功后显示状态陈旧提示；如果重新读取失败，则改为显示重新读取错误。由于 Team 服务把任务文本或 scope 编辑与 dependency 修改公开为独立 action，两者使用两个连续的 compare-and-set mutation。

| 文件 | 职责 |
|---|---|
| [`src/client/mount.ts`](src/client/mount.ts) | 生成的 Remote、locale、导航与 slot registration |
| [`src/client/TeamAction.tsx`](src/client/TeamAction.tsx) | Roster、具名侧栏分组＋未分组、Host 技能发现／加载（可挂载）、Host mailbox handoff、Host bot 创建、persona／重命名／头像／删除编辑器与任务板交互状态 |
| [`src/client/HandoffNotices.tsx`](src/client/HandoffNotices.tsx) | 来自 `TeamView.handoffs` 的 Conversation notices 条 |
| [`src/client/locales.ts`](src/client/locales.ts) | 中英文 panel 文案 |
| [`src/index.ts`](src/index.ts) | 不执行行为的 Host entry |

</details>

-----

<a id="further-exploration"></a>
## 进一步探索

- [Agent Teams Web profile](../agent-team-web-profile/README.zh.md)——挂载本 Client plugin 的公开 opt-in bundle。
- [Agent Teams service](../agent-team/README.zh.md)——权威 roster、task 与 Remote 行为。
- [会话 UI](../../client/ui-conversation/README.zh.md)——稳定 header slot 与 addressed-subagent 导航表层。
- [实验性包](../README.zh.md)——孵化状态与发布规则。

-----

<a id="model-experience"></a>
## 模型体验

无直接影响，因为该浏览器 projection 与任务控制界面不注册面向模型的输入。

#### KV Cache 影响

无直接影响；Team 工具与普通会话提交负责后续任何模型可见用途。

## 已知限制与延期工作

<a id="known-limitations-and-deferred-work"></a>

- **Snapshot refresh**——panel 会在打开、显式 refresh 与 mutation 后刷新；handoff 来自最新的 `agentTeams/view` 快照，没有实时事件订阅。
- **普通 child continuation**——导航后发送的人类消息使用稳定 addressed-subagent 提示词路径，而不是 Team peer mailbox。
- **没有 interrupt 控件**——panel 通过 Host Remote 创建 bot、编辑身份、组织分组并以确认删除，但不能 interrupt teammate；write scope 仍只是提示性 metadata。
- **技能挂载／运行 UI**——US1 发现／加载将技能标为可挂载；按 Bot 的挂载／运行界面属 US2。Host 在 `ctx.skills` 缺席时仍返回 `skills: []`——Client 将该空目录视为不可用（绝不当作空列表成功）；若需显式 Host 错误码，仍由 Runtime 拥有。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者的工作上下文——点击展开</summary>

无。

</details>

**运行时不变式：** 不发布伴生入口。RPC 是权威来源，本包持有 header action 与 handoff notices 的可释放 slot 注册。
