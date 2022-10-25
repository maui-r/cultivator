import { useAppStore } from '../../stores'
import ConnectWalletDialog from './ConnectWallet'
import HelpDialog from './Help'

export const Dialogs = () => {
    const showHelp = useAppStore((state) => state.showHelp)
    const showConnectWallet = useAppStore((state) => state.showConnectWallet)

    if (showHelp) return <HelpDialog />
    if (showConnectWallet) return <ConnectWalletDialog />
    return null
}