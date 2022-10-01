import { styled } from '@mui/material/styles'
import { useEffect, useRef, useState } from 'react'
import Help from './components/Dialog/Help'
import Graph from './components/Graph'
import Header from './components/Header'
import SettingsDrawer from './components/Settings'

const Wrapper = styled('div')({
  display: 'flex',
  flexFlow: 'column',
  height: '100vh'
})

const Main = styled('main')({
  flex: '1 1 auto'
})

const App = () => {
  const mainRef = useRef<HTMLElement>(null)
  const [width, setWidth] = useState<number>(0)
  const [height, setHeight] = useState<number>(0)

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
    <Wrapper>
      <Header />

      <SettingsDrawer />
      <Help />

      <Main ref={mainRef}>
        <Graph width={width} height={height} />
      </Main>
    </Wrapper>
  )
}

export default App