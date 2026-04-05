import { create } from 'zustand'
import { flows, Flow } from '../data/flows'

type FlowStore = {
  // selected flow
  activeFlowId: string
  activeFlow: Flow
  setActiveFlow: (id: string) => void

  // playback
  currentStep: number       // 0 = not started, N = step N active
  isPlaying: boolean
  speed: number             // ms per step
  setStep: (n: number) => void
  play: () => void
  pause: () => void
  reset: () => void
  next: () => void
  prev: () => void
  setSpeed: (ms: number) => void

  // tamper mode
  tamperMode: boolean
  tamperStepId: number | null
  toggleTamper: () => void
  setTamperStep: (id: number | null) => void
}

export const useFlowStore = create<FlowStore>((set, get) => ({
  activeFlowId: 'oauth',
  activeFlow: flows[0],
  setActiveFlow: (id) => {
    const flow = flows.find(f => f.id === id) || flows[0]
    set({ activeFlowId: id, activeFlow: flow, currentStep: 0, isPlaying: false, tamperMode: false, tamperStepId: null })
  },

  currentStep: 0,
  isPlaying: false,
  speed: 1800,

  setStep: (n) => set({ currentStep: n }),

  play: () => {
    const { currentStep, activeFlow, speed, tamperMode, tamperStepId } = get()
    const total = activeFlow.steps.length

    // If tamper mode, stop at the tampered step
    const stopAt = tamperMode && tamperStepId !== null
      ? activeFlow.steps.findIndex(s => s.id === tamperStepId) + 1
      : total

    if (currentStep >= stopAt) {
      set({ isPlaying: false })
      return
    }

    set({ isPlaying: true })

    const advance = () => {
      const { currentStep: cs, isPlaying: ip, tamperMode: tm, tamperStepId: ts } = get()
      if (!ip) return

      const hardStop = tm && ts !== null
        ? get().activeFlow.steps.findIndex(s => s.id === ts) + 1
        : get().activeFlow.steps.length

      const next = cs + 1
      if (next > hardStop) {
        set({ isPlaying: false })
        return
      }
      set({ currentStep: next })
      if (next < hardStop) {
        setTimeout(advance, speed)
      } else {
        set({ isPlaying: false })
      }
    }

    setTimeout(advance, speed)
  },

  pause: () => set({ isPlaying: false }),

  reset: () => set({ currentStep: 0, isPlaying: false }),

  next: () => {
    const { currentStep, activeFlow } = get()
    const max = activeFlow.steps.length
    if (currentStep < max) set({ currentStep: currentStep + 1 })
  },

  prev: () => {
    const { currentStep } = get()
    if (currentStep > 0) set({ currentStep: currentStep - 1 })
  },

  setSpeed: (ms) => set({ speed: ms }),

  tamperMode: false,
  tamperStepId: null,

  toggleTamper: () => {
    const { tamperMode } = get()
    set({ tamperMode: !tamperMode, tamperStepId: null, currentStep: 0, isPlaying: false })
  },

  setTamperStep: (id) => set({ tamperStepId: id, currentStep: 0, isPlaying: false }),
}))
