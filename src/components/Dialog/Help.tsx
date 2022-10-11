import * as React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import { useAppStore } from '../../stores'

export default function HelpDialog() {
    const showHelp = useAppStore((state) => state.showHelp)
    const setShowHelp = useAppStore((state) => state.setShowHelp)

    const handleClose = () => {
        setShowHelp(false)
    }

    return (
        <Dialog open={showHelp} onClose={handleClose}>
            <DialogTitle>Controls</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <Typography gutterBottom>
                        Left-click on profile: expand connections
                    </Typography>
                    <Typography gutterBottom>
                        Right-click on profile: open menu
                    </Typography>
                    <Typography gutterBottom>
                        Scroll: zoom
                    </Typography>
                    <Typography gutterBottom>
                        Left-click and drag: rotate
                    </Typography>
                    <Typography gutterBottom>
                        Right-click and drag: pan
                    </Typography>

                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button color='success' onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    )
}