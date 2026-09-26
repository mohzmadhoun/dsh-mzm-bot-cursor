# MzM Cursor Automations

Repo-owned prompts and Terraform for unattended **product owner assistant** runs.

## Role file (not a subagent)

| Path | Purpose |
|------|---------|
| `.cursor/roles/dh-product-owner-assistant.md` | Standing identity: name, label, job, anti-jobs, experiment overrides, Linear lock, team table. Automations and chat must treat this as the **initial prompt / standing orders**. |

Specialist Task subagents remain under `.cursor/agents/dh-*.md`.

## Automations

| Name | Trigger | Prompt |
|------|---------|--------|
| **MzM PO patrol** | Cron hourly (`0 * * * *`) | `mzm-po-patrol.prompt.md` |
| **MzM PO Linear wake** | Linear issue created + status changed on project `P-MOH-2` | `mzm-po-linear-wake.prompt.md` |

Both: repo `github.com/mohzmadhoun/dsh-mzm-bot-cursor`, branch `master`, `memory_enabled = true`, environment `47969b30-b9e5-11f1-977f-f6b8f2fcf9b2`.

## How to create (dashboard)

1. Open https://cursor.com/automations
2. Create each automation: paste the corresponding `.prompt.md` body (or “read file X then follow it”).
3. Enable **Memories**.
4. Attach this repository / environment.
5. Enable **Linear** MCP (and GitHub) tools as needed.
6. Save + enable.

## How to create (Terraform)

Requires `CURSOR_TOKEN` (Cursor API key: `key_` / `crsr_`).

```bash
cd .cursor/automations/terraform
export CURSOR_TOKEN=…   # do not commit
terraform init
terraform apply
```

See `terraform/` in this folder.

## Note

Cloud agents in this workspace cannot create Automations via MCP (read-only `get-automation`). Dashboard or Terraform with your token is required.
