import { useEffect, useState } from 'react'
import { cn, difficultyColor, statusColor } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import { api } from '@/utils/axios.config'
import {
    handleFullScreenChange,
    handleVisibilityChange,
    requestFullScreen,
} from '@/utils/students'
import QuestionDescriptionModal from '@/app/admin/courses/[courseId]/module/_components/Assessment/QuestionDescriptionModal'

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

interface questionDetails {
    id: any
    title: string
    description: string
    difficulty: string
    constraints?: string
    testCases?: string
    examples: { input: number[]; output: number }
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
    const [questionDetails, setQuestionDetails] = useState<questionDetails>({
        title: '',
        id: 0,
        description: '',
        examples: {
            input: [],
            output: 0,
        },
        difficulty: '',
    })

    const handleSolveChallenge = (id: any) => {
        onSolveChallenge(id)
        // requestFullScreen(document.documentElement)
    }

    const getQuestionDetails = async () => {
        try {
            await api
                .get(`codingPlatform/get-coding-question/${id}`)
                .then((response) => {
                    setQuestionDetails(response?.data.data)
                })
        } catch (error) {
            console.error('Error fetching courses:', error)
        }
    }

    useEffect(() => {
        getQuestionDetails()
    }, [])

    return (
        <div
            key={id}
            className={`container mx-auto rounded-xl shadow-[0px_1px_5px_2px_#4A4A4A14,0px_2px_1px_1px_#4A4A4A0A,0px_1px_2px_1px_#4A4A4A0F] overflow-hidden max-w-2xl min-h-52 mt-4 py-5`}
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1 min-w-0 font-bold text-gray-700 text-lg sm:text-xl my-2 truncate">
                    {title}
                </div>
                <div className="flex items-center gap-4">
                    <div
                        className={cn(
                            `font-semibold text-secondary my-2`,
                            difficultyColor(difficulty)
                        )}
                    >
                        {difficulty}
                    </div>
                    <h2 className="my-2 whitespace-nowrap text-gray-600 text-[15px]">Topic: {tagName}</h2>
                </div>
            </div>

            <div className="text-xl mt-2 text-start text-gray-600 truncate overflow-hidden whitespace-nowrap">
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
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            {/* <div className="flex justify-between"> */}
                <Dialog>
                    <DialogTrigger asChild>
                        <p className="cursor-pointer mt-4 flex justify-start text-[rgb(81,134,114)] text-[16px] font-bold">
                            View Full Description
                        </p>
                    </DialogTrigger>
                    <DialogOverlay />
                    <QuestionDescriptionModal
                        question={questionDetails}
                        type="coding"
                        tagName={tagName}
                    />
                </Dialog>
                <div
                    onClick={() => handleSolveChallenge(id)}
                    // className="cursor-pointer mt-4 flex justify-end text-secondary font-bold"
                    className="cursor-pointer mt-4 flex sm:justify-start text-[rgb(81,134,114)] text-[16px] font-bold"
                >
                    {isSuccess ? 'View Solution' : 'Solve Challenge'}
                    <ChevronRight />
                </div>
            </div>
        </div>
    )
}

export default CodingQuestionCard