import { motion } from 'framer-motion'
import { useFlowStore } from '../store/useFlowStore'

export default function Controls() {
  const { currentStep, isPlaying, play, pause, reset, next, prev, activeFlow, speed, setSpeed } = useFlowStore()
  const total = activeFlow.steps.length
  const atEnd = currentStep >= total

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Prev */}
      <motion.button
        onClick={prev}
        disabled={currentStep === 0}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-9 h-9 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Previous step"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
        </svg>
      </motion.button>

      {/* Play / Pause */}
      <motion.button
        onClick={isPlaying ? pause : play}
        disabled={atEnd && !isPlaying}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-5 h-9 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-violet-500/20"
      >
        {isPlaying ? (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
            Pause
          </>
        ) : atEnd ? (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
            </svg>
            Replay
          </>
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            {currentStep === 0 ? 'Play' : 'Resume'}
          </>
        )}
      </motion.button>

      {/* Next */}
      <motion.button
        onClick={atEnd ? reset : next}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-9 h-9 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        title={atEnd ? 'Reset' : 'Next step'}
      >
        {atEnd ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/>
          </svg>
        )}
      </motion.button>

      {/* Reset */}
      {currentStep > 0 && !atEnd && (
        <motion.button
          onClick={reset}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-9 h-9 rounded-lg glass flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors"
          title="Reset"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
          </svg>
        </motion.button>
      )}

      {/* Speed control */}
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-xs text-slate-600">Speed</span>
        <div className="flex gap-1">
          {[2400, 1800, 1000].map((ms, i) => {
            const labels = ['0.5×', '1×', '2×']
            return (
              <button
                key={ms}
                onClick={() => setSpeed(ms)}
                className={`px-2 py-1 rounded text-xs font-mono transition-all ${
                  speed === ms
                    ? 'bg-violet-600/30 text-violet-300 ring-1 ring-violet-500/30'
                    : 'text-slate-600 hover:text-slate-400'
                }`}
              >
                {labels[i]}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
