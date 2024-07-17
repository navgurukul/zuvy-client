'use client'
import React, { useState, useEffect, useCallback } from 'react'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getProctoringDataStore } from '@/store/store'
import { paramsType } from '../ViewSolutionOpenEnded/page'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'

type SubmissionData = {
    id: number
    userId: number
    chosenOption: number
    questionId: number
    attemptCount: number
}

type QuizOptions = {
    [key: string]: string
}

type Quiz = {
    id: number
    question: string
    options: QuizOptions
    difficulty: string
    correctOption: number
    marks: number | null
}

type QuizDetails = {
    id: number
    quiz_id: number
    assessmentOutsourseId: number
    bootcampId: number
    chapterId: number
    createdAt: string
    submissionsData: SubmissionData[]
    Quiz: Quiz
}
const Page = ({ params }: { params: paramsType }) => {
    const { proctoringData, fetchProctoringData } = getProctoringDataStore()
    const [quizQuestionDetails, setQuizQuiestionDetails] = useState<
        QuizDetails[]
    >([])
    const [loading, setLoading] = useState<boolean>(true)
    console.log(params)
    const fetchQuizQuestionDetails = useCallback(async () => {
        try {
            await api
                .get(
                    `/Content/assessmentDetailsOfQuiz/${params.StudentAssesmentData}?studentId=${params.IndividualReport}`
                )
                .then((res) => {
                    setQuizQuiestionDetails(res.data)
                })
        } catch (error: any) {
            toast({
                title: 'Error',
                description: 'Failed To fetch',
            })
        } finally {
            setLoading(false)
        }
    }, [params.IndividualReport, params.StudentAssesmentData])

    useEffect(() => {
        fetchProctoringData(params.report, params.IndividualReport)
        fetchQuizQuestionDetails()
    }, [, fetchQuizQuestionDetails, fetchProctoringData, params])

    useEffect(() => {
        if (proctoringData) {
            setLoading(false)
        }
    }, [proctoringData])
    const { tabChange, copyPaste, quizSubmission, user } = proctoringData
    const cheatingClass =
        tabChange > 0 && tabChange > 0 ? 'bg-red-600' : 'bg-green-400'

    return (
        <MaxWidthWrapper className="flex flex-col gap-5">
            <div className="flex  items-center gap-x-3">
                <div className="flex flex-col gap-x-2">
                    <div className="flex gap-x-4 my-4 ">
                        <Avatar>
                            <AvatarImage
                                src="https://github.com/shadcn.png"
                                alt="@shadcn"
                            />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <h1 className="text-left font-semibold text-lg">
                            {user.name}- Quiz Questions Report
                        </h1>
                    </div>
                </div>
            </div>
            <h1 className="text-left font-semibold text-[20px]">Overview</h1>
            <div className="lg:flex h-[150px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-md w-2/5 ">
                <div className="flex flex-col w-full justify-between   ">
                    <div
                        className={`flex items-center justify-between p-4 rounded-md ${cheatingClass} `}
                    >
                        <h1
                            className={`text-xl text-start font-semibold  ${
                                cheatingClass ? 'text-white' : 'text-black'
                            } `}
                        >
                            Total Score:
                        </h1>
                        <p
                            className={`font-semibold ${
                                cheatingClass ? 'text-white' : 'text-black'
                            }`}
                        >
                            {quizSubmission?.quizScore}/
                            {quizSubmission?.totalQuizScore}
                        </p>
                    </div>
                    <div className="flex flex-start p-4 gap-x-4">
                        <div>
                            <h1 className="text-start font-bold">
                                {copyPaste}
                            </h1>
                            <p className="text-gray-500 text-start">
                                Copy Paste
                            </p>
                        </div>
                        <div>
                            <h1 className="text-start font-bold">
                                {tabChange}
                            </h1>
                            <p className="text-gray-500">Tab Changes</p>
                        </div>
                        <div>
                            <h1 className="text-start font-bold">
                                {cheatingClass ? 'Yes' : 'No'}
                            </h1>
                            <p className="text-gray-500">Cheating Detected</p>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                {quizQuestionDetails.map((quizDetail, index) => {
                    const { Quiz, submissionsData } = quizDetail
                    const chosenOption = submissionsData[0]?.chosenOption
                    const correctOption = Quiz?.correctOption

                    return (
                        <div
                            key={quizDetail.id}
                            className="flex items-start flex-col gap-y-4 "
                        >
                            <div className="flex flex-row gap-x-2 my-3">
                                <p className="font-semibold">Q{index + 1}.</p>
                                <p className="capitalize font-semibold ">
                                    {Quiz.question}
                                </p>
                            </div>
                            {Object.entries(Quiz.options).map(
                                ([key, option], index) => {
                                    const isCorrect =
                                        parseInt(key) === correctOption
                                    const isChosen =
                                        parseInt(key) === chosenOption
                                    const textColor = isChosen
                                        ? isCorrect
                                            ? 'green'
                                            : 'red'
                                        : 'black'

                                    return (
                                        <div key={key} className="w-full">
                                            <div
                                                className="flex   items-center w-full justify-start "
                                                style={{ color: textColor }}
                                            >
                                                <p className="text-primary  font-semibold">
                                                    {index + 1}.
                                                </p>
                                                <div className="flex flex-row space-x-5 w-full m-2">
                                                    <div className="w-1/2 flex flex-row items-center gap-x-3 ">
                                                        <input
                                                            type="radio"
                                                            name={`question-${quizDetail.id}`}
                                                            value={key}
                                                            checked={isCorrect}
                                                            readOnly={isCorrect}
                                                            disabled={isCorrect}
                                                            className=""
                                                        />
                                                        <p className="font-semibold">
                                                            {option}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            )}
                        </div>
                    )
                })}
            </div>
        </MaxWidthWrapper>
    )
}

export default Page
