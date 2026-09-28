# Contract: Denied-permission path

**Owners:** DH Runtime (approval / standing deny enforce) · DH Electron / Client (deny UI) · DH Verifier (SC-003)
**Acceptance:** Spec FR-006 · US3 · SC-003 · research R4

## Interface (logical)

| Operation | Caller | Provider | Result |
|-----------|--------|----------|--------|
| Request permission | Tool / Host gate | `dsh-user-approval` or product standing rule | Pending decision |
| Deny | User or standing deny | Host enforcement | `decision=deny`; action does not proceed as success |
| Present outcome | Client | Host projection / chat-activity | Clear blocked/denied state ≠ success |

## Rules

1. Pass requires **one** proven deny path (user deny **or** standing deny/block).
2. Denied action MUST NOT be treated as successfully permitted/executed.
3. Denial MUST remain distinguishable from successful tool call.
4. Retry-with-allow after deny is complementary UX — not required for Pass.
5. Prefer composing `dsh-user-approval` (Architect confirms Desktop answerer).

## Verifier

| Check | Pass bar |
|-------|----------|
| SC-003 | One deny with user-visible distinct blocked state |
| FR-014/015 | Desktop media committed + PR embeds |

## Failures

| Condition | Required behavior |
|-----------|-------------------|
| Silent fail presented as success | Fail FR-006 |
| No user-visible denial | Fail SC-003 |
| Unit/jsdom-only evidence | Fail FR-014 |
