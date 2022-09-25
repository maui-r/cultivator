import create from 'zustand'
import { persist } from 'zustand/middleware'
import { NodeStyle } from './types'

interface AppState {
    showSettings: boolean
    setShowSettings: (showSettingsModal: boolean) => void
}

interface AppPersistState {
    nodeStyle: NodeStyle
    setNodeStyle: (nodeStyle: NodeStyle) => void
}

export const useAppStore = create<AppState>((set) => ({
    showSettings: false,
    setShowSettings: (showSettings) => set(() => ({ showSettings }))
}))

export const useAppPersistStore = create(
    persist<AppPersistState>(
        (set) => ({
            nodeStyle: NodeStyle.Ball,
            setNodeStyle: (nodeStyle) => set(() => ({ nodeStyle }))
        }),
        { name: 'cultivator.store' }
    )
)