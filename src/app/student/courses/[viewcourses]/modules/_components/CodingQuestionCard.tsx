import { cn, difficultyColor, statusColor } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
    handleFullScreenChange,
    handleVisibilityChange,
    requestFullScreen,
} from '@/utils/students'

interface QuestionCardProps {
    id: number
    title: string
    difficulty: string
    description: string
    status: string
    tagName: any
    tagId?: number
    isSuccess?: boolean
    onSolveChallenge: (id: number) => void
}

function CodingQuestionCard({
    id,
    title,
    difficulty,
    tagName,
    description,
    status,
    isSuccess,
    onSolveChallenge,
}: QuestionCardProps) {
    const handleSolveChallenge = (id: any) => {
        onSolveChallenge(id)
        // requestFullScreen(document.documentElement)
    }

    return (
        <div
            key={id}
            className={`container mx-auto rounded-xl shadow-[0px_1px_5px_2px_#4A4A4A14,0px_2px_1px_1px_#4A4A4A0A,0px_1px_2px_1px_#4A4A4A0F] overflow-hidden max-w-2xl min-h-52 mt-4 py-5`}
        >
            <div className="flex justify-between">
                <div className="font-bold text-xl my-2 truncate overflow-hidden whitespace-nowrap">
                    {title}
                </div>
                <div
                    className={cn(
                        `font-semibold text-secondary my-2`,
                        difficultyColor(difficulty)
                    )}
                >
                    {difficulty}
                </div>
                <h2 className="my-2">Topic: {tagName}</h2>
            </div>
            <div className="text-xl mt-2 text-start truncate overflow-hidden whitespace-nowrap">
                Description: {description}
            </div>
            <div className={`text-xl mt-2 text-start `}>
                Status:{' '}
                <span
                    className={cn(
                        `font-semibold text-secondary my-2`,
                        statusColor(status)
                    )}
                >
                    {status}
                </span>
            </div>
            <div
                onClick={() => handleSolveChallenge(id)}
                className="cursor-pointer mt-4 flex justify-end text-secondary font-bold"
            >
                {isSuccess ? 'View Solution' : 'Solve Challenge'}
                <ChevronRight />
            </div>
        </div>
    )
}

export default CodingQuestionCard
