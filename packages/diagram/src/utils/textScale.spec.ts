import { describe, expect, it } from 'vitest'
import { calcLabelScale, calcTextScale, MAX_TEXT_SCALE, READABLE_TEXT_SCALE, textScaleProps } from './textScale'

describe('calcTextScale', () => {
  it('does not change the text if it is readable', () => {
    expect(calcTextScale(1)).toBe(1)
    expect(calcTextScale(2.5)).toBe(1)
    expect(calcTextScale(READABLE_TEXT_SCALE)).toBe(1)
  })

  it('compensates the zoom, so the text is readable', () => {
    expect(calcTextScale(0.5)).toBe(1.4)
    expect(calcTextScale(0.35)).toBe(2)
    expect(calcTextScale(0.3)).toBe(2.4)
  })

  it('is limited', () => {
    expect(calcTextScale(0.2)).toBe(MAX_TEXT_SCALE)
    expect(calcTextScale(0.05)).toBe(MAX_TEXT_SCALE)
  })

  it('handles invalid zoom', () => {
    expect(calcTextScale(0)).toBe(MAX_TEXT_SCALE)
    expect(calcTextScale(NaN)).toBe(MAX_TEXT_SCALE)
  })

  it('changes in steps, to avoid restyling on every wheel tick', () => {
    // the whole range of zoom levels results in a handful of values
    const values = new Set<number>()
    for (let zoom = 0.2; zoom <= 1; zoom += 0.01) {
      values.add(calcTextScale(zoom))
    }
    expect(values.size).toBeLessThanOrEqual(10)
    expect(calcTextScale(0.431)).toBe(calcTextScale(0.432))
  })

  it('does not return floating point noise', () => {
    for (let zoom = 0.2; zoom <= 1; zoom += 0.01) {
      expect(String(calcTextScale(zoom))).toMatch(/^\d(\.\d)?$/)
    }
  })
})

describe('textScaleProps', () => {
  it('returns nothing if the text is readable', () => {
    expect(textScaleProps(1)).toBeNull()
    expect(textScaleProps(0.5)).toBeNull()
    expect(textScaleProps(NaN)).toBeNull()
    expect(textScaleProps(1, 1)).toBeNull()
  })

  it('returns the attributes and the variables if the text is magnified', () => {
    expect(textScaleProps(1.4)).toEqual({
      'data-likec4-text-scaled': true,
      'data-likec4-label-scaled': true,
      style: { '--likec4-text-scale': 1.4, '--likec4-label-scale': 1.4 },
    })
  })

  it('does not switch the nodes to the magnified mode if only the labels need magnification', () => {
    const props = textScaleProps(1, 1.2)
    expect(props).toEqual({
      'data-likec4-label-scaled': true,
      style: { '--likec4-label-scale': 1.2 },
    })
    expect(props).not.toHaveProperty('data-likec4-text-scaled')
  })

  it('matches calcTextScale', () => {
    expect(textScaleProps(calcTextScale(1))).toBeNull()
    expect(textScaleProps(calcTextScale(0.3))).not.toBeNull()
  })
})

describe('calcLabelScale', () => {
  it('magnifies labels earlier and stronger than the text', () => {
    expect(calcLabelScale(0.8)).toBe(1.2)
    expect(calcLabelScale(0.58)).toBe(1.6)
    expect(calcLabelScale(0.58)).toBeGreaterThan(calcTextScale(0.58))
  })

  it('is limited', () => {
    expect(calcLabelScale(0.1)).toBe(3.2)
  })

  it('does not change readable labels', () => {
    expect(calcLabelScale(1)).toBe(1)
  })
})
