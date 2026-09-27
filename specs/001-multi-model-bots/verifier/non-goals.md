# Non-goals absence checks — Phase 1 Wedge A

**Feature:** `specs/001-multi-model-bots`
**Role:** DH Verifier measured confirms for FR-010 (T010) and explicit Out of Scope polish (T039).
**Spec:** [../spec.md](../spec.md) Out of Scope · FR-010
**Research:** [../research.md](../research.md) R4 · R5 · R7
**Plan:** [MzM-Docs/mzm-bot-plan.md](../../../MzM-Docs/mzm-bot-plan.md) P1 Out / P6 connector deferral
**Evidence log (T010 baseline):** [evidence/t010-t011/measured-checks.txt](./evidence/t010-t011/measured-checks.txt)

## Verdict

| Slice | Verdict | Scope |
|-------|---------|-------|
| **T010** FR-010 Box/Shell | **Pass** | Chat-oriented Desktop composition; Shell/Box not required for SC-001…SC-006 |
| **T039** Out of Scope absence checks | **Pass** (documented) | MCP/1Password vault, personas/skills/routines/memory product UX, pixel Grok chrome — absence rules below |

P1 Desktop Host composition is **chat-oriented for acceptance**: sessions, model/provider use, and Agent Teams mailbox. Local **Box / computer-use** backends are **absent** from Desktop composition. Local **Shell** tool rows remain in `dsh-base` as general coding tools, but **P1 product SC-001…SC-006 MUST NOT require Shell/Box backends** (FR-010). Remaining Out of Scope rows are **product UX absences**: harness infrastructure may exist without making those surfaces Phase 1 acceptance dependencies.

### Global Pass / Fail (T039)

**Pass** when every checklist row below holds and no Scenario 1–5 (SC-001…SC-006) recipe **requires** an Out of Scope surface to Pass.

**Fail** T039 (and reopen the owning FR / Scenario) if any of:

- Desktop composition adds `@deepseek-ai/dsh-computer-use`, a Box backend, or `@deepseek-ai/dsh-mcp-client` as a shipped product mount
- A Phase 1 product Scenario Pass begins requiring Shell/Box, MCP connector productization, 1Password/connector vault, personas/job/voice/anti-jobs UX, skills library UX, routines product UX, memory productization UX, or pixel Grok chrome
- Credential primary path becomes 1Password / external vault instead of in-app Models (FR-008/009)

## Desktop profile composition (measured)

| Layer | Source | Bundles |
|-------|--------|---------|
| Web template | `PROFILE_TEMPLATES.web` in `packages/boot/app-boot/src/profile.ts` | `@deepseek-ai/dsh-base`, `@deepseek-ai/dsh-web-app` |
| P1 Agent Teams | `OPTIONAL_BUNDLES` (same file) | `@deepseek-ai/dsh-experimental-agent-team-profile`, `@deepseek-ai/dsh-experimental-agent-team-web-profile` |
| Desktop init | `DESKTOP_PROFILE_BUNDLES` in `apps/desktop/src/project-manager.ts` | Web template + OPTIONAL_BUNDLES |

**measured:** `apps/desktop-host/` does not declare alternate profile bundles; Host runs the Electron-owned `$DSH_HOME/profiles/desktop` composition above.

**measured:** Agent Teams Host patch (`packages/experimental/agent-team-profile/cordis.patch.yml`) inserts `agent-team` + `tool-agent-team` and disables legacy subagent tools — no Box/Shell product backend rows.

## Box / computer-use (measured absence)

**Command (rerunnable):**

```sh
rg -n -i 'computer-use|dsh-box|@deepseek-ai/dsh-box|box-backend' \
  apps/desktop apps/desktop-host \
  packages/experimental/agent-team-profile \
  packages/experimental/agent-team-web-profile \
  packages/bundle/web-app packages/bundle/base \
  --glob '!**/node_modules/**' --glob '!**/lib/**' --glob '!**/README*.md'
```

**Result:** no matches (see evidence log). Desktop P1 composition does **not** mount computer-use or a Box backend package.

## Shell tool stack (measured presence; acceptance non-dependency)

**measured:** `packages/bundle/base/cordis.patch.yml` mounts platform-gated `bash-sandbox` / `tool-bash` and `pwsh-sandbox` / `tool-pwsh`.

**Pass rule for Verifier:** Presence of those base coding tools does **not** fail FR-010. Fail only if a Phase 1 product Scenario (SC-001…SC-006) **requires** local Shell/Box backends or computer-use to Pass. Wedge acceptance paths are chat, model assignment, Host mailbox, progress/final, and in-app credentials.

## MCP / connector productization + 1Password vault (T039)

**Spec Out of Scope:** MCP / connector productization (including 1Password connector vault). Auth primary remains in-app Models ([research R4](../research.md); FR-008/009).

### MCP client mount (measured absence from Desktop composition)

**Command (rerunnable):**

```sh
rg -n '@deepseek-ai/dsh-mcp-client' \
  apps/desktop apps/desktop-host \
  packages/experimental/agent-team-profile \
  packages/experimental/agent-team-web-profile \
  packages/bundle/web-app packages/bundle/base \
  --glob '!**/node_modules/**' --glob '!**/lib/**'
```

**Pass result:** The only Desktop hit is the **absence assertion** in `apps/desktop/tests/profile-mcp.spec.ts` (`expect(...dsh-mcp-client...).toEqual([])`). No composition patch mounts `@deepseek-ai/dsh-mcp-client`.

**measured companion:** `packages/bundle/base` mounts `@deepseek-ai/dsh-mcp-resources` once (shared resource consumer). That is harness MCP resource ownership, **not** MCP/connector product UX. Presence of `mcp-resources` alone does **not** fail T039.

**Optional automated confirm:**

```sh
pnpm exec vitest run apps/desktop/tests/profile-mcp.spec.ts
```

### 1Password / connector vault product UX (measured non-primary)

**Command (rerunnable):**

```sh
rg -n -i '1password|1Password' \
  apps/desktop/src packages/client \
  --glob '!**/node_modules/**' --glob '!**/lib/**' --glob '!**/tests/**'
```

**Pass result:** Hits are **negative guidance only** (MISSING_CREDENTIAL → in-app Models; “not through a 1Password or external vault product flow”) in `packages/client/ui-chat` locale/slots/README. No 1Password connector vault UI, IPC, or credential provider product path.

**Fail:** A Scenario 1/US4 Pass requires 1Password or another external vault as the primary credential entry path.

## Personas / skills / routines / memory product UX (T039)

**Spec Out of Scope:** Personas / job / voice / anti-jobs product UX; Skills library UX; Routines (cron or event-driven); Memory productization / recall UX.

These checks target **product UX surfaces required for Phase 1 acceptance**, not harness primitives that share vocabulary (`personaPrefix` in system-prompt config, base `dsh-skill*` packages, session-log `recall` context forms, `ui-schedule` rows).

### Product-surface absence scan

**Command (rerunnable):**

```sh
rg -n -i \
  'persona.?edit|anti-?job|job.?voice|personas?/?library|skills.?library|SkillsLibrary|skill.?pack.?ux|event.?driven.?routine|routines?/?product|cron.?routine|memory.?product|agent.?memory.?ux|durable.?memory' \
  apps/desktop packages/client \
  --glob '!**/node_modules/**' --glob '!**/lib/**' --glob '!**/tests/**' --glob '!**/README*.md'
```

**Pass result:** no product-surface matches under Desktop / Client product trees.

### Infrastructure vs product (non-failing presence)

| May be present | Why it does **not** fail T039 |
|----------------|-------------------------------|
| `personaPrefix` / `personaSuffix` in bundle system-prompt config | Deployment coding-agent prompt strings, not persona/job/voice/anti-jobs product UX |
| `dsh-skill*` / `ui-skill` / `tool-skill` in base/web-app | Harness skill loading / input triggers; **Skills library UX** remains Out of Scope |
| `ui-schedule` in web-app | Schedule UI primitive; **routines productization** (cron/event-driven product UX) remains Out of Scope |
| Session-log / chat `recall` context forms | Transcript/context plumbing; **memory productization / recall UX** as a product feature remains Out of Scope |

**Fail:** Any SC-001…SC-006 recipe requires persona editing, skills library UX, routines product UX, or memory productization UX to Pass. Basic bot create stays name + model only (spec Assumptions).

## Pixel Grok chrome (T039)

**Spec Out of Scope:** Pixel-perfect Grok chrome parity; chat chrome beyond progress updates + final result delivery.

**Command (rerunnable):**

```sh
rg -n -i 'grok.?chrome|pixel.?perfect.?grok|grok.?bot.?identical' \
  apps/desktop packages/client \
  --glob '!**/node_modules/**' --glob '!**/lib/**'
```

**Pass result:** no matches. Phase 1 UI acceptance is **usable** bot create, model assign, chat progress+final, mailbox handoff visibility, and in-app credentials (FR-006/007) — not Grok visual parity.

**Fail:** A Scenario 4/5 Pass criterion requires pixel Grok chrome or chat chrome beyond progress + final delivery.

## Explicit non-goals checklist (T010 + T039)

| Non-goal | Status | Check |
|----------|--------|-------|
| Box / computer-use backends | **Pass** (absent from Desktop composition) | rg Box section → no matches |
| Local Shell backends required for P1 acceptance | **Pass** (not required) | No SC recipe depends on bash/pwsh/Box |
| MCP connector productization (`dsh-mcp-client` product mount) | **Pass** (absent; profile-mcp asserts empty) | rg MCP + vitest `profile-mcp.spec.ts` |
| 1Password / connector vault product UX | **Pass** (non-primary; negative guidance only) | rg 1Password → Models handoff only |
| Personas / job / voice / anti-jobs product UX | **Pass** (no product surface) | product-surface rg → no matches |
| Skills library UX | **Pass** (no product surface; harness skills OK) | product-surface rg + infra table |
| Routines (cron / event-driven) product UX | **Pass** (no product surface) | product-surface rg + infra table |
| Memory productization / recall UX | **Pass** (no product surface) | product-surface rg + infra table |
| Pixel-perfect Grok chrome | **Pass** (no parity requirement) | rg Grok chrome → no matches |

## How to re-confirm

1. Re-run the evidence capture under [evidence/t010-t011/](./evidence/t010-t011/) (or the Box/Shell `rg` above).
2. Re-run the MCP, 1Password, product-surface, and Grok `rg` commands in this file; optionally `pnpm exec vitest run apps/desktop/tests/profile-mcp.spec.ts`.
3. Confirm `DESKTOP_PROFILE_BUNDLES` still equals Web template + Agent Teams OPTIONAL_BUNDLES only.
4. Fail T010 if Desktop composition adds `@deepseek-ai/dsh-computer-use`, a Box backend, or any Scenario 1–5 Pass begins requiring Shell/Box.
5. Fail T039 if Desktop composition mounts `@deepseek-ai/dsh-mcp-client` as product, credential primary becomes an external vault, or any Scenario 1–5 Pass begins requiring MCP/1Password/personas/skills-library/routines/memory product UX or pixel Grok chrome.
