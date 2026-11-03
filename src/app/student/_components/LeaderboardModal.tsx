'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Entry } from '@/components/appComponentFileType'

type LeaderboardModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  entries: Entry[]
  selfEntry?: Entry | null
  loading?: boolean
  error?: string | null
}

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

const podiumStyles = {
  1: {
    icon: "🥇",
    podium: 'bg-[#28652e] h-[61px]',
    trophy: '/leaderboard/Gold-Trophy.png',
  },
  2: {
    icon: "🥈",
    podium: 'bg-[#5e8965] h-[45px]',
    trophy: '/leaderboard/Silver-Trophy.png',
  },
  3: {
    icon: "🥉",
    podium: 'bg-[#8ba78e] h-[36px]',
    trophy: '/leaderboard/Bronze-Trophy.png',
  },
} as const

const PODIUM_INITIAL_DELAY = 1
const PODIUM_STAGGER = 0.26
const PODIUM_ITEM_DURATION = 0.8
const ROW_STAGGER = 0.09
const podiumSequence = [3, 2, 1]

const podiumContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      // container no longer delays children; per-item delays control sequence
    },
  },
}

const podiumItemVariants = {
  hidden: {
    opacity: 0,
    y: 45,
    scale: 0.92,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

const rowsContainerVariants = {
  hidden: {},
  visible: (delayChildren: number) => ({
    transition: {
      delayChildren,
      staggerChildren: ROW_STAGGER,
    },
  }),
}

const rowVariants = {
  hidden: {
    opacity: 0,
    y: 15,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

function AnimatedScore({
  value,
  duration = 0.9,
}: {
  value: number
  duration?: number
}) {
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    let animationFrame: number
    const startValue = displayValue
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)

      // Same ease-out feel as the original implementation
      const eased = 1 - Math.pow(1 - progress, 3)

      const currentValue = Math.round(
        startValue + (value - startValue) * eased,
      )

      setDisplayValue(currentValue)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrame)
    // We intentionally want to animate only when `value` changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])

  return (
    <span className="flex items-center">
      {displayValue.toLocaleString()} <span className="ml-0.5 text-[9px]">pts</span>
    </span>
  )
}

export default function LeaderboardModal({
  open,
  onOpenChange,
  entries,
  selfEntry = null,
  loading = false,
  error = null,
}: LeaderboardModalProps) {
  const allEntries = useMemo(() => {
    return selfEntry &&
      !entries.some((entry) => entry.rank === selfEntry.rank)
      ? [...entries, selfEntry]
      : entries
  }, [entries, selfEntry])

  const sortedEntries = useMemo(() => {
    return [...allEntries].sort((a, b) => a.rank - b.rank)
  }, [allEntries])

  /*
   * Keep the original visual order:
   *
   *     2       1       3
   *
   * So Silver → Gold → Bronze.
   */
  const podiumEntries = useMemo(() => {
    return [2, 1, 3]
      .map((rank) =>
        sortedEntries.find((entry) => entry.rank === rank),
      )
      .filter((entry): entry is Entry => Boolean(entry))
  }, [sortedEntries])

  const remainingEntries = useMemo(() => {
    return sortedEntries.filter((entry) => entry.rank > 3)
  }, [sortedEntries])

  const rowsAnimationDelay = useMemo(() => {
    return podiumEntries.reduce((latestCompletion, entry) => {
      const sequenceIndex = podiumSequence.indexOf(entry.rank)
      const completionTime =
        PODIUM_INITIAL_DELAY +
        sequenceIndex * PODIUM_STAGGER +
        PODIUM_ITEM_DURATION

      return Math.max(latestCompletion, completionTime)
    }, 0)
  }, [podiumEntries])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-[548px] gap-0 overflow-hidden rounded-xl border border-border bg-card p-0 shadow-2xl">
        <DialogHeader className="px-6 pb-2 pt-6">
          <DialogTitle className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
            <motion.div
              initial={{ rotate: -15, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Trophy
                className="h-5 w-5 text-amber-500"
                aria-hidden="true"
              />
            </motion.div>

            Leaderboard
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
            Loading leaderboard…
          </div>
        ) : error ? (
          <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
            Failed to load leaderboard.
          </div>
        ) : sortedEntries.length === 0 ? (
          <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
            No activity recorded yet.
          </div>
        ) : (
          <motion.div
            key={open ? 'open' : 'closed'}
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.3,
              ease: 'easeOut',
              delay: 0.5,
            }}
            className="max-h-[calc(100vh-7.5rem)] overflow-y-auto px-6 pb-6"
          >
            {podiumEntries.length > 0 && (
              <motion.div
                variants={podiumContainerVariants}
                initial="hidden"
                animate="visible"
                className="flex min-h-[198px] items-end justify-center gap-2 pt-5 mx-16"
              >
                {podiumEntries.map((entry) => {
                  const style = podiumStyles[entry.rank as 1 | 2 | 3]

                  // Sequence order for animation (3 -> 2 -> 1)
                  const seqIndex = podiumSequence.indexOf(entry.rank)
                  const itemDelay =
                    PODIUM_INITIAL_DELAY + seqIndex * PODIUM_STAGGER

                  return (
                    <motion.div
                      key={entry.rank}
                      layout
                      initial={{ opacity: 0, y: 45, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        delay: itemDelay,
                        duration: PODIUM_ITEM_DURATION,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="flex w-[calc((100%-1rem)/3)] flex-col items-center"
                    >
                      {/* Medal */}
                      <motion.div
                        className="mb-1 h-5"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            // medal pops a little after the item starts
                            delay: itemDelay + 0.04,
                            duration: 0.6,
                            type: 'spring',
                            stiffness: 220,
                            damping: 18,
                          }}
                      >
                        {style.icon}
                      </motion.div>

                      {/* Trophy Image */}
                      <motion.div
                        className="mb-2 flex h-12 w-12 items-center justify-center"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{
                          scale: 1.08,
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 15,
                        }}
                      >
                        <img 
                          src={style.trophy} 
                          alt={`Rank ${entry.rank}`}
                          className="w-full h-full object-contain drop-shadow-lg"
                        />
                      </motion.div>

                      {/* Name */}
                      <p className="max-w-full truncate text-xs font-semibold text-foreground">
                        {entry.isYou ? 'You' : entry.name}
                      </p>

                      {/* Score */}
                      <p className="mt-1 flex items-center text-[10px] text-muted-foreground">
                        <AnimatedScore value={entry.points} />
                      </p>

                      {/* Podium block */}
                      <motion.div
                        layout
                        className={`mt-2 flex w-full items-center justify-center rounded-t-md text-sm font-bold text-white ${style.podium}`}
                        whileHover={{
                          y: -2,
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 20,
                        }}
                      >
                        {entry.rank}
                      </motion.div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}

            {remainingEntries.length > 0 && (
              <motion.div
                variants={rowsContainerVariants}
                initial="hidden"
                animate="visible"
                custom={rowsAnimationDelay}
                className="space-y-1.5 border-t border-border pt-4"
              >
                <AnimatePresence mode="popLayout">
                  {remainingEntries.map((entry) => (
                    <motion.div
                      key={`${entry.rank}-${entry.name}`}
                      layout
                      variants={rowVariants}
                      exit={{
                        opacity: 0,
                        x: -20,
                        transition: {
                          duration: 0.2,
                        },
                      }}
                      transition={{
                        layout: {
                          duration: 0.5,
                          ease: [0.22, 1, 0.36, 1],
                        },
                      }}
                      className={`flex h-10 items-center rounded-lg px-3 py-2 text-xs ${
                        entry.isYou
                          ? 'border border-primary/20 bg-primary-light'
                          : 'bg-muted/50'
                      }`}
                    >
                      {/* Rank */}
                      <motion.span
                        layout
                        className="w-8 font-semibold text-muted-foreground text-sm"
                      >
                        #{entry.rank}
                      </motion.span>

                      {/* Name */}
                      <motion.span
                        layout
                        className={`min-w-0 flex-1 truncate font-medium text-sm ${
                          entry.isYou
                            ? 'text-primary'
                            : 'text-foreground'
                        }`}
                      >
                        {entry.isYou ? 'You' : entry.name}
                      </motion.span>

                      {/* Score with badge style */}
                      <motion.span
                        layout
                        className={`ml-3 flex items-center font-semibold rounded-full px-2.5 py-1 text-xs ${
                          entry.isYou
                            ? 'bg-primary/10 text-primary'
                            : 'bg-orange-50 text-orange-500'
                        }`}
                      >
                        <AnimatedScore value={entry.points} />
                      </motion.span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  )
}
