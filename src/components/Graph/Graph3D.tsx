import ForceGraph3D from 'react-force-graph-3d'
import SpriteText from 'three-spritetext'

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
}

const Graph3D = ({ addHandleToGraph, graphData, queriedHandles }: Props) => {
    return <ForceGraph3D
        enableNodeDrag={false}
        onNodeClick={(node: any) => addHandleToGraph(node.handle)}
        graphData={graphData}
        linkDirectionalParticles={1}
        nodeAutoColorBy='group'
        nodeThreeObject={(node: Node) => {
            const sprite = new SpriteText(node.handle)
            const isQueried = queriedHandles.includes(node.handle)
            sprite.color = isQueried ? '#e3cf1c' : '#fff'
            sprite.textHeight = 2
            return sprite
        }}
    />
}

export default Graph3D