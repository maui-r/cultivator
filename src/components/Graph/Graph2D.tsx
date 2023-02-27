import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Grid, useTheme } from '@mui/material'
import { useAppPersistStore, useAppStore, useNodeStore } from '../../stores'
import { Edge, GraphLayout } from '../../types'
import { compareNodes } from '../../helpers'
import G6, { Graph } from '@antv/g6'
import _ from 'lodash'


const getLayout = (graphLayout: GraphLayout) => {
  switch (graphLayout) {
    case GraphLayout.Circular:
      return {
        type: 'circular',
        radius: 200,
      }
    case GraphLayout.Concentric:
      return {
        type: 'concentric',
        linkDistance: 50,
        preventOverlap: true,
        nodeSize: 30,
        sweep: 10,
        equidistant: false,
        startAngle: 0,
        clockwise: false,
        maxLevelDiff: 5,
        sortBy: 'degree',
      }
    case GraphLayout.Grid:
      return {
        type: 'grid'
      }
    case GraphLayout.Radial:
      return {
        type: 'radial',
        preventOverlap: true,
        nodeSize: 15,
      }
    //case GraphLayout.Force:
    //  return {
    //    type: 'force',
    //    preventOverlap: true,
    //    nodeSize: 20,
    //  }
    //case GraphLayout.MDS:
    //  return {
    //    type: 'mds',
    //    linkDistance: 100,
    //  }
  }
}

const Graph2D = () => {
  const ref = useRef<HTMLDivElement>(null)
  const graphRef = useRef<Graph | null>(null)
  const nodes = useNodeStore((state) => state.nodes, compareNodes)
  const selectedNodeId = useAppStore((state) => state.selectedNodeId)
  const selectNode = useAppStore((state) => state.selectNode)
  const graphLayout = useAppPersistStore((state) => state.graphLayout)
  const theme = useTheme()

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
  //  return props
  //}, [getNodeColor])

  const handleNodeClick = useCallback((event: any) => {
    // event is a GraphEvent from '@antv/g-base/lib/event/graph-event'
    // but GraphEvent doesn't have an item property...
    if (!event.item._cfg.id || typeof event.item._cfg.id !== 'string') return
    selectNode(event.item._cfg.id)
  }, [selectNode])

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
        default: ['drag-canvas', 'zoom-canvas', 'drag-node', 'activate-relations'],
      },
      animate: true,
      layout: getLayout(graphLayout),
      defaultEdge: {
        style: {
          endArrow: true,
        },
      },
    })
    graphRef.current.data(graphData)
    graphRef.current.fitCenter()
    graphRef.current.render()

    // Bind events
    graphRef.current.on('afterlayout', () => {
      graphRef?.current?.fitView()
    })
    graphRef.current.on('node:click', handleNodeClick)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  // Update graph when underlying data changes
  useEffect(() => {
    graphRef.current?.changeData(graphData)
    if (selectedNodeId) {
      graphRef.current?.setItemState(selectedNodeId, 'selected', true)
    }
    // Don't run this effect when selectedNodeId is updated. There is a
    // separate effect for it. Selected node is set, here, because the
    // changeData call resets the selected node on the graph.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphData])

  useEffect(() => {
    // Unselect all selected nodes
    graphRef.current?.findAllByState('node', 'selected').forEach(node => {
      if (node.getID() === selectedNodeId) return
      graphRef.current?.setItemState(node, 'selected', false)
    })
    if (!selectedNodeId) return
    // Select selected node
    graphRef.current?.setItemState(selectedNodeId, 'selected', true)
  }, [selectedNodeId])

  useEffect(() => {
    graphRef?.current?.updateLayout(getLayout(graphLayout))
  }, [graphLayout])

  return <Grid item xs zeroMinWidth ref={ref}></Grid>
}

export default Graph2D
