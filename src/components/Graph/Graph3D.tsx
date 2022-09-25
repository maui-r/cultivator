import ForceGraph3D, { ForceGraphProps } from 'react-force-graph-3d'
import SpriteText from 'three-spritetext'
import { useAppPersistStore } from '../../store'
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

const Graph3D = ({ width, height, addHandleToGraph, graphData, queriedHandles }: Props) => {
    const nodeStyle = useAppPersistStore((state) => state.nodeStyle)

    var graphProps: ForceGraphProps
    switch (nodeStyle) {
        case NodeStyle.Ball:
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
        onNodeClick={(node: any) => addHandleToGraph(node.handle)}
        graphData={graphData}
        linkDirectionalParticles={1}
        {...graphProps}
    />
}

export default Graph3D