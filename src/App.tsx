import { useMemo } from 'react'
import { styled } from '@mui/material/styles'
import { createTheme, CssBaseline, Grid, ThemeProvider, useMediaQuery } from '@mui/material'
import { SnackbarProvider } from 'notistack'
import { Provider as UrqlProvider } from 'urql'
import { WagmiConfig } from 'wagmi'
import wagmiClient from './wallets'
import { ColorMode } from './types'
import { useAppPersistStore, useAppStore, useOptimisticCache } from './stores'
import Header from './components/Header'
import SettingsDrawer from './components/Settings'
import api from './lens/client'
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
  ...(mode === 'light'
    ? {
      primary: {
        main: '#80656e',
        contrastText: '#fff',
      },
      secondary: {
        main: '#656e80',
        contrastText: '#fff',
      }
    }
    : {
      primary: {
        main: '#caffee',
        contrastText: '#000',
      },
      secondary: {
        main: '#ffeebf',
        contrastText: '#000',
      }
    }),
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
  // Get theme
  const colorMode = useAppPersistStore((state) => state.colorMode)
  const isSystemDark: boolean = useMediaQuery('(prefers-color-scheme: dark)')
  const mode = useMemo(() => getMode(colorMode, isSystemDark), [colorMode, isSystemDark])
  const theme = useMemo(() => createTheme({
    palette: getThemePalette(mode),
    components: themeComponents,
  }), [mode])

  // Clear cache when profile is switched
  const currentProfileId = useAppStore((state) => state.currentProfileId)
  console.log('profile:', currentProfileId)
  const clearOptimisticCache = useOptimisticCache((state) => state.clearOptimisticCache)
  const lensClient = useMemo(() => {
    console.debug(`Profile switched to ${currentProfileId} -> clearing cache`)
    api.reset()
    clearOptimisticCache()
    return api.client
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProfileId])

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