import { useEffect, useMemo, useRef, useState } from 'react'
import { styled } from '@mui/material/styles'
import { createTheme, CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material'
import { RecoilRoot } from 'recoil'
import { SnackbarProvider } from 'notistack'
import { createClient, WagmiConfig } from 'wagmi'
import { getDefaultProvider } from 'ethers'
import { ColorMode } from './types'
import { useAppPersistStore } from './stores'
import Help from './components/Dialog/Help'
import Graph from './components/Graph'
import Header from './components/Header'
import ProfileMenu from './components/Menu/ProfileMenu'
import SettingsDrawer from './components/Settings'

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

const wagmiClient = createClient({
  autoConnect: true,
  provider: getDefaultProvider(),
})

const Wrapper = styled('div')({
  display: 'flex',
  flexFlow: 'column',
  height: '100vh'
})

const Main = styled('main')({
  flex: '1 1 auto'
})

const App = () => {
  const colorMode = useAppPersistStore((state) => state.colorMode)
  const isSystemDark: boolean = useMediaQuery('(prefers-color-scheme: dark)')
  const mainRef = useRef<HTMLElement>(null)
  const [width, setWidth] = useState<number>(0)
  const [height, setHeight] = useState<number>(0)

  const theme = useMemo(() => createTheme({
    palette: getThemePalette(getMode(colorMode, isSystemDark)),
    components: themeComponents,
  }), [colorMode, isSystemDark])

  const handleResize = () => {
    if (!mainRef.current) {
      return
    }
    setWidth(mainRef.current.clientWidth)
    setHeight(mainRef.current.clientHeight)
  }

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RecoilRoot>
        <SnackbarProvider maxSnack={3}>
          <WagmiConfig client={wagmiClient}>

            <Wrapper>
              <Header />

              <SettingsDrawer />
              <Help />

              <Main ref={mainRef}>
                <ProfileMenu />
                <Graph width={width} height={height} />
              </Main>
            </Wrapper>

          </WagmiConfig>
        </SnackbarProvider>
      </RecoilRoot>
    </ThemeProvider>
  )
}

export default App