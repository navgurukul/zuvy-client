import React from 'react'
import { Timer } from 'lucide-react'
import { TimerDisplayProps } from '@/app/[admin]/[organization]/courses/[courseId]/module/_components/ModuleComponentType'

const TimerDisplay: React.FC<TimerDisplayProps> = ({ remainingTime }) => {
    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) {
            return `00:00:00`
        }
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
            <Timer size={24} />
            <h1 className="text-right text-xl">{formatTime(remainingTime)}</h1>
        </div>
    )
}

export default TimerDisplay
