import { motion, AnimatePresence } from 'framer-motion'
import { useFlowStore } from '../store/useFlowStore'

export default function StepPanel() {
  const { activeFlow, currentStep, tamperMode, tamperStepId } = useFlowStore()
  const { steps } = activeFlow

  const step = currentStep > 0 ? steps[currentStep - 1] : null
  const isError = step && tamperMode && tamperStepId === step.id
  const total = steps.length

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>Progress</span>
          <span>{currentStep} / {total}</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: isError ? '#ef4444' : 'linear-gradient(90deg, #7c3aed, #06b6d4)' }}
            animate={{ width: `${(currentStep / total) * 100}%` }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          />
        </div>

        {/* Step dots */}
        <div className="flex gap-1 mt-2 flex-wrap">
          {steps.map((s, i) => {
            const isTamperStep = tamperMode && tamperStepId === s.id
            const isActive = i + 1 === currentStep
            const isDone = i + 1 < currentStep
            return (
              <motion.div
                key={s.id}
                className="w-2 h-2 rounded-full transition-all duration-200"
                style={{
                  background: isTamperStep && isDone
                    ? '#ef4444'
                    : isActive
                    ? '#7c3aed'
                    : isDone
                    ? '#4ade80'
                    : 'rgba(255,255,255,0.1)',
                }}
                animate={{ scale: isActive ? 1.4 : 1 }}
              />
            )
          })}
        </div>
      </div>

      {/* Current step detail */}
      <AnimatePresence mode="wait">
        {step ? (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-3 flex-1"
          >
            {/* Step number + label */}
            <div className="flex items-start gap-3">
              <div
                className="min-w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  background: isError ? 'rgba(239,68,68,0.2)' : 'rgba(124,58,237,0.2)',
                  color: isError ? '#ef4444' : '#a78bfa',
                }}
              >
                {isError ? '✕' : step.id}
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm leading-tight">
                  {isError && step.tamperLabel ? step.tamperLabel : step.label}
                </h3>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  {isError && step.tamperDetail ? step.tamperDetail : step.detail}
                </p>
              </div>
            </div>

            {/* Code snippet */}
            {step.code && !isError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-black/40 rounded-lg p-3 border border-white/5"
              >
                <pre className="text-xs text-cyan-300 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
                  {step.code}
                </pre>
              </motion.div>
            )}

            {/* Error state code */}
            {isError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/5 rounded-lg p-3 border border-red-500/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-400 text-xs font-semibold uppercase tracking-wider">Tamper Detected</span>
                </div>
                <pre className="text-xs text-red-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {`error: "${step.tamperLabel?.toLowerCase().replace(/ /g, '_')}"\nHTTP 401 Unauthorized`}
                </pre>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center gap-3 text-slate-600"
          >
            <div className="text-4xl">▶</div>
            <p className="text-sm">Press Play or Step → to begin</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
