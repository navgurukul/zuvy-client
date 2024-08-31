import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn, difficultyColor } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import { api } from '@/utils/axios.config'

interface QuestionCardProps {
    id: number
    title: string
    description: string
    tagId?: number
    onSolveChallenge: (id: number) => void
}

export type Tag = {
    id: number
    tagName: string
}

const QuestionCard = ({
    id,
    title,
    description,
    tagId,
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
                <h2>Topic: {tag?.tagName}</h2>
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
