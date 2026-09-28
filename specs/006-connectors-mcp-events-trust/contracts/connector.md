# Contract: Connector install → auth → tool call

**Owners:** DH Runtime (Host catalog + MCP bind) · DH Electron / Client (surfaces) · DH Verifier (SC-001)
**Acceptance:** Spec FR-001, FR-002, FR-003, FR-016, FR-017 · US1 · SC-001 · research R1–R2

## Interface (logical)

| Operation | Caller | Provider | Result |
|-----------|--------|----------|--------|
| List catalog | Client | Host Connector catalog | Thin managed + optional fixture entries |
| Install connector | Client | Host | `ConnectorRecord` → installed or failed with reason |
| Authenticate | Client | Host + credentials / authorization | `authState=ready` without chat-paste primary |
| Invoke tool | Bot turn / Verifier | Host MCP (`dsh-mcp-client` tools) | User-visible **success** outcome |

## Rules

1. Install MUST be user-visible and durable on Host — not catalog text alone.
2. Pass connector = **any one** from thin catalog / Verifier fixture — not a fixed named connector.
3. Auth MUST reach `ready` via product credential UX (in-app primary).
4. ≥1 successful connector tool call with user-visible success; LLM wording not scored.
5. Failed install / abandoned auth MUST NOT claim Story 1 Pass.
6. Client mutates via Host HTTP/WS only; Electron Main is not SoT.

## Verifier

| Check | Pass bar |
|-------|----------|
| SC-001 | Install → auth → ready → successful tool call on desktop |
| FR-014/015 | Desktop media committed under `verifier/evidence/` + PR embeds |
| FR-017 | Path works with fixture/thin entry — not gated on a fixed name |

## Failures

| Condition | Required behavior |
|-----------|-------------------|
| Catalog-only / no install | Fail |
| Secrets pasted into chat as primary auth | Fail FR-002/008 |
| Success claimed without user-visible tool outcome | Fail FR-003 |
| Main IPC as connector SoT | Fail seam honesty |
