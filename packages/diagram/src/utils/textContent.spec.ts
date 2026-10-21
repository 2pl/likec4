// SPDX-License-Identifier: MIT
//
// Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.

import { describe, expect, it } from 'vitest'
import {
  type TextFitNode,
  calcTextContentThresholds,
  fitsAtScale,
  maxReadableScale,
  nodeTextKind,
  textContentMode,
} from './textContent'

function node(overrides: Partial<TextFitNode> = {}): TextFitNode {
  return {
    title: 'Backend',
    technology: null,
    text: null,
    kind: null,
    size: 'md',
    shape: 'rectangle',
    width: 320,
    height: 180,
    textSize: 19,
    iconSize: 0,
    iconPosition: 'left',
    ...overrides,
  }
}

const longText = 'Handles orders, payments and notifications for all the customers of the platform, '.repeat(2)

describe('nodeTextKind', () => {
  it('returns null when the node has no text', () => {
    expect(nodeTextKind(null, [{ summary: { txt: 'a' } }])).toBeNull()
  })

  it('detects a summary', () => {
    expect(nodeTextKind({ txt: 'short' }, [{ summary: { txt: 'short' }, description: { txt: 'long' } }])).toBe(
      'summary',
    )
  })

  it('detects a description shown because there is no summary', () => {
    expect(nodeTextKind({ txt: 'long' }, [{ description: { txt: 'long' } }])).toBe('description')
  })

  it('checks every source (deployed instance and its element)', () => {
    expect(nodeTextKind({ md: '**long**' }, [{}, { description: { md: '**long**' } }])).toBe('description')
  })

  it('treats untraceable text (view override, no model) as a summary', () => {
    expect(nodeTextKind({ txt: 'override' }, [{ description: { txt: 'long' } }])).toBe('summary')
    expect(nodeTextKind({ txt: 'no model' }, [])).toBe('summary')
  })
})

describe('fitsAtScale', () => {
  it('fits a short title in a large node', () => {
    expect(fitsAtScale(node(), 2.6, { technology: false, text: false })).toBe(true)
  })

  it('needs more room for each part', () => {
    const n = node({ technology: 'Java, Spring', text: longText, height: 200 })
    const scale = maxReadableScale(n, { technology: true, text: true })
    expect(scale).toBeLessThan(maxReadableScale(n, { technology: false, text: true }))
    expect(fitsAtScale(n, scale, { technology: true, text: true })).toBe(true)
  })

  it('reserves room for the icon', () => {
    const n = node({ text: longText })
    const withIcon = node({ text: longText, iconSize: 60 })
    expect(maxReadableScale(withIcon, { technology: false, text: true })).toBeLessThanOrEqual(
      maxReadableScale(n, { technology: false, text: true }),
    )
  })
})

describe('maxReadableScale', () => {
  it('returns 1 when the parts do not fit even slightly magnified', () => {
    expect(maxReadableScale(node({ height: 60, text: longText }), { technology: false, text: true })).toBe(1)
  })

  it('returns the max scale when everything fits', () => {
    expect(maxReadableScale(node({ width: 2000, height: 2000 }), { technology: false, text: false })).toBe(2.6)
  })
})

describe('calcTextContentThresholds', () => {
  it('switches all nodes to summary when a description does not fit', () => {
    const thresholds = calcTextContentThresholds([
      node({ text: 'Short summary', kind: 'summary' }),
      node({ text: longText, kind: 'description' }),
    ])
    expect(thresholds.full).toBeLessThan(thresholds.summary)
    expect(textContentMode(thresholds.full, thresholds)).toBe('full')
    expect(textContentMode(thresholds.full + 0.2, thresholds)).toBe('summary')
  })

  it('switches all nodes to title when a summary does not fit', () => {
    const thresholds = calcTextContentThresholds([
      node({ text: longText, kind: 'summary', height: 120 }),
    ])
    expect(textContentMode(thresholds.summary + 0.2, thresholds)).toBe('title')
  })

  it('does not count small nodes', () => {
    const thresholds = calcTextContentThresholds([
      node({ size: 'sm', width: 100, height: 60, text: longText, kind: 'summary' }),
      node({ size: 'xs', width: 60, height: 40, technology: 'Go', text: longText, kind: 'description' }),
    ])
    expect(thresholds).toEqual({ full: Infinity, summary: Infinity })
  })

  it('does not count descriptions for the summary threshold', () => {
    const thresholds = calcTextContentThresholds([node({ text: longText, kind: 'description', height: 120 })])
    expect(thresholds.summary).toBe(Infinity)
    expect(textContentMode(2.6, thresholds)).toBe('summary')
  })
})

describe('textContentMode', () => {
  it('shows everything when the text is not magnified', () => {
    expect(textContentMode(1, { full: 1, summary: 1 })).toBe('full')
  })
})
