/**
 * Pure computerUse-class screenshot/GUI observation projection for conversation
 * tool cards (P7 T022). Derives user-visible observation from Host-session Tool
 * blocks over HTTP/WS — never Electron Main SoT. Recognizes the Desktop Host
 * Pass fixture tool and Host-stamped `capabilityClass` / observation meta
 * (US2 T020).
 * @module
 */
import type { AttachmentId, ImageAttachmentRef, ImageMediaType } from '@deepseek-ai/dsh-attachment'
import type { ToolCallBlock, ToolResultNode } from '@deepseek-ai/dsh-client-ui-chat/client'

/** Host Pass fixture observation tool (desktop-host computer-use-pass-fixture). */
export const COMPUTER_USE_PASS_SCREENSHOT_TOOL = 'computer_use_pass_screenshot'

/** User-visible ComputerUseRun.observation status for Verifier / SC-002. */
export type ComputerUseObservationStatus = 'running' | 'observed' | 'error'

/**
 * Projected observation for a computerUse-class Tool card.
 * `images` carries durable attachment refs when the Host admitted a screenshot;
 * absent images still allow an `observed` stamp from Host meta or Pass text
 * fallback when admission projected text diagnostics instead of bytes.
 */
export interface ComputerUseObservation {
  status: ComputerUseObservationStatus
  /** Durable screenshot refs in result order; null when none admitted. */
  images: readonly { readonly attachment: ImageAttachmentRef }[] | null
  /** Model-facing text beside the gallery (Host result text blocks). */
  text: string | null
}

/** Media types a durable observation image may claim. */
const IMAGE_MEDIA_TYPES: ReadonlySet<ImageMediaType> = new Set([
  'image/png', 'image/jpeg', 'image/webp', 'image/gif',
])

/**
 * True when a wire value is a usable pixel or byte measure.
 * @param value - unvalidated wire value.
 * @returns true when it is a positive integer.
 */
function positiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

/** Runtime membership check for admitted image media types. */
function isImageMediaType(value: string): value is ImageMediaType {
  return IMAGE_MEDIA_TYPES.has(value as ImageMediaType)
}

/**
 * True when Host meta marks this result as computerUse-class observation.
 * @param meta - opaque result metadata.
 * @returns whether Host stamped computerUse observation identity.
 */
function metaMarksObservation(meta: unknown): boolean {
  if (typeof meta !== 'object' || meta === null || Array.isArray(meta)) return false
  const record = meta as Record<string, unknown>
  if (record.capabilityClass === 'computerUse') return true
  if (record.computerUseObservation === true || record.observation === true) return true
  if (typeof record.computerUseObservation === 'string' && record.computerUseObservation !== '') {
    return true
  }
  if (typeof record.observation === 'string' && record.observation !== '') return true
  if (typeof record.observation === 'object' && record.observation !== null) return true
  return false
}

/**
 * True when the wire tool name is the Host Pass screenshot observation tool.
 * @param toolName - dispatch-supplied tool name.
 * @returns whether Pass-fixture observation projection applies by name.
 */
export function isComputerUsePassScreenshotTool(toolName: string): boolean {
  return toolName === COMPUTER_USE_PASS_SCREENSHOT_TOOL
}

/**
 * True when this tool name / Host meta should project a computerUse observation card.
 * @param toolName - wire tool name.
 * @param block - running or settled Tool block.
 * @returns whether observation projection applies.
 */
export function isComputerUseObservationTool(toolName: string, block: ToolCallBlock): boolean {
  if (isComputerUsePassScreenshotTool(toolName)) return true
  if ('kind' in block) return metaMarksObservation(block.meta)
  return false
}

/**
 * Narrow durable image attachment refs from settled result content.
 * @param content - settled Tool result content blocks.
 * @returns refs in order, or null when none are valid.
 */
function imageReferences(content: readonly unknown[]): ImageAttachmentRef[] | null {
  const refs: ImageAttachmentRef[] = []
  for (const part of content) {
    if (typeof part !== 'object' || part === null) continue
    const { type, attachment } = part as { type?: unknown; attachment?: unknown }
    if (type !== 'image') continue
    if (typeof attachment !== 'object' || attachment === null || Array.isArray(attachment)) {
      return null
    }
    const {
      attachmentId, mediaType, bytes, width, height, name, originalDimensions,
    } = attachment as Record<string, unknown>
    if (typeof attachmentId !== 'string' || attachmentId === '') return null
    if (typeof mediaType !== 'string' || !isImageMediaType(mediaType)) return null
    if (!positiveInteger(bytes) || !positiveInteger(width) || !positiveInteger(height)) {
      return null
    }
    if (name !== undefined && typeof name !== 'string') return null
    let inputDimensions: ImageAttachmentRef['originalDimensions'] | undefined
    if (originalDimensions !== undefined) {
      if (
        typeof originalDimensions !== 'object'
        || originalDimensions === null
        || Array.isArray(originalDimensions)
      ) {
        return null
      }
      const { width: inputWidth, height: inputHeight } = originalDimensions as Record<string, unknown>
      if (!positiveInteger(inputWidth) || !positiveInteger(inputHeight)) return null
      inputDimensions = { width: inputWidth, height: inputHeight }
    }
    refs.push({
      attachmentId: attachmentId as AttachmentId,
      mediaType,
      bytes,
      width,
      height,
      ...name === undefined ? {} : { name },
      ...inputDimensions === undefined ? {} : { originalDimensions: inputDimensions },
    })
  }
  return refs.length > 0 ? refs : null
}

/**
 * Join text blocks from a settled observation result (Host Pass text, not read_image envelope).
 * @param block - settled Tool result.
 * @returns joined text, or null when no text blocks exist.
 */
function observationText(block: ToolResultNode): string | null {
  const parts: string[] = []
  for (const part of block.content) {
    if (part.type === 'text' && typeof part.text === 'string' && part.text !== '') {
      parts.push(part.text)
    }
  }
  return parts.length > 0 ? parts.join('\n') : null
}

/**
 * Derive computerUse observation for a Tool block (null when not this class).
 * @param toolName - wire tool name.
 * @param block - running or settled Tool block from the Host session log.
 * @returns projected observation, or null when no computerUse observation applies.
 */
export function computerUseObservation(
  toolName: string,
  block: ToolCallBlock,
): ComputerUseObservation | null {
  if (!isComputerUseObservationTool(toolName, block)) return null
  if (!('kind' in block)) {
    return { status: 'running', images: null, text: null }
  }
  const text = observationText(block)
  if (block.isError) {
    return { status: 'error', images: null, text }
  }
  const images = imageReferences(block.content)
  if (images !== null) {
    return {
      status: 'observed',
      images: images.map(attachment => ({ attachment })),
      text,
    }
  }
  if (isComputerUsePassScreenshotTool(toolName) || metaMarksObservation(block.meta)) {
    if (text === null) return { status: 'error', images: null, text: null }
    return { status: 'observed', images: null, text }
  }
  return null
}
