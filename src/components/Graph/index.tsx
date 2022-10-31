import { useEffect, useMemo, useRef, useState } from 'react'
import { Grid, useTheme } from '@mui/material'
import ForceGraph3D, { ForceGraphProps, NodeObject } from 'react-force-graph-3d'
import SpriteText from 'three-spritetext'
import { useAppPersistStore, useAppStore, useNodeStore } from '../../stores'
import { Link, Node, NodeStyle } from '../../types'
import _ from 'lodash'

export const Graph3D = () => {
    const ref = useRef<HTMLDivElement>(null)
    const [width, setWidth] = useState<number>(0)
    const [height, setHeight] = useState<number>(0)
    const nodes = useNodeStore((state) => state.nodes)
    const selectedNodeId = useAppStore((state) => state.selectedNodeId)
    const selectNode = useAppStore((state) => state.selectNode)
    const nodeStyle = useAppPersistStore((state) => state.nodeStyle)
    const theme = useTheme()

    const handleResize = () => {
        if (!ref?.current) return
        setWidth(ref.current.offsetWidth)
        setHeight(ref.current.offsetHeight)
    }

    useEffect(() => {
        handleResize()
        window.addEventListener('resize', handleResize)
    }, [])

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

    const handleNodeClick = (node: NodeObject, event: MouseEvent) => {
        if (typeof node?.id !== 'string') return
        selectNode(node.id)
    }

    const getColor = (node: NodeObject) => {
        if (node.id === selectedNodeId) return theme.palette.success.main
        return theme.palette.text.primary
    }

    var graphProps: ForceGraphProps
    switch (nodeStyle) {
        case NodeStyle.Bubble:
            graphProps = {
                nodeLabel: 'handle',
                nodeColor: getColor,
                // default value
                nodeThreeObject: () => { return false },
            }
            break
        case NodeStyle.LensHandle:
            graphProps = {
                nodeThreeObject: (node: Node) => {
                    const sprite = new SpriteText(node.handle)
                    sprite.textHeight = 2
                    sprite.color = getColor(node)
                    return sprite
                },
                // default value
                nodeLabel: 'name',
            }
            break
    }

    const backgroundColor = useMemo(() => { return 'rgba(0,0,0,0)' }, [])
    const linkColor = useMemo(() => () => { return theme.palette.text.secondary }, [theme])

    return (
        <Grid item xs zeroMinWidth ref={ref}>
            <ForceGraph3D
                width={width}
                height={height}
                backgroundColor={backgroundColor}
                linkColor={linkColor}
                linkOpacity={0.7}
                enableNodeDrag={false}
                onNodeClick={handleNodeClick}
                showNavInfo={false}
                graphData={graphData}
                linkDirectionalParticles={1}
                {...graphProps}
            />
        </Grid>
    )
}