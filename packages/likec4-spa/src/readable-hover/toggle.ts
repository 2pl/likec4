// SPDX-License-Identifier: MIT
//
// Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.

import { useStore } from '@nanostores/react'
import type { Project } from 'likec4:projects'
import { type WritableAtom, atom } from 'nanostores'
import { useEffect } from 'react'

type ReadableHoverStorage = Pick<Storage, 'getItem' | 'setItem'>

export function readableHoverStorageKey(projectId: string) {
  return `likec4.readableHover:${projectId}`
}

export function parseReadableHoverOverride(value: unknown): boolean | undefined {
  return value === 'true' ? true : value === 'false' ? false : undefined
}

export function resolveReadableHover(input: {
  savedOverride?: boolean
  configuredDefault: boolean
}): boolean {
  return input.savedOverride ?? input.configuredDefault
}

/**
 * Reads the readable-hover override saved for one project.
 *
 * Storage is optional to keep server rendering and unavailable browser storage safe.
 */
export function readReadableHoverOverride(
  projectId: string,
  storage: ReadableHoverStorage | undefined = browserLocalStorage(),
): boolean | undefined {
  if (!storage) return undefined

  try {
    return parseReadableHoverOverride(storage.getItem(readableHoverStorageKey(projectId)))
  } catch {
    return undefined
  }
}

/**
 * Saves a user-selected readable-hover preference for one project.
 */
export function saveReadableHoverOverride(
  projectId: string,
  value: boolean,
  storage: ReadableHoverStorage | undefined = browserLocalStorage(),
): boolean {
  if (!storage) return false

  try {
    storage.setItem(readableHoverStorageKey(projectId), String(value))
    return true
  } catch {
    return false
  }
}

function resolveProjectReadableHover(project: Project): boolean {
  const savedOverride = readReadableHoverOverride(project.id)
  return resolveReadableHover({
    ...(savedOverride !== undefined ? { savedOverride } : {}),
    configuredDefault: project.readableHover,
  })
}

// One atom per project id, so the header toggle and the diagram prop (rendered in
// separate component trees) stay in sync without lifting state through props.
const atomsByProject = new Map<string, WritableAtom<boolean>>()
function atomForProject(project: Project): WritableAtom<boolean> {
  let $readableHover = atomsByProject.get(project.id)
  if (!$readableHover) {
    $readableHover = atom(resolveProjectReadableHover(project))
    atomsByProject.set(project.id, $readableHover)
  }
  return $readableHover
}

/**
 * Returns the saved readable-hover preference for a project, or its configured
 * default when no preference exists, plus a setter that persists the choice.
 *
 * Shared across every caller for the same project, so a toggle rendered outside
 * the diagram (e.g. in the header) stays in sync with the diagram prop.
 */
export function useReadableHover(project: Project): readonly [boolean, (value: boolean) => void] {
  const $readableHover = atomForProject(project)
  const value = useStore($readableHover)

  useEffect(() => {
    $readableHover.set(resolveProjectReadableHover(project))
  }, [$readableHover, project.id, project.readableHover])

  const setValue = (next: boolean) => {
    $readableHover.set(next)
    saveReadableHoverOverride(project.id, next)
  }

  return [value, setValue] as const
}

function browserLocalStorage(): ReadableHoverStorage | undefined {
  if (typeof window === 'undefined') return undefined

  try {
    return window.localStorage
  } catch {
    return undefined
  }
}
