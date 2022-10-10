import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import HelpIcon from '@mui/icons-material/Help'
import SettingsIcon from '@mui/icons-material/Settings'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import { Stack, Tooltip } from '@mui/material'
import { useAccount, useConnect } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { useAppStore } from '../../stores'

const SettingsButton = () => {
    const showSettings = useAppStore((state) => state.showSettings)
    const setShowSettings = useAppStore((state) => state.setShowSettings)

    return (
        <Tooltip title="Toggle settings drawer" enterDelay={300}>
            <IconButton color="inherit" onClick={() => setShowSettings(!showSettings)} sx={{ px: '8px' }}>
                <SettingsIcon fontSize="small" />
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
        <Tooltip title="Show help" enterDelay={300}>
            <IconButton color="inherit" onClick={handleClick} sx={{ px: '8px' }}>
                <HelpIcon fontSize="small" />
            </IconButton>
        </Tooltip>
    )
}

const WalletButton = () => {
    const { isConnected } = useAccount()
    const { connect } = useConnect({
        connector: new InjectedConnector(),
    })

    if (isConnected) return null

    return (
        <Tooltip title="Connect wallet" enterDelay={300}>
            <IconButton color="inherit" onClick={() => connect()} sx={{ px: '8px' }}>
                <AccountBalanceWalletIcon fontSize="small" />
            </IconButton>
        </Tooltip>
    )
}

const Header = () => {
    return (
        <AppBar position="static">
            <Toolbar variant="dense">

                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Cultivator
                </Typography>

                <Stack direction="row" spacing={1.3}>
                    <SettingsButton />
                    <WalletButton />
                    <HelpButton />
                </Stack>

            </Toolbar>
        </AppBar>
    )
}

export default Header