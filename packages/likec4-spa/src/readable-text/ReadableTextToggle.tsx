// SPDX-License-Identifier: MIT
//
// Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.

import { ActionIcon, Tooltip } from '@mantine/core'
import { IconTextSize } from '@tabler/icons-react'
import { useCurrentProject } from '../hooks'
import { useReadableText } from './toggle'

/**
 * Header toggle for the "readable text when zoomed out" diagram feature (see `useReadableText`).
 */
export function ReadableTextToggle() {
  const project = useCurrentProject()
  const [readableText, setReadableText] = useReadableText(project)

  return (
    <Tooltip label={readableText ? 'Readable text when zoomed out: on' : 'Readable text when zoomed out: off'}>
      <ActionIcon
        size={'md'}
        variant={readableText ? 'light' : 'subtle'}
        color={readableText ? 'blue' : 'gray'}
        onClick={() => setReadableText(!readableText)}
        aria-label="Toggle readable text when zoomed out"
        aria-pressed={readableText}
      >
        <IconTextSize stroke={1.5} />
      </ActionIcon>
    </Tooltip>
  )
}
