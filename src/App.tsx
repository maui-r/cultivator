import { useEffect, useMemo } from 'react'
import { styled } from '@mui/material/styles'
import { Alert, Box, createTheme, CssBaseline, Grid, ThemeProvider, useMediaQuery } from '@mui/material'
import { SnackbarProvider } from 'notistack'
import { Provider as UrqlProvider } from 'urql'
import shallow from 'zustand/shallow'
import { WagmiConfig } from 'wagmi'
import wagmiClient from './wallets'
import { ColorMode } from './types'
import { useAppPersistStore, useAppStore, useNodeStore, useOptimisticCache } from './stores'
import Header from './components/Header'
import SettingsDrawer from './components/Settings'
import api from './lens/client'
import { Dialogs } from './components/Dialog'
import { Graph2D } from './components/Graph'
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
  MuiLinearProgress: {
    styleOverrides: {
      dashed: {
        animationIterationCount: 1,
      }
    }
  }
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

  const currentAddress = useAppStore((state) => state.currentAddress)
  const currentProfileId = useAppStore((state) => state.currentProfileId)
  const clearOptimisticCache = useOptimisticCache((state) => state.clearOptimisticCache)

  // Reset urql instance when profile or address change
  const lensClient = useMemo(() => {
    return api.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAddress, currentProfileId])

  useEffect(() => {
    clearOptimisticCache()
    console.debug('-------------------------')
    console.debug('address:', currentAddress)
    console.debug('profile id:', currentProfileId)
    console.debug('-------------------------')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAddress, currentProfileId])

  const hasNodes = useNodeStore((state) => Object.keys(state.nodes).length > 0, shallow)

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

              {!hasNodes ?
                <Box sx={{ p: 1 }}>
                  <Alert severity='info'>Use the search bar to add some nodes 👆</Alert>
                </Box>
                : null}
              <Content container>
                <NodeDetails />
                <Graph2D />
              </Content>
            </Wrapper>

          </UrqlProvider>
        </WagmiConfig>
      </SnackbarProvider>
    </ThemeProvider>
  )
}

export default App