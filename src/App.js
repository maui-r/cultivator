import { useState, useCallback, useEffect } from 'react'
import ForceGraph3D from 'react-force-graph-3d'
import { gql, useQuery } from '@apollo/client'
import _ from 'lodash'


const GET_PROFILE_BY_HANDLE = gql`
  query GetProfileByHandle {
    profiles(request: { handles: ["wagmi.lens"], limit: 1 }) {
      items {
        id
        handle
        ownedBy
        stats {
          totalFollowers
          totalFollowing
        }
      }
    }
    following(request: { 
      address: "0x4A1a2197f307222cD67A1762D9A352F64558d9Be"
    }) {
      items {
        profile {
          id
          handle
          ownedBy
          stats {
            totalFollowers
            totalFollowing
          }
        }
      }
    }
  }
`

const formatGraphData = (data) => {
  const nodes = []
  const links = []

  if (!data?.following?.items || !data?.profiles?.items) {
    return
  }

  const [root] = data.profiles.items
  nodes.push({
    id: parseInt(root.id, 16),
    handle: root.handle,
  })

  data.following.items.forEach((f) => {
    nodes.push({
      id: parseInt(f.profile.id, 16),
      handle: f.profile.handle,
    })

    links.push({
      source: parseInt(root.id, 16),
      target: parseInt(f.profile.id, 16),
    })
  })

  // filter out duplicates
  const uniqueNodes = _.uniqBy(nodes, 'id')

  return { nodes: uniqueNodes, links: links }
}

const DynamicGraph = () => {
  const [graphData, setGraphData] = useState({
    nodes: [],
    links: []
  })
  const { loading, error, data } = useQuery(GET_PROFILE_BY_HANDLE, {
    //onCompleted: data => setGraphData(formatGraphData(data))
  })

  useEffect(() => {
    setGraphData(formatGraphData(data))
  }, [data])

  const handleClick = useCallback(node => {
    const { nodes, links } = graphData

    // TODO
    const newNodes = [...nodes]
    const newLinks = [...links]

    setGraphData({ nodes: newNodes, links: newLinks })
  }, [graphData, setGraphData])

  if (loading) return <div>Loading...</div>

  if (error) {
    console.log(error)
    return <div>Error :(</div>
  }

  return <ForceGraph3D
    enableNodeDrag={false}
    onNodeClick={handleClick}
    graphData={graphData}
    nodeLabel='handle'
  />
}

function App() {
  return (
    <div className='App'>
      <DynamicGraph />
    </div>
  )
}

export default App