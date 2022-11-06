import { Avatar, AvatarProps } from '@mui/material'
import { parseIpfs } from '../../helpers'
import { MediaSet, NftImage } from '../../lens/schema/graphql'

interface ProfileWithPictureInfo {
  picture?: MediaSet | Pick<NftImage, '__typename' | 'uri'> | null
}

const getProfilePictureUrl = (profile: ProfileWithPictureInfo) => {
  if (!profile.picture) return

  if (profile.picture?.__typename === 'MediaSet') {
    return parseIpfs(profile.picture.original.url)
  }

  if (profile.picture.__typename === 'NftImage') {
    return parseIpfs(profile.picture.uri)
  }
}

type ProfilePictureProps = AvatarProps & {
  profile: ProfileWithPictureInfo
}

export const ProfilePicture = (props: ProfilePictureProps) => {
  const { profile, ...avatarProps } = props
  const url = getProfilePictureUrl(profile)
  return <Avatar {...avatarProps} src={url} />
}