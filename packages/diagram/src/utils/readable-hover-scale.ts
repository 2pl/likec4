// SPDX-License-Identifier: MIT
//
// Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.

import { type ReadableTextLevel, READABLE_TEXT_LEVELS } from './textScale'

/**
 * Screen-space font size (px) below which hovered text is considered unreadable.
 */
export const ReadableHoverFontThresholdPx = 14

/**
 * Level of the "readable text" feature that hovered text is enlarged to:
 * one level above the current one (`false` when readable text is disabled),
 * `xlarge` being the largest.
 */
export function readableHoverLevel(readableText: ReadableTextLevel | false): ReadableTextLevel {
  switch (readableText) {
    case 'large':
    case 'xlarge':
      return 'xlarge'
    default:
      return 'large'
  }
}

/**
 * Screen-space font size (px) hovered text is enlarged to, for text with the given CSS font size.
 * Uses the readability target of the {@link readableHoverLevel} (titles and labels have different targets).
 */
export function readableHoverThresholdPx(
  fontPx: number,
  kind: 'text' | 'label',
  readableText: ReadableTextLevel | false,
): number {
  return fontPx * READABLE_TEXT_LEVELS[readableHoverLevel(readableText)][kind].readable
}

/**
 * Upper bound on how much the "readable hover" scale may exceed the baseline hover scale.
 */
export const ReadableHoverMaxScale = 4

/**
 * Computes the hover scale needed to keep an on-screen font size readable.
 *
 * Returns `baselineScale` unchanged when the text is already readable (or the
 * measurement is invalid), otherwise the scale required to reach `thresholdPx`,
 * clamped to `[baselineScale, maxScale]`.
 */
export function computeReadableHoverScale(
  onScreenFontPx: number,
  baselineScale: number,
  thresholdPx: number = ReadableHoverFontThresholdPx,
  maxScale: number = ReadableHoverMaxScale,
): number {
  if (!Number.isFinite(onScreenFontPx) || onScreenFontPx <= 0) {
    return baselineScale
  }
  const needed = thresholdPx / onScreenFontPx
  return Math.min(Math.max(baselineScale, needed), Math.max(baselineScale, maxScale))
}
