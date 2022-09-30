import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import SettingsIcon from '@mui/icons-material/Settings'
import { Stack, Tooltip } from '@mui/material'
import { useAppStore } from '../../store'

const Header = () => {
    const showSettings = useAppStore((state) => state.showSettings)
    const setShowSettings = useAppStore((state) => state.setShowSettings)

    return (
        <AppBar position="static">
            <Toolbar variant="dense">
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Cultivator
                </Typography>
                <Stack direction="row" spacing={1.3}>
                    {/* <Tooltip title={'GitHub repository'} enterDelay={300}>
                        <IconButton
                            component="a"
                            color="inherit"
                            href={'https://github.com/maui-r/cultivator'}
                            target={'_blank'}
                        >
                            <GitHubIcon fontSize="small" />
                        </IconButton>
                    </Tooltip> */}
                    <Tooltip title={'Toggle settings drawer'} enterDelay={300}>
                        <IconButton color="inherit" onClick={() => setShowSettings(!showSettings)} sx={{ px: '8px' }}>
                            <SettingsIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Toolbar>
        </AppBar>
    )
}

export default Header