import { Tooltip } from '@mui/material'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'

export const LinearBuffer = ({ progressValue, bufferOffset, maxValue }: { progressValue: number | undefined, bufferOffset: number | undefined, maxValue: number | undefined }) => {
  const netProgress = (progressValue ?? 0) - (bufferOffset ?? 0)
  const normalize = (value: number) => ((value * 100) / (maxValue ?? 100))

  return (
    <Box sx={{ width: '100%' }}>
      <Tooltip title={`added: ${netProgress}, without profile: ${bufferOffset ?? 0}`}>
        <LinearProgress variant='buffer' value={normalize(netProgress)} valueBuffer={normalize(progressValue ?? 0)} />
      </Tooltip>
    </Box>
  )
}