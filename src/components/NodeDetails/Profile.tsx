import { useEffect, useState } from 'react'
import { utils } from 'ethers'
import { useQuery } from 'urql'
import { useSnackbar } from 'notistack'
import { useAccount, useContractWrite, useNetwork, useSignTypedData } from 'wagmi'
import { Box, Button, Card, Stack, styled, Tooltip, Typography } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import { useAppStore, useNodeStore, useOptimisticCache } from '../../stores'
import { sleep, sortProfiles } from '../../helpers'
import { graphql } from '../../lens/schema'
import { FollowModule, FollowModuleRedeemParams, Profile } from '../../lens/schema/graphql'
import { APP_CHAIN_ID, REQUEST_DELAY } from '../../constants'
import { createFollowTypedData, followProxy } from '../../lens/follow'
import { lensHubProxyAbi, lensHubProxyAddress } from '../../contracts'
import ErrorComponent from './Error'
import Loading from './Loading'
import { getProfileMin, getProfilesOwnedByAddress } from '../../lens/profile'
import { OptimisticAction, OptimisticTransactionStatus } from '../../types'
import { getOptimisticTransactionStatus } from '../../lens/optimisticTransaction'
import { broadcastTypedData } from '../../lens/broadcast'
import { createUnfollowTypedData } from '../../lens/unfollow'
import { ProfilePicture } from '../Shared/ProfilePicture'
import { getAllFollowing, getFollowers } from '../../subgraph'

const ProfileStatCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexGrow: 1,
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  flexWrap: 'wrap',
  padding: theme.spacing(1),
}))
const ProfileStatValue = styled(Typography)({ fontWeight: 700 })
const ProfileStatName = styled(Typography)({ fontWeight: 300 })

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
        totalPosts
        totalComments
        totalMirrors
        totalCollects
      }
      isFollowedByMe
      followModule {
        ... on UnknownFollowModuleSettings {
         type
        }
        ... on RevertFollowModuleSettings {
         type
        }
        ... on ProfileFollowModuleSettings {
         type
        }
        ... on FeeFollowModuleSettings {
          type
          amount {
            asset {
              symbol
              name
              decimals
              address
            }
            value
          }
        }
      }
    }
  }
`)

const prepareFollowModuleParams = ({ followModule, followerProfileId }: { followModule: Partial<FollowModule> | null | undefined, followerProfileId: string | null }): FollowModuleRedeemParams | null => {
  if (followModule?.__typename === 'FeeFollowModuleSettings') {
    if (!followModule?.amount) throw new Error('Missing properties of followModule')
    return {
      feeFollowModule: {
        amount: {
          currency: followModule.amount.asset.address,
          value: followModule.amount.value
        }
      }
    }
  }

  if (followModule?.__typename === 'ProfileFollowModuleSettings') {
    if (!followerProfileId) throw new Error('Missing followerProfileId')
    return {
      profileFollowModule: {
        profileId: followerProfileId
      }
    }
  }

  return null
}

const FollowButton = ({ profile, refetchProfile }: { profile: Pick<Profile, 'id'> & { followModule?: Partial<FollowModule> | null }, refetchProfile: Function }) => {
  const transactions = useOptimisticCache((state) => state.transactions)
  const addTransaction = useOptimisticCache((state) => state.addTransaction)
  const removeTransaction = useOptimisticCache((state) => state.removeTransaction)
  const setShowSignIn = useAppStore((state) => state.setShowSignIn)
  const currentAddress = useAppStore((state) => state.currentAddress)
  const currentProfileId = useAppStore((state) => state.currentProfileId)
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

  const isLoading = followInProgress || isSignTypedDataLoading || isWriteLoading
  const error = signTypedDataError || writeError

  const handleFollow = async () => {
    try {
      setFollowInProgress(true)

      if (!currentAddress) {
        enqueueSnackbar(
          'Not authenticated',
          {
            action: () => <Button color='inherit' variant='outlined' size='small' onClick={() => setShowSignIn(true)}>Sign In</Button>,
            variant: 'error',
          }
        )
        return
      }

      if (transactions[profile.id]) {
        const status = await getOptimisticTransactionStatus(transactions[profile.id])
        if (status === OptimisticTransactionStatus.pending) {
          enqueueSnackbar('Please wait a moment and try again', { variant: 'error' })
          return
        }
        refetchProfile()
        removeTransaction(profile.id)
      }

      if (profile.followModule?.__typename === 'UnknownFollowModuleSettings') {
        enqueueSnackbar('Unknown Follow Module not supported', { variant: 'error' })
        return
      }

      if (profile.followModule?.__typename === 'RevertFollowModuleSettings') {
        enqueueSnackbar('This profile can\'t be followed', { variant: 'error' })
        return
      }

      if (profile.followModule?.__typename === 'ProfileFollowModuleSettings' && !currentProfileId) {
        enqueueSnackbar('A profile is required to follow this profile', { variant: 'error' })
        return
      }

      if (!profile.followModule) {
        try {
          const proxyActionId = await followProxy({ profileId: profile.id })
          console.debug('follow proxy action id:', proxyActionId)
          refetchProfile()
          return
        } catch {
          console.log('proxy follow failed')
        }
      }

      if (chain?.id !== APP_CHAIN_ID) {
        enqueueSnackbar(
          'Wrong chain',
          {
            action: () => <Button color='inherit' variant='outlined' size='small' onClick={() => setShowSignIn(true)}>Switch Network</Button>,
            variant: 'error',
          }
        )
        return
      }

      const followModuleParams = prepareFollowModuleParams({ followModule: profile.followModule, followerProfileId: currentProfileId })
      const request = { follow: [{ profile: profile.id, followModule: followModuleParams }] }

      const typedData = await createFollowTypedData(request)
      // Remove __typename fields
      const { __typename: tmp0, ...domain } = typedData.typedData.domain
      const { __typename: tmp1, ...types } = typedData.typedData.types
      const { __typename: tmp2, ...value } = typedData.typedData.value

      // Ask user to sign typed data
      const signature = await signTypedDataAsync({ domain, types, value })

      try {
        const txId = await broadcastTypedData({ typedData, signature })
        console.debug('follow tx id:', txId)
        addTransaction(profile.id, { action: OptimisticAction.follow, txId })
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
        console.debug('follow tx hash:', tx.hash)
        addTransaction(profile.id, { action: OptimisticAction.follow, txHash: tx.hash })
        return
      } catch {
        console.log('contract call follow failed')
      }

      throw new Error('None of the follow tactics succeeded')
    } catch {
      enqueueSnackbar('Follow failed', { variant: 'error' })
    } finally {
      setFollowInProgress(false)
    }
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

const UnfollowButton = ({ profile, refetchProfile }: { profile: Pick<Profile, 'id'>, refetchProfile: Function }) => {
  const transactions = useOptimisticCache((state) => state.transactions)
  const addTransaction = useOptimisticCache((state) => state.addTransaction)
  const removeTransaction = useOptimisticCache((state) => state.removeTransaction)
  const setShowSignIn = useAppStore((state) => state.setShowSignIn)
  const currentAddress = useAppStore((state) => state.currentAddress)
  const [unfollowInProgress, setUnfollowInProgress] = useState<boolean>(false)
  const { enqueueSnackbar } = useSnackbar()
  const { chain } = useNetwork()
  const { signTypedDataAsync, error: signTypedDataError, isLoading: isSignTypedDataLoading } = useSignTypedData()
  const { writeAsync, error: writeError, isLoading: isWriteLoading } = useContractWrite({
    mode: 'recklesslyUnprepared',
    address: lensHubProxyAddress,
    abi: lensHubProxyAbi,
    functionName: 'burnWithSig',
    chainId: APP_CHAIN_ID,
  })

  const isLoading = unfollowInProgress || isSignTypedDataLoading || isWriteLoading
  const error = signTypedDataError || writeError

  const handleUnfollow = async () => {
    try {
      setUnfollowInProgress(true)

      if (!currentAddress) {
        enqueueSnackbar(
          'Not authenticated',
          {
            action: () => <Button color='inherit' variant='outlined' size='small' onClick={() => setShowSignIn(true)}>Sign In</Button>,
            variant: 'error',
          }
        )
        return
      }

      if (transactions[profile.id]) {
        const status = await getOptimisticTransactionStatus(transactions[profile.id])
        if (status === OptimisticTransactionStatus.pending) {
          enqueueSnackbar('Please wait a moment and try again', { variant: 'error' })
          return
        }
        refetchProfile()
        removeTransaction(profile.id)
      }

      if (chain?.id !== APP_CHAIN_ID) {
        enqueueSnackbar(
          'Wrong chain',
          {
            action: () => <Button color='inherit' variant='outlined' size='small' onClick={() => setShowSignIn(true)}>Switch Network</Button>,
            variant: 'error',
          }
        )
        return
      }

      const request = { profile: profile.id }
      const typedData = await createUnfollowTypedData(request)
      // Remove __typename fields
      const { __typename: tmp0, ...domain } = typedData.typedData.domain
      const { __typename: tmp1, ...types } = typedData.typedData.types
      const { __typename: tmp2, ...value } = typedData.typedData.value

      // Ask user to sign typed data
      const signature = await signTypedDataAsync({ domain, types, value })

      try {
        const txId = await broadcastTypedData({ typedData, signature })
        console.debug('follow tx id:', txId)
        addTransaction(profile.id, { action: OptimisticAction.unfollow, txId })
        return
      } catch {
        console.log('broadcast unfollow failed')
      }

      try {
        if (!writeAsync) throw new Error('writeAsync is undefined')
        const { v, r, s } = utils.splitSignature(signature)
        const tx = await writeAsync({
          recklesslySetUnpreparedArgs: [{
            tokenId: value.tokenId,
            sig: { v, r, s, deadline: value.deadline, },
          }]
        })
        console.debug('follow tx hash:', tx.hash)
        addTransaction(profile.id, { action: OptimisticAction.unfollow, txHash: tx.hash })
        return
      } catch {
        console.log('contract call unfollow failed')
      }

      throw new Error('None of the unfollow tactics succeeded')
    } catch {
      enqueueSnackbar('Unfollow failed', { variant: 'error' })
    } finally {
      setUnfollowInProgress(false)
    }
  }

  useEffect(() => {
    if (!error) return
    enqueueSnackbar('Something went wrong...', { variant: 'error' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  return (
    <LoadingButton onClick={handleUnfollow} loading={isLoading} variant='contained' startIcon={<PersonRemoveIcon />} sx={{ m: 1 }}>Unfollow</LoadingButton>
  )
}

const QueryFollowersButton = ({ profileId }: { profileId: string }) => {
  const isQuerying = useAppStore((state) => state.isQuerying)
  const setIsQuerying = useAppStore((state) => state.setIsQuerying)
  const addNodes = useNodeStore((state) => state.addNodes)
  const nodes = useNodeStore((state) => state.nodes)
  const node = nodes[profileId]

  const handleAddFollowers = async () => {
    if (!node) return
    setIsQuerying(true)
    try {
      // 
      if (node.queriedFollowers?.allQueried) return
      console.debug('- add followers of', profileId)

      // Number of additional followers to query
      const followersToQuery = 25

      // Get the follower addresses
      let skip = node.queriedFollowers?.queried ?? 0
      const followerAddresses = await getFollowers({
        profileId,
        first: followersToQuery,
        skip,
      })

      const newNodes = []
      for (const address of followerAddresses) {
        skip++
        // Get "default" profile of follower address
        const profiles = await getProfilesOwnedByAddress(address)
        await sleep(REQUEST_DELAY)
        if (profiles.length < 1) continue
        const profileId = sortProfiles(profiles)[0].id
        const profileMin = await getProfileMin({ id: profileId })

        // Check if profile already present
        if (nodes.hasOwnProperty(profileMin.id)) continue

        // Get following
        const following = await getAllFollowing(address)

        if (Object.keys(useNodeStore.getState().nodes).length < 10) {
          // Add node immediately to give the user something to explore
          addNodes([{ ...profileMin, following }])
        } else {
          newNodes.push({ ...profileMin, following })
        }
      }

      // Update "origin" node
      const allQueried = followerAddresses.length < followersToQuery
      newNodes.push({ ...node, queriedFollowers: { queried: skip, allQueried } })

      addNodes(newNodes)
    } finally {
      setIsQuerying(false)
    }
  }

  const buttonText = !node.queriedFollowers ? 'Add' :
    !node.queriedFollowers.allQueried ? 'Add more' :
      null

  if (!buttonText) return null
  if (isQuerying) return <Button variant='outlined' size='small' disabled>{buttonText}</Button>
  return (
    <Tooltip title='Add to graph'>
      <Button variant='outlined' size='small' onClick={handleAddFollowers}>{buttonText}</Button>
    </Tooltip>
  )
}

const ProfileDetails = ({ profileId }: { profileId: string }) => {
  const transactions = useOptimisticCache((state) => state.transactions)
  const [{ data, fetching, error }, refetchProfile] = useQuery({
    query: ProfileQuery,
    variables: { profileId },
    requestPolicy: 'cache-and-network',
  })
  if (error) console.log(error.message)
  const profile = data?.profile
  const isOptimisticFollowInProgress = transactions[profile?.id]?.action === OptimisticAction.follow
  const isOptimisticUnfollowInProgress = transactions[profile?.id]?.action === OptimisticAction.unfollow
  const isFollowing = isOptimisticFollowInProgress || (profile?.isFollowedByMe && !isOptimisticUnfollowInProgress)


  const currentProfileId = useAppStore((state) => state.currentProfileId)
  const currentAddress = useAppStore((state) => state.currentAddress)
  useEffect(() => {
    console.debug('refetch selected profile')
    refetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAddress, currentProfileId])


  if (fetching) return <Loading />
  if (error || !profile) return <ErrorComponent />
  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ textAlign: 'center' }}>
        <ProfilePicture profile={profile} sx={{ margin: 'auto', width: 80, height: 80 }} />
        <Typography variant='h5' component='h3' sx={{ mt: 1 }}>{profile.name ?? profile.handle}</Typography>
        {
          profileId === currentProfileId
            ? null
            : isFollowing
              ? <UnfollowButton profile={profile} refetchProfile={refetchProfile} />
              : <FollowButton profile={profile} refetchProfile={refetchProfile} />
        }
        <Typography sx={{ m: 1 }}>{profile.bio}</Typography>
      </Box>
      <Stack spacing={1}>
        <ProfileStatCard variant='outlined'>
          <Box>
            <ProfileStatValue>{profile.stats.totalFollowers}</ProfileStatValue>
            <ProfileStatName>{profile.stats.totalFollowers === 1 ? 'Follower' : 'Followers'}</ProfileStatName>
          </Box>
          {profile.stats.totalFollowers ? <QueryFollowersButton profileId={profileId} /> : null}
        </ProfileStatCard>
        <ProfileStatCard variant='outlined'>
          <Box>
            <ProfileStatValue>{profile.stats.totalFollowing}</ProfileStatValue>
            <ProfileStatName>Following</ProfileStatName>
          </Box>
          {/* <AddFollowingButton profileId={profileId} /> */}
        </ProfileStatCard>
        <ProfileStatCard variant='outlined'>
          <Box>
            <ProfileStatValue>{profile.stats.totalPosts}</ProfileStatValue>
            <ProfileStatName>{profile.stats.totalPosts === 1 ? 'Post' : 'Posts'}</ProfileStatName>
          </Box>
        </ProfileStatCard>
        <ProfileStatCard variant='outlined'>
          <Box>
            <ProfileStatValue>{profile.stats.totalComments}</ProfileStatValue>
            <ProfileStatName>{profile.stats.totalComments === 1 ? 'Comment' : 'Comments'}</ProfileStatName>
          </Box>
        </ProfileStatCard>
        <ProfileStatCard variant='outlined'>
          <Box>
            <ProfileStatValue>{profile.stats.totalMirrors}</ProfileStatValue>
            <ProfileStatName>{profile.stats.totalMirrors === 1 ? 'Mirror' : 'Mirrors'}</ProfileStatName>
          </Box>
        </ProfileStatCard>
        <ProfileStatCard variant='outlined'>
          <Box>
            <ProfileStatValue>{profile.stats.totalCollects}</ProfileStatValue>
            <ProfileStatName>{profile.stats.totalCollects === 1 ? 'Collect' : 'Collects'}</ProfileStatName>
          </Box>
        </ProfileStatCard>
      </Stack>
    </Box>
  )
}

export default ProfileDetails