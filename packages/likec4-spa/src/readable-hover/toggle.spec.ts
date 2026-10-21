// SPDX-License-Identifier: MIT
//
// Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.

import { describe, expect, it } from 'vitest'
import {
  parseReadableHoverOverride,
  readableHoverStorageKey,
  readReadableHoverOverride,
  resolveReadableHover,
  saveReadableHoverOverride,
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

describe('resolveReadableHover', () => {
  it('uses the saved override before the configured default', () => {
    expect(resolveReadableHover({ savedOverride: true, configuredDefault: false })).toBe(true)
    expect(resolveReadableHover({ savedOverride: false, configuredDefault: true })).toBe(false)
  })

  it('falls back to the configured default when no override exists', () => {
    expect(resolveReadableHover({ configuredDefault: true })).toBe(true)
    expect(resolveReadableHover({ configuredDefault: false })).toBe(false)
  })
})

describe('parseReadableHoverOverride', () => {
  it('parses only the literal strings "true" and "false"', () => {
    expect(parseReadableHoverOverride('true')).toBe(true)
    expect(parseReadableHoverOverride('false')).toBe(false)
    expect(parseReadableHoverOverride('yes')).toBeUndefined()
    expect(parseReadableHoverOverride(null)).toBeUndefined()
  })
})

describe('readable hover storage', () => {
  it('isolates saved preferences by project id', () => {
    const storage = createStorage()

    expect(saveReadableHoverOverride('alpha', true, storage)).toBe(true)
    expect(readReadableHoverOverride('alpha', storage)).toBe(true)
    expect(readReadableHoverOverride('beta', storage)).toBeUndefined()
  })

  it('ignores malformed saved values', () => {
    const storage = createStorage({
      [readableHoverStorageKey('alpha')]: 'enabled',
    })

    expect(readReadableHoverOverride('alpha', storage)).toBeUndefined()
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

    expect(readReadableHoverOverride('alpha', storage)).toBeUndefined()
    expect(saveReadableHoverOverride('alpha', true, storage)).toBe(false)
  })
})
