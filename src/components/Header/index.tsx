import { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import HelpIcon from '@mui/icons-material/Help'
import SettingsIcon from '@mui/icons-material/Settings'
import { Box, Button, Menu, MenuItem, Avatar as MuiAvatar, Stack, Tooltip } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi'
import { APP_CHAIN_ID } from '../../constants'
import { useAppStore } from '../../stores'
import { signIn, signOut } from '../../lens/auth'

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
    const hasSignedIn = useAppStore((state) => state.hasSignedIn)
    const setShowConnectWallet = useAppStore((state) => state.setShowConnectWallet)
    const [isSigningIn, setIsSigningIn] = useState(false)
    const { isConnected } = useAccount()
    const { chain } = useNetwork()
    const { isLoading, switchNetwork } = useSwitchNetwork()

    const handleConnect = () => {
        setShowConnectWallet(true)
    }

    const handleSignIn = async () => {
        setIsSigningIn(true)
        await signIn()
        setIsSigningIn(false)
    }

    const handleSwitchNetwork = () => {
        switchNetwork?.(APP_CHAIN_ID)
    }

    if (isConnected && chain?.id !== APP_CHAIN_ID) return (
        <LoadingButton
            color='inherit'
            loading={isLoading}
            onClick={handleSwitchNetwork}
        >
            Switch to Polygon
        </LoadingButton>
    )

    if (hasSignedIn) return null

    if (isConnected) return (
        <LoadingButton
            color='inherit'
            loading={isSigningIn}
            onClick={handleSignIn}
        >
            Sign In
        </LoadingButton>
    )

    return (
        <Button color='inherit' onClick={handleConnect}>
            Connect
        </Button>
    )
}

const Avatar = () => {
    const hasSignedIn = useAppStore((state) => state.hasSignedIn)
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

    if (!hasSignedIn) return null

    return (
        <Box>
            <Tooltip title='Show user menu'>
                <IconButton onClick={handleOpenMenu}>
                    <MuiAvatar alt='' src='' sx={{ width: 36, height: 36 }} />
                </IconButton>
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
    return (
        <AppBar position='static' sx={{ zIndex: (theme) => theme.zIndex.appBar }}>
            <Toolbar>
                <Typography variant='h6' component='h1' sx={{ flexGrow: 1 }}>
                    Cultivator
                </Typography>

                <Stack direction='row' spacing={1.3}>
                    <SettingsButton />
                    <HelpButton />
                    <SignInButton />
                    <Avatar />
                </Stack>

            </Toolbar>
        </AppBar>
    )
}

export default Header