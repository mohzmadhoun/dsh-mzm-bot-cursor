# T005 — Box / computer / settings seam locks (implementers)

**Status:** Setup seam locks documented (no product behavior)
**Owners:** DH Spec (author) · DH Architect (Path A lock) · DH Verifier (rerun against recipes)
**Linear:** [MOH-361](https://linear.app/momadhoun/issue/MOH-361) · Setup [MOH-356](https://linear.app/momadhoun/issue/MOH-356) · epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350) · project **DeepSeek Harness - Cursor** (`P-MOH-2`) only — never GrokBot
**Acceptance:** research R0–R6 · [contracts/non-goals.md](../contracts/non-goals.md) · Architect Path A · clarify + PO locks
**Branch:** `cursor/p7-setup-spec-dc28`
**Start contracts:** [../contracts/README.md](../contracts/README.md)
**Sources:** Architect MOH-353 comment `292420d5-3504-4eeb-ac0b-74b61aed1ddd` · PO MOH-353 comment `6da26b6f-47dc-483f-a573-d4083fa3cd52` · Clarify Session 2026-09-28

## Measurable Done

| Lock | Pass bar | Fail if |
|------|----------|---------|
| Host SoT topology | Box readiness, Shell/box outcomes, computerUse handoff, Computer settings live on **Desktop Host**; Client projects over Host HTTP/WS | Electron Main or Client-only durable store is product SoT |
| Local Shell / box Pass | Host sandboxed `ctx.shell` (`dsh-bash-sandbox`/`dsh-pwsh-sandbox` + `dsh-sandbox-local` + tool-bash/pwsh); one Verifier-reachable **local** success | PTC-as-Shell Pass; brokered remote required; Main Shell SoT |
| Box readiness | Host-projected `not_ready`/`starting`/`ready`/`failed`; not-ready attempts ≠ Pass | Silent skip; marketing-string-only scoring; not-ready counted as SC-001 |
| computerUse-class Pass | `ctx.computerUse` + **one** provider (Cua when reachable **or** Host Pass fixture that `register()`s) + subagent spawn-in-process; screenshot-only + parent handoff | Interactive browser click/type required; Main screenshot bus; browser-use as sole class |
| Settings → Computer | Client Global `settings.section` **Computer** with locale-owned rows **Shell** + **Computer use** over Host settings SoT | Per-agent gear alone; Plugins page alone; Main settings store |
| Shell row (PO) | Read-only readiness projection sufficient | Mutate-sandbox required for Pass when readiness row is present |
| Chrome ≠ substitute | SC-003 alone MUST NOT grant SC-001/SC-002 | Settings chrome scored as Phase Done |
| host-protocol exclusions | Forbid `shell-exec`, `box-ready`, `computer-use-control`, `computer-screenshot`, `computer-settings-mutate` on Node IPC | Those names/payloads travel Main↔Host IPC |
| Evidence slices | GUI evidence committed under `verifier/evidence/{shell-box,computer-use,settings}/` + PR embeds | Unit/jsdom alone for GUI Pass; soft-named evidence dirs |

---

## Lock detail (research crosswalk)

### 0. Clarify locks — R0 (do not reopen)

| Lock | Decision |
|------|----------|
| Settings home + labels | Global Settings → **Computer**; rows **Shell** and **Computer use** (locale-owned English for Verifier) — FR-004 / FR-016 |
| computerUse Pass minimum | Screenshot-only (or equivalent GUI observation) + parent handoff; live interactive browser click/type **NOT** required — FR-003 |
| Box readiness copy | Clear not-ready / starting ≠ ready; exact marketing string **NOT** scored — FR-002 |
| Evidence slices | `shell-box/` · `computer-use/` · `settings/` — FR-014 |
| Pass Shell topology | One Verifier-reachable **local** Shell/box tool success; brokered remote optional beyond Pass — FR-011 |
| User machines | OUT — FR-006 |

### 1. Topology: Host SoT; no Electron Main bus — R1

```text
Electron Main  = lifecycle IPC + dsh-app:// only (no product bus)
Desktop Host   = SoT: ctx.shell + sandbox, ctx.computerUse + subagent, settings document
Client (Web)   = Settings → Computer chrome + tool/subagent presentation over Host HTTP/WS
```

**Forbidden:** parallel Electron Main bus or Main/Client-local durable store as product SoT for box / Shell / computerUse / Computer settings. Host mailbox remains the only product messaging plane.

### 2. Local Shell / box = Host sandboxed Shell — R2

Pass “box” = Desktop Host **local execution world** via:

- `ctx.shell` through **`dsh-bash-sandbox` / `dsh-pwsh-sandbox`**
- + `dsh-sandbox-local` (+ policy as composed)
- + `dsh-tool-bash` / `dsh-tool-pwsh`

Prove **one** successful local Shell tool invocation with user-visible success (FR-001). LLM wording not scored (FR-015). Brokered remote / PTC **not** required for Pass (FR-011).

**PO simplest-path:** Shell Settings row = **read-only readiness** sufficient (mutate sandbox policy optional beyond Pass).

### 3. computerUse-class = `ctx.computerUse` + subagent spawn — R3

Mount `dsh-computer-use` + **one** provider; delegate via `dsh-subagent` + `dsh-subagent-spawn-in-process` (+ `dsh-tool-subagent`). Screenshot via provider tools → session/attachments. Parent handoff = existing tool-result / addressed-subagent UI. Screenshot-only; no click/type Pass gate (FR-003).

**Provider for Pass (PO + Architect):** Prefer shipped experimental Cua Driver MCP/native when Verifier-reachable; else a **Host-side Pass fixture** that still `register()`s on `ctx.computerUse` and emits a durable user-visible screenshot. Both OK — Spec/tasks pick whichever is Verifier-reachable on Cloud Agent display.

### 4. Settings = Client Computer section over Host settings SoT — R4

Client Global `settings.section` **Computer** with locale-owned rows **Shell** and **Computer use**, reading Host settings document namespaces via existing `settings.describe` / scope Remotes (same pattern as Models / Plugins). Per-agent gear alone fails Pass (FR-016). Settings presence MUST NOT substitute for SC-001/SC-002 (FR-005 / SC-004).

**PO simplest-path:** Shell row may be **read-only readiness** (+ optional link into existing Plugins shell card); either OK if **Shell** label visible under Settings → Computer.

### 5. Verifier evidence — R5 / SO 11+12

| Story | Evidence dir |
|-------|----------------|
| US1 Shell/box | `specs/007-box-subagent-settings/verifier/evidence/shell-box/` |
| US2 computerUse | `…/verifier/evidence/computer-use/` |
| US3 settings | `…/verifier/evidence/settings/` |

Embed in GUI PR bodies. Unit/jsdom alone fails GUI Pass. Chrome alone fails Phase 7 (FR-005).

### 6. host-protocol exclusions — R6

Extend `apps/desktop/src/host-protocol.ts` exclusion prose (P6 pattern). Forbidden on Node IPC:

| Forbidden family | Names (Architect stamp) |
|------------------|-------------------------|
| Shell | `shell-exec` |
| Box readiness | `box-ready` |
| computerUse | `computer-use-control`, `computer-screenshot` |
| Computer settings | `computer-settings-mutate` |

Credential/secret payloads already forbidden (P6). Data plane remains Host HTTP/WS.

### 7. Architect Path A answers (former open stamps — locked)

| # | Question | Answer |
|---|----------|--------|
| 1 | Shell executor + box substrate | Host sandboxed Shell (`bash-sandbox`/`pwsh-sandbox` + sandbox-local + tools); Pass box = Host local execution world |
| 2 | computerUse provider + subagent | `ctx.computerUse` + one provider (Cua or Host fixture) + subagent spawn-in-process |
| 3 | Settings home | Client `settings.section` Computer over Host settings SoT |
| 4 | host-protocol names | `shell-exec`, `box-ready`, `computer-use-control`, `computer-screenshot`, `computer-settings-mutate` |
| 5 | Fixture homes | Host-side Pass fixture OK for computerUse when Cua unreachable (must `register()` on `ctx.computerUse`) |

**PO simplest-path locks:** (1) Host Pass fixture OK if Cua unreachable; (2) Shell settings row = read-only readiness sufficient.

Implementers MUST NOT invent a competing SoT (Main bus, Client-only catalog, remote-only Pass, PTC-as-Shell-Pass).

---

## Spot-check recipe note (Verifier)

1. **Fail if** product or recipe treats Electron Main store, Client-only SoT, PTC-as-Shell Pass, remote-only Pass, interactive-browser Pass gate, or per-agent gear alone as Pass.
2. **Fail if** Settings → Computer chrome alone is scored as Phase Done (SC-004).
3. **Fail if** not-ready Shell attempts are scored as SC-001.
4. **Fail if** computerUse Pass requires live click/type.
5. **Pass only if** evidence uses Host sandboxed Shell + Host computerUse/subagent + Host settings SoT + Client HTTP/WS projections as locked above.
6. GUI scenarios still need FR-013/014 desktop media committed under named evidence slices + PR embeds (SO 11+12).

## Regression guard wording

> P7 Pass path is **Host sandboxed Shell** (one local tool success + readiness), **`ctx.computerUse` + one provider (Cua or Host fixture) + spawn-in-process** (screenshot-only + parent handoff), and **Client Settings → Computer** rows **Shell** + **Computer use** over Host settings SoT (**Shell** may be read-only readiness). Electron Main has no `shell-exec` / `box-ready` / `computer-use-control` / `computer-screenshot` / `computer-settings-mutate` bus. Chrome polish ≠ Verifier substitute. User machines, interactive-browser Pass, PTC-as-Shell Pass, and full Grok Computer catalog are Out.

## Non-overlap

- T001 owns design-tree stamp — [design-tree-complete.md](./design-tree-complete.md).
- T002 / T003 / T004 own inventory files — not this doc.
- T006 owns `verifier/README.md` scenario map — **DH Verifier** (Spec does not draft while Verifier is unlocked).
- T013–T014 own host-protocol + no-Electron-bus regression — later foundational.
- Non-goals recipe T028 expands [contracts/non-goals.md](../contracts/non-goals.md) for SC-005.
