'use client'
import { motion } from 'framer-motion'
import { useFlowStore } from '../store/useFlowStore'
import { flows } from '../data/flows'

export default function FlowSelector() {
  const { activeFlowId, setActiveFlow } = useFlowStore()

  return (
    <div className="flex gap-2 flex-wrap">
      {flows.map(flow => {
        const isActive = activeFlowId === flow.id
        return (
          <motion.button
            key={flow.id}
            onClick={() => setActiveFlow(flow.id)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`relative px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${
              isActive
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                : 'glass text-slate-400 hover:text-white'
            }`}
          >
            <span>{flow.icon}</span>
            <span>{flow.title}</span>
            {isActive && (
              <motion.span
                layoutId="flow-badge"
                className="absolute inset-0 rounded-lg ring-1 ring-violet-400/40"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
