# Contract: Secrets absent + credential UX

**Owners:** DH Runtime (credential seam) · DH Electron / Client (auth UX) · DH Verifier (SC-004, SC-007)
**Acceptance:** Spec FR-007, FR-008, FR-009 · US4, US5 · SC-004, SC-007 · research R5

## Interface (logical)

| Operation | Caller | Provider | Result |
|-----------|--------|----------|--------|
| Store / describe credential | Host auth flow | `dsh-credentials` (+ local store) | Value stored; describe never returns secret |
| Authorize (when needed) | Client | `dsh-authorization` flows | `authorized` only after commit |
| Dump inspect | Verifier | Session dump / export path | No plaintext secrets |
| Vault UX | Product (optional) | Vault/connector-class path | Only if in-app cannot complete Pass connector |

## Rules

1. Connector secrets/tokens/passwords/API keys MUST be absent from session dumps / exportable artifacts (plaintext).
2. Primary Pass auth = **in-app** secure path; secrets off renderer durable storage; not chat-paste primary.
3. Env/key files = dev/CI only — **not** product Pass path.
4. **1Password-class vault is NOT a mandatory Pass gate** when in-app auth completes the Pass connector (FR-009).
5. If in-app cannot auth the Pass connector, either provide vault/connector-class path **or** select a connector that authenticates in-app.

## Verifier

| Check | Pass bar |
|-------|----------|
| SC-004 | Dump inspection shows secrets absent; evidence committed |
| SC-007 | In-app primary honored; vault only if needed |
| FR-014/015 | GUI auth surfaces need desktop media when shown |

## Failures

| Condition | Required behavior |
|-----------|-------------------|
| Plaintext secrets in dumps | Fail FR-007 / SC-004 |
| Chat-paste as primary Pass auth | Fail FR-008 |
| Failing Pass solely because vault UI absent when in-app works | Fail over-strict gate / FR-009 |
| Env-file as product Pass | Fail FR-008 |
