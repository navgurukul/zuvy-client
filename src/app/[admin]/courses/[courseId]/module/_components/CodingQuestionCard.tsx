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
import QuestionDescriptionModal from '@/app/[admin]/courses/[courseId]/module/_components/Assessment/QuestionDescriptionModal'
import {
    QuestionCardProps,
    questionDetails,
} from '@/app/[admin]/courses/[courseId]/module/_components/ModuleComponentType'

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

    const handleSolveChallenge = (id: number) => {
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
            className={`container mx-auto rounded-xl shadow-[0px_1px_5px_2px_#4A4A4A14,0px_2px_1px_1px_#4A4A4A0A,0px_1px_2px_1px_#4A4A4A0F] overflow-hidden max-w-2xl min-h-52 mt-4 py-5 px-6`}
        >
             {/* Title and Topic - Title left, Topic right */}
            <div className="flex justify-between items-center mb-3">
                <div className="font-bold text-gray-700 text-left text-xl">
                    {title}
                </div>
                <div className="text-gray-600 text-base whitespace-nowrap ml-4">
                    Topic: {tagName}
                </div>
            </div>

            {/* Difficulty - Left aligned with label */}
            <div className="mb-3 text-left">
                <span className="text-gray-600 text-base">Difficulty - </span>
                <span
                    className={cn(
                        `font-semibold text-base`,
                        difficultyColor(difficulty)
                    )}
                >
                    {difficulty}
                </span>
            </div>

            {/* Description - Left aligned */}
            <div className="text-base text-left text-gray-600 mb-3">
                {description}
            </div>

            {/* Status - Left aligned */}
            <div className="text-base text-left text-gray-700 mb-4">
                Status:{' '}
                <span
                    className={cn(
                        `font-semibold`,
                        statusColor(status)
                    )}
                >
                    {status}
                </span>
            </div>

            {/* Bottom section with View Full Description and Solve Challenge */}
            <div className="flex justify-between items-center mt-4">
                <Dialog>
                    <DialogTrigger asChild>
                        <p className="cursor-pointer text-[rgb(81,134,114)] text-base font-semibold hover:underline">
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
                    className="cursor-pointer flex items-center text-[rgb(81,134,114)] text-base font-semibold hover:underline"
                >
                    {isSuccess ? 'View Solution' : 'Solve Challenge'}
                    <ChevronRight className="w-5 h-5" />
                </div>
            </div>
        </div>
    )
}

export default CodingQuestionCard
