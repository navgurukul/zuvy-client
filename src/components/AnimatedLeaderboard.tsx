'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Crown, Medal, Star } from 'lucide-react';
import { LeaderboardProps } from '@/components/appComponentFileType';

const initials = (name: string) => {
  if (!name) return '';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

const SkeletonLoader = () => (
  <div className="space-y-2">
    {[...Array(5)].map((_, i) => (
      <motion.div 
        key={i} 
        className="flex items-center justify-between py-3 px-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1 }}
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="w-6 h-4 bg-muted rounded animate-pulse" />
          <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
          <div className="w-24 h-4 bg-muted rounded animate-pulse" />
        </div>
        <div className="w-12 h-4 bg-muted rounded animate-pulse" />
      </motion.div>
    ))}
  </div>
);

const PodiumCharacter = ({ rank, name, points }: { rank: number; name: string; points: number }) => {
  const getPodiumHeight = (rank: number) => {
    switch (rank) {
      case 1: return 'h-28'; // Tallest
      case 2: return 'h-20'; // Medium
      case 3: return 'h-16'; // Lowest
      default: return 'h-14';
    }
  };

  const getCharacterImage = (rank: number): string | undefined => {
    switch (rank) {
      case 1: return '/leaderboard/Gold-Trophy.png';
      case 2: return '/leaderboard/Silver-Trophy.png';
      case 3: return '/leaderboard/Bronze-Trophy.png';
      default: return undefined;
    }
  };

  const getMedalIcon = (rank: number): string => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center flex-1 min-w-0 max-w-[100px]"
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.8,
        delay: rank * 0.2,
        type: "spring",
        stiffness: 100,
        damping: 10
      }}
    >
      {/* Medal Icon - Above trophy */}
      <motion.div
        className="mb-1 text-base"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          delay: (rank * 0.2) + 0.3,
          duration: 0.6,
          type: 'spring',
          stiffness: 220,
          damping: 18,
        }}
      >
        {getMedalIcon(rank)}
      </motion.div>

      {/* Character Image with animation */}
      <motion.div
        className="relative mb-1 w-full flex justify-center"
        animate={{ 
          y: [0, -6, 0],
          rotate: [0, 2, -2, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
          delay: rank * 0.5
        }}
      >
        {/* Celebration particles for rank 1 */}
        {rank === 1 && (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: ['#FFD700', '#FFA500', '#FF6B35'][i % 3],
                  top: `${-8 + Math.random() * 16}px`,
                  left: `${-8 + Math.random() * 48}px`,
                }}
                animate={{
                  y: [-25, -50, -25],
                  opacity: [0, 1, 0],
                  scale: [0.3, 1, 0.3],
                  rotate: [0, 360, 720]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeInOut"
                }}
              />
            ))}
          </>
        )}

        {/* Sparkles for rank 2 */}
        {rank === 2 && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-silver rounded-full"
                style={{
                  backgroundColor: '#C0C0C0',
                  top: `${Math.random() * 32}px`,
                  left: `${Math.random() * 32}px`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.6
                }}
              />
            ))}
          </>
        )}

        {/* Character Image */}
        {getCharacterImage(rank) && (
          <motion.div
            className="relative w-14 h-16 flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img 
              src={getCharacterImage(rank)} 
              alt={`${rank} place character`}
              className="w-full h-full object-contain drop-shadow-lg"
            />
            {/* Glow effect for 1st place */}
            {rank === 1 && (
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: [
                    '0 0 0px rgba(255, 215, 0, 0)',
                    '0 0 25px rgba(255, 215, 0, 0.4)',
                    '0 0 0px rgba(255, 215, 0, 0)'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Name - Below image, small text with word wrap */}
      <motion.div
        className="mb-1 text-[10px] leading-tight font-semibold text-center w-full px-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: (rank * 0.2) + 1 }}
      >
        {name}
      </motion.div>

      {/* Points display - Below name */}
      <motion.div
        className="mb-1 text-[9px] text-muted-foreground font-bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: (rank * 0.2) + 1.2 }}
      >
        {points} pts
      </motion.div>

      {/* Podium Block - Green with varying heights */}
      <motion.div
        className={`w-full ${getPodiumHeight(rank)} rounded-t-lg flex flex-col items-center justify-center relative`}
        style={{ backgroundColor: '#2B5E2B' }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{
          duration: 0.6,
          delay: (rank * 0.2) + 0.5,
          ease: "easeOut"
        }}
      >
        {/* Rank number on podium */}
        <motion.div
          className="text-white font-bold text-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: (rank * 0.2) + 0.8 }}
        >
          {rank}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const TopThreePodium = ({ entries }: { entries: any[] }) => {
  const topThree = entries.slice(0, 3);
  
  // Arrange for podium display: 2nd, 1st, 3rd
  const podiumOrder = [
    topThree[1], // 2nd place (left)
    topThree[0], // 1st place (center)
    topThree[2]  // 3rd place (right)
  ].filter(Boolean);

  return (
    <motion.div
      className="flex items-end justify-center gap-2 mb-4 px-2 overflow-visible w-full"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {podiumOrder.map((entry, index) => {
        if (!entry) return null;
        return (
          <PodiumCharacter
            key={entry.rank}
            rank={entry.rank}
            name={entry.name}
            points={entry.points}
          />
        );
      })}
    </motion.div>
  );
};

export default function AnimatedLeaderboard({ 
  entries, 
  loading = false, 
  error = null, 
  selfEntry = null, 
  showSelfEntry = false,
  onViewLeaderboard,
}: LeaderboardProps) {
  // Mock data for testing if no entries
  const mockEntries = [
    { rank: 1, name: "Alex Johnson", points: 850, isYou: false },
    { rank: 2, name: "Sarah Wilson", points: 720, isYou: false },
    { rank: 3, name: "Mike Chen", points: 680, isYou: false },
    { rank: 4, name: "Emma Davis", points: 520, isYou: true },
    { rank: 5, name: "John Smith", points: 480, isYou: false }
  ];

  // Use mock data if no real data is available
  const displayEntries = entries.length > 0 ? entries : mockEntries;

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <motion.div
        className="flex items-center justify-center py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-sm text-muted-foreground">Failed to load leaderboard</p>
      </motion.div>
    );
  }

  const topThree = displayEntries.slice(0, 3);
  const remainingEntries = displayEntries.slice(3);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 rounded-xl p-3 overflow-hidden">
          <motion.div
            className="text-center mb-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-1">🏆 Top Performers</h3>
            {/* <p className="text-xs text-muted-foreground">Leading the pack this week</p> */}
          </motion.div>
          <TopThreePodium entries={topThree} />
        </div>
      )}

      {/* Remaining entries */}
      {remainingEntries.length > 0 && (
        <div className="space-y-1">
          <AnimatePresence>
            {remainingEntries.map((entry, idx) => (
              <motion.div
                key={`${entry.rank}-${entry.name}-${idx}`}
                className={`flex items-center justify-between py-1.5 px-2 rounded-lg transition-all duration-200 ${
                  entry.isYou 
                    ? 'bg-emerald-50 border border-emerald-200' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: (idx * 0.05) + 1.2,
                }}
                title={entry.name}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-[10px] font-semibold text-gray-500 w-5">
                    #{entry.rank}
                  </span>
                  
                  <span className="text-xs font-medium truncate flex-1">
                    {entry.name}
                    {entry.isYou && (
                      <span className="ml-1 text-[10px] text-emerald-600 font-semibold">(You)</span>
                    )}
                  </span>
                </div>

                <span className="text-xs font-bold text-orange-500 ml-2 whitespace-nowrap">
                  {entry.points} <span className="text-[10px] text-gray-400">pts</span>
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Self entry if not in top 5 */}
      {showSelfEntry && selfEntry && (
        <motion.div
          className="border-t border-border pt-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
        >
          <motion.p
            className="mb-2 text-xs text-muted-foreground text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2 }}
          >
            🚀 Keep climbing!
          </motion.p>

          <motion.div
            className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-blue-50 border border-blue-200"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.3 }}
            title={selfEntry.name}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-[10px] font-semibold text-gray-500 w-5">
                #{selfEntry.rank}
              </span>

              <span className="text-xs font-medium truncate flex-1">
                {selfEntry.name} <span className="text-blue-600 font-semibold text-[10px]">(You)</span>
              </span>
            </div>

            <span className="text-xs font-bold text-blue-600 ml-2 whitespace-nowrap">
              {selfEntry.points} <span className="text-[10px] text-gray-400">pts</span>
            </span>
          </motion.div>
        </motion.div>
      )}

      {/* View Full Leaderboard Link */}
      <motion.div
        className="mt-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
      >
        <button
          type="button"
          onClick={onViewLeaderboard}
          className="text-sm font-medium text-primary hover:text-primary/80 hover:underline transition-all duration-200"
        >
          View Full Leaderboard →
        </button>
      </motion.div>
    </motion.div>
  );
}