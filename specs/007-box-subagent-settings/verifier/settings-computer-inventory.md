# T004 — Client `settings.section` + Host settings Remotes inventory (Setup)

**Status:** Inventory complete (Setup). US3 T024–T025 land Client `ui-settings-computer` over Host Remotes; no Electron Main product SoT.
**Owners:** DH Electron / Client (author) · DH Runtime (Host settings SoT / Remotes) · DH Verifier (SC-003 later) · PO (scope)
**Linear:** Epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350) · tasks gate [MOH-354](https://linear.app/momadhoun/issue/MOH-354) — no invented child ids until `taskstoissues`
**Acceptance slice:** Setup T004 — inventory for [contracts/settings.md](../contracts/settings.md) / research R4 / data-model `ComputerSettingsProjection`
**Branch:** `cursor/p7-setup-electron-dc28`
**Surfaces inventoried:** `packages/client/ui-settings*/src/client/`, `packages/settings/**`, `packages/api/settings-controller/`, `packages/bundle/{base,web-app}/`, `apps/desktop-host/`, `apps/desktop/src/host-protocol.ts`

## Measurable Done (this doc)

| Check | Pass bar |
|-------|----------|
| Section registration pattern named | `ctx.slots.inject('settings.section', …)` with `id` / `order` / locale thunk `label` |
| Models / Plugins / General mapped | Package, section `id`, `order`, Host data path |
| Host Remotes named | `ctx.remote.settings` (`describe` / `update` / `replace` / `mutate`) + `settings/document-updated` |
| Computer package home | Recommend create `packages/client/ui-settings-computer/` (absent today) |
| Electron Main | No Computer-settings product SoT; mutate/list stay Host HTTP/WS |
| Non-goals | No T024/T025 UI implement; no Main IPC keys; no rewrite `specs/001`–`006`; no MzM-Docs edits |

---

## Requirement (FR-004 / FR-005 / FR-010 / FR-016 / SC-003 / SC-004)

From [contracts/settings.md](../contracts/settings.md) + research R4 / Architect Path A:

- Global Settings → **Computer** with locale-owned rows **Shell** and **Computer use**.
- Client projects over Host settings document / Remotes; per-agent gear alone fails FR-016.
- Shell row may be **read-only readiness** (PO).
- Settings chrome MUST NOT substitute for SC-001 / SC-002 (FR-005 / SC-004).
- Electron Main: no Computer-settings product SoT on Node IPC.

---

## Client settings shell topology

| Layer | Package | Role |
|-------|---------|------|
| Domain base | `packages/client/ui-settings` | Declares `SlotMap` for settings slots; provides `ctx.settingsScope` + shared `settings.describe` mirror; `ctx.settingsShell` navigation face |
| Shell chrome | `packages/client/ui-settings-general` | Occupies `sidebar.settings`; declares runtime children including `settings.section`; projects ledger → nav; mounts active section |
| Feature sections | `ui-settings-models`, `ui-settings-plugins`, … | Each `slots.inject('settings.section', …)` once the shell declares the slot |

**Contract home:** `packages/client/ui-settings/src/client/contract/slots.ts` — `'settings.section': { kind: 'list'; scope: 'root'; owner: SettingsSectionOwnerProps }` with owner prop `close()`.

**Shell mount:** `ui-settings-general` `SettingsRoot` registers `sidebar.settings` with children `settings.trigger` / `header` / `action` / `close` / `section` / `onboarding`, then renders `renderSlot('settings.section', { close }, { only: active })`.

**Composition:** Desktop inherits Web template bundles (`dsh-base` + `dsh-web-app`). Client rows live in `packages/bundle/web-app/cordis.patch.yml` (`ui-settings`, `ui-settings-general`, `ui-settings-models`, `ui-settings-plugins`, …). `apps/desktop-host/` adds Host-only glue (office / managed-skills / update-tasks) — **no** settings UI and **no** Computer section code today.

---

## Existing `settings.section` registrations (Models / Plugins / General + siblings)

| Section `id` | `order` | Package `apply` | English nav | Host / Client data path | Children / notes |
|--------------|---------|-----------------|-------------|-------------------------|------------------|
| `general` | `0` | `ui-settings-general/src/client/index.ts` | General (`settings` / `general.nav`) | Item rows own their Remotes; section itself is chrome | Declares `settings.general.item` list |
| `models` | `10` | `ui-settings-models/src/client/index.ts` | Models (`settings.models` / `nav`) | `remote.settings` + `remote.credentials` + `remote.llm` via page store / schema ops; invalidations on `settings/document-updated`, credentials, adapters | `settings.models.provider-card`, `settings.models.footer`; also onboarding steps |
| `plugins` | `15` | `ui-settings-plugins/src/client/index.ts` | Built-in plugins (`settings.plugins` / `nav`) | `settingsScope.describe()` gates host-plane cards when namespaces are served | Declares `settings.plugins.tab`; cards register `plugins.item` for `shell`, `agent-loop`, `subagent`, `web-search-deepseek` |
| `agent-presets` | `20` | `ui-agent-preset/src/client/index.ts` | Agent presets | `remote.settings` + `remote.agentPresets` | Sibling (not under `ui-settings*`); ordered after Models |
| `archived-sessions` | `25` | `ui-settings-unarchive-sessions/src/client/index.ts` | Archived sessions | Workspace unarchive (not settings document) | Minimal section pattern |

**Canonical registration shape** (Models simplified):

```ts
ctx.slots.inject('settings.section', () => ctx.slots.register({
  name: 'settings.section',
  id: 'models',          // stable nav / `only` key
  order: 10,             // ascending nav position
  label: () => t('nav'), // locale thunk; shell re-resolves on locale revision
  inject: injected,      // plain data/callbacks; components never see ctx
  children: { /* optional nested slots */ },
}, ModelsSection))
```

**Services typical inject list:** `slots`, `locale`, `remote`, `remote.settings`, `settingsScope` (+ feature Remotes). Domain base `ui-settings` owns the one `settings.describe` reader (`SettingsDescribeMirror`) and refreshes on `settings/document-updated` + `connection/reset`.

**Row patterns inside a section:**

| Pattern | Example | Fit for Computer |
|---------|---------|------------------|
| Nested list slot (`settings.general.item`) | Language / Appearance / Enter behavior | Good for **Shell** + **Computer use** as two labeled rows under one Computer page |
| Section-owned tabs (`settings.plugins.tab`) | Plugins inventory vs config tabs | Overkill for two Pass rows |
| Inline section body | Models form; Archived sessions | OK if rows stay clearly labeled Shell / Computer use |

**Stable Models id export:** `MODELS_SECTION_ID = 'models'` in `ui-settings/src/client/settings-shell.ts` for cross-plugin `settingsShell.openSection`.

---

## Recommended Computer section home (T024 / T025 — not implemented here)

| Decision | Recommendation | Rationale |
|----------|----------------|-----------|
| Package | **Create** `packages/client/ui-settings-computer/` (`@deepseek-ai/dsh-client-ui-settings-computer`) | Matches tasks Path Conventions; package **ABSENT** on master; keep feature ownership out of General / Plugins |
| Section id | `computer` | Stable `only` key; English Verifier label **Computer** via locale dict |
| Suggested `order` | `12`–`18` (between Models `10` and Plugins `15`, or just after Plugins before Agent presets) | Daily Shell/computerUse paths should sit near Models/Plugins, not buried under Archived sessions |
| Rows | Locale keys for **Shell** and **Computer use** (English dictionary strings for Verifier) | FR-004 / FR-016 Global Settings — not per-agent gear |
| Shell row behavior | Read-only Host readiness projection sufficient (PO); optional link into existing Plugins `shell` card beyond Pass | Do not treat Plugins Bash card alone as SC-003 |
| Wire path | `ctx.settingsScope` / `ctx.remote.settings.*` only | Architect R4; no Main IPC |
| Bundle wiring | Add `dsh.client` row + dependency in `packages/bundle/web-app/` (Desktop inherits) | Same as Models/Plugins |

**Gap:** No `settings.computer.*` slot types yet. Prefer either (a) Computer-owned child list analogous to `settings.general.item`, typed in `ui-settings` contract when the section package lands, or (b) two hard-coded row components inside `ComputerSection` with locale labels — both satisfy SC-003 if labels are visible under Global Settings → Computer.

---

## Host settings document + Remotes

### `packages/settings/settings` — Service Definition (`ctx.settings`)

| Fact | Detail |
|------|--------|
| Role | Namespace registration, layered resolve, writes, `settings/updated` + `settings/document-updated` |
| Provider abstract | `SettingsProvider` — file provider is the shipped default |
| Computer fields | **None** today — no `BoxBackend` / Computer projection namespace |

### `packages/settings/settings-file` — Document provider

| Fact | Detail |
|------|--------|
| Store | `$DSH_HOME/settings.yaml` (hot-reload) |
| Composition | `packages/bundle/base/cordis.patch.yml` row `settings` → `@deepseek-ai/dsh-settings-file` |
| Desktop | Desktop Host profile boots base + web-app layers → file document is Host SoT for user sections |

### `packages/api/settings-controller` — Typert Remote (`ctx.remote.settings`)

| Remote method | Role for Computer |
|---------------|-------------------|
| `describe()` | Redacted namespace views + schemas — Client mirror / scope reads |
| `update` / `replace` / `mutate` | User-section writes with revision fencing; errors `settings/conflict` \| `settings/rejected` |
| `openSettingsDocument` | Native editor open (loopback / document deployments) |
| `canOpenAgentPresetDirectory` / open preset dir | Agent-preset only — not Computer |

**Composition:** `packages/bundle/web-app/cordis.patch.yml` row `settings-controller`.

**Forwarded event:** `settings/document-updated` on the application Remotes allowlist (`packages/api/remotes/src/remote-events.ts`) — Client pages refresh without polling.

### Existing Host namespace relevant to Shell row

| Namespace | Owner | Client surface today | P7 note |
|-----------|-------|----------------------|---------|
| `shell` (`SHELL_SETTINGS_NAMESPACE`) | `dsh-shell` / local executors via `installSection` | Plugins → Bash card (`ui-settings-plugins`, `SHELL_NS = 'shell'`) — budgets/cwd, **not** box readiness | Pass Computer **Shell** row needs readiness projection (T007/T011); may stay read-only and distinct from Bash config card |
| computer-use | `dsh-computer-use` registry only | **No** settings namespace; **no** Client settings page | T011 must define enablement/config fields (or Remote fact) for **Computer use** row |

### `apps/desktop-host/`

| Surface | Computer settings relevance |
|---------|-----------------------------|
| `src/index.ts` | Boots profile `desktop`; mounts office / managed-skills / update-tasks |
| Settings / Remotes | **Inherited** from base + web-app bundles — no local Computer settings module |
| Gap | T007 / T011 / T012 own Host readiness + Computer document fields + HTTP/WS projection — **blocked for Client row data until Runtime lands SoT** |

---

## Electron Main (inventory only — no SoT)

| Surface | Finding |
|---------|---------|
| `apps/desktop/src/host-protocol.ts` | Lifecycle-only child/control types (`ready` / `fatal` / `shutdown` / `update-tasks`). Comments already exclude prior product buses (mailbox, identity, skills, routines, memory, connectors, credentials). **P7 keys** `shell-exec`, `box-ready`, `computer-use-control`, `computer-screenshot`, `computer-settings-mutate` **not yet named** — T013 |
| `apps/desktop/src/ipc.ts` | Private desktop channels; no Computer-settings product bus observed |
| Data plane | Settings mutate/list via authenticated Host HTTP/WS (`remote.settings`) — matches contracts/settings.md Electron obligations |

**This inventory does not** add Main product SoT, implement Computer UI, or extend host-protocol (T013/T014 are separate Electron foundational tasks).

---

## Gap vs Pass (handoff)

| Gap | Owner | Blocking? |
|-----|-------|-----------|
| Create `ui-settings-computer` + register `settings.section` id `computer` with Shell + Computer use rows | DH Client / Web (T024/T025) | Yes for SC-003 chrome |
| Host `BoxBackend.readiness` SoT + projection | DH Runtime (T007/T012) | Yes for Shell row data (read-only OK) |
| Host Computer settings document fields / computer-use enablement | DH Runtime (T011/T012) | Yes for Computer use row mutate/list; presence projection may be minimal |
| host-protocol P7 exclusion comments + `no-electron-box-shell-computer-bus` | DH Electron (T013/T014) | Yes before US fan-out stamp |
| Evidence under `verifier/evidence/settings/` | DH Verifier (US3) | After UI exists |

**Non-blockers for this inventory:** Plugins Bash card exists but does **not** satisfy FR-016 / SC-003 (wrong home). `ui-settings-computer` absence is expected Setup state.

---

## Traceability

| Artifact | Maps to |
|----------|---------|
| This inventory | T004 Setup |
| contracts/settings.md | FR-004, FR-005, FR-010, FR-016 · SC-003, SC-004 |
| research R4 | Client Computer section over Host settings SoT |
| data-model `ComputerSettingsProjection` | Section + Shell + Computer use observables |
| T013–T014 / T024–T025 | Implement follow-ons — out of T004 scope |
