import type { DiagramEdge } from '@likec4/core/types'
import { cx } from '@likec4/styles/css'
import { Box } from '@likec4/styles/jsx'
import { edgeLabel } from '@likec4/styles/recipes'
import { useMergedRef } from '@mantine/hooks'
import type { HTMLMotionProps } from 'motion/react'
import * as m from 'motion/react-m'
import { type ReactNode, forwardRef, useRef } from 'react'
import { isTruthy } from 'remeda'
import type { UndefinedOnPartialDeep } from 'type-fest'
import type { BaseEdgePropsWithData } from '../../base/types'
import { useEnabledFeatures } from '../../context/DiagramFeatures'
import { useReadableHoverScale } from '../../hooks/useReadableHoverScale'

const BaselineHoverScale = 1.06

type Data = UndefinedOnPartialDeep<
  Pick<
    DiagramEdge,
    | 'label'
    | 'technology'
  >
>

type EdgeLabelProps =
  & HTMLMotionProps<'div'>
  & {
    children?: ReactNode
    edgeProps: BaseEdgePropsWithData<Data>
    isSequenceStep?: boolean
    stepNum?: number
    pointerEvents?: 'all' | 'none'
  }

export const EdgeLabel = forwardRef<HTMLDivElement, EdgeLabelProps>((
  {
    edgeProps: {
      id,
      data: {
        label,
        technology,
        hovered: isHovered = false,
      },
      selected = false,
      selectable = false,
    },
    isSequenceStep: isStepEdge = false,
    stepNum,
    pointerEvents = 'all',
    className,
    children,
    ...rest
  },
  ref,
) => {
  const hasLabel = isTruthy(label) || isTruthy(technology)
  const isScaledUp = isHovered && !selected

  const { enableReadableHover } = useEnabledFeatures()
  const containerRef = useRef<HTMLDivElement>(null)
  const hoverScale = useReadableHoverScale(containerRef, {
    enabled: enableReadableHover,
    hovered: isScaledUp,
    baselineScale: BaselineHoverScale,
    measureSelector: '.likec4-edge-label__text, .likec4-edge-label__technology',
  })

  return (
    <m.div
      ref={useMergedRef(ref, containerRef)}
      className={cx(
        // This class is queried by RelationshipPopover to position near the edge label
        'likec4-edge-label',
        edgeLabel({
          pointerEvents,
          isStepEdge,
          cursor: selectable || isStepEdge ? 'pointer' : 'default',
        }),
        className,
      )}
      data-edge-id={id}
      animate={{
        scale: isScaledUp ? hoverScale : 1,
      }}
      {...rest}
    >
      {isStepEdge && stepNum && (
        <Box className={'likec4-edge-label__step-number'}>
          {stepNum}
        </Box>
      )}
      {hasLabel && (
        <Box className={'likec4-edge-label__contents'}>
          {isTruthy(label) && (
            <Box
              lineClamp={5}
              className={'likec4-edge-label__text'}>
              {label}
            </Box>
          )}
          {isTruthy(technology) && (
            <Box className={'likec4-edge-label__technology'}>
              {'[ ' + technology + ' ]'}
            </Box>
          )}
          {children}
        </Box>
      )}
    </m.div>
  )
})
EdgeLabel.displayName = 'EdgeLabel'
