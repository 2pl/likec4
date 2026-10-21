// SPDX-License-Identifier: MIT
//
// Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.

import { ActionIcon, Tooltip } from '@mantine/core'
import { IconTextIncrease } from '@tabler/icons-react'
import { useCurrentProject } from '../hooks'
import { useReadableHover } from './toggle'

/**
 * Header toggle for the "readable hover" diagram feature, shown as "Hover zoom" (see `useReadableHover`).
 */
export function ReadableHoverToggle() {
  const project = useCurrentProject()
  const [readableHover, setReadableHover] = useReadableHover(project)

  return (
    <Tooltip label={readableHover ? 'Hover zoom: on' : 'Hover zoom: off'}>
      <ActionIcon
        size={'md'}
        variant={readableHover ? 'filled' : 'subtle'}
        color={readableHover ? 'blue' : 'gray'}
        onClick={() => setReadableHover(!readableHover)}
        aria-label="Hover zoom"
        aria-pressed={readableHover}
      >
        <IconTextIncrease stroke={1.5} />
      </ActionIcon>
    </Tooltip>
  )
}
