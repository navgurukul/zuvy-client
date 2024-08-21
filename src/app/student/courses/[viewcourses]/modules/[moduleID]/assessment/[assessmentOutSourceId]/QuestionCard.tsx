import { Button } from '@/components/ui/button'
import { cn, difficultyColor } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import React from 'react'

interface QuestionCardProps {
    id: number
    title: string
    description: string
    onSolveChallenge: (id: number) => void
}

const QuestionCard = ({
    id,
    title,
    description,
    onSolveChallenge,
}: QuestionCardProps) => {
    return (
        <div className="my-5 p-6 bg-white rounded-xl shadow-md">
            <div className="flex justify-between">
                <h2 className="capitalize">{title}</h2>
                <h2
                    className={cn(
                        `font-semibold text-secondary`,
                        difficultyColor(description)
                    )}
                >
                    {description}
                </h2>
            </div>
            <div></div>
            <div className="text-secondary justify-end flex items-center">
                <p
                    className="cursor-pointer"
                    onClick={() => onSolveChallenge(id)}
                >
                    Solve Challenge
                </p>
                <ChevronRight className="cursor-pointer" size={18} />
            </div>
        </div>
    )
}

export default QuestionCard
