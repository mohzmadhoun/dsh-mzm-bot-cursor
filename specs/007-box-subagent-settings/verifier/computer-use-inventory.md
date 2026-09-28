# T003 — `ctx.computerUse` + Cua providers + Pass fixture + subagent spawn (Setup inventory)

**Status:** Inventory complete (Setup; no product behavior change)
**Owners:** DH Runtime (author) · DH Verifier (rerun readability) · PO (scope)
**Linear:** Setup parent [MOH-356](https://linear.app/momadhoun/issue/MOH-356) · epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350) · project **DeepSeek Harness - Cursor** (`P-MOH-2`) only — never GrokBot
**Acceptance slice:** Setup T003 — map computerUse registry + providers + subagent spawn against [contracts/computer-use.md](../contracts/computer-use.md) / [data-model.md](../data-model.md) `ComputerUseRun` (research R3 · Architect Path A)
**Branch:** `cursor/p7-setup-runtime-dc28`
**Measured tip:** `origin/master` @ `6fa18cfcfe`
**Surfaces inventoried:** `packages/computer-use/computer-use/`, `packages/experimental/computer-use-cua-driver-{mcp,native}/`, `packages/subagent/{subagent,subagent-spawn-in-process,tool-subagent}/`, `packages/bundle/base/cordis.patch.yml`, `packages/experimental/agent-team-profile/`, `apps/desktop-host/`

## Measurable Done (this doc)

| Check | Pass bar |
|-------|----------|
| Files covered | Registry + both Cua providers + subagent spawn/tool path + Desktop Host listed with current APIs and gaps |
| Gap vs data-model | Every `ComputerUseRun` field marked **absent** / **mapped** / **present** |
| Pass provider home | Named preferred Host Pass fixture home **and** Cua reachability note |
| Spawn path | `dsh-subagent` + `dsh-subagent-spawn-in-process` + `dsh-tool-subagent` composition named |
| Non-goals honored | No interactive-browser Pass gate; no Electron Main computer-use bus; no T007+ mounts; no rewrite `001`–`006` |

---

## Data-model target (P7 ComputerUseRun)

From [data-model.md](../data-model.md):

| Field | Target | Today (measured @ `6fa18cfcfe`) |
|-------|--------|----------------------------------|
| `runId` | Opaque id | **Absent** as product entity — subagent run / tool-call ids exist on existing seams |
| `parentBotId` | → Bot | **Mapped** — parent Agent / Team member on Desktop |
| `childId` / handle | Opaque | **Mapped** — `dsh-subagent` continuable / one-shot child ids when spawn path used |
| `capabilityClass` | `computerUse` (product string may differ) | **Absent** as labeled class — registry name only; no Desktop product wiring |
| `observation` | ≥1 screenshot / GUI artifact | **Mapped in providers** — Cua MCP/native admit durable images via MCP result adapter; **unmounted** on Desktop |
| `handoff` | Parent-visible progress/result | **Mapped** — tool-subagent / Team spawn return + session projection; not yet wired to a computerUse child path on Desktop |
| `interactiveBrowser` | Not required `true` for Pass | **N/A** — screenshot-only Pass (FR-003 / R0) |

**Architect Path A (locked):** `dsh-computer-use` + **one** provider (Cua when Verifier-reachable, else Host Pass fixture that still `register()`s) + `dsh-subagent` + `dsh-subagent-spawn-in-process` + `dsh-tool-subagent`. Interactive browser **not** required.

---

## Composition map (today vs Path A target)

```text
TODAY (Desktop profile)
  dsh-base: subagent + spawn-in-process + tool-subagent (host tools later disabled)
  dsh-web-app: disables tool-subagent*
  agent-team-profile: keeps tool-subagent* disabled; inserts tool-agent-team (freshProvider: spawn)
  presets: remount tool-subagent* for standard/cordis sessions
  computer-use: NOT in any shipped bundle / desktop-host plugin

PATH A TARGET (Foundational T009–T010 + US2)
  Mount dsh-computer-use on Desktop Host composition
  Register ONE provider:
      prefer Cua MCP/native when Verifier-reachable
      else Host Pass fixture that ctx.computerUse.register(...) + emits durable screenshot
  Parent bot delegates via spawn (tool-subagent and/or Team spawn backend)
  Pass = screenshot observation + parent-visible handoff (no interactive browser gate)
```

| Layer | computerUse | Subagent |
|-------|-------------|----------|
| `dsh-base` | **Absent** | **Present** — `subagent`, `subagent-spawn-in-process` (`providerName: spawn`), `tool-subagent` (`provider: spawn`, continuable) |
| `dsh-web-app` | **Absent** | Disables host-plane `tool-subagent*` (preset remounts) |
| `agent-team-profile` | **Absent** | Host `tool-subagent*` stay disabled; `tool-agent-team` uses `freshProvider: spawn` / `forkProvider: fork` |
| `apps/desktop-host` | **Absent** | No extra spawn wiring beyond profile |
| Experimental Cua pkgs | Exist; **not** composed on Desktop | N/A |

---

## File-by-file touch map

### `packages/computer-use/computer-use/` — `ctx.computerUse` registry

| Symbol / area | Role today | P7 note |
|---------------|------------|---------|
| `ComputerUseRegistry` (`src/index.ts`) | Cordis service `computerUse`; exclusive `register(name)` via `ctx.effect` | **Service Definition** for Path A — must mount on Desktop Host (T009) |
| `providerName` getter | Current registration including while closing | Readiness / Settings “Computer use” row may project presence |
| `ComputerUseProviderName` (`src/brand.ts`) | Branded provider id | Fixture + Cua must brand names (`cua-driver-mcp`, `cua-driver-native`, or Pass fixture name) |
| Model tools | **None** — registry only | Providers own tools + screenshots |
| Bundle presence | **Not** in `dsh-base` / `dsh-web-app` / desktop-host deps | Explicit Desktop mount required |

### `packages/experimental/computer-use-cua-driver-mcp/` — Cua MCP provider

| Concern | Today | P7 implication |
|---------|-------|----------------|
| npm | `@deepseek-ai/dsh-experimental-computer-use-cua-driver-mcp` | Prefer when Verifier has installed `cua-driver` |
| `register` name | `cua-driver-mcp` | Exclusive slot |
| Tools | MCP bridge under `mcp__cua-driver-mcp__*` | Screenshots via MCP image admission + attachment store |
| Config | `command` (default `cua-driver`), `args` (`[mcp]`), timeouts, reconnect | Needs executable on PATH / absolute path |
| Isolation | Experimental — **release apps must not list it in package.json deps** (`packages/experimental/AGENTS.md`) | Compose via profile patch / optional bundle overlay, not `apps/desktop-host/package.json` dependencies |
| Cloud Agent | No guarantee of installed driver + OS desktop grants | Likely **unreachable** for default Verifier → Host Pass fixture |

### `packages/experimental/computer-use-cua-driver-native/` — Cua native provider

| Concern | Today | P7 implication |
|---------|-------|----------------|
| npm | `@deepseek-ai/dsh-experimental-computer-use-cua-driver-native` | Prefer when native SDK + host desktop permissions work in-process |
| `register` name | `cua-driver-native` | Exclusive slot |
| Dep | `@trycua/cua-driver@0.28.0` | Screenshots as durable attachments; test fixture in `tests/fixtures/cua-driver.ts` models screenshot admission |
| Isolation | Same experimental rule | Profile overlay only — not desktop-host direct dependency |
| Risk | Native crash can take Host process; needs launching-app OS permissions | Verifier Cloud Agent display may lack grants → fixture preferred |

### `packages/subagent/subagent/` — registry + APIs

| Concern | Today | P7 implication |
|---------|-------|----------------|
| Host plane | Mounted in `dsh-base` | Process singleton — stays Host (correct for Path A) |
| Start APIs | `start` / `startContinuable` / list / followup | Parent→child handoff substrate for `ComputerUseRun` |
| Agent Teams | `dsh-experimental-agent-team` injects `subagents`; teammate create uses spawn/fork providers | Alternate parent path; still Host SoT |

### `packages/subagent/subagent-spawn-in-process/` — Path A spawn backend

| Concern | Today | P7 implication |
|---------|-------|----------------|
| Provider name | Default `spawn` (base config `providerName: spawn`) | Research R3 locked backend |
| Behavior | Fresh child, in-process; inherits cwd / LLM route unless overridden | Child can receive computerUse tools when provider mounted on shared Host context |
| Capabilities | `agentOptions`, `toolFilter`, `persona`, `depthLimit`, `outputSchema` | Pass may filter child tools to observation path |

### `packages/subagent/tool-subagent/` — model-facing delegation tool

| Concern | Today | P7 implication |
|---------|-------|----------------|
| Base row | `tool-subagent` → `provider: spawn`, `toolName: subagent`, continuable | Path A parent tool |
| Desktop | Disabled on web-app **and** agent-team-profile host plane; **remounted by standard/cordis presets** | Verifier parent session on `standard`/`cordis` still gets `subagent` unless Team-only tool surface is forced |
| Team overlay | `tool-agent-team` with `freshProvider: spawn` | Valid Host spawn path for Team leads; Path A still names `dsh-tool-subagent` — implementers may use either parent tool as long as spawn-in-process runs and handoff is visible |

### `apps/desktop-host/` — Desktop Host process

| Path | Today | P7 gap |
|------|-------|--------|
| `src/index.ts` | Profile boot + Office + managed skills | **No** `dsh-computer-use`; **no** Cua; **no** Pass fixture plugin |
| Precedent | `managed-skills.ts` / `office.ts` post-boot `ctx.plugin(...)` | Preferred home for Host Pass fixture plugin (non-experimental, Desktop-owned) |
| IPC | ready / shutdown / update-tasks | Forbid `computer-use-control` / `computer-screenshot` on Node IPC (R6; DH Electron T013) |

---

## Host Pass-fixture candidates (pick for T009 / T020)

| # | Candidate | Pros | Cons | Verdict |
|---|-----------|------|------|---------|
| 1 | **`apps/desktop-host/src/` plugin** (e.g. `computer-use-pass-fixture.ts`) mounted from `index.ts` after profile boot | Matches managed-skills precedent; no experimental dep isolation fight; Verifier-reachable without Cua binary; still must `ctx.computerUse.register(...)` + emit durable screenshot | Desktop-only; must also ensure `dsh-computer-use` is loaded in profile/composition first | **Preferred** |
| 2 | New `packages/experimental/computer-use-pass-fixture/` | Mirrors Cua package layout; reusable in unit/composition tests | Experimental isolation: Desktop Host / release bundles **must not** depend via package.json — profile overlay only; easy to violate | Alternate for test-only / optional overlay |
| 3 | Ship Cua MCP/native via Desktop profile overlay when reachable | Real driver; closest to production computerUse | Cloud Agent often lacks `cua-driver` + OS grants; experimental isolation; interactive permissions | **Prefer when Verifier-reachable**; else fall back to #1 |
| 4 | Reuse `browser-use-*` as Pass class | Existing screenshot tools | Research R3 **rejects** browser-use as sole Pass class | **Reject** |
| 5 | Electron Main screenshot IPC | Easy chrome | Violates R1/R6 Host SoT | **Reject** |

**Fixture contract (when #1 chosen):**

1. Mount `@deepseek-ai/dsh-computer-use` on Desktop composition (T009).
2. Pass fixture calls `ctx.computerUse.register(ComputerUseProviderName('<pass-fixture-name>'))`.
3. Registers ≥1 model-facing tool that returns a durable user-visible screenshot (or equivalent GUI artifact) through the normal tool/attachment pipeline (session-logged).
4. Parent path uses spawn (`dsh-tool-subagent` and/or Team `freshProvider: spawn`) so handoff is parent-visible (T021).
5. No Electron Main bus; no interactive browser requirement.

**Cua reachability stamp (this Cloud Agent tip):** No installed `cua-driver` executable observed on PATH; native SDK is a workspace dependency of the experimental package but Host desktop permissions for Verifier are unverified. **Default Pass provider for Foundational/US2 = Host Pass fixture (#1)** unless Verifier later proves Cua reachable and stamps `computer-use-pass-provider.md` otherwise.

---

## Gaps vs Foundational / US2 tasks

| Gap | Blocks | Notes |
|-----|--------|-------|
| `dsh-computer-use` not on Desktop | T009 | Mount registry before any provider |
| No provider registered | T009 / T020 | Fixture or Cua |
| No `ComputerUseRun` product projection | T021 | Observation + handoff must be user-visible |
| Experimental Cua cannot be a desktop-host package.json dependency | T009 wiring | Use profile overlay **or** prefer Host fixture under `apps/desktop-host/` |
| Agent Teams disables host `tool-subagent*` | T010 / T021 | Spawn backend remains; choose parent tool (preset `subagent` vs `tool-agent-team`) explicitly in recipe |
| Attachment store + image-capable model route | Screenshot admission | Required for durable observation (Cua READMEs); fixture must honor same |

---

## Path A honor checklist (this inventory)

| Lock | Honored? |
|------|----------|
| `ctx.computerUse` + one provider | Documented; mount still future (T009) |
| Cua **or** Host Pass fixture that `register()`s | Preferred fixture home named; Cua kept as prefer-when-reachable |
| `dsh-subagent` + spawn-in-process + tool-subagent | Present on base; Desktop tool gating noted |
| Screenshot-only Pass; no interactive browser gate | Documented |
| No Electron Main computer-use bus | No Main SoT found |
| No T007+ product mounts in this PR | Inventory only |

---

## Out of this stamp

- No `dsh-computer-use` / Cua / fixture mounts
- No subagent remounts or Agent Teams tool changes
- No `computer-use-pass-provider.md` (T009 deliverable)
- No `MzM-Docs/` edits
- No rewrite of `specs/001`–`006`
