import { useQuery } from 'urql'
import { Avatar, Box, Button, Card, Stack, Tooltip, Typography } from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import { parseIpfs } from '../../helpers'
import { graphql } from '../../lens/schema'
import Loading from './Loading'
import Error from './Error'

const ProfileQuery = graphql(`
  query Profile($profileId: ProfileId!) {
    profile(request: { profileId: $profileId }) {
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

const ProfileDetails = ({ profileId, addHandleToGraph, queriedHandles }: { profileId: string, addHandleToGraph: Function, queriedHandles: string[] }) => {
  const [{ data, fetching, error }] = useQuery({
    query: ProfileQuery,
    variables: { profileId }
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
    return <Error />
  }

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Avatar src={getProfilePictureUrl(profile)} sx={{ margin: 'auto', width: 80, height: 80 }} />
        <Typography variant='h5' component='h3' sx={{ mt: 1 }}>{profile.name ?? profile.handle}</Typography>
        {profile.isFollowedByMe ?
          <Button variant='contained' startIcon={<PersonRemoveIcon />} sx={{ m: 1 }}>Unfollow</Button>
          :
          <Button variant='contained' startIcon={<PersonAddIcon />} sx={{ m: 1 }}>Follow</Button>
        }
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