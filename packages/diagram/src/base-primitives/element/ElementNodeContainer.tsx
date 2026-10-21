import { type Color, type ComputedNodeStyle, type ElementShape, ensureSizes } from '@likec4/core/types'
import { cx } from '@likec4/styles/css'
import { elementNode } from '@likec4/styles/recipes'
import { useMergedRef } from '@mantine/hooks'
import type { MotionNodeLayoutOptions, MotionStyle, Variants } from 'motion/react'
import * as m from 'motion/react-m'
import { type PropsWithChildren, forwardRef, useRef } from 'react'
import type { BaseNodePropsWithData } from '../../base/types'
import { useEnabledFeatures } from '../../context/DiagramFeatures'
import { useReadableHoverScale } from '../../hooks/useReadableHoverScale'

type RequiredData = {
  color: Color
  shape: ElementShape
  style?: ComputedNodeStyle
}

type ElementNodeContainerProps = PropsWithChildren<
  & {
    nodeProps: BaseNodePropsWithData<RequiredData>
    className?: string | undefined
    style?: MotionStyle | undefined
    [key: `data-${string}`]: string | undefined
  }
  & MotionNodeLayoutOptions
>

const variants = {
  normal: {
    scale: 1,
  },
  hovered: {
    scale: 1.05,
  },
  selected: {
    scale: 1.02,
  },
  tap: {
    scale: 0.98,
  },
} satisfies Variants

/**
 * Top-level primitive to compose leaf nodes renderers.
 * This container provides the state via data-* attributes
 */
export const ElementNodeContainer = forwardRef<HTMLDivElement, ElementNodeContainerProps>(({
  nodeProps: {
    selected,
    selectable,
    data: {
      hovered: isHovered = false,
      dimmed: isDimmed = false,
      ...data
    },
  },
  className,
  style,
  children,
  ...rest
}, ref) => {
  let variant: keyof typeof variants
  switch (true) {
    case isHovered:
      variant = 'hovered'
      break
    case selected:
      variant = 'selected'
      break
    default:
      variant = 'normal'
  }

  const {
    size,
    padding,
    textSize,
  } = ensureSizes(data.style ?? {})

  const { enableReadableHover } = useEnabledFeatures()
  const containerRef = useRef<HTMLDivElement>(null)
  const hoverScale = useReadableHoverScale(containerRef, {
    enabled: enableReadableHover,
    hovered: isHovered,
    baselineScale: variants.hovered.scale,
    measureSelector: '[data-likec4-node-title]',
    kind: 'text',
  })

  return (
    <m.div
      ref={useMergedRef(ref, containerRef)}
      className={cx(
        elementNode(),
        'group',
        className,
      )}
      variants={variants}
      initial={false}
      {...selectable && {
        animate: isHovered ? { scale: hoverScale } : variant,
        // Keep the enlarged scale while pressed: shrinking to the tap scale would move
        // the action buttons from under the pointer, and the click would be lost
        whileTap: hoverScale > variants.hovered.scale ? { scale: hoverScale } : 'tap',
      }}
      data-likec4-hovered={isHovered}
      data-likec4-color={data.color}
      data-likec4-shape={data.shape}
      data-likec4-shape-size={size}
      data-likec4-spacing={padding}
      data-likec4-text-size={textSize}
      {...(data.style?.sizing === 'fixed' && {
        'data-likec4-sizing': 'fixed',
      })}
      {...(isDimmed !== false && {
        'data-likec4-dimmed': isDimmed,
      })}
      style={style as MotionStyle}
      tabIndex={-1}
      {...rest}
    >
      {children}
    </m.div>
  )
})
ElementNodeContainer.displayName = 'ElementNodeContainer'
