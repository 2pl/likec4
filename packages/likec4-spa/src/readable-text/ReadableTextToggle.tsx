// SPDX-License-Identifier: MIT
//
// Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.

import { ActionIcon, Indicator, Menu, MenuDropdown, MenuItem, MenuLabel, MenuTarget, Tooltip } from '@mantine/core'
import { IconCheck, IconTextSize } from '@tabler/icons-react'
import { useState } from 'react'
import { useCurrentProject } from '../hooks'
import { type ReadableText, ReadableTextOptions, useReadableText } from './toggle'

const labels = {
  off: 'Off',
  normal: 'Medium',
  large: 'Large',
  xlarge: 'Extra large',
} as const

const badges = {
  large: 'L',
  xlarge: 'XL',
} as const

function label(value: ReadableText) {
  return labels[value === false ? 'off' : value]
}

/**
 * Header menu for the "readable text when zoomed out" diagram feature (see `useReadableText`),
 * shown as "Text size": off, medium, large, extra large.
 */
export function ReadableTextToggle() {
  const project = useCurrentProject()
  const [readableText, setReadableText] = useReadableText(project)
  const [opened, setOpened] = useState(false)
  const badge = readableText === 'large' || readableText === 'xlarge' ? badges[readableText] : null

  return (
    <Menu shadow="md" width={200} position="bottom-end" opened={opened} onChange={setOpened}>
      <Tooltip label={`Text size: ${label(readableText)}`} disabled={opened}>
        <Indicator label={badge} size={14} disabled={!badge} offset={4} color="orange">
          <MenuTarget>
            <ActionIcon
              size={'md'}
              variant={readableText ? 'filled' : 'subtle'}
              color={readableText ? 'blue' : 'gray'}
              aria-label="Text size"
              data-readable-text={readableText || 'off'}
            >
              <IconTextSize stroke={1.5} />
            </ActionIcon>
          </MenuTarget>
        </Indicator>
      </Tooltip>
      <MenuDropdown>
        <MenuLabel>Text size when zoomed out</MenuLabel>
        {ReadableTextOptions.map(option => (
          <MenuItem
            key={label(option)}
            onClick={() => setReadableText(option)}
            rightSection={option === readableText ? <IconCheck size={14} /> : null}
          >
            {label(option)}
          </MenuItem>
        ))}
      </MenuDropdown>
    </Menu>
  )
}
