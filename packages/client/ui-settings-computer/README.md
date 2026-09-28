---
description: "Global Settings → Computer page for the dsh web client: Shell readiness (read-only) and Computer use enablement over Host settings Remotes."
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-settings-computer

English | [中文](README.zh.md)

## Summary

The **Computer** Settings page is the Global Settings home for the daily Shell/box and computerUse paths. It registers one locale-owned `settings.section` with English Verifier labels **Computer**, **Shell**, and **Computer use**. The **Shell** row projects Host box readiness read-only. The **Computer use** row writes `computerUseEnabled` through authenticated Host settings Remotes. Neither row invents Client or Electron Main SoT, and Settings chrome alone does not satisfy Shell or computerUse Pass proofs.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

Open Global Settings and select **Computer**. Mount `@deepseek-ai/dsh-client-ui-settings-computer` in a Web composition that already provides the settings shell and `ctx.settingsScope`; the page registers its own navigation entry and needs no configuration. Desktop inherits the Web-app Client bundle row.

### Reading Shell readiness

The Shell row shows Host-projected `readiness` (`not_ready` / `starting` / `ready` / `failed`), locality, and a short hint that not-ready states must not count as Shell tool success. The row has no mutate control; Host owns readiness.

### Toggling Computer use

The Computer use row shows an enablement switch bound to Host `computerUseEnabled`. Writes go through `settingsScope.set` → `remote.settings.mutate` on the `computer` namespace. While the Host namespace is loading, unavailable, or not writable, the switch stays disabled. Presence of this chrome does not grant SC-001 or SC-002.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

The page is one localized `settings.section` contribution with id `computer` and order `12` (between Models and Plugins). The Settings shell owns navigation and mounting.

### Registration and data sources

`apply()` registers the locale namespace, binds `ctx.settingsScope` to namespace `computer` with a Client decoder that narrows Host wire fields, and uses `ctx.slots.inject()` so a late or restored slot declaration still reaches it. Reads ride the shared describe mirror; the only write is `computerUseEnabled`.

### Source map

| File | Role |
|---|---|
| [`src/index.ts`](src/index.ts) | Host loader entry: the page is browser-only, so the plugin body is empty |
| [`src/client/index.ts`](src/client/index.ts) | Browser plugin: locale namespace, section registration, settingsScope bind |
| [`src/client/ComputerSection.tsx`](src/client/ComputerSection.tsx) | The page component: Shell + Computer use rows |
| [`src/client/computer-projection.ts`](src/client/computer-projection.ts) | Host `computer` section types and decoder |
| [`src/client/locales.ts`](src/client/locales.ts) | Chinese and English dictionaries for every visible and accessible string |
| [`src/client/ComputerSection.module.css`](src/client/ComputerSection.module.css) | Page styles |

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

- [ui-settings](../ui-settings/README.md) — the domain base declaring `settings.section` and the namespace scope service.
- [ui-settings-general](../ui-settings-general/README.md) — the Settings shell that renders the navigation and mounts the section.
- [contracts/settings.md](../../../specs/007-box-subagent-settings/contracts/settings.md) — FR-004 / FR-005 / FR-016 Pass bars for this chrome.
- [Desktop Host computer-settings](../../../apps/desktop-host/src/computer-settings.ts) — Host SoT for the `computer` namespace.

-----

<a id="model-experience"></a>
## Model Experience

None, as the package is a browser-side UI plugin layer that registers nothing model-facing.

#### KV Cache effect

None; this package neither assembles nor sends a provider request.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

These limits are current package constraints for Settings → Computer.

- **Shell readiness is read-only** — the page projects Host `readiness` and does not offer a Client mutate path for box start/stop; Host owns that SoT.
- **Settings chrome is not Pass proof** — visible Shell and Computer use rows satisfy SC-003 chrome only; SC-001 and SC-002 still require measured Shell/box and computerUse evidence (FR-005 / SC-004).

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>

**Runtime invariant:** No companion is published. A browser-side settings page that registers one localized `settings.section` contribution and its locale namespace; it emits no Cordis events and owns no cross-plugin mutable relation beyond Host settings Remotes.
