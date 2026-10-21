// SPDX-License-Identifier: MIT
//
// Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.

import { describe, expect, it } from 'vitest'
import { computeReadableHoverScale, ReadableHoverFontThresholdPx, ReadableHoverMaxScale } from './readable-hover-scale'

describe('computeReadableHoverScale', () => {
  it('returns the baseline scale when the text is already readable', () => {
    expect(computeReadableHoverScale(16, 1.05)).toBe(1.05)
    expect(computeReadableHoverScale(ReadableHoverFontThresholdPx, 1.05)).toBe(1.05)
  })

  it('scales up to reach the threshold when the text is too small', () => {
    // 7px on screen, threshold 14px -> needs x2
    expect(computeReadableHoverScale(7, 1.05)).toBeCloseTo(2, 5)
  })

  it('never returns less than the baseline scale', () => {
    expect(computeReadableHoverScale(1000, 1.06)).toBe(1.06)
  })

  it('clamps to the max scale', () => {
    const result = computeReadableHoverScale(0.1, 1.05)
    expect(result).toBe(ReadableHoverMaxScale)
  })

  it('respects a custom threshold and max scale', () => {
    expect(computeReadableHoverScale(10, 1, 20, 3)).toBe(2)
    expect(computeReadableHoverScale(1, 1, 20, 3)).toBe(3)
  })

  it('falls back to the baseline scale for invalid measurements', () => {
    expect(computeReadableHoverScale(0, 1.05)).toBe(1.05)
    expect(computeReadableHoverScale(-5, 1.05)).toBe(1.05)
    expect(computeReadableHoverScale(Number.NaN, 1.05)).toBe(1.05)
    expect(computeReadableHoverScale(Number.POSITIVE_INFINITY, 1.05)).toBe(1.05)
  })
})
