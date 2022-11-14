import { Alert, Box, Grid } from '@mui/material'
import { useAppStore } from '../../stores'
import Profile from './Profile'

export const NodeDetails = () => {
  const selectedNodeId = useAppStore((state) => state.selectedNodeId)

  return <Grid item xs={6} sm={4} md={3} xl={2}>
    {
      selectedNodeId
        ?
        <Profile profileId={selectedNodeId} />
        :
        <Box sx={{ p: 1 }}>
          <Alert severity='info'>Click on a node to show info</Alert>
        </Box>
    }
  </Grid>
}