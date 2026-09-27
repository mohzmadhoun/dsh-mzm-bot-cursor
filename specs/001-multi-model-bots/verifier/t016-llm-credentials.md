# T016 Bot model calls via ctx.llm credentials — Verifier proof recipe

**Status:** Host credential-route proof path (not Scenario 2 Pass — Client UI is T017; missing-credential UX is T020).
**Owners:** DH Runtime (implementation) · DH Verifier (rerun + Pass/Fail)
**Acceptance slice:** Spec FR-002 — a Bot chat uses that Bot’s `ModelSelection` and the registered `ctx.llm` adapter resolves that provider’s Host `CredentialRef` ([contracts/bot-create-model.md](../contracts/bot-create-model.md) · [contracts/in-app-credentials.md](../contracts/in-app-credentials.md))
**API:** `TeamService.createBot` keeps the T015 `installModelSelection` bind. The agent loop calls `ctx.llm.prepareCall` for that provider. `dsh-llm-pi-ai` resolves the route’s `apiKeyEnv` through `ctx.credentials.resolve`. A miss fails with `MISSING_CREDENTIAL`.
**Branch:** `cursor/p1-t016-llm-credentials-92fa` (base `cursor/p1-t015-model-bind-92fa`)

## What this proves

1. A Bot chat’s `request/header` carries that Bot’s `{ provider, model }` into the registered `ctx.llm` adapter (`dsh-llm-pi-ai`), not a second router.
2. The adapter’s provider HTTP call authenticates with the Host credential stored for that provider’s `CredentialRef`.
3. A second Bot with a different provider sends that provider’s credential, not the first Bot’s.
4. Unsetting the second Bot’s named reference fails the next chat with `MISSING_CREDENTIAL`, does not open a provider HTTP call, and does not resolve the first Bot’s reference.
5. The first Bot’s later chat still uses its own credential.
6. Electron Main, IPC, and preload do not invent bot records, route models, or expose a secret credential API.

Does **not** prove SC-001/SC-002 (Desktop multi-model session). Does **not** cover T017 Client UI or T020 in-app credential failure UX. Does **not** require `DEEPSEEK_API_KEY`.

## Preconditions

- [ ] Checkout on `cursor/p1-t016-llm-credentials-92fa` (or a merge-base including T016)
- [ ] `pnpm install` complete
- [ ] Node `^22.19 || >=24`
- [ ] No provider API secrets required (in-memory credential store and a loopback provider stand-in)

## Commands (rerunnable)

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/llm-credentials.spec.ts
```

Electron Main negative check:

```sh
pnpm exec vitest run apps/desktop/tests/topology-handshake.spec.ts \
  -t 'keeps Electron Main from inventing bots'
```

## Pass criteria

- The agent-team credential spec is green: two providers, isolated Host tokens, `MISSING_CREDENTIAL` on the unset reference, and the surviving Bot still uses its own token.
- The Electron assertion is green.

## Evidence home

Record stdout + SHA under [evidence/t016-llm-credentials/](./evidence/t016-llm-credentials/) when Verifier runs Pass/Fail.
