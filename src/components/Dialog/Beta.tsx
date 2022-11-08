import { Link } from '@mui/material'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import { useAppStore } from '../../stores'

export const BetaDialog = () => {
  const showBeta = useAppStore((state) => state.showBeta)
  const setShowBeta = useAppStore((state) => state.setShowBeta)

  const handleClose = () => {
    setShowBeta(false)
  }

  return (
    <Dialog open={showBeta} onClose={handleClose}>
      <DialogTitle>You're early 🌱</DialogTitle>
      <DialogContent dividers>
        <Typography>
          Cultivator is still in beta. Things may break or behave in unexpected ways.
          If you find bugs don't keep them all for yourself!
          Help us improve by creating
          a <Link href='https://cultivator.canny.io/bug-reports' target='_blank' rel='noopener'>Bug Report</Link> or
          telling us about
          the <Link href='https://cultivator.canny.io/feature-requests' target='_blank' rel='noopener'>Feature</Link> you'd
          like to see the most.
        </Typography>
        <Typography>
        </Typography>

      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant='outlined'>I understand</Button>
      </DialogActions>
    </Dialog>
  )
}