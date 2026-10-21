// SPDX-License-Identifier: MIT
//
// Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.

import { describe, expect, it } from 'vitest'
import {
  computeReadableHoverScale,
  ReadableHoverFontThresholdPx,
  readableHoverLevel,
  ReadableHoverMaxScale,
  readableHoverMaxScale,
  readableHoverThresholdPx,
} from './readable-hover-scale'
import { calcLevelTextScale, READABLE_TEXT_LEVELS } from './textScale'

describe('readableHoverLevel', () => {
  it('enlarges to the level above the readable text level', () => {
    expect(readableHoverLevel(false)).toBe('large')
    expect(readableHoverLevel('normal')).toBe('large')
    expect(readableHoverLevel('large')).toBe('xlarge')
  })

  it('keeps xlarge as the largest level', () => {
    expect(readableHoverLevel('xlarge')).toBe('xlarge')
  })
})

describe('readableHoverMaxScale', () => {
  it('does not limit hover when readable text is enabled', () => {
    expect(readableHoverMaxScale(0.3, 'text', 'normal')).toBe(ReadableHoverMaxScale)
    expect(readableHoverMaxScale(0.3, 'label', 'xlarge')).toBe(ReadableHoverMaxScale)
  })

  it('limits hover without readable text to the hover scale with readable text "normal"', () => {
    // zoom 0.36: "normal" magnifies titles x2 (0.72 on screen), hover to "large" (1.0) needs x1.39
    expect(readableHoverMaxScale(0.36, 'text', false)).toBeCloseTo(1 / 0.72, 5)
  })

  it('never makes the hovered element larger than with readable text "normal"', () => {
    const fontPx = 19.2
    for (const zoom of [0.1, 0.2, 0.36, 0.5]) {
      const withNormal = computeReadableHoverScale(
        fontPx * zoom * calcLevelTextScale(zoom, 'normal'),
        1.05,
        readableHoverThresholdPx(fontPx, 'text', 'normal'),
      )
      const withoutReadableText = computeReadableHoverScale(
        fontPx * zoom,
        1.05,
        readableHoverThresholdPx(fontPx, 'text', false),
        readableHoverMaxScale(zoom, 'text', false),
      )
      expect(withoutReadableText).toBeLessThanOrEqual(withNormal + 1e-9)
    }
  })

  it('keeps the baseline bump when the text is readable', () => {
    expect(computeReadableHoverScale(30, 1.05, 19.2, readableHoverMaxScale(1, 'text', false))).toBe(1.05)
  })
})

describe('readableHoverThresholdPx', () => {
  it('uses the readability target of the hover level', () => {
    expect(readableHoverThresholdPx(20, 'text', false)).toBeCloseTo(20 * READABLE_TEXT_LEVELS.large.text.readable)
    expect(readableHoverThresholdPx(20, 'text', 'large')).toBeCloseTo(20 * READABLE_TEXT_LEVELS.xlarge.text.readable)
  })

  it('uses the label targets for relationship labels', () => {
    expect(readableHoverThresholdPx(14, 'label', false)).toBeCloseTo(14 * READABLE_TEXT_LEVELS.large.label.readable)
    expect(readableHoverThresholdPx(14, 'label', 'large')).toBeCloseTo(14 * READABLE_TEXT_LEVELS.xlarge.label.readable)
  })

  it('enlarges hovered text above what readable text already shows', () => {
    // Readable text "large" keeps titles at 100% of their size on screen,
    // hover needs more (xlarge target), so it does not stay at the baseline bump
    const fontPx = 20
    const onScreen = fontPx * READABLE_TEXT_LEVELS.large.text.readable
    expect(computeReadableHoverScale(onScreen, 1.05, readableHoverThresholdPx(fontPx, 'text', 'large')))
      .toBeCloseTo(READABLE_TEXT_LEVELS.xlarge.text.readable / READABLE_TEXT_LEVELS.large.text.readable)
  })
})

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
