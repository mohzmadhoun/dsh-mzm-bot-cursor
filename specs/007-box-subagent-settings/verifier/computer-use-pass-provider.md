# T009 — computerUse Pass provider (Foundational)

**Status:** Chosen for Foundational / US2 Pass path
**Owners:** DH Runtime (author) · DH Verifier (rerun) · PO (scope)
**Linear:** [MOH-365](https://linear.app/momadhoun/issue/MOH-365) · epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350) · project **DeepSeek Harness - Cursor** (`P-MOH-2`) only
**Branch:** `cursor/p7-foundational-runtime-dc28` · US2 Host path on `cursor/p7-us2-runtime-dc28`
**Contracts:** [computer-use.md](../contracts/computer-use.md) · research R3 · [computer-use-inventory.md](./computer-use-inventory.md)

## Choice

| Field | Value |
|-------|-------|
| Provider home | `apps/desktop-host/src/computer-use-pass-fixture.ts` |
| Mount | `apps/desktop-host/src/computer.ts` → `ctx.plugin(ComputerUseRegistry)` then Pass fixture |
| `register()` name | `desktop-pass-fixture` (`ComputerUseProviderName`) |
| Observation tool | `computer_use_pass_screenshot` (1×1 PNG via MCP image-admission adapter) |
| US2 Host path | `apps/desktop-host/src/computer-use-path.ts` — projects `ComputerUseRun` (observation + spawn handoff) |
| Cua MCP/native | **Not** selected for default Cloud Agent Pass — no `cua-driver` executable on PATH; OS desktop grants unverified |

## Why Host Pass fixture

Inventory preferred fixture #1 when Cua is unreachable. This Cloud Agent / Verifier environment does not ship a reachable `cua-driver` CLI; native Cua remains an experimental package that release Desktop Host must not depend on via `package.json`. The Host fixture still calls `ctx.computerUse.register(...)` and emits a durable screenshot-capable tool result (screenshot-only Pass; interactive browser not required).

## Path A honor

- Mounted on **Desktop Host** after profile boot — not Electron Main
- Exclusive slot via `dsh-computer-use` registry
- Subagent spawn-in-process remains on base profile for parent handoff (T010 / US2 T021)
- Host `installComputerUsePath` projects observation from Pass screenshot + handoff from `subagent/start`–`end` / parent `subagent` tool (T020/T021)
- No Main `computer-use-control` / `computer-screenshot` bus

## Swap note

If Verifier later proves Cua MCP/native reachable on the Cloud Agent display, replace the fixture mount with a profile overlay for `dsh-experimental-computer-use-cua-driver-{mcp,native}` and update this stamp — still one `register()` slot.
