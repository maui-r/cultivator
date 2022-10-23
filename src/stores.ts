import create from 'zustand'
import { persist } from 'zustand/middleware'
import { PopoverPosition } from '@mui/material'
import { ColorMode, NodeStyle } from './types'
import { JWT_ACCESS_TOKEN_KEY } from './constants'

interface AppState {
    showSettings: boolean
    setShowSettings: (showSettings: boolean) => void
    showHelp: boolean
    setShowHelp: (showHelp: boolean) => void
    showConnectWallet: boolean
    setShowConnectWallet: (showHelp: boolean) => void
    profileMenuPosition: PopoverPosition | null
    profileMenuHandle: string | null
    profileMenuId: string | null
    setProfileMenu: (profileMenuPosition: PopoverPosition | null, profileMenuHandle: string | null, profileMenuId: string | null) => void
    hasSignedIn: boolean
}

export const useAppStore = create<AppState>((set) => ({
    showSettings: false,
    setShowSettings: (showSettings) => set(() => ({ showSettings })),
    showHelp: false,
    setShowHelp: (showHelp) => set(() => ({ showHelp })),
    showConnectWallet: false,
    setShowConnectWallet: (showConnectWallet) => set(() => ({ showConnectWallet })),
    profileMenuPosition: null,
    profileMenuHandle: null,
    profileMenuId: null,
    setProfileMenu: (profileMenuPosition, profileMenuHandle, profileMenuId) => set(() => ({ profileMenuPosition, profileMenuHandle, profileMenuId })),
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