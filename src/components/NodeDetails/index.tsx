import Drawer from '@mui/material/Drawer'
import { Box, Toolbar } from '@mui/material'
import { useAppStore } from '../../stores'

const drawerWidth = { xs: 310, sm: 360 }

const Profile = () => {
    const selectedNodeId = useAppStore((state) => state.selectedNodeId)
    return (
        <p>
            Selected Profile ID: {selectedNodeId}
        </p>
    )
}

const NodeDetailsDrawer = () => {
    return (
        <Drawer
            anchor='left'
            variant='permanent'
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
                // clip drawer under app bar
                zIndex: (theme) => theme.zIndex.appBar - 1
            }}
        >
            <Toolbar />
            <Box sx={{ overflow: 'auto' }}>
                <Profile />
            </Box>
        </Drawer>
    )
}

export default NodeDetailsDrawer