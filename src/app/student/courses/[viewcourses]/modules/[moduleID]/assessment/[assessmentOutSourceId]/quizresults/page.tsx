'use client'

import { api } from '@/utils/axios.config'
import React, { useEffect, useState } from 'react'
import { ChevronLeft, Check, X, Circle } from 'lucide-react' // Import Circle icon
import { useRouter } from 'next/navigation'
import { addClassToCodeTags } from '@/utils/admin'
import { cn, difficultyColor } from '@/lib/utils'
import useWindowSize from '@/hooks/useHeightWidth'
import { RemirrorForm } from '@/components/remirror-editor/RemirrorForm'

// Define the type for the quiz result

const QuizResults = ({
    params,
}: {
    params: { assessmentOutSourceId: string }
}) => {
    const [quizResults, setQuizResults] = useState<any>()
    const { width } = useWindowSize()
    const isMobile = width < 768
    const codeBlockClass =
        'text-gray-800 font-light bg-gray-300 p-4 rounded-lg text-left whitespace-pre-wrap w-full'

    const router = useRouter()

    async function getQuizResults() {
        try {
            const response = await api.get(
                `Content/assessmentDetailsOfQuiz/${params.assessmentOutSourceId}`
            )
            setQuizResults(response?.data?.data)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        getQuizResults()
    }, [params.assessmentOutSourceId])

    if (!quizResults?.mcqs.length) {
        return (
            <div>
                <div
                    onClick={() => router.back()}
                    className="cursor-pointer flex justify-start"
                >
                    <ChevronLeft width={24} />
                    Go Back
                </div>
                No Quiz Questions In This Assessment
            </div>
        )
    }

    return (
        <React.Fragment>
            <div className=" mx-auto">
                <div className="flex items-center justify-between gap-2 mb-6">
                    <div
                        onClick={() => router.back()}
                        className="flex items-center cursor-pointer"
                    >
                        <ChevronLeft strokeWidth={2} size={18} />
                        <h1 className="font-extrabold">Quiz Results</h1>
                    </div>
                </div>
                {quizResults?.mcqs.map((result: any, index: number) => (
                    <div
                        key={result.quizId}
                        className="md:p-6 lg:p-6 bg-white rounded-xl w-full max-w-2xl mx-auto"
                    >
                        {/* <div className="flex justify-end"> */}
                        <div className="flex justify-between">
                            <span className="font-semibold">
                                Question {index + 1}.
                            </span>
                            {/* <p
                                className="text-gray-800 mb-4 font-bold text-lg"
                                dangerouslySetInnerHTML={{
                                    __html: addClassToCodeTags(
                                        result.question,
                                        codeBlockClass
                                    ),
                                }}
                            /> */}
                            <div className="flex items-center justify-between gap-2">
                                <div
                                    className={cn(
                                        'font-semibold text-secondary my-2',
                                        difficultyColor(result.difficulty)
                                    )}
                                >
                                    {result.difficulty}
                                </div>
                                <h2 className="bg-[#DEDEDE] px-2 py-1 text-sm rounded-2xl font-semibold">
                                    {` ${
                                        result.submissionsData?.status ===
                                        'passed'
                                            ? Number(result.mark)
                                            : 0
                                    }/${Math.trunc(Number(result.mark))} Marks`}
                                </h2>
                            </div>
                        </div>
                        <div className="mb-4 text-left">
                            <RemirrorForm
                                description={result.question}
                                preview={true}
                                bigScreen={true}
                            />
                        </div>
                        <div className="space-y-4">
                            {Object.entries(result.options).map(
                                ([key, value]) => {
                                    const isCorrect =
                                        key === result.correctOption.toString()
                                    const isChosen =
                                        key ===
                                        result?.submissionsData?.chosenOption?.toString()

                                    // Only highlight the user's selected answer and replace the circle with correct/incorrect icons
                                    const bgColor = isChosen
                                        ? isCorrect
                                            ? 'bg-green-100'
                                            : 'bg-red-100'
                                        : ''
                                    const textColor = isCorrect
                                        ? 'text-green-400 font-bold'
                                        : isChosen
                                        ? 'text-red-400'
                                        : 'text-gray-700'
                                    const borderColor = isChosen
                                        ? 'border-black'
                                        : 'border-gray-300'

                                    // Icon to display based on whether the option is correct, incorrect, or unselected
                                    const icon = isChosen ? (
                                        isCorrect ? (
                                            <Check className="text-green-500" />
                                        ) : (
                                            <X className="text-red-500" />
                                        )
                                    ) : (
                                        <Circle className="text-gray-400" />
                                    )

                                    return (
                                        <div
                                            key={key}
                                            className={`p-2 mx-4 rounded border ${bgColor} ${borderColor} ${textColor} flex items-center justify-between`}
                                        >
                                            <div className="flex items-center text-left gap-2">
                                                {icon}
                                                <span>{value as any}</span>
                                            </div>
                                        </div>
                                    )
                                }
                            )}
                        </div>
                        <div className="mt-2 text-sm text-gray-600 font-semibold text-left ml-4">
                            {/* if chosen incorrect answer show correct */}
                            {/* {result.correctOption !==
                                result?.submissionsData?.chosenOption &&
                                `Correct Answer: ${
                                    Object.values(result.options)[
                                        result.correctOption - 1
                                    ]
                                }`} */}
                            {!result?.submissionsData && (
                                <div>Not Answered</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </React.Fragment>
    )
}

export default QuizResults
