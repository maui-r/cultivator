import { useTheme } from '@mui/material'
import { useMemo } from 'react'
import ForceGraph3D, { ForceGraphProps, NodeObject } from 'react-force-graph-3d'
import SpriteText from 'three-spritetext'
import { useAppPersistStore, useAppStore } from '../../stores'
import { NodeStyle } from '../../types'

interface Profile {
    id: string
    handle: string
}

type Node = {
    id: number,
    profile: Profile,
}

type Link = {
    source: number,
    target: number,
}

interface GraphData {
    nodes: Node[]
    links: Link[]
}

interface Props {
    addHandleToGraph: Function
    graphData: GraphData
    queriedHandles: string[]
    width: number
    height: number
}

interface ProfileNodeObject extends NodeObject {
    profile?: Profile
}

const Graph3D = ({ width, height, addHandleToGraph, graphData, queriedHandles }: Props) => {
    const selectNode = useAppStore((state) => state.selectNode)
    const selectedNodeId = useAppStore((state) => state.selectedNodeId)
    const nodeStyle = useAppPersistStore((state) => state.nodeStyle)
    const theme = useTheme()

    const handleNodeClick = (node: ProfileNodeObject, event: MouseEvent) => {
        if (typeof node.id !== 'number') return
        selectNode(node.id)
    }

    const selectedNodeColor = theme.palette.success.main
    const queriedNodeColor = theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.secondary.main
    const getColor = (node: ProfileNodeObject | Node) => {
        if (!node.profile) return theme.palette.text.primary

        // is selected?
        if (selectedNodeId && parseInt(node.profile.id) === selectedNodeId) return selectedNodeColor

        // is queried?
        if (node.profile.handle && queriedHandles.includes(node.profile.handle)) return queriedNodeColor

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
                    const sprite = new SpriteText(node.profile.handle)
                    const isQueried = queriedHandles.includes(node.profile.handle)
                    sprite.color = getColor(node)
                    sprite.textHeight = isQueried ? 4 : 2
                    return sprite
                },
                // default value
                nodeLabel: 'name',
            }
            break
    }

    const backgroundColor = useMemo(() => { return 'rgba(0,0,0,0)' }, [])
    const linkColor = useMemo(() => () => { return theme.palette.text.secondary }, [theme])

    return <ForceGraph3D
        width={width}
        height={height}
        backgroundColor={backgroundColor}
        linkColor={linkColor}
        enableNodeDrag={false}
        onNodeClick={handleNodeClick}
        showNavInfo={false}
        graphData={graphData}
        linkDirectionalParticles={1}
        {...graphProps}
    />
}

export default Graph3D