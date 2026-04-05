import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFlowStore } from '../store/useFlowStore'
import { Actor, FlowStep } from '../data/flows'

// Width per actor column
const COL_W = 160
const ACTOR_H = 64
const STEP_H = 80
const PADDING = 32

function getActorX(actors: Actor[], id: string) {
  const idx = actors.findIndex(a => a.id === id)
  return PADDING + idx * COL_W + COL_W / 2
}

type ArrowProps = {
  x1: number
  x2: number
  y: number
  label: string
  color: string
  isReturn: boolean
  isError: boolean
  index: number
}

function Arrow({ x1, x2, y, label, color, isReturn, isError, index }: ArrowProps) {
  const right = x2 > x1
  const arrowColor = isError ? '#ef4444' : color

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 0.1, duration: 0.35 }}
    >
      {/* Line */}
      <motion.line
        x1={x1} y1={y} x2={x2} y2={y}
        stroke={arrowColor}
        strokeWidth={isError ? 2.5 : 2}
        strokeDasharray={isReturn ? '6 3' : 'none'}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
      {/* Arrowhead */}
      <motion.polygon
        points={
          right
            ? `${x2},${y} ${x2 - 10},${y - 5} ${x2 - 10},${y + 5}`
            : `${x2},${y} ${x2 + 10},${y - 5} ${x2 + 10},${y + 5}`
        }
        fill={arrowColor}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.2 }}
      />
      {/* Label */}
      <motion.text
        x={(x1 + x2) / 2}
        y={y - 8}
        textAnchor="middle"
        fill={isError ? '#ef4444' : '#cbd5e1'}
        fontSize="11"
        fontFamily="Inter, sans-serif"
        fontWeight="500"
        initial={{ opacity: 0, y: y - 14 }}
        animate={{ opacity: 1, y: y - 8 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {label.length > 32 ? label.slice(0, 30) + '…' : label}
      </motion.text>
    </motion.g>
  )
}

export default function SequenceDiagram() {
  const { activeFlow, currentStep, tamperMode, tamperStepId } = useFlowStore()
  const { actors, steps } = activeFlow

  const svgWidth = PADDING * 2 + actors.length * COL_W
  const svgHeight = ACTOR_H + steps.length * STEP_H + 40

  const visibleSteps = steps.slice(0, currentStep)

  // Find tamper step
  const tamperStep = tamperMode && tamperStepId !== null
    ? steps.find(s => s.id === tamperStepId)
    : null

  // Is current step the tamper step?
  const isTamperedActive = tamperMode && tamperStepId !== null &&
    currentStep > 0 && steps[currentStep - 1]?.id === tamperStepId

  return (
    <div className="w-full overflow-x-auto">
      <svg
        width={svgWidth}
        height={svgHeight}
        style={{ minWidth: svgWidth }}
        className="mx-auto"
      >
        {/* Actor columns */}
        {actors.map((actor, i) => {
          const x = PADDING + i * COL_W + COL_W / 2
          return (
            <g key={actor.id}>
              {/* Lifeline */}
              <line
                x1={x} y1={ACTOR_H}
                x2={x} y2={svgHeight - 20}
                stroke="rgba(255,255,255,0.07)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              {/* Actor box */}
              <foreignObject x={x - 56} y={4} width={112} height={52}>
                <div
                  style={{ borderColor: actor.color + '44', background: actor.color + '18' }}
                  className="w-full h-full rounded-xl border flex flex-col items-center justify-center gap-0.5"
                >
                  <span style={{ fontSize: 18 }}>{actor.icon}</span>
                  <span style={{ color: actor.color, fontSize: 10, fontWeight: 600, letterSpacing: '0.05em' }}>
                    {actor.label}
                  </span>
                </div>
              </foreignObject>
            </g>
          )
        })}

        {/* Steps / arrows */}
        <AnimatePresence>
          {visibleSteps.map((step, idx) => {
            const y = ACTOR_H + (idx + 1) * STEP_H - STEP_H / 2
            const x1 = getActorX(actors, step.from)
            const x2 = getActorX(actors, step.to)
            const isError = tamperMode && tamperStepId === step.id
            const fromActor = actors.find(a => a.id === step.from)
            const color = fromActor?.color || '#a78bfa'
            const label = isError && step.tamperLabel ? `❌ ${step.tamperLabel}` : step.label

            return (
              <Arrow
                key={`${step.id}-${activeFlow.id}`}
                x1={step.isReturn ? x2 : x1}
                x2={step.isReturn ? x1 : x2}
                y={y}
                label={label}
                color={color}
                isReturn={step.isReturn || false}
                isError={isError}
                index={idx}
              />
            )
          })}
        </AnimatePresence>

        {/* Active actor highlights */}
        {currentStep > 0 && (() => {
          const step = steps[currentStep - 1]
          if (!step) return null
          const fromX = getActorX(actors, step.from)
          const toX = getActorX(actors, step.to)
          const isError = tamperMode && tamperStepId === step.id

          return (
            <>
              <motion.circle cx={fromX} cy={ACTOR_H / 2 + 4} r={30}
                fill="none"
                stroke={isError ? '#ef4444' : '#7c3aed'}
                strokeWidth={1.5}
                strokeOpacity={0.5}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              />
              <motion.circle cx={toX} cy={ACTOR_H / 2 + 4} r={30}
                fill="none"
                stroke={isError ? '#ef4444' : '#06b6d4'}
                strokeWidth={1.5}
                strokeOpacity={0.5}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              />
            </>
          )
        })()}
      </svg>
    </div>
  )
}
