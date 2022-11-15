import { Alert, Box } from '@mui/material'

const Error = () => {
  return (
    <Box sx={{ p: 1 }}>
      <Alert severity='error'>Oh no... Something went wrong</Alert>
    </Box>
  )
}

export default Error