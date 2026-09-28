# T002 — Host sandboxed Shell + sandbox-local + tool-bash/pwsh (Setup inventory)

**Status:** Inventory complete (Setup; no product behavior change)
**Owners:** DH Runtime (author) · DH Verifier (rerun readability) · PO (scope)
**Linear:** Setup parent [MOH-356](https://linear.app/momadhoun/issue/MOH-356) · epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350) · project **DeepSeek Harness - Cursor** (`P-MOH-2`) only — never GrokBot
**Acceptance slice:** Setup T002 — map Host sandboxed Shell composition against [data-model.md](../data-model.md) `BoxBackend` / `ShellBoxToolCall` (research R1/R2 · Architect Path A · [contracts/shell-box.md](../contracts/shell-box.md))
**Branch:** `cursor/p7-setup-runtime-dc28`
**Measured tip:** `origin/master` @ `6fa18cfcfe`
**Surfaces inventoried:** `packages/shell/**`, `packages/sandbox/sandbox-local/`, `packages/bundle/base/cordis.patch.yml`, `packages/bundle/web-app/cordis.patch.yml`, `packages/preset/agent-presets/presets/{standard,cordis}/agent.cordis.yml`, `apps/desktop-host/`

## Measurable Done (this doc)

| Check | Pass bar |
|-------|----------|
| Files covered | Shell seam + sandbox-local + bash/pwsh sandbox executors + tool-bash/pwsh + Desktop Host boot / profile composition listed with current APIs and gaps |
| Gap vs data-model | Every `BoxBackend` / `ShellBoxToolCall` field marked **absent** / **mapped** / **present** |
| Preferred readiness SoT | Named Host-owned home for `BoxBackend.readiness` (settings document field + Host probe owner) |
| Pass Shell stack | Path A packages named as the Verifier-reachable local path |
| Non-goals honored | No Electron Main Shell SoT; no T007+ product mounts; no rewrite of `specs/001`–`006`; no `MzM-Docs/` edits |

---

## Data-model target (P7 BoxBackend / ShellBoxToolCall)

From [data-model.md](../data-model.md):

| Field | Target | Today (measured @ `6fa18cfcfe`) |
|-------|--------|----------------------------------|
| `BoxBackend.boxId` | Branded opaque Host id (or singleton) | **Absent** — no box entity; Host local cwd / sandbox policy world is implicit |
| `BoxBackend.readiness` | `not_ready` \| `starting` \| `ready` \| `failed` | **Absent** as product SoT — executor failures surface as `SANDBOX_UNAVAILABLE` / tool errors, not a projected readiness enum |
| `BoxBackend.local` | `true` for Pass | **Mapped** — Path A Pass = Host sandboxed Shell on Desktop Host process (research R2); no brokered remote required |
| `BoxBackend.updatedAt` | Timestamp | **Absent** |
| `ShellBoxToolCall.callId` | Opaque id | **Mapped** — tool-call id from `dsh-tools` execution pipeline |
| `ShellBoxToolCall.boxId` | → BoxBackend | **Absent** — singleton Host world implied |
| `ShellBoxToolCall.botId` | → Bot | **Mapped** — Agent / Agent Teams member identity on Desktop |
| `ShellBoxToolCall.toolName` | `bash` / `pwsh` | **Present** — model-facing tools from `dsh-tool-bash` / `dsh-tool-pwsh` |
| `ShellBoxToolCall.outcome` | `success` \| `error` \| `not_ready` | **Partial** — success/error via tool result + session log; **no** first-class `not_ready` outcome gated by BoxBackend |
| `ShellBoxToolCall.visibility` | User-visible success / not-ready / error | **Mapped** for tool success/error cards; readiness chrome **absent** until T011/T025 |

**Architect Path A (locked):** Pass “box” = Desktop Host **local execution world** via `ctx.shell` ← `dsh-bash-sandbox` / `dsh-pwsh-sandbox` + `dsh-sandbox-local` (+ policy) + `dsh-tool-bash` / `dsh-tool-pwsh`. Not PTC-as-Shell Pass. Not Electron Main.

---

## Composition map (Desktop Host)

```text
Electron Main  ──lifecycle IPC only──►  apps/desktop-host (Node)
                                              │
                                              ▼
                              runProfile(profile: 'desktop')
                                              │
              ┌───────────────────────────────┼───────────────────────────────┐
              ▼                               ▼                               ▼
     @deepseek-ai/dsh-base          @deepseek-ai/dsh-web-app     OPTIONAL_BUNDLES
     (host plane Shell stack)       (disables host tool-bash/     (agent-team*)
                                     tool-pwsh; presets remount)
                                              │
                                              ▼
                         agent presets (standard/cordis) remount
                         tool-bash / tool-pwsh per session
```

| Layer | Package / path | Shell-relevant rows |
|-------|----------------|---------------------|
| Desktop Host process | `apps/desktop-host/src/index.ts` | Boots `profile: 'desktop'`; mounts Office + managed skills only — **no** Shell/box plugin of its own |
| Profile bundles | `DESKTOP_PROFILE_BUNDLES` = `dsh-base` + `dsh-web-app` + `OPTIONAL_BUNDLES` (`agent-team-profile`, `agent-team-web-profile`) | Shell substrate from base; tools gated by web-app → presets |
| Host plane (base) | `packages/bundle/base/cordis.patch.yml` | `sandbox` → `dsh-sandbox-local`; `sandbox-policy`; `bash-sandbox` / `pwsh-sandbox` (platform-gated); `tool-bash` / `tool-pwsh` (platform-gated) |
| Web overlay | `packages/bundle/web-app/cordis.patch.yml` | **Disables** host-plane `tool-bash` / `tool-pwsh` (and jobs/fs/…); does **not** disable `bash-sandbox` / `pwsh-sandbox` / `sandbox` |
| Preset plane | `packages/preset/agent-presets/presets/standard/agent.cordis.yml` (cordis twin) | Remounts `tool-bash` (`disabled` on win32) / `tool-pwsh` (`disabled` off win32) |

**Implication for T008 / US1:** Executors + sandbox already load on Desktop Host. Model-visible `bash`/`pwsh` arrive via the session preset, not a new desktop-host dependency. Foundational work is readiness SoT + ensuring the sandboxed stack stays mounted and Verifier-reachable — not inventing a parallel Shell.

---

## File-by-file touch map

### `packages/shell/shell/` — `ctx.shell` Service Definition

| Symbol / area | Role today | P7 note |
|---------------|------------|---------|
| `ShellExecutor` (`src/index.ts`) | Abstract `ctx.shell` service; one provider per context | Path A SoT for Shell execution — Host process only |
| `SHELL_SETTINGS_NAMESPACE = 'shell'` | Shared settings namespace for executor knobs (`timeoutMs`, `cwd`, …) | **Not** BoxBackend readiness; do not overload as Computer Shell row SoT without an explicit readiness field |
| `ShellExecRequest` / `ShellExecSpec` / `ShellRunResult` (`src/types.ts`) | Request → resolve → run/start | Maps to `ShellBoxToolCall` execution mechanics |
| `ShellSandboxInfo` | Per-run `mode` / `denied` / `enforcement` / `runnerFailed` | Feeds tool result facts; distinct from product `BoxBackend.readiness` |

### `packages/shell/bash-sandbox/` + `packages/shell/pwsh-sandbox/` — sandboxed executors

| Concern | Today | P7 implication |
|---------|-------|----------------|
| Package | `@deepseek-ai/dsh-bash-sandbox` / `@deepseek-ai/dsh-pwsh-sandbox` | Path A Pass executors (research R2) |
| Registration | Subclass of local executor; registers as `ctx.shell`; injects `subprocess` + `sandbox` + `sandboxPolicy` | Host plane in `dsh-base`; platform-gated (`bash` off win32; `pwsh` on win32) |
| Fail-closed | Confined mode with no usable runner → `SANDBOX_UNAVAILABLE` (never silent unconfined) | Candidate **signal** for `BoxBackend.readiness=failed` / `not_ready` — product enum still **absent** |
| Unconfined twins | `bash-local` / `pwsh-local` | **Out of Pass path** when sandboxed stack is mounted; keep for non-Desktop / debug |

### `packages/shell/tool-bash/` + `packages/shell/tool-pwsh/` — model-facing tools

| Concern | Today | P7 implication |
|---------|-------|----------------|
| Tool names | `bash` / `pwsh` | `ShellBoxToolCall.toolName` |
| Inject | `tools`, `shell`, `systemPrompt`, `shellEnv` | Consumes Host `ctx.shell` — cards project session-logged results |
| Escalation | `sandbox_permissions` + `justification` via `dsh-sandbox` | Optional beyond Pass; Shell settings row may stay read-only readiness (PO) |
| Desktop mount | Disabled on web-app host plane; remounted by standard/cordis presets | US1 Verifier must drive a session whose preset includes the platform tool |

### `packages/sandbox/sandbox-local/` — local confinement provider

| Concern | Today | P7 implication |
|---------|-------|----------------|
| Package | `@deepseek-ai/dsh-sandbox-local` | Path A box substrate on Host |
| Role | `ctx.sandbox` provider; selects platform runner (linux: bwrap→Landlock; darwin: Seatbelt; win32: ACL) | Pass `local: true` world |
| Fail-closed | `SANDBOX_UNAVAILABLE` when no runner usable | Distinguishes backend failure from command denial — input to readiness projection |
| Policy sibling | `dsh-sandbox-policy` (base row; mode + workspaceRoot) | Default Pass mode follows deployment (`workspace-write` via env in base) |

### `apps/desktop-host/` — Desktop Host process

| Path | Today | P7 gap |
|------|-------|--------|
| `src/index.ts` | `runProfile({ profile: 'desktop', … })`; plugins: Office, managed skills, update-tasks | **No** BoxBackend readiness owner; **no** Shell remount beyond profile |
| `package.json` | Depends on boot / webserver / skills — **not** on shell packages directly | Shell arrives via profile bundles (`dsh-base` → workspace graph) — correct for Path A |
| `src/managed-skills.ts` / `office.ts` | Precedent: Host-plane plugins after profile boot | T007 readiness owner can follow this pattern **or** live as settings-backed Host module |
| Lifecycle IPC | ready / shutdown / update-tasks only | Honor R6: never add `shell-exec` / `box-ready` on Node IPC |

### Persistent / non-Pass shell packages (inventory only)

| Package | Role | P7 Pass |
|---------|------|---------|
| `tool-bash-persistent` / `tool-pwsh-persistent` | PTY persistent shells (sdk-minimal etc.) | **Not** Path A Pass |
| `shell-env` | Host-plane `DSH_*` env facts for tools | Keep; web-app correctly leaves it on host plane |

---

## Preferred readiness SoT (analyze A1 — pick)

### Preferred — Host settings document field + Desktop Host probe owner

| Fact | Detail |
|------|--------|
| Shape | Persist `BoxBackend` fields (`readiness`, `local: true`, `updatedAt`, optional singleton `boxId`) under a Host settings namespace owned by T007 (distinct from executor `shell` knobs, or an explicit Computer/box key set documented in T011) |
| Probe | Desktop Host–owned effect observes sandboxed `ctx.shell` + `ctx.sandbox` availability (starting → ready / failed); updates settings SoT; Client Shell row is **read-only** projection (PO) |
| Why | Aligns with research R1/R4 (Host settings SoT + Computer Shell row); Remotes already project settings; no Electron Main bus |
| Next tasks | T007 define fields + owner · T008 confirm sandboxed mount · T011/T012 Computer settings Remotes · T016/T017 success + not-ready paths |

### Alternate — Remote-only fact without settings persistence

| Fact | Detail |
|------|--------|
| Shape | Host service publishes readiness via authenticated Remote only |
| Why weaker | Shell settings row loses a durable document home; restart/replay story is thinner than settings SoT |
| Use when | Only if T004/T011 invent a stronger Computer document that already embeds readiness — still Host-owned |

**Reject:** Electron Main readiness store; Client-local SoT; deriving Pass solely from Plugins shell cards without Host readiness.

---

## Gaps vs Foundational / US1 tasks

| Gap | Blocks | Notes |
|-----|--------|-------|
| No `BoxBackend.readiness` enum / projection | T007, T017, SC-001 gating | Must invent Host SoT; sandbox errors alone are not the product enum |
| No `outcome=not_ready` first-class mapping | T017 | Map attempts while not ready to clear UI + non-Pass |
| Desktop Host has no readiness plugin | T007 / T012 | Follow managed-skills mount pattern or settings section install |
| Verifier must use preset with `tool-bash`/`tool-pwsh` | T016, Scenario 1 | Host-plane tools stay disabled under web-app by design |
| Cloud Agent sandbox runners | Verifier env | Inventory host may lack `bwrap` on PATH; Landlock addon may need built `node-addon-system` — Foundational/Verifier must confirm runner usable before scoring SC-001 Fail as product |

---

## Path A honor checklist (this inventory)

| Lock | Honored? |
|------|----------|
| Host SoT for Shell/box | Yes — composition on Desktop Host via `dsh-base`; no Main Shell SoT found |
| Sandboxed Shell Pass stack | Yes — packages + base rows named |
| No Electron Main Shell bus | Yes — desktop-host IPC is lifecycle-only today |
| No T007+ product mounts in this PR | Yes — inventory only |
| No rewrite `specs/001`–`006` | Yes |

---

## Out of this stamp

- No BoxBackend types, Remotes, or readiness probes
- No Desktop profile patch changes
- No tool/preset remounts
- No `MzM-Docs/` edits
- No host-protocol edits (DH Electron T013–T014)
