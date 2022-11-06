import produce from 'immer'
import create, { StateCreator } from 'zustand'
import { persist } from 'zustand/middleware'
import { CURRENT_PROFILE_ID_KEY, JWT_ADDRESS_KEY } from './constants'
import { signOut } from './lens/auth'
import { ColorMode, Node, NodeStyle, OptimisticTransaction } from './types'

interface AppState {
  selectedNodeId: string | null
  selectNode: (nodeId: string) => void
  showSettings: boolean
  setShowSettings: (showSettings: boolean) => void
  showHelp: boolean
  setShowHelp: (showHelp: boolean) => void
  showSignIn: boolean
  setShowSignIn: (showSignIn: boolean) => void
  currentAddress: string | null
  setCurrentAddress: (address: string) => void
  currentProfileId: string | null
  setCurrentProfileId: (currentProfileId: string | null) => void
  isQuerying: boolean
  setIsQuerying: (isQuerying: boolean) => void
}

const appStore: StateCreator<AppState, [], []> = (set) => ({
  selectedNodeId: null,
  selectNode: (selectedNodeId) => set(() => ({ selectedNodeId })),
  showSettings: false,
  setShowSettings: (showSettings) => set(() => ({ showSettings })),
  showHelp: false,
  setShowHelp: (showHelp) => set(() => ({ showHelp })),
  showSignIn: false,
  setShowSignIn: (showSignIn) => set(() => ({ showSignIn })),
  currentAddress: localStorage.getItem(JWT_ADDRESS_KEY),
  setCurrentAddress: (currentAddress) => set(() => {
    if (!currentAddress) {
      signOut()
    } else {
      localStorage.setItem(JWT_ADDRESS_KEY, currentAddress)
    }
    return { currentAddress }
  }),
  currentProfileId: localStorage.getItem(CURRENT_PROFILE_ID_KEY),
  setCurrentProfileId: (currentProfileId) => set(() => {
    if (!currentProfileId) {
      signOut()
    } else {
      localStorage.setItem(CURRENT_PROFILE_ID_KEY, currentProfileId)
    }
    return { currentProfileId }
  }),
  isQuerying: false,
  setIsQuerying: (isQuerying) => set(() => ({ isQuerying })),
})
//if (process.env.NODE_ENV === 'development') {
//  appStore = devtools(appStore)
//}
export const useAppStore = create<AppState>(appStore)

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

interface NodeState {
  nodes: { [key: Node['id']]: Node }
  addNodes: (newNodes: Node[], skipExisting?: boolean) => void
}

export const useNodeStore = create<NodeState>((set) => ({
  nodes: {},
  addNodes: (newNodes, skipExisting = false) => set(produce(draft => {
    newNodes.forEach((newNode: Node) => {
      const node = draft.nodes[newNode.id]
      if (skipExisting && node) return
      if (node) {
        // Merge existing node with new node
        draft.nodes[node.id] = { ...draft.nodes[node.id], ...newNode }
      } else {
        // Add new node
        draft.nodes[newNode.id] = newNode
      }
    })
  }))
}))

interface OptimisticCacheState {
  transactions: { [key: Node['id']]: OptimisticTransaction }
  addTransaction: (nodeId: string, transaction: OptimisticTransaction) => void
  removeTransaction: (nodeId: string) => void
  clearOptimisticCache: () => void
}

export const useOptimisticCache = create<OptimisticCacheState>((set) => ({
  transactions: {},
  addTransaction: (nodeId: string, transaction: OptimisticTransaction) => set(produce(draft => { draft.transactions[nodeId] = transaction })),
  removeTransaction: (nodeId) => set(produce(draft => { delete draft.transactions[nodeId] })),
  clearOptimisticCache: () => set({ transactions: {} }),
}))