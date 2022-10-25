import { atom, useRecoilState } from 'recoil'
import { useCallback, useState } from 'react'
import { useSnackbar } from 'notistack'
import _ from 'lodash'
import Graph3D from './Graph3D'
import { hexToInt } from '../../helpers'
import SelectHandle from '../Dialog/SelectHandle'
import { getProfile, getRelations } from '../../lens'
import NodeDetailsDrawer from '../NodeDetails'

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
    profile: Profile,
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
        id: hexToInt(profile.id),
        profile,
    })

    // Add following
    following.forEach((f: Following) => {
        nodes.push({
            id: hexToInt(f.profile.id),
            profile: f.profile,
        })

        links.push({
            source: hexToInt(profile.id),
            target: hexToInt(f.profile.id),
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
            id: hexToInt(f.wallet.defaultProfile.id),
            profile: f.wallet.defaultProfile,
        })

        links.push({
            source: hexToInt(f.wallet.defaultProfile.id),
            target: hexToInt(profile.id),
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

interface Props {
    width: number
    height: number
}

const Graph = ({ width, height }: Props) => {
    const [fetchingHandle, setFetchingHandle] = useRecoilState(fetchingHandleState)
    const [queriedHandles, setQueriedHandles] = useState<string[]>([])
    const [graphData, setGraphData] = useState<{ nodes: Node[], links: Link[] }>({ nodes: [], links: [] })
    const { enqueueSnackbar } = useSnackbar()

    const addHandleToGraph = useCallback((handle: string | undefined) => {
        setFetchingHandle(true)

        console.log('fetching handle:', handle)
        if (!handle) {
            enqueueSnackbar('Please enter a non-empty handle', { variant: 'error' })
            setFetchingHandle(false)
            return
        }
        if (queriedHandles.includes(handle)) {
            console.log(`handle '${handle}' has been queried, already`)
            setFetchingHandle(false)
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
            if (typeof handle !== 'string' || handle.endsWith('.lens')) {
                enqueueSnackbar(`Handle not found: ${handle}`, { variant: 'error' })
                setFetchingHandle(false)
                return
            }
            // Try again with '.lens' appended
            addHandleToGraph(handle + '.lens')
        })
    }, [queriedHandles, setQueriedHandles, graphData, setGraphData, setFetchingHandle, enqueueSnackbar])

    return (
        <>
            <SelectHandle queriedHandles={queriedHandles} fetchingHandle={fetchingHandle} setFetchingHandle={setFetchingHandle} addHandleToGraph={addHandleToGraph} />
            <NodeDetailsDrawer addHandleToGraph={addHandleToGraph} queriedHandles={queriedHandles} /> {/* TODO: move details drawer outside graph component */}
            <Graph3D width={width} height={height} addHandleToGraph={addHandleToGraph} graphData={graphData} queriedHandles={queriedHandles} />
        </>
    )
}

export default Graph