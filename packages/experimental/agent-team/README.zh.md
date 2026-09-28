---
description: "在一个会话中运行一个小型具名 agent（智能体）团队：成员之间的持久消息与共享任务板，用于组合实验性 Team 插件的部署。"
kind: "package-reference"
---

# @deepseek-ai/dsh-experimental-agent-team

[English](README.md) | 中文

## 概述

`dsh-experimental-agent-team` 把一个编码会话变成一个小型工作团队：会话中的 agent 成为 Lead，创建具名 teammate 处理委派的工作，与它们交换持久消息，并在公共任务板上跟踪共享任务。消息与任务状态能挺过崩溃、reload 与中断，因此离线的 teammate 会在恢复后收到排队的消息。它本身不提供任何工具——请挂载兄弟包 `dsh-experimental-tool-agent-team`，让模型能够创建 teammate、给它们发消息并使用任务板。它以实验性名称公开发布、不承诺稳定性，并且需要持久会话存储才能激活。

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

当一个 agent 应该在自己的工作目录中运行一支小型具名助手团队、且消息与任务状态需要挺过崩溃与重启时，把本包加入组合。它本身不带工具：请与 `@deepseek-ai/dsh-experimental-tool-agent-team` 一起挂载，让模型能够创建 teammate、给它们发消息并使用任务板。

### 何时选择

当多个 agent 必须在同一个共享工作区协作、且 roster、消息与任务状态需要挺过崩溃与重启时，选择它。当 teammate 需要独立工作目录、多个进程需要协调同一支团队、或任务 owner 需要自动释放时，请不要选择——这些都不受支持。团队功能需要持久会话存储才能激活。

### 最小工作配置

<a id="smallest-working-setup"></a>

对现有组合的最小增量是持久会话存储加两个 Team 包：

```yaml
# smallest team setup — durable storage plus both Team packages
- name: '@deepseek-ai/dsh-session-persistence-jsonl'
- name: '@deepseek-ai/dsh-experimental-agent-team'
- name: '@deepseek-ai/dsh-experimental-tool-agent-team'
```

工具安装后，模型会按请求完成其余工作——例如先「创建一个名为 reviewer 的 teammate 检查 diff」，再「把变更摘要发给 reviewer」。所有限制都是可选的，并在启动时校验：

| 字段 | 默认值 | 含义 |
|---|---|---|
| `maxMembers` | `16` | 一支团队最多可创建的 teammate 数，包括失败的 |
| `maxTasks` | `256` | 任务板上最多的活动任务数 |
| `maxPendingMessagesPerMember` | `64` | 单个成员最多可排队的消息数 |
| `maxMessageBytes` | `65,536` | 单条发送消息的最大尺寸 |
| `disposalTimeoutMs` | `5,000` | 关闭清理允许的时间 |
| `routineCronTickMs` | `15,000` | Agent Teams 已加载时 Host Routine cron 轮询周期 |
| `userSkillsRoot` | — | `upsertUserSkill` 目录包所用的绝对 Host 持久根 |

生成的[配置目录](../../../docs/config-catalog.zh.md#deepseek-aidsh-experimental-agent-team)是每个受支持字段及其 JSDoc 的穷尽式真源。

### Teammate

请 Lead 创建 teammate：给它一个唯一的小写名字（例如 `reviewer`）并描述其职责。teammate 可以 fresh 启动（不携带 Lead 对话的任何记忆），也可以作为 fork 启动（继承 Lead 已完成的轮次）；创建请求决定用哪种。teammate 名字是永久的——即使创建失败的 teammate 也保留其名字，任何名字都不会被复用。Host 调用方还可在 spawn 时传入按 teammate 区分的 LLM `agentOptions`（`provider` + `model`[以及可选的推理强度]），使每个 bot 保留自己的模型路由；该字段与 subagent 后端 `provider` 不同，Electron Main 不得发明或改写它。当 live Agent 同时带有两个 id 时，roster row 会把该 LLM 赋值投影为 `modelSelection`，供 Client Verifier 文案比较不同的 `(provider, model)` 赋值。

产品侧 bot 创建使用 Host `createBot(displayName, modelSelection)`：仅 Lead 可授权的 API 要求非空 `displayName` 与恰好一个 model/provider 赋值，推导持久 kebab roster 名，并把 `displayName` 与该 `modelSelection` 保留在 Host member 快照上。创建时（以及冷恢复时），Agent Teams 通过 `installModelSelection` 绑定 live Bot，使后续对话只使用该 bot 自己的赋值——绝不回落到 Lead 路由。随后的模型调用经 Host `ctx.llm` 适配器（`packages/llm/`）按该赋值解析，并由 Host `ctx.credentials` 解析该 provider 凭据——绝不静默使用同伴 bot 的凭据，也绝不由 Electron Main 发明 bot 记录或改写路由。通过 `ctx.agentTeams.createBot` 或生成的 `agentTeams/createBot` Remote 调用。

持久 member 快照上的可选 Host Bot 身份字段——`persona`（`job`／`voice`／`antiJobs`）、预设 `avatar`（来自固定 Host 预设 id 的 `shape` 与／或 `color`）以及 `sectionId`（`null`／缺省 ⇒ Unassigned／default）——经 Team journal 的 `team/member` 路径持久化，并投影到 Client roster 视图。P1 `modelSelection` 所有权保持不可变。Host `updatePersona` 会替换活跃 Bot 上的 job／voice／anti-jobs，经 `listMembers`／`agentTeams/view` 投影，并在 create 与冷恢复时把非空字段绑定进该 Bot 作用域的 `deployment:persona-prefix` 指令文本（空字段不贡献文案；Verifier 观察装配接线，不评分 LLM 回复措辞）。Host `renameBot` 持久化非空 `displayName`（允许重名；kebab `name` 不可变；空 rename 拒绝且不写入）。Host `setAvatar` 替换预设 shape 与／或 color 标记（至少一项；图片文件／URL 上传不在 Pass 范围——clarify lock 3）。二者均经 `listMembers`／`agentTeams/view` 投影。Host `createSection`／`renameSection` 把具名侧边栏目录行持久化到 `team/section`（空名称拒绝）；Host `assignSection` 将 Bot.`sectionId` 设为具名目录 id，或设为 `null` 表示 Unassigned／default，且不存储 Unassigned 行（clarify lock 4）。`agentTeams/view` 投影 `sections`（名称＋按 roster 顺序的 `botIds`）与 `unassignedBotIds`。Host `deleteBot` 追加 `active` → `deleted` 身份墓碑（清除 `sectionId`）；Client roster／overview／section membership 省略该 Bot，而 transcript 与 mailbox 行在 Pass 中保持不动（clarify lock 5）。Electron Main 不得发明身份或 section 记录。

Host 技能发现经 `projectSkillCatalog` 把 `ctx.skills` 投影到 `agentTeams/view.skills` 与会失败响亮的 `agentTeams/listSkills` Remote（`listSkills`）：Pass 仅列出一个 `managed` 技能（`mzm-thin-pack` / 显示名 `MzM thin pack`）；其余 provider `bundled` 技能（office-*）仍留在 `ctx.skills` 供模型使用，但不进入发现面；其余行映射为 `user`；缺失 skills registry 时 `listSkills` 失败响亮（非 Desktop 组合上 `view` 软返回空）。Electron Main 不得发明目录行。

Host `upsertUserSkill` 创建或更新用户编写的技能：`displayName` 与 `instructionalBody` 必须非空（FR-013）；空字段带明确原因拒绝且不写入持久内容（T028）。成功时经 `dsh-skill-filesystem` 的 `writeSkillBundle` 写入 `<userSkillsRoot>/<skillId>/SKILL.md`（Config `userSkillsRoot`；Desktop profile 设为 `dshHomePath('desktop-user-skills')` 以匹配 Host 挂载），并在 `ctx.skills` 上注册以便立即发现。Electron Main 不得发明技能文件。

Host `attachSkill(botId, skillId)` 仅把有序 `{ botId, skillId }` 追加到该 Bot 的持久 `skillAttachments`（允许多附；绝不自动附到其他 Bot）。技能必须存在于 Host `ctx.skills`，否则失败响亮且不写入。`listMembers` / `agentTeams/view` 将这些附件投影给 Client 的 bot skills/overview — 绝不用 Electron Main 存储。附上之后（以及 create / 冷恢复时），Agent Teams 把非空的附属技能说明正文绑定到该 Bot 作用域内的 `agent-teams:skill-instructions` system-prompt 段（Candidate B，与 P2 persona 前缀并列；空/缺失正文不贡献文案；Verifier 只观察装配接线，不评判 LLM 回复措辞）。

Host Routine 目录（P4 Architect Option 3）把 `RoutineRecord` 持久化在 Lead 日志路径 `team/routine`——按 `botId` 隔离，含非空 `intent`、产品支持的 `scheduleExpr`（`@every 5m`／`@hourly`／`@daily`／五段 cron）、`status: active|paused` 与 `lastRunAt`。Host `createRoutine`（US1 T015–T016）对空 intent 或不支持的 schedule 以明确 Remote `team-rejected` 原因拒绝且不写入；成功仅为该 `botId` 持久化 `status: active`（SC-006）。无确认步骤、无单独 displayName——面板 `identity` 由 intent 派生（SC-007）。Host `listRoutinesByBot`（US2 T019／FR-002）按单个 `botId` 经已认证 HTTP/WS 从该 Host 目录投影 `RoutineProjection`（intent／identity、scheduleExpr／scheduleLabel、status、lastRunAt）；`agentTeams/view.routines` 对 Team 视图暴露同一投影集合。Host `pauseRoutine`／`resumeRoutine`（US3 T022／FR-003/004）持久化 `status: paused|active`；`isRoutineEligibleForWake`／`routinesEligibleForWake` 确保 paused 行绝不会收到 Host cron 唤醒。Host cron 定时器（US4 T025／FR-005；Config `routineCronTickMs`）在 Host 进程中评估到期的 **active** 行，以例行 intent 唤醒 bot 回合（Agent followup／subagent 队列），并在触发提交后更新 `lastRunAt`；paused 行永不唤醒。这不是 `@deepseek-ai/dsh-schedule` 会话提醒，也不是 Electron Main 存储。Host `routine-cron` 校验表达式并计算下次触发／是否到期；可选 `ctx.jobs` 稍后仅可用于飞行中触发可见性。

Host Memory 目录（P5 Host SoT）把 `MemoryRecord` 持久化在 Lead 日志路径 `team/memory`——`kind: profile|log|note`、`layer: agent|user`、`layer=agent` 时必填 `botId`／`layer=user` 时为 null、非空 `content` 与时间戳。Host `writeMemory`（T006–T008／US1 T014／US2 T017／US3 T020）对空 content 或非法 layer／`botId` 组合以明确 Remote `team-rejected` 原因拒绝且不写入；`kind=profile`（FR-001）、`kind=log`（FR-002）与 `kind=note`（FR-003）在 trim 后校验非空 content 并持久化到 Host 目录，list／view 上以 `kind` 可区分（Pass 不要求 bot-tool 写入——FR-015）。kind 与 layer 正交（FR-017／US5 T029）。Host `listMemories`（可选 `botId`）经已认证 HTTP/WS 投影该 bot 的 agent 层行加上全部账户级 user 行（`memoryEligibleForBot`——US5 T027／FR-006/007：bot B 不得把 A 的 agent 行列为 B 的）；`agentTeams/view.memories` 暴露完整目录。目录行经 Lead Session 回放在 Host 子进程重启后仍可投影（US4 T023／FR-004/005）——绝不用 transcript dump。写入之后（以及 create／冷恢复时），Agent Teams 把符合条件的策展正文绑定到该 Bot 作用域内的 `agent-teams:memory-recall` system-prompt 段（US4 T024／FR-016；Candidate A，与 persona／skill 绑定并列；空目录不贡献文案；Verifier 只观察装配接线，不评判 LLM 回复措辞）。这不是 Electron Main 存储、不是 Client 独有 SoT、也不是聊天 transcript。

Host Connector 目录（P6 Architect Path A）把 `ConnectorRecord` 持久化在 Lead 日志路径 `team/connector`——品牌化 `connectorId`、精简目录 `catalogId`／MCP `serverName`、`installState: available|installing|installed|failed`、`authState: none|needs_auth|authenticating|ready|failed`、transport、可选的无密钥值 `credentialKey` 与时间戳。精简目录可用性（`listConnectorCatalog`／`PASS_CONNECTOR_CATALOG`）**不等于**安装（FR-001／US1 T017）：Host `installConnector` 写入持久行——Pass fixture 结算为 `installState=installed`；Verifier 损坏 fixture 结算为 `installState=failed` 并带明确 `error`。Host `authenticateConnector`（US1 T018／FR-002）仅把密钥存入 Host `dsh-credentials`（从不写入 journal／dump；聊天粘贴不是主路径），达到 `authState=ready` 后经 `dsh-mcp-client` 把 Pass MCP fixture 工具绑定到 `ctx.tools`（`mcp__<serverName>__<tool>`）。Host `invokeConnectorTool` 执行已绑定工具并返回可观察的 `ConnectorToolCall`（`outcome=success|error`；FR-003／FR-016——不按 LLM 回复措辞计分）。`describeConnectorCredential` 保持无密钥值（FR-007）。Remote：`listConnectorCatalog`、`listConnectors`、`installConnector`、`authenticateConnector`、`invokeConnectorTool`、`describeConnectorCredential`；`agentTeams/view.connectors` 投影持久行。Electron Main 不得发明连接器／凭据值 SoT。

`modelAssignmentsAreDistinct` 在与 `requiredModelSelection` 相同的 trim 之后比较两个赋值。可选的推理强度不会使它们不同。缺少任一 id 的行不是赋值，subagent 后端 id 仍留在 `provider`。

roster 显示每个成员的职责（`lead` 或 `teammate`）与当前状态：`running`、`idle`、`inactive`（存在但未加载的成员）、`provisioning` 或 `failed`。未加载的成员会在唤醒后收到其消息。

只有 Lead 可以创建 teammate 或中断它们。

### teammate 之间的消息

任何成员都可以向任何其他成员或 Lead 发送消息。live 成员会立即收到；离线成员的消息会排队，并在其恢复后到达。消息不会丢失，也不会重复投递。

每条消息都使用 Steer：running target 在最近的步骤边界收到消息，idle target 启动一个轮次，inactive teammate 则冷恢复。发送方始终能看到结果——target inbox 已接受，或在投递暂时不可用时保留为 queued。排队的消息已经安全存储，因此绝不能重发。

### 共享任务板

任何成员都可以添加任务，包含标题、详情、对其他任务的可选依赖，以及可选的文件触及提示。只有其全部依赖完成后，任务才可 claim。

任务有 owner：成员 claim 任务开始工作，完成后标记完成、释放回板或重新打开；Lead 可以把任务分配给任意成员。每次变更都是 compare-and-set：基于过期副本的更新会被拒绝，因此两个成员不会悄悄覆盖彼此的成果。

当两个 in-progress 任务计划触及重叠路径时，文件提示会产生警告——它们绝不阻止任何操作。已删除任务保留在历史中，但从活动列表中消失。

### 等待与中断

成员可以等待下一次团队变化——teammate 的状态、新消息或任务更新——而不必反复轮询；等待只报告是否超时，调用方随后重新读取当前状态。

Lead 可以停止 teammate 的当前轮次，而不会删除其排队的消息；任务归属不变。

### 成功与失败的表现

成功的表现是：teammate 出现在 roster 中、消息报告 `accepted` 或 `queued`、任务 revision 随每次变更递增。可能的失败会以具体错误报告，而不会悄悄破坏状态：发给不存在的成员名字、claim 尚未就绪的任务、用过期 revision 编辑、或超出成员上限创建 teammate。

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现细节——点击展开</summary>

本节解释服务背后的设计决策并指出实现它们的代码位置；可观察行为已在[使用本包](#use-this-package)中完整说明。

### 设计理念

本服务建立在一个分离与三项承诺之上：

- **持久日志，派生状态。** Lead 会话日志是唯一真源；roster、mailbox 与任务状态每次读取都从中回放。
- **进程内归属。** 所有协作都位于单一进程；保证是重试加去重，绝不是跨进程共识。
- **显式权限。** 每个服务方法都接收确切的实时调用方 `Agent`；只有 Lead 可以 spawn、reassign 或 interrupt。
- **超出上限时明确失败。** 每个限制都是经过校验的部署值，耗尽时报告类型化错误，而不是复用 id 或名字。

[Agent Teams Agent Note](../../../.agents/notes/implemented/feature/2026-08-05-agent-teams.zh.md)负责身份、mailbox、任务与共享 checkout 决策。

### 源码地图

| 文件 | 职责 |
|---|---|
| [`src/index.ts`](src/index.ts) | 插件入口：`Config` schema、服务注册、恢复调度 |
| [`src/roster.ts`](src/roster.ts) | Team 身份、成员关系解析、provisioning 与 roster 拆除 |
| [`src/mailbox.ts`](src/mailbox.ts) | 持久队列、目标本地投递、确认与恢复 |
| [`src/delivery-state.ts`](src/delivery-state.ts) | 从 Lead + 目标会话日志观察产品侧 `deliveryState` |
| [`src/host-mailbox-message.ts`](src/host-mailbox-message.ts) | 从持久日志重建产品侧 Host mailbox 字段（`fromBotId` / `toBotId` / `body` / `createdAt` / 仅 Host 的 `source`） |
| [`src/task-board.ts`](src/task-board.ts) | 任务 CAS 命令、DAG 校验与派生视图 |
| [`src/journal.ts`](src/journal.ts) | 串行化的 Lead 日志事务与提交通知 |
| [`src/projection.ts`](src/projection.ts) | 解码并校验 Team 事件的严格回放投影；`projectSkillCatalog` 映射 Host 技能摘要供 Desktop 发现；成员快照上的 `skillAttachments` 投影给 Client bot overview |
| [`src/persona-bind.ts`](src/persona-bind.ts) | 从持久 Host persona 绑定作用域内 `deployment:persona-prefix` |
| [`src/skill-bind.ts`](src/skill-bind.ts) | 从持久 Host `skillAttachments` + catalog 正文绑定作用域内 `agent-teams:skill-instructions` |
| [`src/memory-bind.ts`](src/memory-bind.ts) | 从持久 Host Memory 目录行绑定作用域内 `agent-teams:memory-recall` |
| [`src/connector-bind.ts`](src/connector-bind.ts) | 精简 Host 连接器目录 + Pass／损坏安装 fixture + MCP 绑定（`dsh-mcp-client`）+ 无密钥值的凭据描述 |
| [`src/activity.ts`](src/activity.ts) | 一次性变更等待者与 dispose（资源释放）时的等待解除 |
| [`src/lifecycle.ts`](src/lifecycle.ts) | 共享准入截止与有界结算 |
| [`src/invariant.ts`](src/invariant.ts) | 在 append 前回放候选事件的不变式伴生插件 |

### Team 身份与 roster

每个普通运行时 root 都是一个隐式 Team 的 Lead，其 `TeamId` 等于 `SessionId`；不存在创建事件，持久状态从第一条成员、消息或任务记录开始。`spawnTeammate()` 先追加并 flush 一条 `provisioning` 成员记录，再要求配置的提供方创建预留 child；提供方失败会追加一条持久的 `failed` 成员。fresh child 不携带 Lead 历史；fork child 只捕获一次 Lead 的已完成 turn 前缀。恢复把未终结的 provisioning 记录对照 child 独立持久化的会话进行对账：直接 parent 与 continuable descriptor 匹配、且初始用户消息已记录则产生 `active`，其他任何情况都产生 `failed`。如果恢复在同进程竞争中先完成，creator 会接受终态，或报告 `TEAM_PROVISIONING_CONFLICT` 并 drain 该 child。名字由第一条 provisioning 记录保留，且永不复用。

### 持久 mailbox

`sendMessage()` 校验 peer 成员关系，追加 `team/message/queued` 并在尝试投递前 flush。目标消息以 `Team message <id> from <name>:` 开头，并在 `TeamMessageSource` 中保留同一 id 与发送者。只有目标会话在 pending inbox 或已记录历史中持久持有消息身份后，才会以 `team/message/delivered` 确认投递。即时准入按目标与持久队列顺序串行化；恢复按同一顺序重新投递 queued-minus-delivered 记录。重试前会同时折叠 live 与持久目标 inbox／历史状态，因此 inbox 已接受但模型尚未 claim 时发生崩溃不会复制消息。该保证是进程内重试加 target 会话去重，而不是跨进程 exactly-once 投递。

产品侧 `deliveryState`（`queued` → `delivered` → `acted` | `visible-pending`）由上述 Lead-log 边与目标 Session 日志通过 `observeMailboxDeliveryState` 重建——绝不来自 Electron IPC。`visible-pending` 表示接收方持有持久 handoff 但尚未产生后续 turn；`acted` 表示 durable team-message receipt 之后出现了 `request/header`。产品侧 Host mailbox 字段（`id`、`fromBotId`、`toBotId`、`body`、`createdAt`、`deliveryState`、`source: { kind: 'host-mailbox' }`）同样由 `readHostMailboxMessage` 重建：别名来自 Lead `team/message/queued` 快照（`senderId`→`fromBotId`、`targetId`→`toBotId`、`content`→`body`）以及 queued 事件的 `time`→`createdAt`；`source` 仅属 Host，绝不可为 Electron IPC。Client 可观测性使用同一重建路径：`projectMailboxHandoffs` 由 Lead 事件与各目标 Session 日志构建 `HostMailboxMessage[]`，并由 `agentTeams/view` 通过 `TeamView.handoffs` 返回（绝非 Main 合成的 IPC）。

投递给 Lead 时直接调用 `Agent.steer()`。投递给 teammate 时使用 continuation owner 的 host-only Steer 路径；该路径会保留 Team 发送者 source，同时授权 Lead-to-child edge 并冷恢复 inactive target。sibling 消息绝不会通过公开的相邻 Agent 消息操作伪装成 Lead。

### 共享任务板

任务是完整版本化快照；每次变更都携带 `expectedRevision`，陈旧调用方会收到 `TEAM_TASK_STALE_REVISION`，而不会覆盖更新的值。数字 `task-<n>` id 的后缀必须是安全整数，id 空间耗尽时报告 `TEAM_TASK_LIMIT`，而不是复用最后一个 id。已删除任务作为 tombstone 保留以供回放与维持 id 稳定，但不占用 `maxTasks`，也不出现在 `listTasks()` 中。`writeScopes` 是规范化后的 workspace 相对前缀；视图会对与 in-progress 任务的重叠发出警告，但绝不阻止 claim 或授予写权限。

### 等待与中断

`waitForChange()` 等待注册之后发生的下一条 roster、task、mailbox 或实时状态边，时长从 10 秒到 1 小时，并且只报告是否超时；运行时 dispose 会释放当前等待。取消会保留 Error reason；非 Error reason 则通过 `TEAM_WAIT_ABORTED` 报告。`interrupt()` 仅限 Lead，委托 continuable-subagent 的 interrupt 路径，以 `keepInbox` 只取消 live teammate 的当前 turn；它既不释放任务 owner，也不删除持久 mail。

### 持久性模型

Team 事件追加到精确的 live Lead 会话，并在操作报告成功或唤醒等待者之前 flush。`team/member`、`team/section`、`team/routine`、`team/memory`、`team/task`、`team/message/queued` 与 `team/message/delivered` 仅存在于日志：它们从不进入会话表面，因此派生模型历史不受协作记录影响。顺序与时间由会话事件的 `seq` 与 `time` 负责，快照不重复保存。`./invariant` 伴生插件把每条候选 Team 事件对照已提交前缀回放，并在 append 前拒绝非法转换。

### Dispose

dispose 会关闭准入、中止并等待已获准的创建、mailbox dispatch 与进行中的 Routine cron fire 事务，再让 continuation owner 释放 roster 中确切的 live direct child 及其后代；Lead 的非 Team continuable child 不受影响。cleanup 失败会让 dispose 明确失败，并以 `disposalTimeoutMs` 为上限。

</details>

-----

<a id="further-exploration"></a>
## 进一步探索

当包级约定不够用时阅读以下页面。它们从共享子系统类型逐步进入工具表面与设计背后的决策。

- [Agent Teams 子系统](../../../docs/subsystems/agent-team.zh.md)——持久 Team 类型与 `ctx.agentTeams` 服务 API。
- [tool-agent-team 包](../tool-agent-team/README.zh.md)——让模型创建 teammate、向其发送消息并进行协调的工具。
- [Agent Teams Agent Note](../../../.agents/notes/implemented/feature/2026-08-05-agent-teams.zh.md)——身份、mailbox、任务与共享 checkout 决策。
- [实验包决策](../../../.agents/notes/implemented/architecture/2026-08-18-experimental-agent-teams-packages.zh.md)——位置、公开发布与依赖隔离。

-----

<a id="model-experience"></a>

### 浏览器 Remote

`TeamService` 除了 roster、mailbox、task 与 lifecycle operation，还拥有生成的 `agentTeams/view`、`agentTeams/createBot`、`agentTeams/renameBot`、`agentTeams/updatePersona`、`agentTeams/setAvatar`、`agentTeams/createSection`、`agentTeams/renameSection`、`agentTeams/assignSection`、`agentTeams/deleteBot`、`agentTeams/createRoutine`、`agentTeams/listRoutinesByBot`、`agentTeams/pauseRoutine`、`agentTeams/resumeRoutine`、`agentTeams/writeMemory`、`agentTeams/listMemories`、`agentTeams/listConnectorCatalog`、`agentTeams/listConnectors`、`agentTeams/installConnector`、`agentTeams/authenticateConnector`、`agentTeams/invokeConnectorTool`、`agentTeams/describeConnectorCredential`、`agentTeams/createTask` 与 `agentTeams/updateTask` Remote method。`agentTeams/view` 返回 roster 行（在存在时投影 displayName、persona、avatar 与 sectionId）、具名 `sections` 与派生 membership、`unassignedBotIds`（clarify lock 4——无 Unassigned 目录行）、未删除任务、`handoffs`（Host mailbox 产品行）、Host 技能目录摘要、Host `routines` 投影、Host `memories` 投影以及 Host `connectors` 投影。`./remote` 导出由 Web UI 挂载的 Client contribution，`./client` 则重新导出可在浏览器 compilation face 中安全使用的 request、view、handoff、身份 mutation 与 task mutation result type。Typert 在外层 `RemoteResult` 中保留 transport failure；create 与 update rejection 则作为 transport 成功响应中的显式 domain result，其中过期的 update revision 会区分为 task conflict。

## 模型体验

### Peer 消息

#### 模型看到什么

每条已投递 peer 消息都是用户角色消息。第一个短文本块包含稳定消息 id 与发送者，之后原样附加发送者的内容块。roster、task 与 mailbox 记录仅存在于日志，绝不进入派生模型历史。

#### Token 影响

每次 peer 投递都会把发送者前缀与消息内容加入 target 历史。任务与 roster 变更不增加模型 token；其面向模型的呈现属于 `@deepseek-ai/dsh-experimental-tool-agent-team` 结果。

#### KV Cache 影响

Peer 消息追加在 target 可复用历史前缀之后。冷恢复会先复用持久对话，再追加尚未投递的消息。

## 已知限制与延期工作

<a id="known-limitations-and-deferred-work"></a>


这些限制说明一支团队目前不能做什么、或哪些方面需要特别的运维关注。它们是当前包约束，不是与其他协作机制的对比。

- **实验原型，无稳定性承诺**——本包公开发布，但孵化期间约定仍可自由变更。
- **单进程、共享 checkout**——成员共享 cwd，修改立即可见；本包不提供 worktree、远端成员、merge 或文件锁。
- **write scope 仅作提示**——Bash、formatter、代码生成器与直接外部写入可以绕过文件版本检查；Lead 必须协调 owner 并检查最终 diff。
- **扁平 roster，Host 身份变更**——只有 Lead 可以创建直接 teammate；kebab `name` 永不复用（含 Host delete 墓碑之后）。Host `updatePersona`、`renameBot`、`setAvatar`、`createSection`／`renameSection`／`assignSection` 与 `deleteBot` 已持久化并投影 persona／displayName／预设 avatar 标记／具名侧边栏 section＋Unassigned／身份移除。Electron Main 不得发明并行身份或 section 存储。
- **不会自动释放 owner**——idle、interrupt、进程退出与工作失败都不会释放任务 owner。
- **mailbox 不保证跨进程 exactly-once**——不支持多个 harness 进程并发操作同一 Team。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者的工作上下文——点击展开</summary>

本开发备注是维护者的工作上下文，明确不具权威性。

#### Promotion

promotion 到产品角色组需要按[实验子树规则](../AGENTS.md)审查公共约定、限制、测试证据、发布载荷、运行时依赖与具名稳定 owner。

#### 未来方向

尚未决定的探索方向包括嵌套 Team、自动释放 owner 的策略、跨进程 mailbox 事务，以及通过 worktree 实现文件系统隔离；这些都没有承诺。

</details>
