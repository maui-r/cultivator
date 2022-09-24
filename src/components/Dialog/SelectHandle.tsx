import { Backdrop, Box, Grid, Paper, TextField, Typography } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import { useRef } from 'react'

interface Props {
    queriedHandles: string[]
    fetchingHandle: boolean
    setFetchingHandle: Function
    addHandleToGraph: Function
}

const SelectHandle = ({ queriedHandles, fetchingHandle, setFetchingHandle, addHandleToGraph }: Props) => {
    const handleInputRef = useRef<HTMLInputElement>()

    return (
        <Backdrop
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={queriedHandles.length === 0}
        >
            <Box>
                <Paper elevation={1}>
                    <Grid container spacing={2} sx={{ p: 3 }}>
                        <Grid item xs={12}>
                            <Typography>Add a lens handle to start exploring</Typography>
                        </Grid>
                        <Grid item xs={12} sm={10}>
                            <TextField
                                onKeyDown={(evt: React.KeyboardEvent<HTMLDivElement>) => {
                                    if (evt.key === 'Enter') {
                                        evt.preventDefault()
                                        if (fetchingHandle) return
                                        addHandleToGraph(handleInputRef?.current?.value)
                                    }
                                }}
                                inputRef={handleInputRef}
                                name='handle'
                                required
                                fullWidth
                                id='handle'
                                label='Lens Handle'
                                defaultValue='lensprotocol'
                                autoFocus
                            />
                        </Grid>
                        <Grid item xs={12} sm={2} alignItems='center' sx={{ display: 'flex' }}>
                            <LoadingButton
                                loading={fetchingHandle}
                                onClick={() => addHandleToGraph(handleInputRef?.current?.value)}
                                variant='contained'>
                                Add
                            </LoadingButton>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
        </Backdrop>
    )
}

export default SelectHandle