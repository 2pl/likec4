import { describe, expect, it } from 'vitest'
import {
  calcLabelScale,
  calcLevelTextScale,
  calcPopoverTextScale,
  calcTextScale,
  MAX_TEXT_SCALE,
  READABLE_TEXT_LEVELS,
  READABLE_TEXT_SCALE,
  textScaleProps,
} from './textScale'

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

describe('readable text levels', () => {
  it('normal level keeps the default values', () => {
    expect(calcLevelTextScale(0.5, 'normal')).toBe(calcTextScale(0.5))
    expect(calcLabelScale(0.5, 'normal')).toBe(calcLabelScale(0.5))
  })

  it('larger levels magnify more, and earlier', () => {
    expect(calcLevelTextScale(0.8, 'normal')).toBe(1)
    expect(calcLevelTextScale(0.8, 'large')).toBe(1.2)
    expect(calcLevelTextScale(0.8, 'xlarge')).toBe(1.8)
    // xlarge keeps the text larger than normal even at 100%
    expect(calcLevelTextScale(1, 'xlarge')).toBe(1.4)
  })

  it('larger levels have higher limits', () => {
    expect(calcLevelTextScale(0.01, 'large')).toBe(READABLE_TEXT_LEVELS.large.text.max)
    expect(calcLevelTextScale(0.01, 'xlarge')).toBe(READABLE_TEXT_LEVELS.xlarge.text.max)
    expect(READABLE_TEXT_LEVELS.xlarge.text.max).toBeGreaterThan(READABLE_TEXT_LEVELS.large.text.max)
    expect(READABLE_TEXT_LEVELS.large.text.max).toBeGreaterThan(MAX_TEXT_SCALE)
  })

  it('passes the limit factor of the preset only when it differs from the default', () => {
    expect(textScaleProps(1.4, 1.4, 1.3)?.style['--likec4-text-cap']).toBe(1.3)
    expect(textScaleProps(1.4, 1.4)?.style).not.toHaveProperty('--likec4-text-cap')
  })
})

describe('calcPopoverTextScale', () => {
  it('keeps the popover text as is when readable text is disabled or normal', () => {
    expect(calcPopoverTextScale(false)).toBe(1)
    expect(calcPopoverTextScale('normal')).toBe(1)
  })

  it('larger levels magnify the popover text more', () => {
    expect(calcPopoverTextScale('large')).toBeGreaterThan(1)
    expect(calcPopoverTextScale('xlarge')).toBeGreaterThan(calcPopoverTextScale('large'))
  })
})
