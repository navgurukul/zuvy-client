import React from 'react'
import {LeaderboardProps} from '@/components/appComponentFileType'


const initials = (name: string) => {
  if (!name) return ''
  return name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()
}

const SkeletonLoader = () => (
  <div className="space-y-2">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center justify-between py-3 px-1">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-6 h-4 bg-muted rounded animate-pulse" />
          <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
          <div className="w-24 h-4 bg-muted rounded animate-pulse" />
        </div>
        <div className="w-12 h-4 bg-muted rounded animate-pulse" />
      </div>
    ))}
  </div>
)

export default function Leaderboard({ entries, loading = false, error = null, selfEntry = null, showSelfEntry = false, }: LeaderboardProps) {
  if (loading) {
    return <SkeletonLoader />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">Failed to load leaderboard</p>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {entries.map((e, idx) => (
          <div
            key={`${e.rank}-${e.name}-${idx}`}
            className={`flex items-center justify-between py-3 px-1 rounded-lg transition-all duration-150 ${e.isYou ? 'bg-emerald-50 border border-emerald-100' : ''}`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="text-sm font-semibold text-muted-foreground w-6 text-left">#{e.rank}</div>
              <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center text-white font-semibold">{initials(e.name)}</div>
              <div className="min-w-0 flex-1 text-sm font-medium truncate" title={`${e.name}${e.isYou ? ' (You)' : ''}`}>
                {e.name}{e.isYou ? ' (You)' : ''}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <div className="text-orange-500 font-semibold">{e.points}</div>
              <div className="text-xs text-muted-foreground">pt</div>
            </div>
          </div>
        ))}
      </div>

      {showSelfEntry && selfEntry && (
      <div className="border-t border-border pt-2">
        <p className="mb-3 text-xs text-muted-foreground">
          Every Day Counts!
        </p>

        <div className="flex items-center justify-between py-2 px-1">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="text-sm font-semibold text-muted-foreground w-6 text-left">
              #{selfEntry.rank}
            </div>

            <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center text-white font-semibold shrink-0">
              {initials(selfEntry.name)}
            </div>

            <div
              className="min-w-0 flex-1 text-sm font-medium truncate"
              title={`${selfEntry.name} (You)`}
            >
              {selfEntry.name} (You)
            </div>
          </div>

          <div className="flex items-center gap-1">
            <div className="text-orange-500 font-semibold">
              {selfEntry.points}
            </div>
            <div className="text-xs text-muted-foreground">pt</div>
          </div>
        </div>
      </div>
    )}
    </div>
  )
}
