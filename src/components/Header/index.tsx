import { useEffect, useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import HelpIcon from '@mui/icons-material/Help'
import SettingsIcon from '@mui/icons-material/Settings'
import WarningRoundedIcon from '@mui/icons-material/WarningRounded'
import { Box, Button, Chip, CircularProgress, CircularProgressProps, Menu, MenuItem, Stack, Tooltip } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import { useAppStore } from '../../stores'
import { signOut } from '../../lens/auth'
import { JWT_ADDRESS_KEY } from '../../constants'
import { useAccount } from 'wagmi'
import { ProfilePicture } from '../Shared/ProfilePicture'
import { useQuery } from 'urql'
import { graphql } from '../../lens/schema'
import { SearchBar } from './SearchBar'

const SettingsButton = () => {
  const showSettings = useAppStore((state) => state.showSettings)
  const setShowSettings = useAppStore((state) => state.setShowSettings)

  return (
    <Tooltip title='Toggle settings drawer' enterDelay={300}>
      <IconButton color='inherit' onClick={() => setShowSettings(!showSettings)}>
        <SettingsIcon />
      </IconButton>
    </Tooltip>
  )
}

const HelpButton = () => {
  const setShowHelp = useAppStore((state) => state.setShowHelp)

  const handleClick = () => {
    setShowHelp(true)
  }

  return (
    <Tooltip title='Show help' enterDelay={300}>
      <IconButton color='inherit' onClick={handleClick}>
        <HelpIcon />
      </IconButton>
    </Tooltip>
  )
}

const SignInButton = () => {
  const showSignIn = useAppStore((state) => state.showSignIn)
  const setShowSignIn = useAppStore((state) => state.setShowSignIn)

  return (
    <LoadingButton
      loading={showSignIn}
      onClick={() => setShowSignIn(true)}
      color='inherit'
      variant='outlined'
    >
      Sign In
    </LoadingButton>
  )
}

const ProfilePictureQuery = graphql(`
  query ProfilePicture($profileId: ProfileId!) {
    profile(request: { profileId: $profileId }) {
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
    }
  }
`)

const CurrentProfilePicture = ({ profileId }: { profileId: string }) => {
  const [{ data, fetching, error }] = useQuery({
    query: ProfilePictureQuery,
    variables: { profileId },
    requestPolicy: 'cache-and-network',
  })
  if (error) console.log(error.message)
  const profile = data?.profile

  if (fetching || error || !profile) return null
  return <ProfilePicture profile={profile} sx={{ width: 36, height: 36 }} />
}

const CurrentProfileMenu = () => {
  const currentProfileId = useAppStore((state) => state.currentProfileId)
  const [anchor, setAnchor] = useState<null | HTMLElement>(null)

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchor(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setAnchor(null)
  }

  const handleSignOut = () => {
    handleCloseMenu()
    signOut()
  }

  return (
    <Box>
      <Tooltip title='Show user menu'>
        {currentProfileId ?
          <IconButton onClick={handleOpenMenu}>
            <CurrentProfilePicture profileId={currentProfileId} />
          </IconButton>
          :
          <Button color='inherit' variant='outlined' onClick={handleOpenMenu}>No Profile</Button>
        }
      </Tooltip>
      <Menu
        sx={{ mt: '45px' }}
        keepMounted
        open={Boolean(anchor)}
        onClose={handleCloseMenu}
        anchorEl={anchor}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleSignOut}>
          <Typography textAlign='center'>Sign Out</Typography>
        </MenuItem>
      </Menu>
    </Box>
  )
}

const CircularProgressWithLabel = (props: CircularProgressProps & { value: number }) => {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant='determinate' {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant='caption'
          component='div'
          color='text.primary'
        >{`${Math.round(Math.max(0, Math.min(props.value, 99)))}%`}</Typography>
      </Box>
    </Box>
  )
}

const QueryProgressIndicator = () => {
  const isQuerying = useAppStore((state) => state.isQuerying)
  const queryProgress = useAppStore((state) => state.queryProgress)

  if (!isQuerying) return null
  if (queryProgress === null) return <CircularProgress size={36} />
  return <CircularProgressWithLabel size={36} value={queryProgress * 100} />
}

const Header = () => {
  const { address } = useAccount()
  const currentAddress = useAppStore((state) => state.currentAddress)
  const setShowBeta = useAppStore((state) => state.setShowBeta)

  // Sign out if address changed
  useEffect(() => {
    if (
      currentAddress === address
      &&
      currentAddress === localStorage.getItem(JWT_ADDRESS_KEY)
    ) {
      return
    }
    console.debug('address mismatch')
    signOut()
  }, [currentAddress, address])

  return (
    <AppBar position='static' color='inherit' enableColorOnDark sx={{ zIndex: (theme) => theme.zIndex.appBar }}>
      <Toolbar>
        <Stack direction='row' alignItems='center' spacing={1.3}>
          <Typography variant='h6' component='h1'>
            Cultivator
          </Typography>
          <Chip icon={<WarningRoundedIcon />} onClick={() => setShowBeta(true)} label='Beta' color='warning' sx={{ p: 0.5 }} />
          <SearchBar />
          <QueryProgressIndicator />
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction='row' spacing={1.3}>
          <SettingsButton />
          <HelpButton />
          {currentAddress ? <CurrentProfileMenu /> : <SignInButton />}
        </Stack>

      </Toolbar>
    </AppBar>
  )
}

export default Header