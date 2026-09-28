# Research: Phase 7 — Computer / box + subagent parity + settings chrome

**Feature**: `specs/007-box-subagent-settings`
**Date**: 2026-09-28
**Inputs**: [spec.md](./spec.md) (Clarified Session 2026-09-28) · `MzM-Docs/mzm-bot-plan.md` §4 P7 · `MzM-Docs/mzm-bot-initial-plan.md` §7 / §11 · constitution v1.0.0 · predecessors `specs/001`–`006` · clarify merged PR #230 @ `3c232d67df` · package READMEs for `dsh-shell`, `dsh-bash-sandbox` / `dsh-pwsh-sandbox`, `dsh-computer-use`, experimental Cua Driver providers, `dsh-subagent`, `dsh-sandbox` · **DH Architect Path A** (MOH-353 comment `292420d5-3504-4eeb-ac0b-74b61aed1ddd`) · **PO simplest-path locks** (MOH-353 comment `6da26b6f-47dc-483f-a573-d4083fa3cd52`)

All Technical Context unknowns from plan.md are resolved below. Format: Decision / Rationale / Alternatives.

**Clarify locks — do not reopen.** **Architect Path A — do not reopen** (answers former open stamps). **PO simplest-path locks — do not reopen.**

---

## R0 — Clarify locks (binding)

| Lock | Decision |
|------|----------|
| Settings home + labels | Global Settings → **Computer**; rows **Shell** and **Computer use** (locale-owned English dictionary strings) — FR-004 / FR-016 |
| computerUse Pass minimum | Screenshot-only (or equivalent GUI observation) + parent handoff; live interactive browser click/type **NOT** required — FR-003 |
| Box readiness copy | Clear not-ready / starting state distinguishable from ready; exact marketing string **NOT** scored — FR-002 |
| Evidence slices | `verifier/evidence/shell-box/`, `computer-use/`, `settings/` — FR-014 |
| Pass Shell topology | One Verifier-reachable **local** Shell/box tool success; brokered remote optional beyond Pass — FR-011 |
| User machines | OUT — FR-006 |

**Rationale:** Clarify Session 2026-09-28 Q1–Q5 + locked assumptions.

**Alternatives considered:** Per-agent gear alone for settings; interactive-browser Pass gate; fixed marketing readiness string; soft-named evidence dirs — all rejected by clarify.

---

## R1 — Topology: Host SoT; no Electron Main box/shell/computerUse bus (Architect Path A — locked)

**Decision:** Phase 7 product SoT for box readiness, Shell/box tool outcomes, computerUse-class subagent handoff, and Computer settings lives on the **Desktop Host**. Client **projects** over authenticated Host HTTP/WS. Electron Main stays **lifecycle-only** Node IPC + `dsh-app://`. **Forbidden:** parallel Electron Main bus or Main/Client-local durable store as product SoT for box / Shell / computerUse / Computer settings. Host mailbox remains the only product messaging plane.

**Topology one-liner (Architect):**

```text
Electron Main  = lifecycle IPC + dsh-app:// only (no product bus)
Desktop Host   = SoT: ctx.shell + sandbox, ctx.computerUse + subagent, settings document
Client (Web)   = Settings → Computer chrome + tool/subagent presentation over Host HTTP/WS
```

**Rationale:** Constitution V; dual-process freeze from P1–P6; Architect Path A stamp.

**Alternatives considered:** Electron Main owns box/Shell (reject); Client-only SoT (reject); Host SoT + Client projection (**chosen**).

---

## R2 — Local Shell / box = Host sandboxed Shell (Architect — locked)

**Decision:** Pass “box” = Desktop Host **local execution world** (Host cwd / sandbox policy) via existing base path:

- `ctx.shell` through **`dsh-bash-sandbox` / `dsh-pwsh-sandbox`**
- + `dsh-sandbox-local` (+ policy as composed)
- + `dsh-tool-bash` / `dsh-tool-pwsh`

Prove **one** successful local Shell tool invocation with user-visible success (FR-001). LLM wording not scored (FR-015). Readiness: Host-projected ready / starting / failed; attempts while not ready MUST NOT count as Pass (FR-002). Brokered remote / PTC **not** required for Pass (FR-011).

**PO simplest-path:** Shell Settings row = **read-only readiness** sufficient (mutate sandbox policy optional beyond Pass).

**Rationale:** Architect option 1 chosen; simplest DSH reuse; no new Shell Service Definition.

**Alternatives considered:**

| # | Option | Verdict |
|---|--------|---------|
| 1 | Host sandboxed Shell (base path) | **Choose (locked)** |
| 2 | PTC as Shell Pass | Reject — different seam |
| 3 | SSH/remote brokered box for Pass | Reject for Pass — FR-011 local only |
| 4 | Electron Main Shell SoT | Reject — R1 |

---

## R3 — computerUse-class = `ctx.computerUse` + subagent spawn (Architect — locked)

**Decision:** Mount `dsh-computer-use` + **one** provider; delegate via `dsh-subagent` + `dsh-subagent-spawn-in-process` (+ `dsh-tool-subagent`). Screenshot via provider tools → session/attachments. Parent handoff = existing tool-result / addressed-subagent UI. Screenshot-only; no click/type Pass gate (FR-003).

**Provider for Pass (PO + Architect):** Prefer shipped experimental Cua Driver MCP/native when Verifier-reachable; else a **Host-side Pass fixture** that still `register()`s on `ctx.computerUse` and emits a durable user-visible screenshot. Both OK — Spec/tasks pick whichever is Verifier-reachable on Cloud Agent display.

**Rationale:** Architect option 2; clarify screenshot-only lock; reuses computer-use + subagent seams.

**Alternatives considered:**

| # | Option | Verdict |
|---|--------|---------|
| 1 | `ctx.computerUse` + subagent spawn (+ Cua or Host fixture) | **Choose (locked)** |
| 2 | `browser-use` as sole Pass class | Reject — inventory class is computerUse |
| 3 | Electron Main / preload screenshot bus | Reject — topology freeze |

---

## R4 — Settings = Client Computer section over Host settings SoT (Architect — locked)

**Decision:** Client Global `settings.section` **Computer** with locale-owned rows **Shell** and **Computer use**, reading Host settings document namespaces via existing `settings.describe` / scope Remotes (same pattern as Models / Plugins). Per-agent gear alone fails Pass (FR-016). Settings presence MUST NOT substitute for SC-001/SC-002 (FR-005 / SC-004).

**PO simplest-path:** Shell row may be **read-only readiness** (+ optional link into existing Plugins shell card); either OK if **Shell** label visible under Settings → Computer.

**Rationale:** Architect option 3; clarify FR-004/016; P1–P6 settings discipline.

**Alternatives considered:** Plugins host-plane pages alone (reject); Electron Main settings store (reject); Client Computer section over Host SoT (**chosen**).

---

## R5 — Verifier evidence (SO 11+12)

**Decision:** GUI scenarios require desktop screenshots and/or short screen recordings, **committed** under:

| Story | Evidence dir |
|-------|----------------|
| US1 Shell/box | `specs/007-box-subagent-settings/verifier/evidence/shell-box/` |
| US2 computerUse | `…/verifier/evidence/computer-use/` |
| US3 settings | `…/verifier/evidence/settings/` |

Embed in GUI PR bodies via absolute `/opt/cursor/artifacts/…` paths. Unit/jsdom alone fails GUI Pass. Chrome alone fails Phase 7 (FR-005).

**Rationale:** FR-013/014; Architect Verifier Pass paths; standing orders 11+12.

---

## R6 — host-protocol exclusions (Architect — locked)

**Decision:** Extend `apps/desktop/src/host-protocol.ts` exclusion prose (P6 pattern). Forbidden on Node IPC:

| Forbidden family | Names (Architect stamp) |
|------------------|-------------------------|
| Shell | `shell-exec` |
| Box readiness | `box-ready` |
| computerUse | `computer-use-control`, `computer-screenshot` |
| Computer settings | `computer-settings-mutate` |

Credential/secret payloads already forbidden (P6). Data plane remains Host HTTP/WS.

**Rationale:** Architect Path A host-protocol section; R1.

---

## R7 — Linear tracking

**Decision:** Plan issue [MOH-353](https://linear.app/momadhoun/issue/MOH-353) under epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350) on project **DeepSeek Harness - Cursor** (`P-MOH-2`) only. Architect stamp cited from MOH-353 comment `292420d5-…`. Further children only after `/speckit-tasks` → `taskstoissues`. Never DeepSeek Harness - GrokBot. Do not rewrite `specs/001`–`006`. Do not edit `MzM-Docs/` in this plan PR (Lead parallel).

**Rationale:** Constitution §II; user mission.

---

## Seam map (summary)

```text
User (Desktop Client)
    │  Shell/box tool · computerUse-class subagent · Settings → Computer
    │  (Host HTTP/WS Remotes only — locale-owned copy)
    ▼
Desktop Host
    ├── Box readiness SoT (ready / starting / failed)
    ├── ctx.shell ← dsh-bash-sandbox / dsh-pwsh-sandbox + dsh-sandbox-local + tool-bash/pwsh
    ├── ctx.computerUse ← one provider (Cua or Host Pass fixture)
    ├── dsh-subagent + spawn-in-process + tool-subagent → parent handoff
    └── Host settings document → Computer section projection
Electron Main ──► lifecycle IPC only; NO shell-exec / box-ready / computer-use-control /
                  computer-screenshot / computer-settings-mutate bus
```

---

## Architect Path A answers (former open stamps — locked)

| # | Question | Answer |
|---|----------|--------|
| 1 | Shell executor + box substrate | Host sandboxed Shell (`bash-sandbox`/`pwsh-sandbox` + sandbox-local + tools); Pass box = Host local execution world |
| 2 | computerUse provider + subagent | `ctx.computerUse` + one provider (Cua or Host fixture) + subagent spawn-in-process |
| 3 | Settings home | Client `settings.section` Computer over Host settings SoT |
| 4 | host-protocol names | `shell-exec`, `box-ready`, `computer-use-control`, `computer-screenshot`, `computer-settings-mutate` |
| 5 | Fixture homes | Host-side Pass fixture OK for computerUse when Cua unreachable (must `register()` on `ctx.computerUse`) |

**PO simplest-path locks:** (1) Host Pass fixture OK if Cua unreachable; (2) Shell settings row = read-only readiness sufficient.

Implementers MUST NOT invent a competing SoT (Main bus, Client-only catalog, remote-only Pass, PTC-as-Shell-Pass).
