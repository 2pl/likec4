// SPDX-License-Identifier: MIT
//
// Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.

import { ActionIcon, Indicator, Tooltip } from '@mantine/core'
import { IconTextSize } from '@tabler/icons-react'
import { useCurrentProject } from '../hooks'
import { type ReadableText, nextReadableText, useReadableText } from './toggle'

const labels = {
  off: 'Readable text when zoomed out: off',
  normal: 'Readable text when zoomed out: normal',
  large: 'Readable text when zoomed out: large',
  xlarge: 'Readable text when zoomed out: extra large',
} as const

const badges = {
  large: 'L',
  xlarge: 'XL',
} as const

function label(value: ReadableText) {
  return labels[value === false ? 'off' : value]
}

/**
 * Header toggle for the "readable text when zoomed out" diagram feature (see `useReadableText`).
 * Each click switches to the next level: off, normal, large, extra large.
 */
export function ReadableTextToggle() {
  const project = useCurrentProject()
  const [readableText, setReadableText] = useReadableText(project)
  const next = nextReadableText(readableText)
  const badge = readableText === 'large' || readableText === 'xlarge' ? badges[readableText] : null

  return (
    <Tooltip label={`${label(readableText)} (click: ${label(next).split(': ')[1]})`}>
      <Indicator label={badge} size={14} disabled={!badge} offset={4}>
        <ActionIcon
          size={'md'}
          variant={readableText ? 'light' : 'subtle'}
          color={readableText ? 'blue' : 'gray'}
          onClick={() => setReadableText(next)}
          aria-label="Toggle readable text when zoomed out"
          data-readable-text={readableText || 'off'}
        >
          <IconTextSize stroke={1.5} />
        </ActionIcon>
      </Indicator>
    </Tooltip>
  )
}
