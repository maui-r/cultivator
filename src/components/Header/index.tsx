import { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import HelpIcon from '@mui/icons-material/Help'
import SettingsIcon from '@mui/icons-material/Settings'
import { Button, Stack, Tooltip } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi'
import { POLYGON_CHAIN_ID } from '../../constants'
import { useAppStore } from '../../stores'
import { signIn } from '../../lens/auth'

const SettingsButton = () => {
    const showSettings = useAppStore((state) => state.showSettings)
    const setShowSettings = useAppStore((state) => state.setShowSettings)

    return (
        <Tooltip title='Toggle settings drawer' enterDelay={300}>
            <IconButton color='inherit' onClick={() => setShowSettings(!showSettings)} sx={{ px: '8px' }}>
                <SettingsIcon fontSize='small' />
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
            <IconButton color='inherit' onClick={handleClick} sx={{ px: '8px' }}>
                <HelpIcon fontSize='small' />
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
        switchNetwork?.(POLYGON_CHAIN_ID)
    }

    if (isConnected && chain?.id !== POLYGON_CHAIN_ID) return (
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

const Header = () => {
    return (
        <AppBar position='static'>
            <Toolbar variant='dense'>

                <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
                    Cultivator
                </Typography>

                <Stack direction='row' spacing={1.3}>
                    <SettingsButton />
                    <HelpButton />
                    <SignInButton />
                </Stack>

            </Toolbar>
        </AppBar>
    )
}

export default Header