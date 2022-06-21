import { Backdrop, Box, Grid, Paper, TextField, Typography } from '@mui/material'
import { atom, useRecoilState } from 'recoil'
import { getProfile, getRelations } from './query'
import { useCallback, useRef, useState } from 'react'
import ForceGraph3D from 'react-force-graph-3d'
import LoadingButton from '@mui/lab/LoadingButton'
import SpriteText from 'three-spritetext'
import _ from 'lodash'

type Profile = {
  id: string,
  handle: string,
}

type Following = {
  profile: Profile,
}

type Wallet = {
  address: number,
  defaultProfile?: Profile,
}

type Follower = {
  wallet?: Wallet,
}

type Node = {
  id: number,
  handle: string,
}

type Link = {
  source: number,
  target: number,
}

const transformHandleData = (
  { profile, following, followers }: { profile: Profile, following: Following[], followers: Follower[] }
) => {
  const nodes: Node[] = []
  const links: Link[] = []

  if (!profile || !following) {
    return { nodes, links }
  }

  // Add profile
  nodes.push({
    id: parseInt(profile.id, 16),
    handle: profile.handle,
  })

  // Add following
  following.forEach((f: Following) => {
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
  followers.forEach((f: Follower) => {
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

const fetchHandleData = async (handle: string) => {
  const profile = await getProfile(handle)
  const { following, followers } = await getRelations(profile)
  return { profile, following, followers }
}

const fetchingHandleState = atom<boolean>({
  key: 'fetchingHandle',
  default: false,
})

function App() {
  const [fetchingHandle, setFetchingHandle] = useRecoilState(fetchingHandleState)
  const [queriedHandles, setQueriedHandles] = useState<string[]>([])
  const [graphData, setGraphData] = useState<{ nodes: Node[], links: Link[] }>({ nodes: [], links: [] })

  const handleInputRef = useRef<HTMLInputElement>()

  const addHandleToGraph = useCallback((handle: string | undefined) => {
    setFetchingHandle(true)

    console.log('fetching handle:', handle)
    if (!handle) {
      console.log('handle is empty')
      return
    }
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
      setFetchingHandle(false)
    }).catch(error => {
      console.log('invalid handle:', handle)
      setFetchingHandle(false)
    })
  }, [queriedHandles, setQueriedHandles, graphData, setGraphData, setFetchingHandle])

  return (
    <div className='App'>
      <Backdrop
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={queriedHandles.length === 0}
      >
        <Box>
          <Paper elevation={1}>
            <Grid container spacing={2} sx={{ p: 3 }}>
              <Grid item xs={12}>
                <Typography>Add a lens handle to start exploring</Typography>
              </Grid>
              <Grid item xs={12} sm={10}>
                <TextField
                  inputRef={handleInputRef}
                  name='handle'
                  required
                  fullWidth
                  id='handle'
                  label='Lens Handle'
                  defaultValue='lensprotocol'
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={2} alignItems='center' sx={{ display: 'flex' }}>
                <LoadingButton
                  loading={fetchingHandle}
                  onClick={() => addHandleToGraph(handleInputRef?.current?.value)}
                  variant='contained'>
                  Add
                </LoadingButton>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Backdrop>
      <ForceGraph3D
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
    </div>
  )
}

export default App