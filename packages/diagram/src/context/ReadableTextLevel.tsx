// SPDX-License-Identifier: MIT
//
// Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.

import { createContext, useContext } from 'react'
import type { ReadableTextLevel } from '../utils/textScale'

const ReadableTextLevelContext = createContext<ReadableTextLevel>('normal')

/**
 * Provides the {@link ReadableTextLevel}, used when the `ReadableText` feature is enabled
 */
export const ReadableTextLevelProvider = ReadableTextLevelContext.Provider

export function useReadableTextLevel(): ReadableTextLevel {
  return useContext(ReadableTextLevelContext)
}
