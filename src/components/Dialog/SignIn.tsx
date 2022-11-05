import { useEffect, useState } from 'react'
import { useSnackbar } from 'notistack'
import { useAccount, useConnect, useNetwork, useSignMessage, useSwitchNetwork } from 'wagmi'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import { useAppStore } from '../../stores'
import { graphql } from '../../lens/schema'
import { APP_CHAIN_ID, APP_CHAIN_NAME } from '../../constants'
import client from '../../lens/client'
import { setAuthState, signOut } from '../../lens/auth'

const ChallengeQuery = graphql(`
  query Challenge($address: EthereumAddress!) {
    challenge(request: { address: $address }) {
      text
    }
  }
`)

const AuthenticateMutation = graphql(`
  mutation Authenticate($address: EthereumAddress!, $signature: Signature!) {
    authenticate(request: {
      address: $address,
      signature: $signature
    }) {
      accessToken
      refreshToken
    }
  }
`)

const ErrorContentText = () => {
  return (
    <DialogContentText color='error' sx={{ pt: 1 }}>
      There was an error! Please try again.
    </DialogContentText>
  )
}

export const SignInDialog = () => {
  const setShowSignIn = useAppStore((state) => state.setShowSignIn)
  const hasSignedIn = useAppStore((state) => state.hasSignedIn)
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false)
  const [signMessageError, setSignMessageError] = useState<Error | undefined>()

  const { enqueueSnackbar } = useSnackbar()
  const { chain } = useNetwork()
  const { address, isConnected, isConnecting } = useAccount()
  const { error: connectError, connect, connectors, isLoading: isLoadingConnect, pendingConnector } = useConnect()
  const { error: switchNetworkError, isLoading: isLoadingSwitchNetwork, switchNetwork } = useSwitchNetwork()
  const { isLoading: isLoadingSignMessage, signMessageAsync } = useSignMessage({ onError: setSignMessageError })

  const isLoading = isConnecting || isSigningIn || isLoadingConnect || isLoadingSwitchNetwork || isLoadingSignMessage
  const error = connectError || switchNetworkError || signMessageError

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true)

      if (!address) {
        await signOut()
        return
      }

      // Get challenge
      const challengeQueryResult = await client
        .query(ChallengeQuery, { address })
        .toPromise()
      const challenge = challengeQueryResult.data?.challenge.text

      if (!challenge) {
        console.log('Unable to retrieve challenge')
        setIsSigningIn(false)
        return
      }

      // Sign challenge
      const signature = await signMessageAsync({ message: challenge })

      // Get JWT tokens
      const authMutationResult = await client
        .mutation(AuthenticateMutation, { address, signature })
        .toPromise()
      const accessToken = authMutationResult.data?.authenticate.accessToken
      const refreshToken = authMutationResult.data?.authenticate.refreshToken

      if (!accessToken || !refreshToken) {
        await signOut()
        setIsSigningIn(false)
        return
      }

      await setAuthState({ address, accessToken, refreshToken })
      setShowSignIn(false)
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleClose = () => {
    setShowSignIn(false)
  }

  // Disable this dialog if already signed in
  useEffect(() => {
    if (!hasSignedIn) return
    if (chain?.id !== APP_CHAIN_ID) return
    if (!isConnected) return
    setShowSignIn(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSignedIn, chain, isConnected])

  useEffect(() => {
    if (!error) return
    enqueueSnackbar('Something went wrong...', { variant: 'error' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  // Connect wallet
  if (!isConnected || !address) return (
    <Dialog open={true} onClose={handleClose}>
      <DialogTitle>Sign In with Lens</DialogTitle>
      <DialogContent dividers>
        <DialogContentText>
          Choose one of the providers to connect your wallet
        </DialogContentText>
        {error && <ErrorContentText />}
      </DialogContent>
      <DialogActions>
        {connectors.map((connector: any) => (
          <LoadingButton
            loading={isLoading && pendingConnector?.id === connector.id}
            disabled={!connector.ready}
            key={connector.id}
            onClick={() => connect({ connector })}
          >
            {connector.name}
          </LoadingButton>
        ))}
        <Button color='error' onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog >
  )

  // Switch network
  if (chain?.id !== APP_CHAIN_ID) return (
    <Dialog open={true} onClose={handleClose}>
      <DialogTitle>Sign In with Lens</DialogTitle>
      <DialogContent dividers>
        <DialogContentText>
          Please switch to {APP_CHAIN_NAME}
        </DialogContentText>
        {error && <ErrorContentText />}
      </DialogContent>
      <DialogActions>
        <LoadingButton loading={isLoading} onClick={() => switchNetwork?.(APP_CHAIN_ID)}>Switch Network</LoadingButton>
        <Button color='error' onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  )

  // Sign in
  if (!hasSignedIn) return (
    <Dialog open={true} onClose={handleClose}>
      <DialogTitle>Sign In with Lens</DialogTitle>
      <DialogContent dividers>
        <DialogContentText>
          You will be asked to sign a message to verify your ownership of the wallet
        </DialogContentText>
        {error && <ErrorContentText />}
      </DialogContent>
      <DialogActions>
        <LoadingButton loading={isLoading} onClick={handleSignIn}>Sign In</LoadingButton>
        <Button color='error' onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  )

  return null
}