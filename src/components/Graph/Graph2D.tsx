import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Grid, useTheme } from '@mui/material'
import { useAppPersistStore, useAppStore, useNodeStore } from '../../stores'
import { Edge, Node, NodeStyle } from '../../types'
import { compareNodes, getRandom } from '../../helpers'
import G6, { Graph } from '@antv/g6'
import _ from 'lodash'

const Graph2D = () => {
  const ref = useRef<HTMLDivElement>(null)
  const graphRef = useRef<Graph | null>(null)
  const nodes = useNodeStore((state) => state.nodes, compareNodes)
  const selectedNodeId = useAppStore((state) => state.selectedNodeId)
  const selectNode = useAppStore((state) => state.selectNode)
  const nodeStyle = useAppPersistStore((state) => state.nodeStyle)
  const theme = useTheme()

  const layouts = useMemo(() => {
    return [
      {
        type: 'circular',
        radius: 200,
      },
      {
        type: 'grid',
      },
      {
        type: 'force',
        preventOverlap: true,
        nodeSize: 20,
      }, {
        type: 'radial',
        preventOverlap: true,
        nodeSize: 15,
      }, {
        type: 'concentric',
        minNodeSpacing: 30,
        maxLevelDiff: 5,
      },
      {
        type: 'mds',
        linkDistance: 100,
      },
    ]
  }, [])

  //const handleNodeClick = useCallback((node: Node, event: MouseEvent) => {
  //  if (typeof node?.id !== 'string') return
  //  selectNode(node.id)
  //}, [selectNode])

  //const getNodeColor = useCallback((node: Node) => {
  //  if (node.id === selectedNodeId) return theme.palette.success.main
  //  return theme.palette.text.primary
  //}, [theme, selectedNodeId])

  //const getEdgeColor = useCallback(() => {
  //  return theme.palette.text.secondary
  //}, [theme])

  //const graphProps: ForceGraphProps = useMemo(() => {
  //  let props: ForceGraphProps = {
  //    // make sure to define defaults for props that may be overwritten
  //    nodeColor: 'color',
  //    nodeLabel: 'name',
  //    nodeThreeObject: () => { return false },
  //  }
  //  switch (nodeStyle) {
  //    case NodeStyle.Bubble:
  //      props = {
  //        ...props,
  //        nodeColor: getNodeColor,
  //        nodeLabel: 'handle',
  //      }
  //      break
  //    case NodeStyle.LensHandle:
  //      props = {
  //        ...props,
  //        nodeThreeObject: (node: Node) => {
  //          const sprite = new SpriteText(node.handle)
  //          sprite.textHeight = 2
  //          sprite.color = getNodeColor(node)
  //          return sprite
  //        },
  //      }
  //      break
  //  }
  //  return props
  //}, [getNodeColor, nodeStyle])

  const graphData = useMemo(() => {
    const nodeIds = Object.keys(nodes)
    const edgesWithRedundancies: Edge[] = []
    nodeIds.forEach((nodeId) =>
      nodes[nodeId].following
        .filter((followingId) => nodeIds.includes(followingId))
        .forEach((followingId) =>
          edgesWithRedundancies.push({ source: nodeId, target: followingId })
        )
    )
    const edges = _.uniq(edgesWithRedundancies)

    console.debug(nodeIds.length, 'nodes,', edges.length, 'edges')
    return { nodes: nodeIds.map((id) => ({ ...nodes[id] })), edges }
  }, [nodes])

  const handleResize = () => {
    console.debug('resizing graph')
    if (!graphRef.current || graphRef.current.get('destroyed')) return
    if (!ref.current || !ref.current.scrollWidth || !ref.current.scrollHeight)
      return
    graphRef.current.changeSize(ref.current.scrollWidth, ref.current.scrollHeight)
  }

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
  }, [])

  // Render the graph
  useEffect(() => {
    if (graphRef.current || !ref.current) return
    graphRef.current = new G6.Graph({
      container: ref.current,
      width: ref.current.scrollWidth,
      height: ref.current.scrollHeight,
      modes: {
        default: ['drag-canvas', 'zoom-canvas', 'drag-node'],
      },
      animate: true,
      layout: getRandom(layouts),
      defaultEdge: {
        style: {
          endArrow: true,
        },
      },
    })
    graphRef.current.data(graphData)
    graphRef.current.fitCenter()
    graphRef.current.render()
    graphRef.current.on('afterlayout', () => {
      graphRef?.current?.fitView()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update graph when underlying data changes
  useEffect(() => {
    if (!graphRef.current) return
    graphRef.current.changeData(graphData)
    graphRef?.current?.updateLayout(getRandom(layouts))
  }, [graphData, layouts])

  return <Grid item xs zeroMinWidth ref={ref}></Grid>
}

export default Graph2D
