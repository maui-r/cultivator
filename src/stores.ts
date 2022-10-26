import create from 'zustand'
import { persist } from 'zustand/middleware'
import { ColorMode, NodeStyle } from './types'
import { JWT_ACCESS_TOKEN_KEY } from './constants'

interface AppState {
    selectedNodeId: number | null
    selectNode: (nodeId: number) => void
    showSettings: boolean
    setShowSettings: (showSettings: boolean) => void
    showHelp: boolean
    setShowHelp: (showHelp: boolean) => void
    showSignIn: boolean
    setShowSignIn: (showSignIn: boolean) => void
    hasSignedIn: boolean
}

export const useAppStore = create<AppState>((set) => ({
    selectedNodeId: null,
    selectNode: (selectedNodeId) => set(() => ({ selectedNodeId })),
    showSettings: false,
    setShowSettings: (showSettings) => set(() => ({ showSettings })),
    showHelp: false,
    setShowHelp: (showHelp) => set(() => ({ showHelp })),
    showSignIn: false,
    setShowSignIn: (showSignIn) => set(() => ({ showSignIn })),
    hasSignedIn: localStorage.getItem(JWT_ACCESS_TOKEN_KEY) ? true : false,
}))

interface AppPersistState {
    nodeStyle: NodeStyle
    setNodeStyle: (nodeStyle: NodeStyle) => void
    colorMode: ColorMode
    setColorMode: (colorMode: ColorMode) => void
}

export const useAppPersistStore = create(
    persist<AppPersistState>(
        (set) => ({
            nodeStyle: NodeStyle.LensHandle,
            setNodeStyle: (nodeStyle) => set(() => ({ nodeStyle })),
            colorMode: ColorMode.System,
            setColorMode: (colorMode) => set(() => ({ colorMode })),
        }),
        { name: 'cultivator.store' }
    )
)