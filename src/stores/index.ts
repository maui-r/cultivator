import create from 'zustand'
import { persist } from 'zustand/middleware'
import { PopoverPosition } from '@mui/material'
import { NodeStyle } from '../types'

interface AppState {
    showSettings: boolean
    setShowSettings: (showSettings: boolean) => void
    showHelp: boolean
    setShowHelp: (showHelp: boolean) => void
    profileMenuPosition: PopoverPosition | null
    profileMenuHandle: string | null
    setProfileMenu: (profileMenuPosition: PopoverPosition | null, profileMenuHandle: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
    showSettings: false,
    setShowSettings: (showSettings) => set(() => ({ showSettings })),
    showHelp: false,
    setShowHelp: (showHelp) => set(() => ({ showHelp })),
    profileMenuPosition: null,
    profileMenuHandle: null,
    setProfileMenu: (profileMenuPosition, profileMenuHandle) => set(() => ({ profileMenuPosition, profileMenuHandle }))
}))

interface AppPersistState {
    nodeStyle: NodeStyle
    setNodeStyle: (nodeStyle: NodeStyle) => void
}

export const useAppPersistStore = create(
    persist<AppPersistState>(
        (set) => ({
            nodeStyle: NodeStyle.LensHandle,
            setNodeStyle: (nodeStyle) => set(() => ({ nodeStyle }))
        }),
        { name: 'cultivator.store' }
    )
)