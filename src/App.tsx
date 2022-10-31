import { useMemo } from 'react'
import { styled } from '@mui/material/styles'
import { createTheme, CssBaseline, Grid, ThemeProvider, useMediaQuery } from '@mui/material'
import { SnackbarProvider } from 'notistack'
import { Provider as UrqlProvider } from 'urql'
import { WagmiConfig } from 'wagmi'
import wagmiClient from './wallets'
import { ColorMode } from './types'
import { useAppPersistStore } from './stores'
import Header from './components/Header'
import SettingsDrawer from './components/Settings'
import lensClient from './lens/client'
import { Dialogs } from './components/Dialog'
import { Graph3D } from './components/Graph'
import { NodeDetails } from './components/NodeDetails'

const themeComponents = {
  MuiCssBaseline: {
    styleOverrides: `
        body {
          // Hide scrollbars to avoid interference
          // with graph resize handler
          overflow: hidden;
        }
      `,
  },
}

type Mode = 'light' | 'dark'
const getThemePalette = (mode: Mode) => ({
  mode,
  primary: {
    main: '#1b3c63',
    contrastText: '#fff',
  },
  secondary: {
    main: '#e3cf1c',
    contrastText: '#000',
  }
})

const getMode = (colorMode: ColorMode, isSystemDark: boolean) => {
  if (colorMode === ColorMode.Light) return 'light'
  if (colorMode === ColorMode.Dark) return 'dark'
  return isSystemDark ? 'dark' : 'light'
}

const Wrapper = styled('div')({
  display: 'flex',
  flexFlow: 'column',
  height: '100vh',
})

const Content = styled(Grid)({
  flex: '1 1 auto',
})

const App = () => {
  const colorMode = useAppPersistStore((state) => state.colorMode)
  const isSystemDark: boolean = useMediaQuery('(prefers-color-scheme: dark)')

  const mode = useMemo(() => getMode(colorMode, isSystemDark), [colorMode, isSystemDark])
  const theme = useMemo(() => createTheme({
    palette: getThemePalette(mode),
    components: themeComponents,
  }), [mode])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <WagmiConfig client={wagmiClient}>
          <UrqlProvider value={lensClient}>

            <Wrapper>
              <Header />
              <Dialogs />
              <SettingsDrawer />

              <Content container>
                <NodeDetails />
                <Graph3D />
              </Content>

            </Wrapper>

          </UrqlProvider>
        </WagmiConfig>
      </SnackbarProvider>
    </ThemeProvider>
  )
}

export default App