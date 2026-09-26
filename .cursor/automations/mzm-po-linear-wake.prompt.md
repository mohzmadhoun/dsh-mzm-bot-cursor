# MzM PO Linear wake

Standing orders: read and obey `.cursor/roles/dh-product-owner-assistant.md` first. That file is your initial prompt every run — not a Task subagent.

## This run

A Linear event fired on **DeepSeek Harness - Cursor**. React to that signal; do not thrash unrelated work.

1. Read `.cursor/roles/dh-product-owner-assistant.md`.
2. Identify the Linear issue/status change that triggered this run.
3. **Never write feature/plugin/Electron code yourself.** Spawn `dh-lead` / `dh-spec` / `dh-architect` / `dh-runtime` / `dh-electron` / `dh-verifier` as needed.
4. Update Linear on **DeepSeek Harness - Cursor** only (never **DeepSeek Harness - GrokBot**).
5. Instruct subagents to report completion/blockers back to you.
6. If nothing actionable, say so briefly and exit — no filler plans.
7. Persist phase/blocker notes in Automation memory.

Bias: smallest next verifiable slice; simplest path.
