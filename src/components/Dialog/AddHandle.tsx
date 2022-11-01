import { Backdrop, Box, Grid, Paper, TextField, Typography } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import { useRef } from 'react'
import { useSnackbar } from 'notistack'
import { useAppStore, useNodeStore } from '../../stores'
import { getProfileNode } from '../../lens/profile'
import { TooManyFollowingException } from '../../errors'

export const AddHandleDialog = () => {
    const addNodes = useNodeStore((state) => state.addNodes)
    const selectNode = useAppStore((state) => state.selectNode)
    const isQuerying = useAppStore((state) => state.isQuerying)
    const setIsQuerying = useAppStore((state) => state.setIsQuerying)
    const handleInputRef = useRef<HTMLInputElement>()
    const { enqueueSnackbar } = useSnackbar()

    const handleAdd = async () => {
        if (isQuerying) return
        try {
            setIsQuerying(true)
            const handle = handleInputRef?.current?.value
            if (!handle) {
                enqueueSnackbar('Please enter a non-empty handle', { variant: 'error' })
                return
            }
            try {
                const { profile } = await getProfileNode(handle)
                addNodes([profile])
                selectNode(profile.id)
                return
            } catch (error) {
                if (error instanceof TooManyFollowingException) {
                    enqueueSnackbar(`${handle} is following too many profiles`, { variant: 'error' })
                    return
                }

                if (!handle.endsWith('.lens')) {
                    // try again with '.lens' appended
                    try {
                        const handleWithLens = handle.concat('.lens')
                        const { profile } = await getProfileNode(handleWithLens)
                        addNodes([profile])
                        selectNode(profile.id)
                        return
                    } catch (error) {
                        if (error instanceof TooManyFollowingException) {
                            enqueueSnackbar(`${handle} is following too many profiles`, { variant: 'error' })
                            return
                        }
                    }
                }
                enqueueSnackbar(`Handle not found: ${handle}`, { variant: 'error' })
            }
        } finally {
            setIsQuerying(false)
        }
    }

    const handleKeyPress = (evt: React.KeyboardEvent<HTMLDivElement>) => {
        if (evt.key === 'Enter') {
            evt.preventDefault()
            handleAdd()
        }
    }

    return (
        <Backdrop
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={true}
        >
            <Box>
                <Paper elevation={1}>
                    <Grid container spacing={2} sx={{ p: 3 }}>
                        <Grid item xs={12}>
                            <Typography>Add a lens handle to start exploring</Typography>
                        </Grid>
                        <Grid item xs={12} sm={10}>
                            <TextField
                                onKeyDown={handleKeyPress}
                                inputRef={handleInputRef}
                                name='handle'
                                required
                                fullWidth
                                id='handle'
                                label='Lens Handle'
                                defaultValue='cultivator'
                                autoFocus
                                color='success'
                                disabled={isQuerying}
                            />
                        </Grid>
                        <Grid item xs={12} sm={2} alignItems='center' sx={{ display: 'flex' }}>
                            <LoadingButton
                                loading={isQuerying}
                                onClick={handleAdd}
                                variant='contained'
                                color='success'
                            >
                                Add
                            </LoadingButton>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
        </Backdrop>
    )
}