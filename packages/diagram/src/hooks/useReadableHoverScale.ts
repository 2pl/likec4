// SPDX-License-Identifier: MIT
//
// Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.

import { type RefObject, useCallback, useLayoutEffect, useRef, useState } from 'react'
import { useEnabledFeatures } from '../context/DiagramFeatures'
import { useReadableTextLevel } from '../context/ReadableTextLevel'
import { computeReadableHoverScale, readableHoverThresholdPx } from '../utils/readable-hover-scale'
import { useXYStore } from './useXYFlow'

export type UseReadableHoverScaleOptions = {
  /** Smart "readable hover" scaling is turned on */
  enabled: boolean
  /** Whether the measured element is currently hovered */
  hovered: boolean
  /** The scale applied today (e.g. 1.05 for elements, 1.06 for edge labels) */
  baselineScale: number
  /** CSS selector (scoped to `containerRef`) for the text node whose on-screen size must stay readable */
  measureSelector: string
  /** Element titles (`text`) or relationship labels (`label`), they have different readability targets */
  kind: 'text' | 'label'
}

/**
 * Computes the hover scale to apply so the measured text stays readable on screen,
 * never going below `baselineScale`.
 *
 * The text is enlarged to the size of the "readable text" level above the current one
 * (see `readableHoverLevel`), so hover always shows the text larger than readable text does.
 *
 * Measures the text's CSS `font-size` and the on-screen scale factor currently applied
 * to it (`getBoundingClientRect().height / offsetHeight`, which picks up zoom and any
 * ancestor transform), dividing out the scale this hook itself last applied so the
 * measurement reflects zoom alone.
 *
 * Only subscribes to the xyflow zoom level while `hovered` is true, so non-hovered
 * nodes don't re-render when the viewport zooms.
 */
export function useReadableHoverScale(
  containerRef: RefObject<HTMLElement | null>,
  { enabled, hovered, baselineScale, measureSelector, kind }: UseReadableHoverScaleOptions,
): number {
  const { enableReadableText } = useEnabledFeatures()
  const readableTextLevel = useReadableTextLevel()
  const readableText = enableReadableText ? readableTextLevel : false
  const appliedScaleRef = useRef(baselineScale)
  const [scale, setScale] = useState(baselineScale)

  const zoom = useXYStore(useCallback((state) => hovered ? state.transform[2] : 0, [hovered]))

  useLayoutEffect(() => {
    if (!enabled || !hovered) {
      appliedScaleRef.current = baselineScale
      setScale(baselineScale)
      return
    }
    const el = containerRef.current?.querySelector<HTMLElement>(measureSelector)
    const offsetHeight = el?.offsetHeight ?? 0
    if (!el || offsetHeight <= 0) {
      setScale(baselineScale)
      return
    }
    const fontPx = parseFloat(getComputedStyle(el).fontSize) || 0
    const visualScale = el.getBoundingClientRect().height / offsetHeight
    // Divide out the scale we previously applied ourselves, leaving only zoom
    // and other ancestor transforms.
    const onScreenFontPx = fontPx * (visualScale / appliedScaleRef.current)
    const next = computeReadableHoverScale(
      onScreenFontPx,
      baselineScale,
      readableHoverThresholdPx(fontPx, kind, readableText),
    )
    appliedScaleRef.current = next
    setScale(next)
  }, [containerRef, enabled, hovered, baselineScale, measureSelector, kind, readableText, zoom])

  return scale
}
