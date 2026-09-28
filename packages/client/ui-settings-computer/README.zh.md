---
description: "dsh Web 客户端的全局设置 →「电脑」页：只读 Shell 就绪状态，以及经 Host settings Remotes 的 Computer use 启用开关。"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-settings-computer

[English](README.md) | 中文

## 摘要

**电脑（Computer）** 设置页是日常 Shell／box 与 computerUse 路径在全局设置中的入口。它注册一个由 locale 拥有的 `settings.section`，英文验收标签为 **Computer**、**Shell**、**Computer use**。**Shell** 行只读投影 Host box 就绪状态。**Computer use** 行通过已认证 Host settings Remotes 写入 `computerUseEnabled`。两行均不把 Client 或 Electron Main 当作产品 SoT，且仅有设置页 chrome 不能替代 Shell／computerUse 验收证明。

## 目录

- [使用本包](#use-this-package)
- [理解实现](#understand-the-implementation)
- [进一步探索](#further-exploration)
- [模型体验](#model-experience)
- [已知限制与延后工作](#known-limitations-and-deferred-work)
- [开发附注](#dev-note)

-----

<a id="use-this-package"></a>
## 使用本包

打开全局设置并选择 **Computer**。在已提供设置外壳与 `ctx.settingsScope` 的 Web 组合中挂载 `@deepseek-ai/dsh-client-ui-settings-computer`；页面自行注册导航项，无需额外配置。Desktop 继承 Web-app Client bundle 行。

### 读取 Shell 就绪状态

Shell 行展示 Host 投影的 `readiness`（`not_ready`／`starting`／`ready`／`failed`）、是否本地，以及未就绪状态不得计为 Shell 工具成功的提示。该行没有变更控件；就绪状态由 Host 拥有。

### 切换 Computer use

Computer use 行展示绑定 Host `computerUseEnabled` 的启用开关。写入经 `settingsScope.set` → `remote.settings.mutate`，命名空间为 `computer`。当 Host 命名空间处于加载中、不可用或不可写时，开关保持禁用。仅有此 chrome 不能授予 SC-001 或 SC-002。

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现细节 — 点击展开</summary>

该页是一个本地化的 `settings.section` 贡献，id 为 `computer`，order 为 `12`（位于 Models 与 Plugins 之间）。导航与挂载由设置外壳拥有。

### 注册与数据来源

`apply()` 注册 locale 命名空间，将 `ctx.settingsScope` 绑定到命名空间 `computer`（带 Client 解码器收窄 Host 线字段），并使用 `ctx.slots.inject()`，以便迟到或恢复的 slot 声明仍能到达。读取走共享 describe 镜像；唯一写入是 `computerUseEnabled`。

### 源码映射

| 文件 | 角色 |
|---|---|
| [`src/index.ts`](src/index.ts) | Host loader 入口：页面仅浏览器侧，插件体为空 |
| [`src/client/index.ts`](src/client/index.ts) | 浏览器插件：locale、分区注册、settingsScope 绑定 |
| [`src/client/ComputerSection.tsx`](src/client/ComputerSection.tsx) | 页面组件：Shell + Computer use 行 |
| [`src/client/computer-projection.ts`](src/client/computer-projection.ts) | Host `computer` 段类型与解码器 |
| [`src/client/locales.ts`](src/client/locales.ts) | 中英文字典，覆盖全部可见与无障碍文案 |
| [`src/client/ComputerSection.module.css`](src/client/ComputerSection.module.css) | 页面样式 |

</details>

-----

<a id="further-exploration"></a>
## 进一步探索

- [ui-settings](../ui-settings/README.zh.md) — 声明 `settings.section` 与命名空间 scope 服务的领域基座。
- [ui-settings-general](../ui-settings-general/README.zh.md) — 渲染导航并挂载分区的设置外壳。
- [contracts/settings.md](../../../specs/007-box-subagent-settings/contracts/settings.md) — 本 chrome 的 FR-004／FR-005／FR-016 通过标准。
- [Desktop Host computer-settings](../../../apps/desktop-host/src/computer-settings.ts) — `computer` 命名空间的 Host SoT。

-----

<a id="model-experience"></a>
## 模型体验

无。本包是浏览器侧 UI 插件层，不注册任何面向模型的表面。

#### KV Cache 影响

无；本包既不组装也不发送提供方请求。

## 已知限制与延后工作

<a id="known-limitations-and-deferred-work"></a>

以下是设置 → Computer 的当前包约束。

- **Shell 就绪状态只读** — 页面投影 Host `readiness`，不为 box 启停提供 Client 变更路径；该 SoT 由 Host 拥有。
- **设置 chrome 不是验收证明** — 可见的 Shell 与 Computer use 行仅满足 SC-003 chrome；SC-001 与 SC-002 仍需要可度量的 Shell／box 与 computerUse 证据（FR-005／SC-004）。

<a id="dev-note"></a>
### 开发附注

<details>
<summary>维护者工作上下文 — 点击展开</summary>

无。

</details>

**运行时不变量：** 不发布 companion。浏览器侧设置页注册一个本地化的 `settings.section` 贡献及其 locale 命名空间；除 Host settings Remotes 外，不发出 Cordis 事件，也不拥有跨插件可变关系。
