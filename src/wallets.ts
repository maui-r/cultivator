import { chain, configureChains, createClient } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'

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

export default wagmiClient