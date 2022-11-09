import { useEffect, useRef, useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import HelpIcon from '@mui/icons-material/Help'
import SettingsIcon from '@mui/icons-material/Settings'
import WarningRoundedIcon from '@mui/icons-material/WarningRounded'
import { Box, Button, Chip, Menu, MenuItem, Stack, TextField, Tooltip } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import { useAppStore, useNodeStore } from '../../stores'
import { signOut } from '../../lens/auth'
import { JWT_ADDRESS_KEY } from '../../constants'
import { useAccount } from 'wagmi'
import { ProfilePicture } from '../Shared/ProfilePicture'
import { useQuery } from 'urql'
import { graphql } from '../../lens/schema'
import { useSnackbar } from 'notistack'
import { getProfileNode } from '../../lens/profile'
import { TooManyFollowingException } from '../../errors'

const SearchBar = () => {
  const addNodes = useNodeStore((state) => state.addNodes)
  const selectNode = useAppStore((state) => state.selectNode)
  const isQuerying = useAppStore((state) => state.isQuerying)
  const setIsQuerying = useAppStore((state) => state.setIsQuerying)
  const handleInputRef = useRef<HTMLInputElement>()
  const { enqueueSnackbar } = useSnackbar()

  const handleAdd = async () => {
    if (isQuerying) return
    try {
      setIsQuerying(true)
      const handle = handleInputRef?.current?.value
      if (!handle) {
        enqueueSnackbar('Please enter a non-empty handle', { variant: 'error' })
        return
      }
      try {
        const { profile } = await getProfileNode(handle)
        addNodes([profile])
        selectNode(profile.id)
        return
      } catch (error) {
        if (error instanceof TooManyFollowingException) {
          enqueueSnackbar(`${handle} is following too many profiles`, { variant: 'error' })
          return
        }

        if (!handle.endsWith('.lens')) {
          // try again with '.lens' appended
          try {
            const handleWithLens = handle.concat('.lens')
            const { profile } = await getProfileNode(handleWithLens)
            addNodes([profile])
            selectNode(profile.id)
            return
          } catch (error) {
            if (error instanceof TooManyFollowingException) {
              enqueueSnackbar(`${handle} is following too many profiles`, { variant: 'error' })
              return
            }
          }
        }
        enqueueSnackbar(`Handle not found: ${handle}`, { variant: 'error' })
      }
    } finally {
      setIsQuerying(false)
    }
  }

  const handleKeyPress = (evt: React.KeyboardEvent<HTMLDivElement>) => {
    if (evt.key === 'Enter') {
      evt.preventDefault()
      handleAdd()
    }
  }

  return (
    <>
      <TextField
        onKeyDown={handleKeyPress}
        inputRef={handleInputRef}
        name='handle'
        required
        fullWidth
        id='handle'
        label='Lens Handle'
        defaultValue='cultivator'
        autoFocus
        disabled={isQuerying}
      />
      <LoadingButton
        loading={isQuerying}
        onClick={handleAdd}
        variant='contained'
      >
        Add
      </LoadingButton>
    </>
  )
}

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
    <AppBar position='static' sx={{ zIndex: (theme) => theme.zIndex.appBar }}>
      <Toolbar>
        <Typography variant='h6' component='h1'>
          Cultivator
        </Typography>
        <Chip icon={<WarningRoundedIcon />} onClick={() => setShowBeta(true)} label='Beta' color='warning' sx={{ ml: 1.5, p: 0.5 }} />
        <SearchBar />
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