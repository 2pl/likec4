// SPDX-License-Identifier: MIT
//
// Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.

import { describe, expect, it } from 'vitest'
import {
  nextReadableText,
  parseReadableTextOverride,
  readableTextStorageKey,
  readReadableTextOverride,
  resolveReadableText,
  saveReadableTextOverride,
} from './toggle'

function createStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial))
  return {
    getItem(key: string) {
      return values.get(key) ?? null
    },
    setItem(key: string, value: string) {
      values.set(key, value)
    },
  }
}

describe('resolveReadableText', () => {
  it('uses the saved override before the configured default', () => {
    expect(resolveReadableText({ savedOverride: 'xlarge', configuredDefault: false })).toBe('xlarge')
    expect(resolveReadableText({ savedOverride: false, configuredDefault: 'normal' })).toBe(false)
  })

  it('falls back to the configured default when no override exists', () => {
    expect(resolveReadableText({ configuredDefault: 'large' })).toBe('large')
    expect(resolveReadableText({ configuredDefault: false })).toBe(false)
  })
})

describe('nextReadableText', () => {
  it('cycles off, normal, large, extra large, and back to off', () => {
    expect(nextReadableText(false)).toBe('normal')
    expect(nextReadableText('normal')).toBe('large')
    expect(nextReadableText('large')).toBe('xlarge')
    expect(nextReadableText('xlarge')).toBe(false)
  })
})

describe('parseReadableTextOverride', () => {
  it('parses the saved levels', () => {
    expect(parseReadableTextOverride('false')).toBe(false)
    expect(parseReadableTextOverride('normal')).toBe('normal')
    expect(parseReadableTextOverride('large')).toBe('large')
    expect(parseReadableTextOverride('xlarge')).toBe('xlarge')
  })

  it('reads "true", saved by earlier versions, as normal', () => {
    expect(parseReadableTextOverride('true')).toBe('normal')
  })

  it('ignores anything else', () => {
    expect(parseReadableTextOverride('yes')).toBeUndefined()
    expect(parseReadableTextOverride(null)).toBeUndefined()
  })
})

describe('readable text storage', () => {
  it('isolates saved preferences by project id', () => {
    const storage = createStorage()

    expect(saveReadableTextOverride('alpha', 'large', storage)).toBe(true)
    expect(readReadableTextOverride('alpha', storage)).toBe('large')
    expect(readReadableTextOverride('beta', storage)).toBeUndefined()
  })

  it('round-trips the disabled state', () => {
    const storage = createStorage()

    saveReadableTextOverride('alpha', false, storage)
    expect(readReadableTextOverride('alpha', storage)).toBe(false)
  })

  it('does not share the key with other diagram preferences', () => {
    expect(readableTextStorageKey('alpha')).toBe('likec4.readableText:alpha')
  })

  it('ignores malformed saved values', () => {
    const storage = createStorage({
      [readableTextStorageKey('alpha')]: 'enabled',
    })

    expect(readReadableTextOverride('alpha', storage)).toBeUndefined()
  })

  it('treats storage errors as absent values', () => {
    const storage = {
      getItem() {
        throw new Error('read failed')
      },
      setItem() {
        throw new Error('write failed')
      },
    }

    expect(readReadableTextOverride('alpha', storage)).toBeUndefined()
    expect(saveReadableTextOverride('alpha', 'normal', storage)).toBe(false)
  })
})
