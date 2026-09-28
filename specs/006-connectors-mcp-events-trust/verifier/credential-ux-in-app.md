# T031 — Client in-app credential UX (Pass / vault optional)

**Status:** Client US5 confirm / complete recorded (product SC stamp remains with T032 Scenario evidence)
**Owners:** DH Electron / Client (this note + TeamAction auth surface) · DH Verifier (SC-007 recipe extension in T032) · DH Runtime (Host credential seam — T011 / T018 / T029)
**Linear:** [MOH-329](https://linear.app/momadhoun/issue/MOH-329/t031-us5-client-in-app-credential-ux-vault-optional) · Epic [MOH-281](https://linear.app/momadhoun/issue/MOH-281/p6-connectors-mcp-events-trust)
**Acceptance slice:** T031 — confirm / complete Client in-app credential UX for Pass connector under `packages/experimental/client-ui-agent-team/src/client/` (Host RPC only; secrets off renderer durable storage); document vault/1Password-class **not** required for Pass when in-app auth completes the fixture (FR-008 / FR-009)
**Contracts:** [../contracts/secrets.md](../contracts/secrets.md) · [../contracts/connector.md](../contracts/connector.md)
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 1 auth · SC-007
**Related:** [credentials-trust-inventory.md](./credentials-trust-inventory.md) (T004) · [connector-event-trust-seam-locks.md](./connector-event-trust-seam-locks.md) (T005 R5) · [scenario-1-connector.md](./scenario-1-connector.md) Step B
**Branch:** `cursor/p6-us5-client-credential-fe1d`

## Measurable Done (this note)

| Check | Pass bar |
|-------|----------|
| In-app auth UX present | TeamAction `ConnectorAuthForm` opens from installed `needs_auth` / `failed` row; `data-team-connector-auth-mode="in_app"` |
| Host RPC only | Secret travels only as `authenticateConnector(sessionId, { connectorId, secret })` Remote argument — never Electron Main IPC / Node IPC credential-value bus |
| Secrets off renderer durable storage | Draft lives in React state only; cleared on success / cancel; no `localStorage` / `sessionStorage` / IndexedDB write of the secret (FR-008) |
| Vault not mandatory | Locale `connectorAuthVaultOptional` + `data-team-connector-vault-not-required` state FR-009: Pass fixture completes in-app; 1Password-class vault is **not** a Pass gate |
| Focused Client proof | Vitest `completes Pass in-app credential UX without vault or renderer durable secret (T031 / US5)` green |

**Does not:** Stamp SC-007 product Done alone (T032 owns Scenario credential-UX / SO 11+12 desktop evidence). Does not invent a vault product surface. Does not reopen Host credential-store implementation (T011 / T029).

---

## FR-008 / FR-009 lock (Pass fixture)

| Rule | Product path | Fail if |
|------|--------------|---------|
| **FR-008** | In-app password field → Host `agentTeams/authenticateConnector`; describe returns value-free `CredentialInfo`; draft cleared after save | Chat-paste primary; env-file as product Pass; secret written to renderer durable storage |
| **FR-009** | Verifier fixture / thin-catalog Pass auth completes via in-app store | Pass fails solely because vault / 1Password UI is absent when in-app works |

Pass connector auth mode for the default fixture is `in_app` (see Host catalog / Scenario 1 fixtures). Vault / connector-class UX stays **optional** and out of Pass default when this Client path reaches `authState=ready`.

---

## Client surfaces (confirm)

| Surface | Path | Role |
|---------|------|------|
| Locale copy | `packages/experimental/client-ui-agent-team/src/client/locales.ts` | `connectorAuthHint`, `connectorAuthVaultOptional`, secret field labels — locale-owned |
| Auth form | `TeamAction.tsx` → `ConnectorAuthForm` | Ephemeral draft; Host RPC save; vault-not-required marker |
| Mount bridge | `mount.ts` | Wires `authenticateConnector` / `describeConnectorCredential` from `ctx.remote.agentTeams` |
| Prior US1 | T019–T020 | Catalog install + auth + tool-success; T031 confirms US5 FR-008/009 posture |

Electron Main does **not** own connector secrets, credential set, or auth UX SoT ([host-protocol exclusions](../../../apps/desktop/src/host-protocol.ts); T013/T014).

---

## Verifier spot-check (Client half)

```sh
DSH_LEFTHOOK_ALLOW_HOOKS_PATH_OVERRIDE=1 ./node_modules/.bin/vitest run \
  packages/experimental/client-ui-agent-team/tests/team-action.client.spec.tsx \
  -t 'T031 / US5'
```

Assert:

1. Editor exposes `data-team-connector-auth-mode="in_app"` and `data-team-connector-vault-not-required`.
2. Save calls Host `authenticateConnector` with the typed secret once.
3. After success, auth editor / secret input are gone; DOM text does not echo the secret.
4. `localStorage` / `sessionStorage` length remain 0 for the fixture secret.
5. Calls / copy do not require `1Password` for Pass.

Desktop FR-014/015 auth-surface media remains under Scenario 1 / T032 — unit/jsdom alone does not stamp SC-007 Done.

---

## Spot-check fail conditions

| Condition | Result |
|-----------|--------|
| Pass gated on vault UI when in-app reaches ready | **Fail FR-009** |
| Secret persisted in renderer durable storage | **Fail FR-008** |
| Chat-paste or env-file taught as product primary | **Fail FR-008** |
| Electron Main credential-value bus used for auth | **Fail** R6 / thin-shell |

---

## Non-overlap

- **T020** landed the auth + tool-success UI; this note confirms US5 FR-008/009 + vault-optional documentation.
- **T029 / US4** owns dump plaintext absence on Host.
- **T032** owns Scenario SC-007 recipe extension + SO 11+12 desktop evidence stamps.
