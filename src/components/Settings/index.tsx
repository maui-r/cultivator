import { Box, Divider, Drawer, IconButton, styled, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import BubbleChartIcon from '@mui/icons-material/BubbleChart'
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail'
import { useAppPersistStore, useAppStore } from '../../stores'
import { NodeStyle } from '../../types'

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

const SelectNodeStyleButtonGroup = () => {
    const nodeStyle = useAppPersistStore((state) => state.nodeStyle)
    const setNodeStyle = useAppPersistStore((state) => state.setNodeStyle)

    const handleNodeStyleChange = (
        event: React.MouseEvent<HTMLElement>,
        newNodeStyle: NodeStyle | null,
    ) => {
        if (!newNodeStyle) return
        setNodeStyle(newNodeStyle)
    }


    return (
        <Box sx={{ pl: 2, pr: 2 }}>
            <Heading gutterBottom id="settings-node-style">Node Style</Heading>
            <ToggleButtonGroup
                exclusive
                value={nodeStyle}
                color="primary"
                onChange={handleNodeStyleChange}
                aria-labelledby="settings-node-style"
                fullWidth
            >
                <IconToggleButton value={NodeStyle.LensHandle} aria-label="Lens Handle">
                    <AlternateEmailIcon fontSize="small" />
                    Handle
                </IconToggleButton>
                <IconToggleButton value={NodeStyle.Bubble} aria-label="Bubble">
                    <BubbleChartIcon fontSize="small" />
                    Bubble
                </IconToggleButton>
            </ToggleButtonGroup>
        </Box>
    )
}

const SettingsDrawer = () => {
    const showSettings = useAppStore((state) => state.showSettings)
    const setShowSettings = useAppStore((state) => state.setShowSettings)
    const onClose = () => setShowSettings(false)

    return (
        <Drawer
            anchor='right'
            open={showSettings}
            onClose={onClose}
            PaperProps={{
                elevation: 0,
                sx: { width: { xs: 310, sm: 360 }, borderRadius: '10px 0px 0px 10px' },
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                <Typography variant="body1" fontWeight="500">Settings</Typography>
                <IconButton color="inherit" onClick={onClose} edge="end">
                    <CloseIcon color="primary" fontSize="small" />
                </IconButton>
            </Box>

            <Divider />

            <SelectNodeStyleButtonGroup />
        </Drawer>
    )
}

export default SettingsDrawer