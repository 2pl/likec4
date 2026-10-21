// SPDX-License-Identifier: MIT
//
// Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.

/**
 * Screen-space font size (px) below which hovered text is considered unreadable.
 */
export const ReadableHoverFontThresholdPx = 14

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
