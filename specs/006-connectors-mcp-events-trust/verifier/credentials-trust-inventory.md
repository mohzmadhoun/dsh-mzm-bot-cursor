# T004 — Credential + approval/deny seam inventory (Setup)

**Status:** Inventory complete (Setup; no product behavior change)
**Owners:** DH Runtime (author) · DH Verifier (SC-003/SC-004 later) · PO (scope)
**Linear:** **Blocked** — track via PR only (project `DeepSeek Harness - Cursor` / `P-MOH-2`; no invented issue ids)
**Acceptance slice:** Setup T004 — inventory credential + approval/deny seams for [contracts/secrets.md](../contracts/secrets.md) / [contracts/trust-deny.md](../contracts/trust-deny.md) (research R4 / R5)
**Branch:** `cursor/p6-setup-t001-t006-fe1d`
**Surfaces inventoried:** `packages/credentials/credentials/src/`, `packages/credentials/credentials-local/src/`, `packages/credentials/authorization/src/`, `packages/interaction/user-approval/src/`

## Measurable Done (this doc)

| Check | Pass bar |
|-------|----------|
| Credential SoT named | Host `ctx.credentials` + local provider; `describe` never returns secret values |
| Auth UX path | In-app primary; authorization flow available when human sign-in needed; vault **optional** |
| Deny paths named | User-deny via `dsh-user-approval` **or** standing `never` / block — either OK for Pass |
| Answerer plane | Desktop Client answerer on **Host HTTP/WS** — not Electron Main |
| Non-goals | No T011/T026 implement; no vault Pass gate; no chat-paste primary; no secret IPC |

---

## Requirement (FR-006…009 / SC-003 / SC-004 / SC-007)

From contracts + research R4/R5 / Architect Path A:

- Connector secrets live in Host credential seam; session dumps MUST NOT contain plaintext secrets (FR-007).
- Renderer MUST NOT hold durable secret SoT (FR-008).
- In-app credential UX is primary; vault/1Password-class only if Pass connector cannot auth in-app (FR-009) — Pass fixture uses in-app.
- Deny Pass: user deny **or** standing never/block; denial user-visible and distinct from success (FR-006).
- Client approval answerer on authenticated Host HTTP path (research R4).

---

## Credentials seam (Host store)

### `packages/credentials/credentials/src/` — Service Definition (`ctx.credentials`)

| Symbol | Role | P6 note |
|--------|------|---------|
| `CredentialRef` / `credentialRef` | Env-name style reference (`DEEPSEEK_API_KEY` grammar) | Connector auth may use refs and/or scoped keys |
| `CredentialKey` / `credentialKey(scope, id)` | Plugin-scoped record address (`scope/id`) | Prefer for connector-bound secrets (e.g. `agent-teams/<connectorId>`) — T011 decides |
| `CredentialProvider.resolve` | Returns secret value + source | Host-only resolve at operation time; never cache across ops; never expose on Client describe |
| `CredentialProvider.describe` / `describeRecord` | Configured / source / writable — **never the value** | Matches data-model “Describe never returns secret value” |
| `modifyRecord` / store APIs | Durable write under provider lock | In-app auth writes here; chat-paste MUST NOT be primary Pass path |
| `CredentialRecord` (`ApiKeyRecord` \| `GrantRecord`) | Stored record kinds | Sufficient for Pass fixture token; OAuth grants via authorization when needed |

**Gap vs P6 product:** No connector-specific credential key convention or Host Remotes for connector auth UX yet (T011 / US1 / US5).

### `packages/credentials/credentials-local/src/` — File-backed provider

| Fact | Detail |
|------|--------|
| Store | `$DSH_HOME/.credentials.yaml` (+ env / `.env` layering) |
| Composition | Mounted in `packages/bundle/base` (`@deepseek-ai/dsh-credentials-local`) — Desktop Host inherits when on base/desktop profile |
| Fit | In-app primary store for Pass fixture auth |
| Rules | Inherited process env wins (read-only); managed file writable; describe stays value-free |
| Not Pass | Env-file / CI key alone as **product** auth path (FR-008 / research R5) |

### `packages/credentials/authorization/src/` — Human sign-in conversation (`ctx.authorization`)

| Symbol | Role | P6 note |
|--------|------|---------|
| `AuthorizationService.registerFlow` | Protocol-agnostic human auth conversation keyed by `CredentialKey` | Use when Pass connector needs OAuth/code entry — **not** required if in-app token store completes fixture |
| Notices / prompts | Neutral UI vocabulary | Client surfaces via Host HTTP (same dual-process rule) |
| Owns | Conversation lifecycle — **not** the secret protocol or Electron Main bus | |

**Vault:** Not present as a mandatory package. Implement only if chosen Pass connector cannot complete in-app auth (FR-009). Inventory records vault as **out of Pass default**.

---

## Approval / deny seam (trust)

### `packages/interaction/user-approval/src/` — `ctx.approval`

| Symbol | Role | P6 note |
|--------|------|---------|
| `ApprovalPolicy` `'ask' \| 'never'` | Session policy before answerers | **`never`** = standing reject path for Pass (Architect Path A either-OK) |
| `ApprovalService.request` | Ask composed answerers; fail-closed if none | User-deny path when policy is `ask` and answerer returns `rejected` |
| Outcomes | `allowed-once` \| `rejected` \| `cancelled` \| `unavailable` | Map Pass deny visibility to `rejected` (and product `outcome=denied`) — T026 |
| Audit | `approval/asked` + `approval/decided` on session log (turn-enclosed) | Reconstructable; denial distinct from tool success |
| Composition | Mounted in base bundle (`@deepseek-ai/dsh-user-approval`) | Host already has the service; Desktop Client answerer on Host HTTP still needed for interactive deny (US3) |

### Deny Pass candidates (either OK)

| Path | How | Verifier observation |
|------|-----|----------------------|
| **A — User deny** | Policy `ask` + Client answerer on Host HTTP returns `rejected` | User-visible deny card / blocked state; tool `outcome=denied` |
| **B — Standing never** | `setApprovalPolicy` / effective policy `never` | Auto-reject without prompt; still user-visible blocked/denied (not success) |

Silent fail as “deny” is **rejected** by research R4.

### Answerer plane (locked)

| Surface | Role |
|---------|------|
| Desktop Host HTTP/WS Remotes | Carry approval prompts / decisions |
| Client / Web | Renders deny card; answers via Host RPC only |
| Electron Main | **Forbidden** as answerer or trust-rule bus (research R6 / R9) |

---

## Session-dump honesty (SC-004)

| Concern | Inventory note |
|---------|----------------|
| Secret storage | Host credential seam only |
| Session log / export | Must not embed plaintext connector tokens/passwords/API keys |
| Describe APIs | Already value-free — product must not invent dump fields that reintroduce secrets |
| Evidence | US4 dump-inspection recipe (T030) — may be non-GUI log/artifact |

---

## Desktop / thin-shell adjacency (already present)

| Guard / doc | Relevance |
|-------------|-----------|
| `apps/desktop/tests/no-secret-ipc.spec.ts` | Forbids credential set/resolve on Main IPC (P1) — extend vocabulary for connector credential-value names in T013 |
| `apps/desktop/src/host-protocol.ts` | Lifecycle-only control types; memory/routine exclusions present — **connector/event/trust/credential-value** exclusions still to add (T013) |
| `apps/desktop/tests/thin-shell-main.spec.ts` | No `ctx.credentials` on Main | Keep |

---

## Gap matrix (P6 need → today)

| Need | Present? | Next task |
|------|----------|-----------|
| Host credential store | Yes (`credentials` + `credentials-local`) | T011 bind for connector auth refs |
| Describe without values | Yes | Honor in connector auth Remotes |
| Authorization human flow | Yes (service) | Optional for Pass fixture |
| Vault mandatory surface | No (correct) | Keep optional |
| Connector auth Remotes / UX | No | T011 / T020 / T031 |
| Approval service | Yes | T026 gate wiring |
| Host HTTP answerer for Desktop | Partial / product gap | T027 Client + Host path |
| Standing `never` policy | Yes | Usable for deny Pass |
| Secrets-absent dump proof | No recipe yet | T029 / T030 |

---

## Explicit non-touch (Setup)

- No credential provider code changes
- No approval answerer implementation in Client
- No vault product surface
- Connector / event inventories — T002 / T003
- Seam locks — [connector-event-trust-seam-locks.md](./connector-event-trust-seam-locks.md) (T005)

---

## Evidence for Verifier / PO

Inventory is source-derived from credentials / credentials-local / authorization / user-approval packages on branch tip vs [contracts/secrets.md](../contracts/secrets.md) and [contracts/trust-deny.md](../contracts/trust-deny.md). Setup T004 delivers this note only; SC-003/SC-004 recipes land with T028/T030.
