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
export function calcLabelScale(zoom: number): number {
  return calcTextScale(zoom, READABLE_LABEL_SCALE, MAX_LABEL_SCALE)
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
 * variables `--likec4-text-scale` and `--likec4-label-scale`).
 * Nodes and labels are magnified independently, the attribute is set only for those that need it.
 *
 * @returns `null` if the text is readable and nothing should be changed
 */
export function textScaleProps(
  scale: number,
  labelScale: number = scale,
): TextScaleProps | null {
  const isTextScaled = scale > 1
  const isLabelScaled = labelScale > 1
  if (!isTextScaled && !isLabelScaled) {
    return null
  }
  const props: TextScaleProps = { style: {} }
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
