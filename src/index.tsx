import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import { RecoilRoot } from 'recoil'
import { SnackbarProvider } from 'notistack'
import { createClient, WagmiConfig } from 'wagmi'
import { getDefaultProvider } from 'ethers'
import App from './App'
import reportWebVitals from './reportWebVitals'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1b3c63',
      contrastText: '#fff',
    },
    secondary: {
      main: '#e3cf1c',
      contrastText: '#000',
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        body {
          // Hide scrollbars to avoid interference
          // with graph resize handler
          overflow: hidden;
        }
      `,
    },
  },
})

const wagmiClient = createClient({
  autoConnect: true,
  provider: getDefaultProvider(),
})

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RecoilRoot>
        <SnackbarProvider maxSnack={3}>
          <WagmiConfig client={wagmiClient}>
            <App />
          </WagmiConfig>
        </SnackbarProvider>
      </RecoilRoot>
    </ThemeProvider>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()