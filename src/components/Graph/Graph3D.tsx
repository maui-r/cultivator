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
    const setProfileMenu = useAppStore((state) => state.setProfileMenu)
    const nodeStyle = useAppPersistStore((state) => state.nodeStyle)
    const theme = useTheme()

    const onOpenProfileMenu = (node: ProfileNodeObject, event: MouseEvent) => {
        if (!node.profile) {
            return
        }

        setProfileMenu({ top: event.y, left: event.x }, node.profile.handle, node.profile.id)
    }

    const queriedNodeColor = theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.secondary.main
    var graphProps: ForceGraphProps
    switch (nodeStyle) {
        case NodeStyle.Bubble:
            graphProps = {
                nodeLabel: 'handle',
                nodeColor: (node: ProfileNodeObject) => {
                    const isQueried = node.profile?.handle && queriedHandles.includes(node.profile?.handle)
                    return isQueried ? queriedNodeColor : theme.palette.text.primary
                },
                // default value
                nodeThreeObject: () => { return false },
            }
            break
        case NodeStyle.LensHandle:
            graphProps = {
                nodeThreeObject: (node: Node) => {
                    const sprite = new SpriteText(node.profile.handle)
                    const isQueried = queriedHandles.includes(node.profile.handle)
                    sprite.color = isQueried ? queriedNodeColor : theme.palette.text.primary
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
        onNodeClick={(node: ProfileNodeObject) => addHandleToGraph(node.profile?.handle)}
        onNodeRightClick={onOpenProfileMenu}
        showNavInfo={false}
        graphData={graphData}
        linkDirectionalParticles={1}
        {...graphProps}
    />
}

export default Graph3D