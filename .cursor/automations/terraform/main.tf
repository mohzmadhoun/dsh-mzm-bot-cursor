terraform {
  required_providers {
    cursor = {
      source  = "cursor/cursor"
      version = "~> 0.1"
    }
  }
}

provider "cursor" {
  # Set CURSOR_TOKEN in the environment. Never commit the token.
}

locals {
  repo                 = "github.com/mohzmadhoun/dsh-mzm-bot-cursor"
  branch               = "master"
  environment_public_id = "47969b30-b9e5-11f1-977f-f6b8f2fcf9b2"
  linear_project_id    = "33d56d8a-8653-414d-95e7-4f627a5dab08"
  linear_team_id       = "a0bde8b5-ed74-4870-8686-6a41346367a9"
}

resource "cursor_platform_workflow" "mzm_po_patrol" {
  name                 = "MzM PO patrol"
  description          = "Hourly product-owner assistant patrol for DeepSeek Harness - Cursor (P1→P7). Never codes; spawns dh-* subagents."
  scope                = "user"
  enabled              = true
  memory_enabled       = true
  git_repo             = local.repo
  git_branch           = local.branch
  environment_public_id = local.environment_public_id
  prompt               = file("${path.module}/../mzm-po-patrol.prompt.md")

  trigger = [
    {
      cron = {
        schedule = "0 * * * *"
      }
    }
  ]
}

resource "cursor_platform_workflow" "mzm_po_linear_wake" {
  name                 = "MzM PO Linear wake"
  description          = "Wake product-owner assistant on Linear issue create/status change for DeepSeek Harness - Cursor."
  scope                = "user"
  enabled              = true
  memory_enabled       = true
  git_repo             = local.repo
  git_branch           = local.branch
  environment_public_id = local.environment_public_id
  prompt               = file("${path.module}/../mzm-po-linear-wake.prompt.md")

  trigger = [
    {
      linear = {
        project_ids  = [local.linear_project_id]
        team_ids     = [local.linear_team_id]
        issue_created = {}
      }
    },
    {
      linear = {
        project_ids    = [local.linear_project_id]
        team_ids       = [local.linear_team_id]
        status_changed = {}
      }
    }
  ]
}

output "mzm_po_patrol_id" {
  value = cursor_platform_workflow.mzm_po_patrol.id
}

output "mzm_po_linear_wake_id" {
  value = cursor_platform_workflow.mzm_po_linear_wake.id
}
