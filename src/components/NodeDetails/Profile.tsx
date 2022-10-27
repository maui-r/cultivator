import { useEffect, useState } from 'react'
import { utils } from 'ethers'
import { useQuery } from 'urql'
import { useSnackbar } from 'notistack'
import { useAccount, useContractWrite, useNetwork, useSignTypedData } from 'wagmi'
import { Avatar, Box, Button, Card, Stack, Tooltip, Typography } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import { useAppStore } from '../../stores'
import { graphql } from '../../lens/schema'
import { parseIpfs } from '../../helpers'
import { APP_CHAIN_ID, APP_CHAIN_NAME, JWT_ADDRESS_KEY } from '../../constants'
import { createFollowTypedData, followBroadcast, followProxy } from '../../lens/follow'
import { lensHubProxyAbi, lensHubProxyAddress } from '../../contracts'
import { signOut } from '../../lens/auth'
import ErrorComponent from './Error'
import Loading from './Loading'

const ProfileQuery = graphql(`
  query Profile($profileId: ProfileId!) {
    profile(request: { profileId: $profileId }) {
      id
      name
      handle
      bio
      picture {
        ... on NftImage {
          uri
        }
        ... on MediaSet {
          original {
            url
            mimeType
          }
        }
        __typename
      }
      stats {
        totalFollowers
        totalFollowing
      }
      isFollowedByMe
    }
  }
`)

const FollowButton = ({ profileId }: { profileId: string }) => {
  const showSignIn = useAppStore((state) => state.showSignIn)
  const setShowSignIn = useAppStore((state) => state.setShowSignIn)
  const hasSignedIn = useAppStore((state) => state.hasSignedIn)
  const [followInProgress, setFollowInProgress] = useState<boolean>(false)
  const { enqueueSnackbar } = useSnackbar()
  const { address } = useAccount()
  const { chain } = useNetwork()
  const { signTypedDataAsync, error: signTypedDataError, isLoading: isSignTypedDataLoading } = useSignTypedData()
  const { writeAsync, error: writeError, isLoading: isWriteLoading } = useContractWrite({
    mode: 'recklesslyUnprepared',
    address: lensHubProxyAddress,
    abi: lensHubProxyAbi,
    functionName: 'followWithSig',
    chainId: APP_CHAIN_ID,
  })

  const isLoading = showSignIn || followInProgress || isSignTypedDataLoading || isWriteLoading
  const error = signTypedDataError || writeError

  const handleFollow = async () => {
    try {
      setFollowInProgress(true)

      if (!address || address !== localStorage.getItem(JWT_ADDRESS_KEY)) {
        await signOut()
      }

      if (!hasSignedIn) {
        enqueueSnackbar(
          'You need to be signed in to follow',
          {
            action: () => <Button color='inherit' variant='outlined' size='small' onClick={() => setShowSignIn(true)}>Sign In</Button>,
            variant: 'error',
          }
        )
        setFollowInProgress(false)
        return
      }

      if (chain?.id !== APP_CHAIN_ID) {
        enqueueSnackbar(
          `You need to be on ${APP_CHAIN_NAME} to follow`,
          {
            action: () => <Button color='inherit' variant='outlined' size='small' onClick={() => setShowSignIn(true)}>Switch Network</Button>,
            variant: 'error',
          }
        )
        setFollowInProgress(false)
        return
      }

      try {
        const txHashProxy = await followProxy({ profileId })
        handleFollowSuccess(txHashProxy)
        return
      } catch {
        console.log('proxy follow failed')
      }

      // TODO: construct request depending on follow module
      const request = { follow: [{ profile: profileId }] }

      const followTypedData = await createFollowTypedData(request)
      // Remove __typename fields
      const { __typename: tmp0, ...domain } = followTypedData.typedData.domain
      const { __typename: tmp1, ...types } = followTypedData.typedData.types
      const { __typename: tmp2, ...value } = followTypedData.typedData.value

      // Ask user to sign typed data
      const signature = await signTypedDataAsync({ domain, types, value })

      try {
        const txHashBroadcast = await followBroadcast({ followTypedData, signature })
        handleFollowSuccess(txHashBroadcast)
        return
      } catch {
        console.log('broadcast follow failed')
      }

      try {
        if (!writeAsync) throw new Error('writeAsync is undefined')
        const { v, r, s } = utils.splitSignature(signature)
        const tx = await writeAsync({
          recklesslySetUnpreparedArgs: [{
            follower: address,
            profileIds: value.profileIds,
            datas: value.datas,
            sig: { v, r, s, deadline: value.deadline, },
          }]
        })
        handleFollowSuccess(tx.hash)
        return
      } catch {
        console.log('contract call follow failed')
      }

      throw new Error('None of the follow tactics succeeded')
    } catch {
      enqueueSnackbar('Follow profile failed', { variant: 'error' })
    } finally {
      setFollowInProgress(false)
    }
  }

  const handleFollowSuccess = (txHash: string | undefined) => {
    if (!txHash) throw new Error('txHash is undefined')
    console.debug('follow tx hash:', txHash)
    enqueueSnackbar('Successfully followed profile', { variant: 'success' })
  }

  useEffect(() => {
    if (!error) return
    enqueueSnackbar('Something went wrong...', { variant: 'error' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  return (
    <LoadingButton onClick={handleFollow} loading={isLoading} variant='contained' startIcon={<PersonAddIcon />} sx={{ m: 1 }}>Follow</LoadingButton>
  )
}

const UnfollowButton = ({ profileId }: { profileId: string }) => {
  return (
    <LoadingButton variant='contained' startIcon={<PersonRemoveIcon />} sx={{ m: 1 }}>Unfollow</LoadingButton>
  )
}

const ProfileDetails = ({ profileId, addHandleToGraph, queriedHandles }: { profileId: string, addHandleToGraph: Function, queriedHandles: string[] }) => {
  const [{ data, fetching, error }] = useQuery({
    query: ProfileQuery,
    variables: { profileId },
    requestPolicy: 'cache-first',
  })
  const profile = data?.profile
  const isQueried = profile?.handle && queriedHandles.includes(profile.handle)

  // TODO: use proper type for profile
  const getProfilePictureUrl = (profile: any) => {
    if (!profile?.picture?.__typename) return

    if (profile.picture?.__typename === 'MediaSet') {
      return parseIpfs(profile.picture.original.url)
    }

    if (profile.picture.__typename === 'NftImage') {
      return parseIpfs(profile.picture.uri)
    }
  }

  const handleAdd = () => {
    if (!profile) return
    if (isQueried) return
    addHandleToGraph(profile.handle)
  }

  if (fetching) return <Loading />
  if (error || !profile) {
    if (error) console.log(error.message)
    return <ErrorComponent />
  }

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Avatar src={getProfilePictureUrl(profile)} sx={{ margin: 'auto', width: 80, height: 80 }} />
        <Typography variant='h5' component='h3' sx={{ mt: 1 }}>{profile.name ?? profile.handle}</Typography>
        {profile.isFollowedByMe ? <UnfollowButton profileId={profileId} /> : <FollowButton profileId={profileId} />}
        <Typography sx={{ m: 1 }}>{profile.bio}</Typography>
      </Box>
      <Stack spacing={1} direction='row'>
        <Card variant='outlined' sx={{ display: 'flex', flexGrow: 1, justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', p: 1 }}>
          <Box>
            <Typography sx={{ fontWeight: 700 }}>{profile.stats.totalFollowers}</Typography>
            <Typography sx={{ fontWeight: 300 }}>Followers</Typography>
          </Box>
          <Tooltip title='Add to graph'>
            <Button variant='outlined' size='small' onClick={handleAdd} disabled={isQueried}>Add</Button>
          </Tooltip>
        </Card>
        <Card variant='outlined' sx={{ display: 'flex', flexGrow: 1, justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', p: 1 }}>
          <Box>
            <Typography sx={{ fontWeight: 700 }}>{profile.stats.totalFollowing}</Typography>
            <Typography sx={{ fontWeight: 300 }}>Following</Typography>
          </Box>
          <Tooltip title='Add to graph'>
            <Button variant='outlined' size='small' onClick={handleAdd} disabled={isQueried}>Add</Button>
          </Tooltip>
        </Card>
      </Stack>
    </Box>
  )
}

export default ProfileDetails