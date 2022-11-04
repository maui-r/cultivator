import { useEffect, useState } from 'react'
import { utils } from 'ethers'
import { useQuery } from 'urql'
import { useSnackbar } from 'notistack'
import { useAccount, useContractWrite, useNetwork, useSignTypedData } from 'wagmi'
import { Avatar, Box, Button, Card, Stack, styled, Tooltip, Typography } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
//import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import { useAppStore, useNodeStore, useOptimisticCache } from '../../stores'
import { getProfilePictureUrl, sleep } from '../../helpers'
import { graphql } from '../../lens/schema'
import { FollowModule, FollowModuleRedeemParams, Profile } from '../../lens/schema/graphql'
import { APP_CHAIN_ID, JWT_ADDRESS_KEY, REQUEST_DELAY, REQUEST_LIMIT } from '../../constants'
import { createFollowTypedData, followBroadcast, followProxy } from '../../lens/follow'
import { lensHubProxyAbi, lensHubProxyAddress } from '../../contracts'
import { signOut } from '../../lens/auth'
import ErrorComponent from './Error'
import Loading from './Loading'
import { fetchNextFollower, getProfileNode } from '../../lens/profile'
import { TooManyFollowingException } from '../../errors'
import { OptimisticAction, OptimisticTransactionStatus } from '../../types'
import { getOptimisticTransactionStatus } from '../../lens/optimisticTransaction'

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

const FollowButton = ({ profile }: { profile: Pick<Profile, 'id'> & { followModule?: Partial<FollowModule> | null } }) => {
  const transactions = useOptimisticCache((state) => state.transactions)
  const addTransaction = useOptimisticCache((state) => state.addTransaction)
  const removeTransaction = useOptimisticCache((state) => state.removeTransaction)
  const setShowSignIn = useAppStore((state) => state.setShowSignIn)
  const hasSignedIn = useAppStore((state) => state.hasSignedIn)
  const currentProfile = useAppStore((state) => state.currentProfile)
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

      if (!address || address !== localStorage.getItem(JWT_ADDRESS_KEY)) {
        await signOut()
      }

      if (!hasSignedIn) {
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

      if (profile.followModule?.__typename === 'ProfileFollowModuleSettings' && !currentProfile?.id) {
        enqueueSnackbar('A profile is required to follow this profile', { variant: 'error' })
        return
      }

      if (!profile.followModule) {
        try {
          const proxyActionId = await followProxy({ profileId: profile.id })
          addTransaction(profile.id, { action: OptimisticAction.follow, proxyActionId })
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

      const followModuleParams = prepareFollowModuleParams({ followModule: profile.followModule, followerProfileId: currentProfile?.id })
      const request = { follow: [{ profile: profile.id, followModule: followModuleParams }] }

      const followTypedData = await createFollowTypedData(request)
      // Remove __typename fields
      const { __typename: tmp0, ...domain } = followTypedData.typedData.domain
      const { __typename: tmp1, ...types } = followTypedData.typedData.types
      const { __typename: tmp2, ...value } = followTypedData.typedData.value

      // Ask user to sign typed data
      const signature = await signTypedDataAsync({ domain, types, value })

      try {
        const txId = await followBroadcast({ followTypedData, signature })
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
        addTransaction(profile.id, { action: OptimisticAction.follow, txHash: tx.hash })
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

  useEffect(() => {
    if (!error) return
    enqueueSnackbar('Something went wrong...', { variant: 'error' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  return (
    <LoadingButton onClick={handleFollow} loading={isLoading} variant='contained' startIcon={<PersonAddIcon />} sx={{ m: 1 }}>Follow</LoadingButton>
  )
}

/*
const UnfollowButton = ({ profileId }: { profileId: string }) => {
  return (
    <LoadingButton variant='contained' startIcon={<PersonRemoveIcon />} sx={{ m: 1 }}>Unfollow</LoadingButton>
  )
}

const AddFollowingButton = ({ profileId }: { profileId: string }) => {
  const disabled = true

  const handleAddFollowing = () => {
    // TODO
  }

  if (disabled) return (
    <Button variant='outlined' size='small' onClick={handleAddFollowing} disabled={true}>Add</Button>
  )

  return (
    <Tooltip title='Add to graph'>
      <Button variant='outlined' size='small' onClick={handleAddFollowing}>Add</Button>
    </Tooltip>
  )
}
*/

const AddFollowersButton = ({ profileId }: { profileId: string }) => {
  const isQuerying = useAppStore((state) => state.isQuerying)
  const setIsQuerying = useAppStore((state) => state.setIsQuerying)
  const addNodes = useNodeStore((state) => state.addNodes)
  const nodes = useNodeStore((state) => state.nodes)
  const node = nodes[profileId]

  const handleAddFollowers = async () => {
    if (!node) return
    setIsQuerying(true)
    try {
      if (node.followersPageInfo && node.followersPageInfo.next === node.followersPageInfo.total) return
      console.debug('- add followers of', profileId)
      let requestCount = 0
      let followerMin
      let updatedProfile = node
      let isLast
      do {
        do {
          // Fetch follower
          console.debug('-- fetch next follower')
          await sleep(REQUEST_DELAY)
          const result = await fetchNextFollower(updatedProfile)
          requestCount++
          followerMin = result.follower
          updatedProfile = result.updatedProfile
          isLast = result.isLast
          console.debug('--- got follower:', result.follower)
          // followerMin is null if the follower doesn't have a default profile set up
        } while (!isLast && !followerMin && requestCount < REQUEST_LIMIT)

        if (!followerMin) {
          addNodes([updatedProfile])
          console.debug('-- no next follower')
          return
        }

        if (nodes[followerMin.id]) {
          // Follower is already present
          addNodes([updatedProfile])
          console.debug('-- follower already present')
          continue
        }

        // Fetch follower's following
        try {
          console.debug('-- fetch followers following')

          // TODO: modify getProfileNode function
          //   we could pass a profileMin object and save one request
          const { profile: follower, requestCount: rc } = await getProfileNode(followerMin.handle)
          requestCount += rc
          addNodes([updatedProfile, follower])
          console.debug('- request count:', requestCount)
        } catch (error) {
          if (error instanceof TooManyFollowingException) {
            console.log('Skipping', followerMin.handle)
            //enqueueSnackbar(`Skipping ${followerMin.handle} (following too many profiles)`, { variant: 'warning' })
            continue
          }
          throw error
        }
      } while (requestCount < REQUEST_LIMIT)
    } finally {
      setIsQuerying(false)
    }
  }

  if (isQuerying) return <LoadingButton variant='outlined' size='small' loading={true}>Add</LoadingButton>

  if (!node.followersPageInfo) return (
    <Tooltip title='Add to graph'>
      <Button variant='outlined' size='small' onClick={handleAddFollowers}>Add</Button>
    </Tooltip>
  )

  if (node.followersPageInfo.next < node.followersPageInfo.total) return (
    <Tooltip title='Add to graph'>
      <Button variant='outlined' size='small' onClick={handleAddFollowers}>Add more</Button>
    </Tooltip>
  )

  return null
}

const ProfileDetails = ({ profileId }: { profileId: string }) => {
  const transactions = useOptimisticCache((state) => state.transactions)
  const [{ data, fetching, error }] = useQuery({
    query: ProfileQuery,
    variables: { profileId },
    requestPolicy: 'cache-and-network',
  })
  if (error) console.log(error.message)
  const profile = data?.profile
  const isFollowing = transactions[profile?.id]?.action === OptimisticAction.follow || profile?.isFollowedByMe

  if (fetching) return <Loading />
  if (error || !profile) {
    return <ErrorComponent />
  }

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Avatar src={getProfilePictureUrl(profile)} sx={{ margin: 'auto', width: 80, height: 80 }} />
        <Typography variant='h5' component='h3' sx={{ mt: 1 }}>{profile.name ?? profile.handle}</Typography>
        {isFollowing ? <Button>Unfollow</Button> : <FollowButton profile={profile} />}
        <Typography sx={{ m: 1 }}>{profile.bio}</Typography>
      </Box>
      <Stack spacing={1}>
        <ProfileStatCard variant='outlined'>
          <Box>
            <ProfileStatValue>{profile.stats.totalFollowers}</ProfileStatValue>
            <ProfileStatName>Followers</ProfileStatName>
          </Box>
          <AddFollowersButton profileId={profileId} />
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
            <ProfileStatName>Posts</ProfileStatName>
          </Box>
        </ProfileStatCard>
        <ProfileStatCard variant='outlined'>
          <Box>
            <ProfileStatValue>{profile.stats.totalComments}</ProfileStatValue>
            <ProfileStatName>Comments</ProfileStatName>
          </Box>
        </ProfileStatCard>
        <ProfileStatCard variant='outlined'>
          <Box>
            <ProfileStatValue>{profile.stats.totalMirrors}</ProfileStatValue>
            <ProfileStatName>Mirrors</ProfileStatName>
          </Box>
        </ProfileStatCard>
        <ProfileStatCard variant='outlined'>
          <Box>
            <ProfileStatValue>{profile.stats.totalCollects}</ProfileStatValue>
            <ProfileStatName>Collects</ProfileStatName>
          </Box>
        </ProfileStatCard>
      </Stack>
    </Box>
  )
}

export default ProfileDetails