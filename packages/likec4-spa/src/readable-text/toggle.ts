// SPDX-License-Identifier: MIT
//
// Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.

import type { ReadableTextLevel } from '@likec4/config'
import { useStore } from '@nanostores/react'
import type { Project } from 'likec4:projects'
import { type WritableAtom, atom } from 'nanostores'
import { useEffect } from 'react'

type ReadableTextStorage = Pick<Storage, 'getItem' | 'setItem'>

/**
 * Readable text level, `false` if disabled
 */
export type ReadableText = ReadableTextLevel | false

/**
 * Options of the header "Text size" menu: off, then larger and larger text
 */
export const ReadableTextOptions: ReadonlyArray<ReadableText> = [false, 'normal', 'large', 'xlarge']

export function readableTextStorageKey(projectId: string) {
  return `likec4.readableText:${projectId}`
}

/**
 * Parses a saved preference (`true` is saved by earlier versions, and means `normal`)
 */
export function parseReadableTextOverride(value: unknown): ReadableText | undefined {
  switch (value) {
    case 'false':
      return false
    case 'true':
    case 'normal':
      return 'normal'
    case 'large':
    case 'xlarge':
      return value
    default:
      return undefined
  }
}

export function resolveReadableText(input: {
  savedOverride?: ReadableText
  configuredDefault: ReadableText
}): ReadableText {
  return input.savedOverride ?? input.configuredDefault
}

/**
 * Reads the readable-text override saved for one project.
 *
 * Storage is optional to keep server rendering and unavailable browser storage safe.
 */
export function readReadableTextOverride(
  projectId: string,
  storage: ReadableTextStorage | undefined = browserLocalStorage(),
): ReadableText | undefined {
  if (!storage) return undefined

  try {
    return parseReadableTextOverride(storage.getItem(readableTextStorageKey(projectId)))
  } catch {
    return undefined
  }
}

/**
 * Saves a user-selected readable-text preference for one project.
 */
export function saveReadableTextOverride(
  projectId: string,
  value: ReadableText,
  storage: ReadableTextStorage | undefined = browserLocalStorage(),
): boolean {
  if (!storage) return false

  try {
    storage.setItem(readableTextStorageKey(projectId), String(value))
    return true
  } catch {
    return false
  }
}

function resolveProjectReadableText(project: Project): ReadableText {
  const savedOverride = readReadableTextOverride(project.id)
  return resolveReadableText({
    ...(savedOverride !== undefined ? { savedOverride } : {}),
    configuredDefault: project.readableText,
  })
}

// One atom per project id, so the header toggle and the diagram prop (rendered in
// separate component trees) stay in sync without lifting state through props.
const atomsByProject = new Map<string, WritableAtom<ReadableText>>()
function atomForProject(project: Project): WritableAtom<ReadableText> {
  let $readableText = atomsByProject.get(project.id)
  if (!$readableText) {
    $readableText = atom(resolveProjectReadableText(project))
    atomsByProject.set(project.id, $readableText)
  }
  return $readableText
}

/**
 * Returns the saved readable-text preference for a project, or its configured
 * default when no preference exists, plus a setter that persists the choice.
 *
 * Shared across every caller for the same project, so a toggle rendered outside
 * the diagram (e.g. in the header) stays in sync with the diagram prop.
 */
export function useReadableText(project: Project): readonly [ReadableText, (value: ReadableText) => void] {
  const $readableText = atomForProject(project)
  const value = useStore($readableText)

  useEffect(() => {
    $readableText.set(resolveProjectReadableText(project))
  }, [$readableText, project.id, project.readableText])

  const setValue = (next: ReadableText) => {
    $readableText.set(next)
    saveReadableTextOverride(project.id, next)
  }

  return [value, setValue] as const
}

function browserLocalStorage(): ReadableTextStorage | undefined {
  if (typeof window === 'undefined') return undefined

  try {
    return window.localStorage
  } catch {
    return undefined
  }
}
