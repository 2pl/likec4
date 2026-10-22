import { clamp } from 'remeda'

/**
 * CSS custom properties, that can be set via `style`
 */
export type CSSVariables = { [key: `--${string}`]: string | number }

/**
 * Text on the screen should not be smaller than this (relative to its normal size).
 * Below this zoom the text of the nodes is magnified to compensate.
 */
export const READABLE_TEXT_SCALE = 0.7

/**
 * Max magnification of the text.
 * Higher values do not fit long words into the narrow nodes
 */
export const MAX_TEXT_SCALE = 2.6

/**
 * Same as {@link READABLE_TEXT_SCALE}, for relationship labels.
 * Labels are small (and do not have a box to wrap into), so they need a bigger target than the titles
 */
export const READABLE_LABEL_SCALE = 0.9

/**
 * Max magnification of the labels (limited further by the preset, depending on the edge type)
 */
export const MAX_LABEL_SCALE = 3.2

/**
 * Magnification changes in steps of this size, to avoid restyling the diagram on every wheel tick
 */
const TEXT_SCALE_STEP = 0.2

/**
 * How large the text is kept, when the diagram is zoomed out
 */
export const ReadableTextLevels = ['normal', 'large', 'xlarge'] as const
export type ReadableTextLevel = typeof ReadableTextLevels[number]

export type ReadableTextLevelValues = {
  text: { readable: number; max: number }
  label: { readable: number; max: number }
  /**
   * Multiplier of the magnification limits set by the preset (edge types, compound titles)
   */
  capFactor: number
  /**
   * Magnification of the text in the popovers (i.e. relationship details on hover).
   * Popovers are not zoomed with the diagram, so it depends on the level only
   */
  popover: number
}

/**
 * Readability targets and limits for each {@link ReadableTextLevel}
 */
export const READABLE_TEXT_LEVELS: Record<ReadableTextLevel, ReadableTextLevelValues> = {
  normal: {
    text: { readable: READABLE_TEXT_SCALE, max: MAX_TEXT_SCALE },
    label: { readable: READABLE_LABEL_SCALE, max: MAX_LABEL_SCALE },
    capFactor: 1,
    popover: 1,
  },
  large: {
    text: { readable: 1, max: 3.4 },
    label: { readable: 1.2, max: 4.2 },
    capFactor: 1.3,
    popover: 1.25,
  },
  xlarge: {
    text: { readable: 1.4, max: 4.2 },
    label: { readable: 1.6, max: 5.2 },
    capFactor: 1.6,
    popover: 1.5,
  },
}

/**
 * Magnification of the text for a given zoom level.
 *
 * Large diagrams are zoomed out to fit the viewport, and the text of the nodes becomes unreadable.
 * The result is rounded to {@link TEXT_SCALE_STEP}.
 *
 * @returns 1 if the text is readable, otherwise up to {@link MAX_TEXT_SCALE}
 */
export function calcTextScale(
  zoom: number,
  readable: number = READABLE_TEXT_SCALE,
  max: number = MAX_TEXT_SCALE,
): number {
  if (!(zoom > 0)) {
    return max
  }
  const scale = clamp(readable / zoom, { min: 1, max })
  // toFixed removes the floating point noise (i.e. 1.4000000000000001)
  return Number((Math.round(scale / TEXT_SCALE_STEP) * TEXT_SCALE_STEP).toFixed(1))
}

/**
 * Magnification of the relationship labels for a given zoom level.
 * @see calcTextScale
 */
export function calcLabelScale(zoom: number, level: ReadableTextLevel = 'normal'): number {
  const { readable, max } = READABLE_TEXT_LEVELS[level].label
  return calcTextScale(zoom, readable, max)
}

/**
 * Magnification of the text of the nodes for a given zoom level and {@link ReadableTextLevel}.
 * @see calcTextScale
 */
export function calcLevelTextScale(zoom: number, level: ReadableTextLevel): number {
  const { readable, max } = READABLE_TEXT_LEVELS[level].text
  return calcTextScale(zoom, readable, max)
}

/**
 * Magnification of the text in the popovers for a given {@link ReadableTextLevel}
 * (`false` when readable text is disabled).
 */
export function calcPopoverTextScale(level: ReadableTextLevel | false): number {
  return level === false ? 1 : READABLE_TEXT_LEVELS[level].popover
}

export type TextScaleProps = {
  'data-likec4-text-scaled'?: true
  'data-likec4-label-scaled'?: true
  style: CSSVariables
}

/**
 * Attributes and styles for the diagram root, to magnify the text of the nodes (see {@link calcTextScale})
 * and the relationship labels (see {@link calcLabelScale}).
 * Magnified text is styled by the preset (conditions `textScaled` and `labelScaled`,
 * variables `--likec4-text-scale`, `--likec4-label-scale` and `--likec4-text-cap`).
 * Nodes and labels are magnified independently, the attribute is set only for those that need it.
 *
 * @returns `null` if the text is readable and nothing should be changed
 */
export function textScaleProps(
  scale: number,
  labelScale: number = scale,
  capFactor: number = 1,
): TextScaleProps | null {
  const isTextScaled = scale > 1
  const isLabelScaled = labelScale > 1
  if (!isTextScaled && !isLabelScaled) {
    return null
  }
  const props: TextScaleProps = { style: {} }
  if (capFactor !== 1) {
    props.style['--likec4-text-cap'] = capFactor
  }
  if (isTextScaled) {
    props['data-likec4-text-scaled'] = true
    props.style['--likec4-text-scale'] = scale
  }
  if (isLabelScaled) {
    props['data-likec4-label-scaled'] = true
    props.style['--likec4-label-scale'] = labelScale
  }
  return props
}
