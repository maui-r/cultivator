import Drawer from '@mui/material/Drawer'
import { useAppStore } from '../../stores'
import { intToHex } from '../../helpers'
import { Box, Toolbar } from '@mui/material'
import Profile from './Profile'

const drawerWidth = { xs: 310, sm: 360 }

const NodeDetailsDrawer = ({ addHandleToGraph, queriedHandles }: { addHandleToGraph: Function, queriedHandles: string[] }) => {
  const selectedNodeId = useAppStore((state) => state.selectedNodeId)
  const nodeIdStr = intToHex(selectedNodeId)

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
        {
          nodeIdStr
            ?
            <Profile profileId={nodeIdStr} addHandleToGraph={addHandleToGraph} queriedHandles={queriedHandles} />
            :
            <p>Click a node to show info</p>
        }
      </Box>
    </Drawer>
  )
}

export default NodeDetailsDrawer