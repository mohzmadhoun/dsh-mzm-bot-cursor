# T016 Bot llm route + Host credentials — Verifier proof recipe

**Status:** Host llm + credential resolve proof path (not Scenario 2 Pass — Client UI is T017; SC-001/002 need Desktop multi-model session; US4 owns credential UI / SC-006 dump recipe).
**Owners:** DH Runtime (implementation) · DH Verifier (rerun + Pass/Fail)
**Acceptance slice:** Spec FR-002 — Bot model calls resolve through Host `ctx.llm` adapters under `packages/llm/` using the bot’s `ModelSelection` and Host `ctx.credentials` resolve — Electron Main MUST NOT invent bot records or route models ([architecture.md](../architecture.md) · [contracts/bot-create-model.md](../contracts/bot-create-model.md) · [contracts/in-app-credentials.md](../contracts/in-app-credentials.md))
**API:** `installModelSelection` → `agent/request` → `ctx.llm.stream` → adapter `credentials.resolve(ref)`; product create remains `TeamService.createBot`
**Branch:** `cursor/p1-t016-llm-route-92fa` (base `cursor/p1-t015-model-bind-92fa`)

## What this proves

1. Bot chats dispatch through Host `ctx.llm` (spy + adapter requests) with that bot’s `{ provider, model }`.
2. Host credential resolve supplies the API key for that provider’s `CredentialRef` (same posture as `llm-deepseek` / `llm-pi-ai`).
3. Missing credential for Bot B’s provider fails with `MISSING_CREDENTIAL` and never silently uses Bot A’s credential.
4. After Host stores Bot B’s own ref, a follow-up chat resolves only that ref.
5. Session log does not embed the raw Host credential secret.
6. Electron Main / preload / IPC expose no `createBot`, `ModelSelection`, or provider-credential secret APIs (static inventory).

Does **not** prove SC-001/SC-002 (Desktop multi-model — Scenario 2 / T018–T019). Does **not** cover T017 Client UI, T019 TTFT, or US4 credential entry UI / Scenario 1 dump Pass (T033–T037).

## Preconditions

- [ ] Checkout on `cursor/p1-t016-llm-route-92fa` (or merge-base including T016)
- [ ] `pnpm install` complete
- [ ] Node `^22.19 || >=24`
- [ ] No provider API secrets required (in-memory Host credentials + scripted adapter)

## Commands (rerunnable)

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/llm-route.spec.ts \
  -t 'ctx.llm|MISSING_CREDENTIAL|Host credential'
```

Electron Main negative inventory (no model router / no secret credential IPC):

```sh
pnpm exec vitest run apps/desktop/tests/topology-handshake.spec.ts \
  -t 'createBot / ModelSelection / provider-credential'
```

Optional Host Team regression (includes T015 bind):

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts \
  packages/experimental/agent-team/tests/llm-route.spec.ts \
  -t 'installModelSelection|ctx.llm|MISSING_CREDENTIAL'
```

## Pass criteria

- Focused llm-route suite green: Host `ctx.llm` dispatch, Host resolve, peer isolation, recovery via own ref, no secret in session dump.
- Desktop topology negative inventory green: no createBot / ModelSelection / credential-secret IPC on Main/preload.

## Evidence home

Record stdout + SHA under [evidence/t016-llm-route/](./evidence/t016-llm-route/) when Verifier runs Pass/Fail.
