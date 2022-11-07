import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Grid, useTheme } from '@mui/material'
import ForceGraph3D, { ForceGraphProps, NodeObject } from 'react-force-graph-3d'
import SpriteText from 'three-spritetext'
import { useAppPersistStore, useAppStore, useNodeStore } from '../../stores'
import { Link, Node, NodeStyle } from '../../types'
import { compareNodes } from '../../helpers'
import _ from 'lodash'

export const Graph3D = () => {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<number>(0)
  const [height, setHeight] = useState<number>(0)
  const nodes = useNodeStore((state) => state.nodes, compareNodes)
  const selectedNodeId = useAppStore((state) => state.selectedNodeId)
  const selectNode = useAppStore((state) => state.selectNode)
  const nodeStyle = useAppPersistStore((state) => state.nodeStyle)
  const theme = useTheme()

  const handleNodeClick = useCallback((node: NodeObject, event: MouseEvent) => {
    if (typeof node?.id !== 'string') return
    selectNode(node.id)
  }, [selectNode])

  const getNodeColor = useCallback((node: NodeObject) => {
    if (node.id === selectedNodeId) return theme.palette.success.main
    return theme.palette.text.primary
  }, [theme, selectedNodeId])

  const getLinkColor = useCallback(() => {
    return theme.palette.text.secondary
  }, [theme])

  const graphProps: ForceGraphProps = useMemo(() => {
    let props: ForceGraphProps = {
      // make sure to define defaults for props that may be overwritten
      nodeColor: 'color',
      nodeLabel: 'name',
      nodeThreeObject: () => { return false },
    }
    switch (nodeStyle) {
      case NodeStyle.Bubble:
        props = {
          ...props,
          nodeColor: getNodeColor,
          nodeLabel: 'handle',
        }
        break
      case NodeStyle.LensHandle:
        props = {
          ...props,
          nodeThreeObject: (node: Node) => {
            const sprite = new SpriteText(node.handle)
            sprite.textHeight = 2
            sprite.color = getNodeColor(node)
            return sprite
          },
        }
        break
    }
    return props
  }, [getNodeColor, nodeStyle])

  const graphData = useMemo(() => {
    const nodeIds = Object.keys(nodes)
    const linksDraft: Link[] = []
    nodeIds.forEach(
      nodeId => nodes[nodeId].following
        .filter(followingId => nodeIds.includes(followingId))
        .forEach(followingId => linksDraft.push({ source: nodeId, target: followingId }))
    )
    const links = _.uniq(linksDraft)

    return { nodes: nodeIds.map(id => ({ ...nodes[id] })), links }
  }, [nodes])

  const handleResize = () => {
    if (!ref?.current) return
    console.debug('resizing graph')
    setWidth(ref.current.offsetWidth)
    setHeight(ref.current.offsetHeight)
  }

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
  }, [])

  return (
    <Grid item xs zeroMinWidth ref={ref}>
      <ForceGraph3D
        onNodeClick={handleNodeClick}
        graphData={graphData}
        width={width}
        height={height}
        backgroundColor={'rgba(0,0,0,0)'}
        linkColor={getLinkColor}
        linkOpacity={0.7}
        linkDirectionalArrowLength={2.5}
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.25}
        showNavInfo={false}
        {...graphProps}
      />
    </Grid>
  )
}