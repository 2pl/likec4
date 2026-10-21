// SPDX-License-Identifier: MIT
//
// Copyright (c) 2023-2026 Denis Davydkov
// Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
//
import { defineParts, defineRecipe } from '@pandacss/dev'

const parts = defineParts({
  root: { selector: '&' },
  stepNumber: { selector: '& .likec4-edge-label__step-number' },
  contents: { selector: '& .likec4-edge-label__contents' },
  label: { selector: '& .likec4-edge-label__text' },
  technology: { selector: '& .likec4-edge-label__technology' },
})

export const edgeLabel = defineRecipe({
  className: 'likec4-edge-label',
  jsx: [],
  base: parts({
    root: {
      fontFamily: 'likec4.relation',
      paddingBlock: '1',
      paddingInline: '1.5',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: 'max-content',
      maxWidth: '100%',
      gap: '0.5',
      color: 'var(--xy-edge-label-color)',
      background: 'var(--xy-edge-label-background-color)',
      border: '0px solid transparent',
      borderRadius: '4px',
      // Magnified, when the diagram is zoomed out, so the label stays readable.
      // Uses `scale` (not `transform`), as the hover animation owns `transform`.
      // Limited, otherwise labels overlap each other and the nodes
      scale: {
        _labelScaled: `min(var(--likec4-label-scale, 1), calc(2.2 * var(--likec4-text-cap, 1)))`,
      },
      transformOrigin: {
        _labelScaled: 'var(--likec4-edge-label-origin, center)',
      },
    },
    stepNumber: {
      alignSelf: 'stretch',
      flex: '0 0 auto',
      fontWeight: 600,
      fontSize: '14px',
      padding: '1',
      textAlign: 'center',
      minWidth: '22px',
      borderTopLeftRadius: '4px',
      borderBottomLeftRadius: '4px',
      _only: {
        borderRadius: '4px',
        minWidth: '24px',
      },
      background: `color-mix(in oklab, var(--xy-edge-label-background-color), {colors.likec4.mixColor} 12%)`,
      fontVariantNumeric: 'tabular-nums',
      [':where([data-likec4-color="gray"]) &']: {
        _dark: {
          background: `color-mix(in oklab, var(--xy-edge-label-background-color), {colors.likec4.mixColor} 15%)`,
        },
      },
    },
    contents: {
      display: 'contents',
      _empty: {
        display: 'none !important',
      },
    },
    label: {
      whiteSpaceCollapse: 'preserve-breaks',
      overflowWrap: 'anywhere',
      fontSize: '14px',
      lineHeight: '1.2',
      margin: '0',
    },
    technology: {
      textAlign: 'center',
      whiteSpaceCollapse: 'preserve-breaks',
      overflowWrap: 'anywhere',
      fontSize: '11px',
      lineHeight: '1',
      opacity: 0.75,
    },
  }),
  variants: {
    pointerEvents: {
      none: parts({
        root: {
          pointerEvents: 'none',
        },
      }),
      all: parts({
        root: {
          pointerEvents: 'all',
        },
      }),
    },
    cursor: {
      pointer: parts({
        root: {
          cursor: 'pointer',
        },
      }),
      default: parts({
        root: {
          cursor: 'default',
        },
      }),
    },
    isStepEdge: {
      false: {},
      true: parts({
        root: {
          // Step labels sit in their own column, there is more room to grow
          scale: {
            _labelScaled: `min(var(--likec4-label-scale, 1), calc(3 * var(--likec4-text-cap, 1)))`,
          },
          flexDirection: 'row',
          gap: '1',
          padding: '0',
        },
        contents: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '0.5',
          paddingRight: '1',
          paddingBottom: '1',
          gap: '0.5',
        },
        label: {
          py: '0.5',
          paddingRight: '0.5',
        },
      }),
    },
  },
  defaultVariants: {
    pointerEvents: 'all',
    isStepEdge: false,
    cursor: 'default',
  },
  staticCss: ['*'],
})
