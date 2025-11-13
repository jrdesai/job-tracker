'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FireworksProps {
  trigger: boolean
  onComplete?: () => void
}

export function Fireworks({ trigger, onComplete }: FireworksProps) {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (trigger) {
      setIsActive(true)
      const timer = setTimeout(() => {
        setIsActive(false)
        onComplete?.()
      }, 3000) // Animation lasts 3 seconds
      return () => clearTimeout(timer)
    }
  }, [trigger, onComplete])

  const createParticle = (index: number, total: number) => {
    const angle = (Math.PI * 2 * index) / total
    const velocity = 200 + Math.random() * 100
    const x = Math.cos(angle) * velocity
    const y = Math.sin(angle) * velocity
    const delay = Math.random() * 0.3
    const size = 4 + Math.random() * 6
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#EC7063'
    ]
    const color = colors[Math.floor(Math.random() * colors.length)]

    return {
      x,
      y,
      delay,
      size,
      color,
      angle,
    }
  }

  const particles = Array.from({ length: 50 }, (_, i) => createParticle(i, 50))

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {/* Multiple burst points */}
          {[
            { x: '50%', y: '40%' },
            { x: '30%', y: '50%' },
            { x: '70%', y: '50%' },
          ].map((burst, burstIndex) => (
            <div
              key={burstIndex}
              className="absolute"
              style={{
                left: burst.x,
                top: burst.y,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {particles.map((particle, index) => (
                <motion.div
                  key={index}
                  className="absolute rounded-full"
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 1,
                    scale: 1,
                  }}
                  animate={{
                    x: particle.x,
                    y: particle.y,
                    opacity: [1, 1, 0],
                    scale: [1, 1.2, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: particle.delay,
                    ease: 'easeOut',
                  }}
                  style={{
                    width: particle.size,
                    height: particle.size,
                    backgroundColor: particle.color,
                    boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                  }}
                />
              ))}
            </div>
          ))}

          {/* Celebration Message */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-lg shadow-2xl border-4 border-yellow-400">
              <motion.h2
                className="text-4xl font-bold text-center mb-2"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                🎉 Congratulations! 🎉
              </motion.h2>
              <motion.p
                className="text-xl text-center"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                You got an Offer!
              </motion.p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}




