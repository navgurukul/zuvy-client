import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn, difficultyColor } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import { api } from '@/utils/axios.config'

interface QuestionCardProps {
    id: number
    title: string
    weightage?: number
    easyCodingMark?: number
    mediumCodingMark?: number
    hardCodingMark?: number
    description: string
    tagId?: number
    codingQuestions?: boolean
    onSolveChallenge: (id: number) => void
}

export type Tag = {
    id: number
    tagName: string
}

const QuestionCard = ({
    id,
    title,
    weightage,
    easyCodingMark,
    mediumCodingMark,
    hardCodingMark,
    description,
    tagId,
    codingQuestions,
    onSolveChallenge,
}: QuestionCardProps) => {
    const [tag, setTag] = useState<Tag>()

    async function getAllTags() {
        const response = await api.get('Content/allTags')
        if (response) {
            const tag = response?.data?.allTags?.find(
                (item: any) => item.id == tagId
            )
            setTag(tag)
        }
    }

    useEffect(() => {
        getAllTags()
    }, [])

    function codingQuestionMarks(difficulty: string) {
        if (difficulty === 'Easy') {
            return easyCodingMark
        } else if (difficulty === 'Medium') {
            return mediumCodingMark
        } else if (difficulty === 'Hard') {
            return hardCodingMark
        }
    }

    return (
        <div className="my-5 p-6 bg-white rounded-xl shadow-[0px_1px_5px_2px_#4A4A4A14,0px_2px_1px_1px_#4A4A4A0A,0px_1px_2px_1px_#4A4A4A0F]">
            <div className="flex justify-between">
                <h2 className="capitalize">{title}</h2>
                <div>
                    {title !== 'Open-Ended Questions' && (
                        <h2 className="bg-[#DEDEDE] px-2 py-1 mb-2 text-sm rounded-2xl font-semibold">
                            {`${
                                codingQuestions
                                    ? Math.trunc(
                                          Number(
                                              codingQuestionMarks(description)
                                          )
                                      )
                                    : weightage
                            } Marks`}
                        </h2>
                    )}
                    <h2
                        className={cn(
                            `font-semibold text-secondary mb-1`,
                            difficultyColor(description)
                        )}
                    >
                        {description}
                    </h2>
                </div>
                {tag && <h2>Topic: {tag?.tagName}</h2>}
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
