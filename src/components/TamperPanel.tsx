import { motion, AnimatePresence } from 'framer-motion'
import { useFlowStore } from '../store/useFlowStore'

export default function TamperPanel() {
  const { tamperMode, toggleTamper, tamperStepId, setTamperStep, activeFlow } = useFlowStore()

  const tamperableSteps = activeFlow.steps.filter(s => s.canTamper)

  return (
    <div className="flex flex-col gap-3">
      {/* Toggle */}
      <button
        onClick={toggleTamper}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300 ${
          tamperMode
            ? 'bg-red-500/10 border-red-500/30 text-red-400'
            : 'glass border-white/5 text-slate-400 hover:text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <motion.span
            animate={{ rotate: tamperMode ? [0, -15, 15, 0] : 0 }}
            transition={{ repeat: tamperMode ? Infinity : 0, duration: 1.5 }}
            className="text-lg"
          >
            ⚠️
          </motion.span>
          <div className="text-left">
            <div className="text-sm font-semibold">Tamper Mode</div>
            <div className="text-xs opacity-60">Simulate auth failures</div>
          </div>
        </div>
        {/* Toggle pill */}
        <div className={`w-10 h-5 rounded-full transition-colors duration-300 relative ${tamperMode ? 'bg-red-500' : 'bg-white/10'}`}>
          <motion.div
            className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
            animate={{ left: tamperMode ? '20px' : '2px' }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          />
        </div>
      </button>

      {/* Tamper step selector */}
      <AnimatePresence>
        {tamperMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="text-xs text-slate-500 mb-2 px-1">Choose where to inject failure:</p>
            <div className="flex flex-col gap-1.5">
              {tamperableSteps.map(step => {
                const isSelected = tamperStepId === step.id
                return (
                  <motion.button
                    key={step.id}
                    onClick={() => setTamperStep(isSelected ? null : step.id)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs transition-all duration-200 ${
                      isSelected
                        ? 'bg-red-500/15 border-red-500/40 text-red-300'
                        : 'glass border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isSelected ? 'bg-red-500/30 text-red-300' : 'bg-white/5 text-slate-500'
                      }`}>
                        {step.id}
                      </span>
                      <div>
                        <div className={`font-medium ${isSelected ? 'text-red-300' : ''}`}>
                          {step.tamperLabel}
                        </div>
                        <div className="text-slate-600 text-xs mt-0.5 line-clamp-1">
                          Step {step.id}: {step.label}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {tamperStepId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20"
              >
                <p className="text-xs text-amber-400/80">
                  💡 Press Play — the flow will run until the injected failure, then show the error state.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
