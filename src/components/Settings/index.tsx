import { Box, Divider, Drawer, FormControl, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent, styled, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness'
import CloseIcon from '@mui/icons-material/Close'
import { useAppPersistStore, useAppStore } from '../../stores'
import { ColorMode, GraphLayout } from '../../types'

export const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}))

const Heading = styled(Typography)(({ theme }) => ({
  margin: '20px 0 10px',
  color: theme.palette.grey[600],
  fontWeight: 700,
  fontSize: theme.typography.pxToRem(11),
  textTransform: 'uppercase',
  letterSpacing: '.08rem',
}))

const IconToggleButton = styled(ToggleButton)({
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  '& > *': {
    marginRight: '8px',
  },
})

const SelectGraphLayoutButtonGroup = () => {
  const graphLayout = useAppPersistStore((state) => state.graphLayout)
  const setGraphLayout = useAppPersistStore((state) => state.setGraphLayout)

  const handleGraphLayoutChange = (event: SelectChangeEvent) => {
    setGraphLayout(event.target.value as GraphLayout)
  }


  return (
    <>
      <Heading gutterBottom id='settings-graph-layout'>Graph Layout</Heading>
      <Box sx={{ minWidth: 120 }}>
        <FormControl fullWidth>
          <InputLabel id='settings-graph-layout-label'>Graph Layout</InputLabel>
          <Select
            labelId='settings-graph-layout-label'
            id='settings-graph-layout-select'
            value={graphLayout}
            label='Graph Layout'
            onChange={handleGraphLayoutChange}
          >
            {
              (Object.keys(GraphLayout) as Array<GraphLayout>).map((key) => {
                return <MenuItem value={key}>{key}</MenuItem>
              })
            }
          </Select>
        </FormControl>
      </Box>
    </>
  )
}

const SelectColorModeButtonGroup = () => {
  const colorMode = useAppPersistStore((state) => state.colorMode)
  const setColorMode = useAppPersistStore((state) => state.setColorMode)

  const handleChangeColorMode = (event: React.MouseEvent<HTMLElement>, colorMode: ColorMode | null) => {
    if (!colorMode) return
    setColorMode(colorMode)
  }

  return (
    <>
      <Heading gutterBottom id='settings-color-mode'>Color Mode</Heading>
      <ToggleButtonGroup
        exclusive
        value={colorMode}
        onChange={handleChangeColorMode}
        aria-labelledby='settings-color-mode'
        fullWidth
      >
        <IconToggleButton value={ColorMode.Light} aria-label='Light'>
          <LightModeIcon fontSize='small' />
          Light
        </IconToggleButton>
        <IconToggleButton value={ColorMode.System} aria-label='System'>
          <SettingsBrightnessIcon fontSize='small' />
          System
        </IconToggleButton>
        <IconToggleButton value={ColorMode.Dark} aria-label='Dark'>
          <DarkModeOutlinedIcon fontSize='small' />
          Dark
        </IconToggleButton>
      </ToggleButtonGroup>
    </>
  )
}

const SettingsDrawer = () => {
  const showSettings = useAppStore((state) => state.showSettings)
  const setShowSettings = useAppStore((state) => state.setShowSettings)
  const onClose = () => setShowSettings(false)

  return (
    <Drawer
      anchor='left'
      open={showSettings}
      onClose={onClose}
      PaperProps={{
        elevation: 0,
        sx: { width: { xs: 310, sm: 360 } },
      }}
    >
      <DrawerHeader>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DrawerHeader>

      <Divider />

      <Box sx={{ pl: 2, pr: 2 }}>
        <SelectColorModeButtonGroup />
        <SelectGraphLayoutButtonGroup />
      </Box>
    </Drawer>
  )
}

export default SettingsDrawer