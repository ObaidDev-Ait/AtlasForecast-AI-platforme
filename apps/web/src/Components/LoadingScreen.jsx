import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import '../Styles/LoadingScreen.css'

/**
 * Premium fullscreen loading screen with radar grid, weather particles,
 * animated logo, and progress bar.
 *
 * @param {'startup' | 'route'} type  — startup is longer (~2.5s), route is fast (~0.8s)
 */

const STATUS_MESSAGES = [
  'Initializing weather systems…',
  'Loading forecast data…',
  'Connecting to satellite feed…',
  'Analyzing atmospheric data…',
  'Calibrating radar systems…',
]

/* ---- Radar SVG (static, rendered once) ---- */
function RadarGrid() {
  const circles = [40, 80, 120, 160, 200]
  return (
    <div className="af-loading-radar">
      <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        {/* Concentric circles */}
        {circles.map((r) => (
          <circle key={r} cx="200" cy="200" r={r} className="af-radar-circle" />
        ))}
        {/* Crosshair lines */}
        <line x1="200" y1="0" x2="200" y2="400" className="af-radar-line" />
        <line x1="0" y1="200" x2="400" y2="200" className="af-radar-line" />
        <line x1="59" y1="59" x2="341" y2="341" className="af-radar-line" />
        <line x1="341" y1="59" x2="59" y2="341" className="af-radar-line" />
      </svg>
      <div className="af-radar-sweep" />
    </div>
  )
}

/* ---- Floating weather particles ---- */
function Particles() {
  return (
    <div className="af-loading-particles">
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="af-loading-particle" />
      ))}
    </div>
  )
}

/* ---- Corner accent brackets ---- */
function Corners() {
  return (
    <>
      <div className="af-loading-corner af-loading-corner--tl" />
      <div className="af-loading-corner af-loading-corner--tr" />
      <div className="af-loading-corner af-loading-corner--bl" />
      <div className="af-loading-corner af-loading-corner--br" />
    </>
  )
}

/* ===== MAIN COMPONENT ===== */
export default function LoadingScreen({ type = 'startup' }) {
  const isStartup = type === 'startup'
  const totalDuration = isStartup ? 2500 : 800

  /* Animated progress */
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const steps = isStartup ? 40 : 15
    const interval = totalDuration / steps
    let current = 0
    const timer = setInterval(() => {
      current += 1
      // Ease-out curve: fast start, slow finish
      const pct = Math.min(100, Math.round((1 - Math.pow(1 - current / steps, 3)) * 100))
      setProgress(pct)
      if (current >= steps) clearInterval(timer)
    }, interval)
    return () => clearInterval(timer)
  }, [isStartup, totalDuration])

  /* Pick a random status message (stable per mount) */
  const statusText = useMemo(
    () => STATUS_MESSAGES[Math.floor(Math.random() * STATUS_MESSAGES.length)],
    []
  )

  /* Framer Motion variants */
  const overlayVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: {
      opacity: 0,
      scale: 1.02,
      filter: 'blur(6px)',
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    },
  }

  const brandVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 },
    },
  }

  const barVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut', delay: isStartup ? 0.4 : 0.15 },
    },
  }

  const statusVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.4, delay: isStartup ? 0.6 : 0.2 },
    },
  }

  /* Logo float animation */
  const floatAnimation = {
    y: [0, -6, 0],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      repeatType: 'loop',
      ease: 'easeInOut',
    },
  }

  return (
    <motion.div
      className="af-loading-screen"
      variants={overlayVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      key={`loading-${type}`}
    >
      {/* Background layers */}
      <RadarGrid />
      <Particles />
      <Corners />

      {/* Foreground content */}
      <div className="af-loading-content">
        {/* Logo + brand */}
        <motion.div
          className="af-loading-brand"
          variants={brandVariants}
          initial="initial"
          animate="animate"
        >
          <motion.div className="af-loading-icon" animate={floatAnimation}>
            <img src="/images/atlasforecast-logo.png" alt="AtlasForecast" className="af-loading-logo-img" />
          </motion.div>
          <motion.span className="af-loading-title" animate={floatAnimation}>
            AtlasForecast
          </motion.span>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          className="af-loading-bar-container"
          variants={barVariants}
          initial="initial"
          animate="animate"
        >
          <div className="af-loading-bar-fill" style={{ width: `${progress}%` }} />
        </motion.div>

        {/* Status text */}
        <motion.p
          className="af-loading-status"
          variants={statusVariants}
          initial="initial"
          animate="animate"
        >
          {statusText}
        </motion.p>
      </div>
    </motion.div>
  )
}
