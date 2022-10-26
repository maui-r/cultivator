import { useAppStore } from '../../stores'
import HelpDialog from './Help'
import { SignInDialog } from './SignIn'

export const Dialogs = () => {
    const showHelp = useAppStore((state) => state.showHelp)
    const showSignIn = useAppStore((state) => state.showSignIn)

    if (showHelp) return <HelpDialog />
    if (showSignIn) return <SignInDialog />
    return null
}