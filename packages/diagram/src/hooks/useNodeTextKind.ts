// SPDX-License-Identifier: MIT
//
// Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.

import type { DeploymentFqn, Fqn, MarkdownOrString } from '@likec4/core'
import { useMemo } from 'react'
import { useOptionalLikeC4Model } from '../context/LikeC4ModelContext'
import { type NodeTextKind, nodeTextKind, nodeTextSources } from '../utils/textContent'

/**
 * Whether the text of a node is its summary or its description (see {@link nodeTextKind})
 */
export function useNodeTextKind(data: {
  description?: MarkdownOrString | null | undefined
  modelFqn?: Fqn | null | undefined
  deploymentFqn?: DeploymentFqn | null | undefined
}): NodeTextKind | null {
  const model = useOptionalLikeC4Model()
  const { description, modelFqn, deploymentFqn } = data
  return useMemo(
    () => nodeTextKind(description, nodeTextSources(model, { modelFqn, deploymentFqn })),
    [model, description, modelFqn, deploymentFqn],
  )
}
