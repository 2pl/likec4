// SPDX-License-Identifier: MIT
//
// Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.

import { describe, expect, it } from 'vitest'
import {
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
    expect(resolveReadableText({ savedOverride: true, configuredDefault: false })).toBe(true)
    expect(resolveReadableText({ savedOverride: false, configuredDefault: true })).toBe(false)
  })

  it('falls back to the configured default when no override exists', () => {
    expect(resolveReadableText({ configuredDefault: true })).toBe(true)
    expect(resolveReadableText({ configuredDefault: false })).toBe(false)
  })
})

describe('parseReadableTextOverride', () => {
  it('parses only the literal strings "true" and "false"', () => {
    expect(parseReadableTextOverride('true')).toBe(true)
    expect(parseReadableTextOverride('false')).toBe(false)
    expect(parseReadableTextOverride('yes')).toBeUndefined()
    expect(parseReadableTextOverride(null)).toBeUndefined()
  })
})

describe('readable text storage', () => {
  it('isolates saved preferences by project id', () => {
    const storage = createStorage()

    expect(saveReadableTextOverride('alpha', false, storage)).toBe(true)
    expect(readReadableTextOverride('alpha', storage)).toBe(false)
    expect(readReadableTextOverride('beta', storage)).toBeUndefined()
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
    expect(saveReadableTextOverride('alpha', true, storage)).toBe(false)
  })
})
