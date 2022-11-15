import { Box, CircularProgress } from '@mui/material'

const Loading = () => {
  return (
    <Box display='flex' justifyContent='center' sx={{ p: 1 }}>
      <CircularProgress />
    </Box>
  )
}

export default Loading