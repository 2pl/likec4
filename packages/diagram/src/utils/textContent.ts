// SPDX-License-Identifier: MIT
//
// Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.

import type { DeploymentFqn, ElementShape, Fqn, MarkdownOrString } from '@likec4/core'
import type { LikeC4Model } from '@likec4/core/model'
import { type IconPosition, type ShapeSize, countWrappedLines } from '@likec4/core/styles'
import { isDeepEqual } from 'remeda'
import { MAX_TEXT_SCALE } from './textScale'

/**
 * What the secondary text of a node is:
 * - `summary`: a short text (the summary, or a text overridden in the view)
 * - `description`: the long description, shown because the element has no summary
 */
export type NodeTextKind = 'summary' | 'description'

type WithSummaryAndDescription = {
  summary?: MarkdownOrString | null | undefined
  description?: MarkdownOrString | null | undefined
}

/**
 * Resolves whether the text of a node is a summary or a description, by comparing it with its model sources.
 *
 * Text that cannot be traced back to a description (no model, view override) is considered a summary.
 *
 * @returns `null` if the node has no text
 */
export function nodeTextKind(
  text: MarkdownOrString | null | undefined,
  sources: ReadonlyArray<WithSummaryAndDescription>,
): NodeTextKind | null {
  if (!text) {
    return null
  }
  if (sources.some(s => !!s.summary && isDeepEqual(s.summary, text))) {
    return 'summary'
  }
  if (sources.some(s => !!s.description && isDeepEqual(s.description, text))) {
    return 'description'
  }
  return 'summary'
}

/**
 * Model sources of the node text (the element, or the deployment node / instance and its element)
 */
export function nodeTextSources(
  model: LikeC4Model<any> | null,
  ref: { modelFqn?: Fqn | null | undefined; deploymentFqn?: DeploymentFqn | null | undefined },
): WithSummaryAndDescription[] {
  if (!model) {
    return []
  }
  if (ref.deploymentFqn) {
    const deployment = model.deployment.findElement(ref.deploymentFqn)
    switch (true) {
      case deployment?.isInstance():
        return [deployment.$instance, deployment.element.$element]
      case deployment?.isDeploymentNode():
        return [deployment.$node]
      default:
        return []
    }
  }
  if (ref.modelFqn) {
    const element = model.findElement(ref.modelFqn)
    return element ? [element.$element] : []
  }
  return []
}

/**
 * Text content shown in the nodes, chosen once for the whole diagram (for consistency):
 * - `full`: title, technology and text (summary, or description if there is no summary)
 * - `summary`: title and summary (descriptions and technology are hidden)
 * - `title`: title only
 */
export type TextContentMode = 'full' | 'summary' | 'title'

/**
 * Node, as seen by the text fit estimation
 */
export interface TextFitNode {
  title: string
  technology: string | null
  /**
   * Plain text of the summary or description
   */
  text: string | null
  kind: NodeTextKind | null
  size: ShapeSize
  shape: ElementShape
  width: number
  height: number
  /**
   * Title font size, in pixels
   */
  textSize: number
  /**
   * Icon size in pixels, 0 if there is no icon
   */
  iconSize: number
  iconPosition: IconPosition
}

// Mirrors elementNodeData recipe (magnified state)
const CharWidthRatio = 0.55
const TitleLineHeight = 1.35
const SecondaryLineHeight = 1.2
const TechnologyRatio = 0.635
const DescriptionRatio = 0.74
const ContentGap = 8
const ContentGapTight = 6
const IconGap = 12
const ScaledPadding = 8

/**
 * Content box of a magnified node, in node pixels.
 * Paddings (and the icon) keep their size on screen, see `_textScaled` in elementNodeData recipe
 */
function scaledContentBox({ shape, width, height }: TextFitNode) {
  let left = ScaledPadding
  let right = ScaledPadding
  let top = ScaledPadding
  let bottom = ScaledPadding
  switch (shape) {
    case 'queue':
    case 'mobile':
      left = 46
      right = 16
      break
    case 'bucket':
      left = right = 20
      break
    case 'component':
      left = 30
      break
    case 'cylinder':
    case 'storage':
      top = 30
      break
    case 'browser':
      top = 32
      bottom = 28
      break
  }
  return {
    width: Math.max(0, width - left - right),
    height: Math.max(0, height - top - bottom),
  }
}

function maxcharsFor(width: number, fontSize: number) {
  return Math.max(1, Math.floor(width / (fontSize * CharWidthRatio)))
}

function linesHeight(text: string, width: number, fontSize: number, lineHeight: number, maxLines: number) {
  return Math.min(countWrappedLines(text, maxcharsFor(width, fontSize)), maxLines) * fontSize * lineHeight
}

/**
 * Whether the title and the given parts fit into the node, when the text is magnified by `scale`
 */
export function fitsAtScale(
  node: TextFitNode,
  scale: number,
  parts: { technology: boolean; text: boolean },
): boolean {
  const box = scaledContentBox(node)
  let width = box.width
  let height = box.height
  if (node.iconSize > 0) {
    if (node.iconPosition === 'left' || node.iconPosition === 'right') {
      width -= node.iconSize + IconGap * scale
    } else {
      height -= node.iconSize + IconGap * scale
    }
  }
  const isSmOrXs = node.size === 'xs' || node.size === 'sm'
  const fontSize = node.textSize * scale
  const gap = (parts.technology && parts.text ? ContentGapTight : ContentGap) * scale

  // The title must fit whole: within its line limit, and without breaking words
  const titleMaxLines = isSmOrXs ? 2 : 3
  const titleMaxchars = maxcharsFor(width, fontSize)
  const titleLines = countWrappedLines(node.title, titleMaxchars)
  if (titleLines > titleMaxLines || node.title.split(/\s+/).some(word => word.length > titleMaxchars)) {
    return false
  }
  let needed = titleLines * fontSize * TitleLineHeight
  if (parts.technology && node.technology) {
    needed += gap + linesHeight(node.technology, width, fontSize * TechnologyRatio, SecondaryLineHeight, Infinity)
  }
  if (parts.text && node.text) {
    needed += gap + linesHeight(node.text, width, fontSize * DescriptionRatio, SecondaryLineHeight, isSmOrXs ? 3 : 5)
  }
  return needed <= height
}

/**
 * Largest text scale (in steps of 0.2, as produced by `calcTextScale`) at which the title
 * and the given parts still fit into the node
 * @param maxScale - Max magnification, see {@link MAX_TEXT_SCALE}
 * @returns 1 if they do not fit at any magnification
 */
export function maxReadableScale(
  node: TextFitNode,
  parts: { technology: boolean; text: boolean },
  maxScale: number = MAX_TEXT_SCALE,
): number {
  let max = 1
  for (let step = 6; step <= Math.round(maxScale * 5); step++) {
    // toFixed removes the floating point noise, same as calcTextScale
    const scale = Number((step / 5).toFixed(1))
    if (!fitsAtScale(node, scale, parts)) {
      break
    }
    max = scale
  }
  return max
}

export type TextContentThresholds = {
  /**
   * Max text scale at which the titles still fit (the text is not magnified more than this)
   */
  title: number
  /**
   * Max text scale for {@link TextContentMode} `full`
   */
  full: number
  /**
   * Max text scale for {@link TextContentMode} `summary`
   */
  summary: number
}

/**
 * Max text scales for each {@link TextContentMode}, the most constrained node decides for the whole diagram:
 * - if a node can not show its technology and text anymore, all nodes switch to `summary`
 * - if a node can not show its summary anymore, all nodes switch to `title`
 * - the text is not magnified beyond the scale at which all the titles still fit
 *
 * Small nodes (`xs`, `sm`) do not vote, they hide what does not fit on their own.
 * Neither do nodes whose title does not fit even without magnification.
 */
export function calcTextContentThresholds(
  nodes: Iterable<TextFitNode>,
  maxScale: number = MAX_TEXT_SCALE,
): TextContentThresholds {
  let title = Infinity
  let full = Infinity
  let summary = Infinity
  for (const node of nodes) {
    if (node.size === 'xs' || node.size === 'sm') {
      continue
    }
    if (fitsAtScale(node, 1, { technology: false, text: false })) {
      title = Math.min(title, maxReadableScale(node, { technology: false, text: false }, maxScale))
    }
    const technology = !!node.technology
    const text = !!node.text
    if (technology || text) {
      full = Math.min(full, maxReadableScale(node, { technology, text }, maxScale))
    }
    if (text && node.kind === 'summary') {
      summary = Math.min(summary, maxReadableScale(node, { technology: false, text: true }, maxScale))
    }
  }
  return { title, full, summary }
}

/**
 * Text scale, limited to the scale at which all the titles still fit (see {@link TextContentThresholds.title})
 */
export function cappedTextScale(scale: number, thresholds: TextContentThresholds): number {
  return Math.max(1, Math.min(scale, thresholds.title))
}

/**
 * Text content shown in the nodes for the given (capped) text scale
 */
export function textContentMode(scale: number, thresholds: TextContentThresholds): TextContentMode {
  switch (true) {
    case scale <= 1 || scale <= thresholds.full:
      return 'full'
    case scale <= thresholds.summary:
      return 'summary'
    default:
      return 'title'
  }
}
