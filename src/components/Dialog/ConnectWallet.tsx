import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { useAppStore } from '../../stores'
import { useAccount, useConnect } from 'wagmi'
import { useEffect } from 'react'
import LoadingButton from '@mui/lab/LoadingButton'

const ConnectWalletDialog = () => {
    const showConnectWallet = useAppStore((state) => state.showConnectWallet)
    const setShowConnectWallet = useAppStore((state) => state.setShowConnectWallet)
    const { isConnected } = useAccount()
    const { connect, connectors, isLoading, pendingConnector } = useConnect()

    const handleClose = () => {
        setShowConnectWallet(false)
    }

    useEffect(() => {
        if (!isConnected) return
        setShowConnectWallet(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnected])

    return (
        <Dialog open={showConnectWallet} onClose={handleClose}>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogContent>
                {connectors.map((connector: any) => (
                    <LoadingButton
                        color='success'
                        loading={isLoading && pendingConnector?.id === connector.id}
                        disabled={!connector.ready}
                        key={connector.id}
                        onClick={() => connect({ connector })}
                    >
                        Connect with {connector.name}
                    </LoadingButton>
                ))}
            </DialogContent>
            <DialogActions>
                <Button color='error' onClick={handleClose}>Cancel</Button>
            </DialogActions>
        </Dialog>
    )
}

export default ConnectWalletDialog