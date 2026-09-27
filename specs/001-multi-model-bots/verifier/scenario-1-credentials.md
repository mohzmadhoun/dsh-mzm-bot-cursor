# Scenario 1 — In-app auth + clean dump (stub)

**Feature:** `specs/001-multi-model-bots`
**Status:** T036 documents FR-009 secondary path. Full SC-006 dump recipe is **T037** (not Pass yet).
**Acceptance slice:** FR-009 product posture (this file + package docs). SC-006 / FR-008 dump Pass remains T037.
**Contract:** [../contracts/in-app-credentials.md](../contracts/in-app-credentials.md)
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 1
**Package authority (resolve order + product role):** [`packages/credentials/credentials-local/README.md`](../../../packages/credentials/credentials-local/README.md) — section “Where keys come from”
**Related (do not edit for T036):** [credentials-ipc.md](./credentials-ipc.md) (T011 / T034)

## FR-009 — Primary vs secondary credentials

| Path | Role | Counts for SC-006 Pass? |
|------|------|-------------------------|
| In-app Models / settings → Host `ctx.credentials` → managed `$DSH_HOME/.credentials.yaml` | **Product primary** | Yes (required evidence path) |
| Launch environment (`DEEPSEEK_API_KEY=…`), project `.env`, harness-home `.env` | **Secondary** — development and CI only | No — CI shortcut only; must not be taught as product primary |

**Fail FR-009** if Desktop/Host docs or this recipe teach env/key-file as the product primary auth path, or if SC-006 Pass evidence relies only on env injection without an in-app entry demonstration.

## Stub notes for T037 (full recipe)

T037 owns the rerunnable Scenario 1 recipe. Until then, Verifier may **Defer** SC-006 with reason rather than Pass on env-only auth.

Outline from quickstart (not yet measured here):

1. Fresh profile (or cleared credentials for providers under test).
2. Enter credentials **in-app** for providers needed.
3. Create a bot that uses one provider; confirm a call authenticates.
4. Export / dump session transcript; review for raw secrets (SC-006).

## Pass criteria (T036 docs slice only)

- `credentials-local` README states product primary = in-app managed file; env / `.env` = secondary (dev/CI only).
- This stub states the same FR-009 table and points at the package README for resolve order.
- This slice alone does **not** claim Scenario 1 / SC-006 dump Pass.
