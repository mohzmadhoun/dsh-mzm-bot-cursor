/**
 * Host Connector thin catalog + Pass MCP fixture bind (P6 T009–T011).
 *
 * Thin catalog SoT definitions live here (Architect Path A / FR-017 any-one fixture).
 * When a durable ConnectorRecord reaches `authState=ready`, tools register on
 * `ctx.tools` via `dsh-mcp-client` `createMcpToolDefinition` + `publicToolName`
 * (research R1/R2) — not Electron Main, not Client-only SoT.
 *
 * Fixture home: this module (`PASS_CONNECTOR_CATALOG` + `bindPassConnectorMcpTools`).
 * Secrets stay in Host `ctx.credentials` under {@link connectorCredentialKey}.
 */

import type { Context } from '@deepseek-ai/cordis'
import {
  credentialKey,
  type CredentialKey,
  type CredentialRecordInfo,
} from '@deepseek-ai/dsh-credentials'
import {
  createMcpToolDefinition,
  publicToolName,
} from '@deepseek-ai/dsh-mcp-client/src/tools.ts'
import type {} from '@deepseek-ai/dsh-tools'
import type {
  ConnectorCatalogEntry,
  ConnectorId,
  ConnectorRecord,
} from './types.ts'
import { TeamError } from './error.ts'

/** Cordis plugin scope used as credentialKey scope for connector secrets. */
export const CONNECTOR_CREDENTIAL_SCOPE = 'agent-teams-connector'

/** Pass Verifier fixture catalog id (any-one FR-017 — not a fixed live connector name). */
export const PASS_FIXTURE_CATALOG_ID = 'verifier-fixture'

/** Pass fixture MCP serverName namespace (`mcp__verifier_fixture__…`). */
export const PASS_FIXTURE_SERVER_NAME = 'verifier_fixture'

/** Pass fixture tool raw name exposed after auth ready. */
export const PASS_FIXTURE_TOOL_RAW_NAME = 'ping'

/**
 * Thin managed / Verifier fixture catalog (P6 T009 / FR-017).
 * Pass = any one completable entry — this fixture is the default Host Pass path.
 */
export const PASS_CONNECTOR_CATALOG: readonly ConnectorCatalogEntry[] = [
  {
    catalogId: PASS_FIXTURE_CATALOG_ID,
    displayName: 'Verifier Fixture Connector',
    serverName: PASS_FIXTURE_SERVER_NAME,
    transport: 'stdio',
    fixture: true,
    authMode: 'in_app',
  },
]

/**
 * Build the Host credential store address for one connector (P6 T011).
 * @param connectorId - durable Host connector id.
 * @returns branded CredentialKey (`agent-teams-connector/<connectorId>`).
 */
export function connectorCredentialKey(connectorId: ConnectorId): CredentialKey {
  return credentialKey(CONNECTOR_CREDENTIAL_SCOPE, String(connectorId))
}

/**
 * Public ToolRuntime name for the Pass fixture ping tool.
 * @returns `mcp__verifier_fixture__ping` (DeepSeek function-name contract).
 */
export function passFixturePublicToolName(): string {
  return publicToolName(PASS_FIXTURE_SERVER_NAME, PASS_FIXTURE_TOOL_RAW_NAME)
}

/**
 * Describe one connector credential without returning the secret value (FR-007).
 * @param ctx - Host context that may carry `credentials`.
 * @param connectorId - durable connector id.
 * @returns configured/writable facts, or throws when credentials seam is absent.
 */
export async function describeConnectorCredential(
  ctx: Context,
  connectorId: ConnectorId,
): Promise<CredentialRecordInfo & { readonly credentialKey: CredentialKey }> {
  const credentials = ctx.get('credentials')
  if (credentials === undefined) {
    throw new TeamError(
      'Host credentials seam is not mounted; connector auth requires dsh-credentials',
      'TEAM_INVALID_ARGUMENT',
    )
  }
  const key = connectorCredentialKey(connectorId)
  const info = await credentials.describeRecord(key)
  return { ...info, credentialKey: key }
}

/**
 * Store one in-app connector secret under the Host credential seam (P6 T011).
 * Never writes the secret into the Team journal or session dump path.
 * @param ctx - Host context carrying `credentials`.
 * @param connectorId - durable connector id.
 * @param secret - non-empty secret / API token.
 * @returns the credential key address (never the value).
 */
export async function storeConnectorSecret(
  ctx: Context,
  connectorId: ConnectorId,
  secret: string,
): Promise<CredentialKey> {
  const credentials = ctx.get('credentials')
  if (credentials === undefined) {
    throw new TeamError(
      'Host credentials seam is not mounted; connector auth requires dsh-credentials',
      'TEAM_INVALID_ARGUMENT',
    )
  }
  const key = connectorCredentialKey(connectorId)
  await credentials.modifyRecord(key, async () => ({ kind: 'api-key', key: secret }))
  return key
}

/**
 * Register Pass fixture MCP tools on `ctx.tools` for one ready connector (P6 T010).
 * Uses `dsh-mcp-client` naming + result projection without opening a live transport.
 * @param ctx - Host context carrying `tools`.
 * @param connector - durable row that must be `authState=ready` + installed.
 * @returns disposer that removes the registered tools.
 */
export function bindPassConnectorMcpTools(
  ctx: Context,
  connector: ConnectorRecord,
): () => void {
  if (connector.authState !== 'ready' || connector.installState !== 'installed') {
    throw new TeamError(
      'MCP bind requires installState=installed and authState=ready',
      'TEAM_INVALID_ARGUMENT',
    )
  }
  const tools = ctx.get('tools')
  if (tools === undefined) {
    throw new TeamError(
      'Host tools registry is not mounted; connector MCP bind requires dsh-tools',
      'TEAM_INVALID_ARGUMENT',
    )
  }
  const publicName = publicToolName(connector.serverName, PASS_FIXTURE_TOOL_RAW_NAME)
  const definition = createMcpToolDefinition(ctx, {
    name: publicName,
    rawName: PASS_FIXTURE_TOOL_RAW_NAME,
    description: 'Verifier fixture connector ping — returns success for Pass tool-call evidence.',
    inputSchema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Optional ping message' },
      },
      additionalProperties: false,
    },
    async call(args) {
      const message = typeof args.message === 'string' && args.message.trim().length > 0
        ? args.message.trim()
        : 'pong'
      return {
        content: [{ type: 'text', text: `connector:${connector.serverName}:${message}` }],
      }
    },
  })
  return tools.register(definition)
}
