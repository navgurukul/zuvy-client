import { Button } from '@/components/ui/button'
import { cn, difficultyColor } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import React from 'react'

interface QuestionCardProps {
    id: number
    onSolveChallenge: (id: number) => void
}

const QuestionCard = ({
    id,
    onSolve,
}: {
    id?: number
    onSolve: () => void
}) => {
    return (
        <div className="my-5 p-6 bg-white rounded-xl shadow-md">
            <div className="flex justify-between">
                <h2>Run a String Pair</h2>
                <h2
                    className={cn(
                        `font-semibold text-secondary`,
                        difficultyColor('medium')
                    )}
                >
                    Medium
                </h2>
            </div>
            <div>
                <h2>Score: Not Attempted Yet</h2>
            </div>
            <div className="text-secondary cursor-pointer justify-end flex items-center">
                <Button onClick={onSolve}>Solve Challenge</Button>
                <ChevronRight size={18} />
            </div>
        </div>
    )
}

export default QuestionCard
