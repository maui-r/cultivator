import ForceGraph3D, { ForceGraphProps, NodeObject } from 'react-force-graph-3d'
import SpriteText from 'three-spritetext'
import { useAppPersistStore, useAppStore } from '../../stores'
import { NodeStyle } from '../../types'

type Node = {
    id: number,
    handle: string,
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
    handle?: string
}

const Graph3D = ({ width, height, addHandleToGraph, graphData, queriedHandles }: Props) => {
    const setProfileMenu = useAppStore((state) => state.setProfileMenu)
    const nodeStyle = useAppPersistStore((state) => state.nodeStyle)

    const onOpenProfileMenu = (node: ProfileNodeObject, event: MouseEvent) => {
        if (!node.handle) {
            return
        }

        setProfileMenu({ top: event.y, left: event.x }, node.handle)
    }

    var graphProps: ForceGraphProps
    switch (nodeStyle) {
        case NodeStyle.Bubble:
            graphProps = {
                nodeLabel: 'handle',
                // default value
                nodeThreeObject: () => { return false },
            }
            break
        case NodeStyle.LensHandle:
            graphProps = {
                nodeThreeObject: (node: Node) => {
                    const sprite = new SpriteText(node.handle)
                    const isQueried = queriedHandles.includes(node.handle)
                    sprite.color = isQueried ? '#e3cf1c' : '#fff'
                    sprite.textHeight = 2
                    return sprite
                },
                // default value
                nodeLabel: 'name',
            }
            break
    }

    return <ForceGraph3D
        width={width}
        height={height}
        enableNodeDrag={false}
        onNodeClick={(node: ProfileNodeObject) => addHandleToGraph(node.handle)}
        onNodeRightClick={onOpenProfileMenu}
        showNavInfo={false}
        graphData={graphData}
        linkDirectionalParticles={1}
        {...graphProps}
    />
}

export default Graph3D