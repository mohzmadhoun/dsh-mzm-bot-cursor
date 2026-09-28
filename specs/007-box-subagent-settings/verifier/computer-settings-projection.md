# T026 — Host Computer settings projection for Client rows (US3)

**Status:** Host half complete — T011/T012 SoT + Remotes **sufficient**; T026 fills Shell read-only guard + Client row field map
**Owners:** DH Runtime (this stamp) · DH Client / Web (T024/T025 chrome) · DH Verifier (T027 Scenario 3)
**Linear:** [MOH-382](https://linear.app/momadhoun/issue/MOH-382/t026-us3-host-computer-settings-projection-for-client) · Epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350) · project `P-MOH-2` only
**Acceptance slice:** T026 — Host settings document / authenticated HTTP/WS Remotes supply Computer-section fields for Client **Shell** + **Computer use** rows (FR-004 / FR-010 / FR-016); no Electron Main Computer-settings SoT
**Contracts:** [settings.md](../contracts/settings.md) · data-model `ComputerSettingsProjection` · research R4 · [settings-computer-inventory.md](./settings-computer-inventory.md)

## Verdict

**T011/T012 already own** the Host `computer` settings namespace and projection through inherited `remote.settings` (`describe` / `update` / `replace` / `mutate` + `settings/document-updated`). **T026 does not invent a second SoT.** Gap-fill only:

| Gap | Fill |
|-----|------|
| Client row field map | `projectComputerSettingsRows()` — Shell vs Computer use |
| Shell read-only (PO) | Host-owned fields rejected on Remotes mutate; Host probe uses `authorizeComputerHostOwned` |
| Live scope lookup | `getComputerSettingsScope(ctx)` for Host commits after composition |
| packages/settings | **No package change** — generic Remotes already project every registered namespace |

## Host SoT → Client rows (FR-004 / FR-016)

| Client row | Host namespace | Fields | Mutate over Remotes |
|------------|---------------|--------|---------------------|
| **Shell** | `computer` (`COMPUTER_SETTINGS_NAMESPACE`) | `boxId`, `readiness`, `local`, `updatedAt` | **Rejected** (Host probe only) |
| **Computer use** | same | `computerUseEnabled` | **Allowed** (`settings.update` / `mutate`) |

Global Settings → **Computer** section registration and locale labels are **Client T024/T025**. Per-agent gear alone fails FR-016 — Host does not expose a parallel per-agent Computer SoT.

## Wire path (authenticated Desktop Host data plane)

1. Desktop profile mounts `dsh-settings-file` + `dsh-api-settings-controller` (base / web-app bundles).
2. `desktop-computer` registers `computer` and probes readiness into Host SoT.
3. Client pages call `ctx.remote.settings.describe()` / `settingsScope` (same as Models / Plugins).
4. Electron Main has **no** `computer-settings-mutate` product bus (T013/T014).

## Prove (DH Verifier Host half)

```sh
pnpm exec vitest run \
  apps/desktop-host/tests/box-readiness.spec.ts \
  apps/desktop-host/tests/computer.spec.ts \
  apps/desktop-host/tests/computer-settings-projection.spec.ts \
  apps/desktop-host/tests/shell-box-path.spec.ts
```

Scenario 3 desktop chrome + FR-013/014 evidence is **T027** (not this stamp). Settings chrome alone ≠ SC-001/SC-002 (FR-005 / SC-004).

## Non-goals

- No Client `ui-settings-computer` UI (T024/T025)
- No Verifier Scenario 3 recipe / evidence media (T027)
- No Electron Main Computer-settings store
- No full Grok Computer catalog (FR-010)
- No edits to `packages/settings/**` schema service (generic Remotes already sufficient)
