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
export function calcTextScale(zoom: number): number {
  if (!(zoom > 0)) {
    return MAX_TEXT_SCALE
  }
  const scale = clamp(READABLE_TEXT_SCALE / zoom, { min: 1, max: MAX_TEXT_SCALE })
  // toFixed removes the floating point noise (i.e. 1.4000000000000001)
  return Number((Math.round(scale / TEXT_SCALE_STEP) * TEXT_SCALE_STEP).toFixed(1))
}

/**
 * Attributes and styles for the diagram root, to magnify the text of the nodes (see {@link calcTextScale}).
 * Magnified text is styled by the preset (conditions `textScaled`, variable `--likec4-text-scale`).
 *
 * @returns `null` if the text is readable and nothing should be changed
 */
export function textScaleProps(
  scale: number,
): { 'data-likec4-text-scaled': true; style: CSSVariables } | null {
  if (!(scale > 1)) {
    return null
  }
  return {
    'data-likec4-text-scaled': true,
    style: { '--likec4-text-scale': scale },
  }
}
