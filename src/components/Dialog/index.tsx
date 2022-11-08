import { useAppStore, useNodeStore } from '../../stores'
import HelpDialog from './Help'
import { AddHandleDialog } from './AddHandle'
import { SignInDialog } from './SignIn'
import { BetaDialog } from './Beta'

export const Dialogs = () => {
  const showHelp = useAppStore((state) => state.showHelp)
  const showBeta = useAppStore((state) => state.showBeta)
  const showSignIn = useAppStore((state) => state.showSignIn)
  const nodes = useNodeStore((state) => state.nodes)

  if (showHelp) return <HelpDialog />
  if (showBeta) return <BetaDialog />
  if (showSignIn) return <SignInDialog />
  if (Object.keys(nodes).length === 0) return <AddHandleDialog />
  return null
}