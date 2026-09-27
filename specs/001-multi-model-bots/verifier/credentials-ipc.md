# Credentials primary path + no secret IPC — Phase 1 Wedge A

**Feature:** `specs/001-multi-model-bots`
**Role:** DH Verifier measured confirm for FR-008/009 · research R4 · T011
**Contract:** [../contracts/in-app-credentials.md](../contracts/in-app-credentials.md)
**Evidence log:** [evidence/t010-t011/measured-checks.txt](./evidence/t010-t011/measured-checks.txt)

## Verdict (T011) — Pass

Primary product credentials path is Host `ctx.credentials` via `@deepseek-ai/dsh-credentials-local` under `$DSH_HOME`. Electron `preload-*.ts` / `ipc.ts` expose **no credential secret IPC**. Env / key-file remain secondary (dev/CI) per package docs — not the product primary.

## Host primary store (measured)

| Fact | Location |
|------|----------|
| Plugin row `id: credentials` → `@deepseek-ai/dsh-credentials-local` | `packages/bundle/base/cordis.patch.yml` |
| Default path `$DSH_HOME/.credentials.yaml` (harness home) | `packages/credentials/credentials-local/README.md` |
| Desktop Host composition includes `dsh-base` | `DESKTOP_PROFILE_BUNDLES` → `PROFILE_TEMPLATES.web` |

**measured:** Base patch comment states adapters resolve references per request; Models page writes the managed document; secrets are not materialized into the process environment.

**inferred:** Desktop Web Models UI talks to Host over authenticated HTTP/WS (same as Web), not Electron Main credential APIs — consistent with architecture pick I / research R4.

## Electron secret IPC absence (measured)

**Files audited:**

- `apps/desktop/src/ipc.ts`
- `apps/desktop/src/preload-app.ts`
- `apps/desktop/src/preload-mandatory.ts`
- `apps/desktop/src/preload-menu.ts`
- `apps/desktop/src/preload-platform.ts`
- `apps/desktop/src/preload-theme.ts`
- `apps/desktop/src/preload-update-dialog.ts`
- `apps/desktop/src/preload-windows.ts`

**Command (rerunnable):**

```sh
rg -n -i 'credential|secret|api[_-]?key|password' \
  apps/desktop/src/preload-*.ts apps/desktop/src/ipc.ts
```

**Result:** one hit only — JSDoc on `DesktopUpdateState.technicalDetails` stating diagnostics contain **no credentials**. No channel, invoke handler, or `contextBridge` API for reading/writing provider secrets.

**measured `DESKTOP_IPC` channels:** `boot`, `bootFailed`, `directoryPick`, `updatesStatus`, `updatesOpen`, `updatesPresentation`, `nativeThemeSet`, `windowsAppearance`, `windowsMenu` — lifecycle / chrome / directory pick only.

## FR-009 secondary path (measured docs)

`packages/credentials/credentials-local/README.md` documents resolve order: launch environment → stored file → project `.env` → harness-home `.env`. Product primary remains in-app write to the managed file (Models / settings). Env wins for that process when set (dev/CI override), matching FR-009 secondary posture.

## Fail rules

Fail T011 if any of:

- A `dsh-desktop:*` IPC channel or preload bridge accepts/returns provider secret values.
- Desktop composition removes `dsh-credentials-local` without an equivalent Host `ctx.credentials` provider under `$DSH_HOME`.
- Documented product primary auth becomes env/keyfile-only (FR-009 violation).

## Related later work

- US4 / T033 Models write-only entry: [t033-cred-entry-ui.md](./t033-cred-entry-ui.md).
- US4 / T034 re-audit: [t034-no-secret-ipc.md](./t034-no-secret-ipc.md) (`apps/desktop/tests/no-secret-ipc.spec.ts`); this file remains the T011 Pass baseline.
- US4 / T035–T037: invalid/revoked UX + env docs + Scenario 1 dump hygiene (SC-006).
