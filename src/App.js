import { useState, useCallback, useEffect } from 'react'
import ForceGraph3D from 'react-force-graph-3d'
import _ from 'lodash'
import { getProfile, getRelations } from './query'
import SpriteText from 'three-spritetext'

const transformHandleData = ({ profile, following, followers }) => {
  const nodes = []
  const links = []

  if (!profile || !following) {
    return { nodes, links }
  }

  // Add profile
  nodes.push({
    id: parseInt(profile.id, 16),
    handle: profile.handle,
  })

  // Add following
  following.forEach((f) => {
    nodes.push({
      id: parseInt(f.profile.id, 16),
      handle: f.profile.handle,
    })

    links.push({
      source: parseInt(profile.id, 16),
      target: parseInt(f.profile.id, 16),
    })
  })

  // Add followers
  followers.forEach((f) => {
    if (!f.wallet?.defaultProfile?.id) {
      // TODO: visualize as well
      console.log(f.wallet?.address, 'has no default profile set up')
      return
    }

    nodes.push({
      id: parseInt(f.wallet.defaultProfile.id, 16),
      handle: f.wallet.defaultProfile.handle,
    })

    links.push({
      source: parseInt(f.wallet.defaultProfile.id, 16),
      target: parseInt(profile.id, 16),
    })
  })

  return { nodes, links }
}

const fetchHandleData = async handle => {
  const profile = await getProfile(handle)
  const { following, followers } = await getRelations(profile)
  return { profile, following, followers }
}

const DynamicGraph = ({ rootHandle }) => {
  const [queriedHandles, setQueriedHandles] = useState([])
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })

  const addHandleToGraph = useCallback(handle => {
    console.log('fetching handle:', handle)
    if (queriedHandles.includes(handle)) {
      console.log('handle has been queried, already')
      return
    }

    fetchHandleData(handle).then(handleData => {
      const { nodes, links } = graphData
      const transformedHandleData = transformHandleData(handleData)
      const newNodes = [...nodes, ...transformedHandleData.nodes]
      const newLinks = [...links, ...transformedHandleData.links]

      // Filter out duplicates
      const uniqueNodes = _.uniqBy(newNodes, 'id')
      const uniqueLinks = _.uniq(newLinks)

      setQueriedHandles([...queriedHandles, handle])
      setGraphData({ nodes: uniqueNodes, links: uniqueLinks })
    }).catch(error => {
      console.log('invalid handle:', handle)
    })
  }, [queriedHandles, setQueriedHandles, graphData, setGraphData])

  useEffect(() => {
    addHandleToGraph(rootHandle)
  }, [])

  return <ForceGraph3D
    enableNodeDrag={false}
    onNodeClick={node => addHandleToGraph(node.handle)}
    graphData={graphData}
    linkDirectionalParticles={1}
    nodeAutoColorBy="group"
    nodeThreeObject={node => {
      const sprite = new SpriteText(node.handle);
      const isQueried = queriedHandles.includes(node.handle)
      sprite.color = isQueried ? 'yellow' : 'white';
      sprite.textHeight = 2;
      return sprite;
    }}
  />
}

function App() {
  const rootHandle = 'wagmi.lens'
  return (
    <div className='App'>
      <DynamicGraph rootHandle={rootHandle} />
    </div>
  )
}

export default App