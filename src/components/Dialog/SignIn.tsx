import { useEffect, useState } from 'react'
import { useSnackbar } from 'notistack'
import { useAccount, useConnect, useNetwork, useSignMessage, useSwitchNetwork } from 'wagmi'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import { useAppStore } from '../../stores'
import { graphql } from '../../lens/schema'
import { APP_CHAIN_ID, APP_CHAIN_NAME, JWT_ACCESS_TOKEN_KEY, JWT_EXPIRATION_TIME_KEY, JWT_REFRESH_TOKEN_KEY } from '../../constants'
import api from '../../lens/client'
import { getExpirationTime } from '../../lens/auth'
import { getProfilesOwnedByAddress } from '../../lens/profile'
import { sortProfiles } from '../../helpers'

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
  const currentAddress = useAppStore((state) => state.currentAddress)
  const setCurrentAddress = useAppStore((state) => state.setCurrentAddress)
  const setCurrentProfileId = useAppStore((state) => state.setCurrentProfileId)
  const setShowSignIn = useAppStore((state) => state.setShowSignIn)
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
        return
      }

      // Get challenge
      const challengeQueryResult = await api.client
        .query(ChallengeQuery, { address })
        .toPromise()
      const challenge = challengeQueryResult.data?.challenge.text

      if (!challenge) {
        console.log('Unable to retrieve challenge')
        return
      }

      // Sign challenge
      const signature = await signMessageAsync({ message: challenge })

      // Get JWT tokens
      const authMutationResult = await api.client
        .mutation(AuthenticateMutation, { address, signature })
        .toPromise()
      const accessToken = authMutationResult.data?.authenticate.accessToken
      const refreshToken = authMutationResult.data?.authenticate.refreshToken
      const expirationTime = getExpirationTime(accessToken)

      if (!accessToken || !refreshToken || !expirationTime) {
        return
      }

      // Update local storage
      localStorage.setItem(JWT_ACCESS_TOKEN_KEY, accessToken)
      localStorage.setItem(JWT_REFRESH_TOKEN_KEY, refreshToken)
      localStorage.setItem(JWT_EXPIRATION_TIME_KEY, expirationTime.toString())

      const profiles = await getProfilesOwnedByAddress(address)
      if (profiles.length > 0) {
        const currentProfile = sortProfiles(profiles)[0].id
        setCurrentProfileId(currentProfile)
      }
      setCurrentAddress(address)
      setShowSignIn(false)
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleClose = () => {
    setShowSignIn(false)
  }

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
            variant='outlined'
          >
            {connector.name}
          </LoadingButton>
        ))}
        <Button
          onClick={handleClose}
          color='error'
          variant='outlined'
        >
          Cancel
        </Button>
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
        <LoadingButton
          loading={isLoading}
          onClick={() => switchNetwork?.(APP_CHAIN_ID)}
          variant='outlined'
        >
          Switch Network
        </LoadingButton>
        <Button
          onClick={handleClose}
          color='error'
          variant='outlined'
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )

  // Sign in
  if (!currentAddress) return (
    <Dialog open={true} onClose={handleClose}>
      <DialogTitle>Sign In with Lens</DialogTitle>
      <DialogContent dividers>
        <DialogContentText>
          You will be asked to sign a message to verify your ownership of the wallet
        </DialogContentText>
        {error && <ErrorContentText />}
      </DialogContent>
      <DialogActions>
        <LoadingButton
          loading={isLoading}
          onClick={handleSignIn}
          variant='outlined'
        >
          Sign In
        </LoadingButton>
        <Button
          onClick={handleClose}
          color='error'
          variant='outlined'
        >Cancel</Button>
      </DialogActions>
    </Dialog>
  )

  return null
}