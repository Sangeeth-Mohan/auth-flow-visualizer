import { motion, AnimatePresence } from 'framer-motion'
import FlowSelector from './components/FlowSelector'
import SequenceDiagram from './components/SequenceDiagram'
import StepPanel from './components/StepPanel'
import TamperPanel from './components/TamperPanel'
import Controls from './components/Controls'
import { useFlowStore } from './store/useFlowStore'
import './index.css'

export default function App() {
  const { activeFlow, activeFlowId } = useFlowStore()

  return (
    <div className="min-h-screen bg-[#060612] flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-sm">
            🔐
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">Auth Flow Visualizer</h1>
            <p className="text-xs text-slate-500">Interactive auth protocol diagrams</p>
          </div>
        </div>
        <a
          href="https://sangeethkreativestudio.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-600 hover:text-violet-400 transition-colors font-mono"
        >
          by SKM ↗
        </a>
      </header>

      {/* Flow selector */}
      <div className="px-6 py-4 border-b border-white/5">
        <FlowSelector />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">

        {/* Left: Sequence Diagram */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFlowId}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.35 }}
            className="flex-1 overflow-auto px-4 py-6 lg:px-8"
          >
            {/* Flow title */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">{activeFlow.icon}</span>
                <h2 className="text-xl font-bold text-white">{activeFlow.title}</h2>
                <span className="text-xs text-slate-500 font-mono bg-white/5 px-2 py-0.5 rounded-full">
                  {activeFlow.subtitle}
                </span>
              </div>
              <p className="text-sm text-slate-500 ml-11">
                {activeFlow.steps.length} steps · {activeFlow.actors.length} actors
              </p>
            </div>

            <SequenceDiagram />
          </motion.div>
        </AnimatePresence>

        {/* Right: Controls + Step details + Tamper */}
        <div className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col">

          {/* Controls */}
          <div className="px-5 py-4 border-b border-white/5">
            <Controls />
          </div>

          {/* Step detail */}
          <div className="flex-1 px-5 py-4 overflow-y-auto">
            <StepPanel />
          </div>

          {/* Tamper panel */}
          <div className="px-5 py-4 border-t border-white/5">
            <TamperPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
