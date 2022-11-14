import { Alert, Box, Grid } from '@mui/material'
import shallow from 'zustand/shallow'
import { useAppStore, useNodeStore } from '../../stores'
import Profile from './Profile'

export const NodeDetails = () => {
  const selectedNodeId = useAppStore((state) => state.selectedNodeId)
  const hasNodes = useNodeStore((state) => Object.keys(state.nodes).length > 0, shallow)


  return <Grid item xs={6} sm={4} md={3} xl={2}>
    {selectedNodeId ?
      <Profile profileId={selectedNodeId} />
      :
      hasNodes ?
        <Box sx={{ p: 1 }} >
          <Alert severity='info'>Click on a node to show info</Alert>
        </Box>
        :
        null
    }
  </Grid >
}