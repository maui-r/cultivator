import create from 'zustand'
import { persist } from 'zustand/middleware'
import { NodeStyle } from '../types'

interface AppState {
    showSettings: boolean
    setShowSettings: (showSettings: boolean) => void
    showHelp: boolean
    setShowHelp: (showHelp: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
    showSettings: false,
    setShowSettings: (showSettings) => set(() => ({ showSettings })),
    showHelp: false,
    setShowHelp: (showHelp) => set(() => ({ showHelp }))
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