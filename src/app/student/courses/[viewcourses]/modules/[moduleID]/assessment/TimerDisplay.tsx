import React from 'react'
import { useTimerStore } from '@/store/store'
import { Timer } from 'lucide-react'

const TimerDisplay: React.FC = () => {
    const remainingTime = useTimerStore((state) => state.remainingTime)

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
            .toString()
            .padStart(2, '0')
        const m = Math.floor((seconds % 3600) / 60)
            .toString()
            .padStart(2, '0')
        const s = (seconds % 60).toString().padStart(2, '0')
        return `${h}:${m}:${s}`
    }

    return (
        <div className="flex items-center justify-end gap-2">
            <Timer size={18} />
            <h1 className="text-right">{formatTime(remainingTime)}</h1>
        </div>
    )
}

export default TimerDisplay
