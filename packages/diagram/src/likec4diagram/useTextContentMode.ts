// SPDX-License-Identifier: MIT
//
// Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.

import type { LikeC4Model } from '@likec4/core/model'
import type { LikeC4Styles } from '@likec4/core/styles'
import { flattenMarkdownOrString } from '@likec4/core/types'
import { useMemo } from 'react'
import { useEnabledFeatures } from '../context/DiagramFeatures'
import { useOptionalLikeC4Model } from '../context/LikeC4ModelContext'
import { useLikeC4Styles } from '../hooks/useLikeC4Styles'
import { useTextScale } from '../hooks/useXYFlow'
import {
  type TextContentMode,
  type TextFitNode,
  calcTextContentThresholds,
  nodeTextKind,
  nodeTextSources,
  textContentMode,
} from '../utils/textContent'
import type { Types } from './types'

function toTextFitNode(styles: LikeC4Styles, model: LikeC4Model<any> | null, node: Types.Node): TextFitNode | null {
  if (node.type !== 'element' && node.type !== 'deployment' && node.type !== 'seq-actor') {
    return null
  }
  const data = node.data
  const shape = data.shape ?? styles.defaults.shape
  const fitted = styles.fitNodeContent({ ...data, shape })
  const hasIcon = !!data.icon && data.icon !== 'none'
  return {
    title: data.title,
    technology: data.technology?.trim() || null,
    text: (data.description && flattenMarkdownOrString(data.description).trim()) || null,
    kind: nodeTextKind(data.description, nodeTextSources(model, data)),
    size: styles.nodeSizes(data.style).sizes.size,
    shape,
    width: node.width ?? data.width,
    height: node.height ?? data.height,
    textSize: fitted.textSize,
    iconSize: hasIcon ? fitted.iconSize : 0,
    iconPosition: data.style.iconPosition ?? styles.defaults.iconPosition ?? 'left',
  }
}

/**
 * Text content shown in all the nodes, while the text is magnified (see {@link textContentMode}).
 * Returns `full` if the text is not magnified.
 */
export function useTextContentMode(nodes: ReadonlyArray<Types.Node>): TextContentMode {
  const { enableReadableText } = useEnabledFeatures()
  const styles = useLikeC4Styles()
  const model = useOptionalLikeC4Model()
  const textScale = useTextScale()
  const isScaled = enableReadableText && textScale > 1
  const thresholds = useMemo(
    () => {
      if (!isScaled) {
        return null
      }
      const fitNodes: TextFitNode[] = []
      for (const node of nodes) {
        const fitNode = toTextFitNode(styles, model, node)
        if (fitNode) {
          fitNodes.push(fitNode)
        }
      }
      return calcTextContentThresholds(fitNodes)
    },
    [isScaled, nodes, styles, model],
  )
  return thresholds ? textContentMode(textScale, thresholds) : 'full'
}
