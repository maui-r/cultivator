import { useAppStore } from '../../stores'
import HelpDialog from './Help'
import { SignInDialog } from './SignIn'
import { BetaDialog } from './Beta'

export const Dialogs = () => {
  const showHelp = useAppStore((state) => state.showHelp)
  const showBeta = useAppStore((state) => state.showBeta)
  const showSignIn = useAppStore((state) => state.showSignIn)

  if (showHelp) return <HelpDialog />
  if (showBeta) return <BetaDialog />
  if (showSignIn) return <SignInDialog />
  return null
}