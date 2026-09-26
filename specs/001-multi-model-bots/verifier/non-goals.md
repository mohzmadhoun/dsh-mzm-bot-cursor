# Non-goals absence checks — Phase 1 Wedge A

**Feature:** `specs/001-multi-model-bots`
**Role:** DH Verifier measured confirms for FR-010 (T010) and polish expansion (T039).
**Spec:** [../spec.md](../spec.md) Out of Scope · FR-010
**Research:** [../research.md](../research.md) R7
**Evidence log:** [evidence/t010-t011/measured-checks.txt](./evidence/t010-t011/measured-checks.txt)

## Verdict (T010) — Pass

P1 Desktop Host composition is **chat-oriented for acceptance**: sessions, model/provider use, and Agent Teams mailbox. Local **Box / computer-use** backends are **absent** from Desktop composition. Local **Shell** tool rows remain in `dsh-base` as general coding tools, but **P1 product SC-001…SC-006 MUST NOT require Shell/Box backends** (FR-010).

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

## Explicit non-goals checklist (T010 subset; T039 expands)

| Non-goal | T010 status | Check |
|----------|-------------|-------|
| Box / computer-use backends | **Pass** (absent from Desktop composition) | rg above → no matches |
| Local Shell backends required for P1 acceptance | **Pass** (not required) | No SC recipe depends on bash/pwsh/Box |
| MCP / 1Password vault product UX | Deferred to T039 | — |
| Personas / skills / routines / memory product UX | Deferred to T039 | — |
| Pixel Grok chrome | Deferred to T039 | — |

## How to re-confirm

1. Re-run the evidence capture under [evidence/t010-t011/](./evidence/t010-t011/) (or the `rg` above).
2. Confirm `DESKTOP_PROFILE_BUNDLES` still equals Web template + Agent Teams OPTIONAL_BUNDLES only.
3. Fail T010 if Desktop composition adds `@deepseek-ai/dsh-computer-use`, a Box backend, or any Scenario 1–5 Pass begins requiring Shell/Box.
