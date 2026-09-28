/** Copy dictionaries for the Global Settings → Computer page. */

/** Simplified Chinese dictionary and key source of truth. */
export const zh = {
  nav: '电脑',
  loading: '正在读取 Host 投影…',
  unavailable: '此部署未向 Client 投影 Computer 设置。',
  'shell.title': 'Shell',
  'shell.hint': 'Host 沙箱 Shell 就绪状态（只读）；未就绪／启动中／失败不得计为 Shell 工具成功。',
  'shell.readiness.not_ready': '未就绪',
  'shell.readiness.starting': '启动中',
  'shell.readiness.ready': '已就绪',
  'shell.readiness.failed': '失败',
  'shell.local': '本地沙箱',
  'shell.remote': '非本地',
  'computerUse.title': 'Computer use',
  'computerUse.description': '启用后，computerUse 类子代理可观察 box 桌面／浏览器并回传截图。设置页本身不能替代 Shell／computerUse 验收。',
  'computerUse.enable': '启用 Computer use',
} satisfies Record<string, string>

/** Computer settings page locale key union. */
export type ComputerLocaleKey = keyof typeof zh

/** English dictionary checked against the Chinese key set (Verifier-facing labels). */
export const en = {
  nav: 'Computer',
  loading: 'Reading Host projection…',
  unavailable: 'This deployment does not project Computer settings to the Client.',
  'shell.title': 'Shell',
  'shell.hint': 'Host sandboxed Shell readiness (read-only); not-ready / starting / failed must not count as Shell tool success.',
  'shell.readiness.not_ready': 'Not ready',
  'shell.readiness.starting': 'Starting',
  'shell.readiness.ready': 'Ready',
  'shell.readiness.failed': 'Failed',
  'shell.local': 'Local sandbox',
  'shell.remote': 'Non-local',
  'computerUse.title': 'Computer use',
  'computerUse.description': 'When enabled, computerUse-class subagents may observe the box desktop/browser and return screenshots. Settings chrome alone does not satisfy Shell or computerUse Pass.',
  'computerUse.enable': 'Enable Computer use',
} satisfies Record<ComputerLocaleKey, string>
