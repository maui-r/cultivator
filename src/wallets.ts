import { chain, configureChains, createClient } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { ALCHEMY_API_KEY } from './constants'

const chains = [chain.polygon]
const providers = [alchemyProvider({ apiKey: ALCHEMY_API_KEY })]
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