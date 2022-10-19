import { chain, configureChains, createClient } from 'wagmi'
import { GetAccountResult, GetNetworkResult, watchAccount, watchNetwork } from '@wagmi/core'
import { publicProvider } from 'wagmi/providers/public'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { CHAIN_ID_KEY, WALLET_ADDRESS_KEY } from '../constants'

const chains = [chain.polygon]
const providers = [publicProvider()]
const { provider, webSocketProvider } = configureChains(chains, providers)
const wagmiClient = createClient({
    autoConnect: true,
    connectors: [
        new MetaMaskConnector({ chains }),
        //new CoinbaseWalletConnector({
        //    chains,
        //    options: {
        //        appName: 'Cultivator',
        //    }
        //}),
        //new WalletConnectConnector({
        //    chains,
        //    options: {
        //        qrcode: true,
        //    }
        //}),
        //new InjectedConnector({
        //    chains,
        //    options: {
        //        name: 'Injected',
        //        shimDisconnect: true,
        //    }
        //}),
    ],
    provider,
    webSocketProvider,
})

const handleAccountChange = async (account: GetAccountResult) => {
    if (!account.address) {
        sessionStorage.removeItem(WALLET_ADDRESS_KEY)
        return
    }
    sessionStorage.setItem(WALLET_ADDRESS_KEY, account.address)
}

const handleNetworkChange = async (network: GetNetworkResult) => {
    if (!network.chain?.id) {
        sessionStorage.removeItem(CHAIN_ID_KEY)
        return
    }
    sessionStorage.setItem(CHAIN_ID_KEY, network.chain.id.toString())
}

// make sure wagmi client exists when setting up these listeners
watchAccount(handleAccountChange)
watchNetwork(handleNetworkChange)

export default wagmiClient